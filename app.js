const scheduler = require('./src/scheduler');
const DataProvider = require('./src/data-provider')
const sendEmail = require('./src/email-util');
const express = require('express');

const app = express();

require('dotenv').config();

const config = require('envrc')({NODE_ENV: process.env.NODE_ENV});
const sessionRefreshCount = config('refreshCount');
const taskIntervalValue = config('taskIntervalValue');
const taskIntervalUnit = config('taskIntervalUnit');
const receivers = config('receivers');

class Counter {

    constructor() {
        this.count = 0;
    }
    increment() {
        this.count++;
    }
    reset() {
        this.count=0;
    }
}

class ContextProvider {
    constructor(contextList) {
        this.contextList = contextList;
        this.currentIdx = 0;
        this.currentContext = this.contextList[this.currentIdx];
    }

    next() {

        // Reset if at the end of list
        if(this.currentIdx >= this.contextList.size) this.currentIdx = 0;

        this.currentContext = this.contextList[this.currentIdx];

        this.currentIdx++;

    }

}

const contextProvider = new ContextProvider(JSON.parse(process.env.ACCESS_TOKENS));

const counter = new Counter();

const task = () => {

    console.log(`Fetching data for key ${counter.count}`);

    if(counter.count === sessionRefreshCount) {
        counter.reset();
        contextProvider.next();
    }

    counter.increment();

    const dataProvider = new DataProvider(contextProvider.currentContext);

    dataProvider
        .fetch()
        .then(
            (result) => {
                if(result.responseStatus === 200) {
                    for(const idx in receivers) {
                        sendEmail(receivers[idx], result.responseData);
                    }
                }
                else{
                    console.log("Error occurred.")
                }
            }
        )
}


scheduler(taskIntervalValue, taskIntervalUnit, task);

app.listen(3000,function(){
    console.log("Express Started on Port 3000");
});