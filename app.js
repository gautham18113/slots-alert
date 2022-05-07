const express = require('express');
const scheduler = require('./src/scheduler');
const sendEmail = require('./src/util/email-util');
const sendTelegramMessage = require('./src/util/telegram-util')
const ContextProvider = require('./src/context/context-provider')
const DataProvider = require('./src/data/data-provider')
const SlotDataFormatter = require('./src/data/slot-data-formatter')
const Store = require("./src/data/store/s3-store");

require('dotenv').config();

const sessionRefreshCount = parseInt(process.env.SESSION_REFRESH_COUNT);
const taskIntervalValue = parseInt(process.env.TASK_INTERVAL_VALUE);
const taskIntervalUnit = process.env.TASK_INTERVAL_UNIT;
const successEmailRecipients = JSON.parse(process.env.SUCCESS_EMAIL_RECIPIENTS);
const successMessageRecipients = JSON.parse(process.env.SUCCESS_MESSAGE_RECIPIENTS);
const allEmailRecipients = JSON.parse(process.env.ALL_EMAIL_RECIPIENTS);
const allMessageRecipients = JSON.parse(process.env.ALL_MESSAGE_RECIPIENTS);
const accessTokens = JSON.parse(process.env.ACCESS_TOKENS);
const contextFile = process.env.CONTEXT_FILE;
const contextS3Bucket = process.env.CONTEXT_BUCKET;


const dataStore = new Store(contextS3Bucket, contextFile);
const contextProvider = new ContextProvider(accessTokens, dataStore);


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
                allMessageRecipients.map((receiver) => sendTelegramMessage(receiver, dataFormatter.telegramFormat()));
                allEmailRecipients.map((receiver) => sendEmail(receiver, dataFormatter.emailFormat()));
                if (result.totalSlots > 0) {
                    successEmailRecipients.map((receiver) => sendEmail(receiver, dataFormatter.emailFormat()));
                    successMessageRecipients.map((receiver) => sendTelegramMessage(receiver, dataFormatter.telegramFormat()));
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
