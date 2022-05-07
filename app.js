const scheduler = require('./src/scheduler');
const DataProvider = require('./src/data/data-provider')
const SlotDataFormatter = require('./src/data/slot-data-formatter')
const sendEmail = require('./src/util/email-util');
const sendTelegramMessage = require('./src/util/telegram-util')
const ContextProvider = require('./src/context/context-proivder')
const express = require('express');
const config = require('envrc')({NODE_ENV: process.env.NODE_ENV})


const emailReceivers = config('receivers');
const sessionRefreshCount = config('refreshCount');
const taskIntervalValue = config('taskIntervalValue');
const taskIntervalUnit = config('taskIntervalUnit');
const messageReceivers = config('broadcastChannels');

require('dotenv').config();

const contextProvider = new ContextProvider(JSON.parse(process.env.ACCESS_TOKENS));

const task = async () => {

    await contextProvider.init();

    if (contextProvider.getCounter() === sessionRefreshCount) {
        await contextProvider.changeContext();
        await contextProvider.resetCounter();
    }

    console.log(`Fetching data for key ${contextProvider.getContext().accessKey}`);


    await contextProvider.incrementCounter();

    const dataProvider = new DataProvider(contextProvider.getContext());

    await dataProvider
        .fetch()
        .then((result) => {

            if (result.responseStatus === 200) {
                // On successful response, parse data and broadcast.
                const dataFormatter = new SlotDataFormatter(result.responseData);
                messageReceivers.map((receiver) => sendTelegramMessage(receiver, dataFormatter.telegramFormat()));
                if (result.totalSlots > 0) {
                    emailReceivers.map((receiver) => sendEmail(receiver, dataFormatter.emailFormat()));
                    sendTelegramMessage("1574467545", dataFormatter.telegramFormat());
                }
            } else {
                // On unsuccessful response, switch context and log error.
                contextProvider.changeContext();
                contextProvider.resetCounter();
                console.error(result);
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
