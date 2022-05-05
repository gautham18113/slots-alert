const {Telegraf} = require('telegraf');

const raiseErrorCallback = (error) => {
    throw new Error(error);
}


const sendMessage = (chatId, message, messageType="HTML") =>{
   if(!process.env.BOT_API_KEY) {
       throw new Error("Bot API key not set. Unable to send message.")
   }
   const bot = new Telegraf(process.env.BOT_API_KEY);
   bot.telegram.sendMessage(chatId, message, {parse_mode: messageType})
       .catch((error) => {
           console.log(error)
           raiseErrorCallback(error);
       });
}

module.exports = sendMessage;