const Discord = require('discord.js');
const tools = require('./tools.js')
const errorImg = tools.errorImg
const successImg = tools.successImg

module.exports = {
  
  helpMsg: new Discord.MessageEmbed()
    .setColor('#22AAFF')
    .setTitle ('STARBOT HELP MENU')
    .setDescription('__**Command List**__\n'+
      '`!sb autodelete [off/on]`\n'+
      '`!sb bannotice [off/#channel]*`\n'+
      '`!sb check [items/coins]*`\n'+
      '`!sb craft [item]`\n'+
      '`!sb gacha [num]`\n'+
      '`!sb give [coins] [num] [@user]\n'+
      '`!sb greetings [enter/exit] [off/#channel] [message]* `\n'+
      '`!sb help`\n'+
      '`!sb makechannel [off/header] [name]*`\n'+
      '`!sb reizer`\n'+
      '`!sb rename [name]`\n'+
      '`!sb reset [items/coins] [@user/all]*`\n'+
      '`!sb send [item] [@user]`\n'+
      '`!sb sell [num] [item]`\n'+
      '`!sb shutup [@user]*`\n'+
      '`!sb settings`\n'+
      '`!sb unwarn [@user]`\n'+
      '`!sb warn [set] [max warnings] [@role] [#channel]*`\n' +
      '`!sb warn [@user] [reason]*`\n\n' +

      'Commands with a * require certain permissions.'
    )
    .addField('Support', "Further documentation can be found [here](https://docs.google.com/document/d/1DUnCYePUHrLMFW9otnC4YICe-Ly6TP2WrxIm18vKnoI/edit#heading=h.b5x0koghhdh2).")
    .setThumbnail('https://www.shareicon.net/data/256x256/2016/03/25/451843_question_256x256.png'),

  renameError1: new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setTitle('ERROR#201')
    .setDescription('You must be in a voice channel to perform this action.'+ '\n\nρ(- ω -、)ヾ(￣ω￣; )')
    .setThumbnail(errorImg),

  renameError2: new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setTitle('ERROR#202')
    .setDescription('No name changes remaining. Please make a new room.'+ '\n\nρ(- ω -、)ヾ(￣ω￣; )')
    .setThumbnail(errorImg),

  adminError: new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setTitle('ERROR#101')
    .setDescription('You must have admin permissions to perform this action.'+ '\n\nρ(- ω -、)ヾ(￣ω￣; )')
    .setThumbnail(errorImg),

  invalidMsg: new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setTitle('ERROR#301')
    .setDescription('Missing or invalid arguments.'+ '\n\nρ(- ω -、)ヾ(￣ω￣; )')
    .setThumbnail(errorImg),

  commandErrorMsg: new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setTitle('ERROR#001')
    .setDescription('Invalid command... oh no...'+ '\n\nρ(- ω -、)ヾ(￣ω￣; )')
    .setThumbnail(errorImg),

}