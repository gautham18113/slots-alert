const scheduler = require('./src/scheduler');
const DataProvider = require('./src/data/data-provider')
const SlotDataFormatter = require('./src/data/slot-data-formatter')
const sendEmail = require('./src/util/email-util');
const sendTelegramMessage = require('./src/util/telegram-util')
const ContextProvider = require('./src/context/context-proivder')
const Counter = require('./src/counter/counter')
const express = require('express');
const config = require('envrc')({NODE_ENV: process.env.NODE_ENV});


const emailReceivers = config('receivers');
const sessionRefreshCount = config('refreshCount');
const taskIntervalValue = config('taskIntervalValue');
const taskIntervalUnit = config('taskIntervalUnit');
const messageReceivers = config('broadcastChannels');

require('dotenv').config();

const contextProvider = new ContextProvider(JSON.parse(process.env.ACCESS_TOKENS));
const counter = new Counter();

const task = () => {

    console.log(`Fetching data for key ${contextProvider.currentContext.accessKey}`);

    if (counter.count === sessionRefreshCount) {
        counter.reset();
        contextProvider.next();
    }

    counter.increment();

    const dataProvider = new DataProvider(contextProvider.currentContext);

    dataProvider
        .fetch()
        .then((result) => {

            if (result.responseStatus === 200) {
                const dataFormatter = new SlotDataFormatter(result.responseData);
                messageReceivers.map((receiver) => sendTelegramMessage(receiver, dataFormatter.telegramFormat()));
                if (result.totalSlots > 0) {
                    emailReceivers.map((receiver) => sendEmail(receiver, dataFormatter.emailFormat()));
                }
            } else {
                if (process.env.NODE_VERBOSE) {
                    console.log(result);
                }
                console.log("Error occurred.")
                sendEmail("gautham18113@gmail.com", JSON.stringify(result));
                if (result.responseStatus === null) counter.increment();
            }
        })
}


scheduler(taskIntervalValue, taskIntervalUnit, task);

const app = express();

app.get("/", (req, res) => {
    res.send("OK")
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Express Started on Port 3000");
});
