const nodeCron = require('node-cron');

const schedule = (intervalValue, intervalUnit, task) => {
    let cron = "";
    if(intervalUnit === "hour") cron = `0 */${intervalValue} * * *`;
    if(intervalUnit === "minute") cron = `0 */${intervalValue} * * * *`;
    nodeCron.schedule(cron, task);
}
module.exports = schedule;

