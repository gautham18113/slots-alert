const scheduler = require('./src/scheduler');
const DataProvider = require('./src/data-provider')
const SlotDataFormatter = require('./src/slot-data-formatter')
const sendEmail = require('./src/email-util');
const sendTelegramMessage = require('./src/telegram-util')
const express = require('express');

const app = express();

require('dotenv').config();

const config = require('envrc')({NODE_ENV: process.env.NODE_ENV});
const sessionRefreshCount = config('refreshCount');
const taskIntervalValue = config('taskIntervalValue');
const taskIntervalUnit = config('taskIntervalUnit');
const emailReceivers = config('receivers');
const messageReceivers = config('broadcastChannels');

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

    console.log(`Fetching data for key ${contextProvider.currentContext.accessKey}`);

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
                    const dataFormatter = new SlotDataFormatter(result.responseData);
                    if(result.totalSlots > 0) {
                        emailReceivers.map((receiver) => sendEmail(receiver, dataFormatter.emailFormat()));
                        messageReceivers.map((receiver) => sendTelegramMessage(receiver, dataFormatter.telegramFormat()));
                    }
                }
                else{
                    if(process.env.NODE_VERBOSE) {
                        console.log(process.env.NODE_VERBOSE);
                        console.log(result);
                    }
                    console.log("Error occurred.")
                    sendEmail("gautham18113@gmail.com", JSON.stringify(result));
                    if(result.responseStatus === null) counter.increment();
                }
            }
        )
}


scheduler(taskIntervalValue, taskIntervalUnit, task);

app.listen(process.env.PORT || 3000,function(){
    console.log("Express Started on Port 3000");
});