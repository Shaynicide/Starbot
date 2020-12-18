const { registerFont } = require('canvas')
registerFont('./fonts//DeterminationMono.ttf', { family: 'DeterminationMono' })
registerFont('./fonts/PixelCH.ttf', { family: 'PixelCH' })
registerFont('./fonts/PixelHangul.ttf', { family: 'PixelHangul' })
registerFont('./fonts/umeboshi_.ttf', { family: 'PixelMPlusBold' })
const Canvas = require('canvas')
const Discord = require('discord.js')
const tools = require('./tools.js')
const fs = require('fs')
const path = require('path')
var serverData

const serverFiles = fs.readdirSync('./servers/', 
  (err,success) => {
    return success
  })

function readServer (serverID){
  serverID = "./servers/" + serverID
  serverData = fs.readFileSync(serverID + ".json")
  serverData = JSON.parse(serverData)
}

function writeServer (serverID){
  serverID = "./servers/" + serverID
  serverData = JSON.stringify(serverData,null,2)
  serverData = fs.writeFileSync(serverID + ".json", serverData)
}

var itemDB = fs.readFileSync('itemDB.json')
itemDB = JSON.parse(itemDB)


function giveCoin (amount,person,msg,serverData){
  serverData.inventory[person].coins += amount
}

function takeItem (item,amount,user,msg,serverData){
  if (serverData.inventory[user.id].items.hasOwnProperty(item.name) && 
  amount <= serverData.inventory[user.id].items[item.name]) {
    serverData.inventory[user.id].items[item.name] -= amount
  }
  if (serverData.inventory[user.id].items[item.name] < 1){
    delete serverData.inventory[user.id].items[item.name]
  }
}

function capitalize (str){
    let str2 = str.split(" ")
    for (let i = 0; i < str2.length; i++){
      str2[i] = str2[i].charAt(0).toUpperCase() + str2[i].substring(1)
    }
    return str2.join(' ')
  }

function applyText (canvas, text, bgSize) {
  let ctx = canvas.getContext('2d')
  let fontSize = canvas.width/10
  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `bold ${fontSize -= 1}px DeterminationMono`
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } 
  while (ctx.measureText(text).width > bgSize)

  // Return the result to use in the actual canvas
  return ctx.font
}

function centerText (canvas, text, bgWidth, bgPos) {
  let ctx = canvas.getContext('2d')
  return ((bgWidth/2) - (ctx.measureText(text).width/2)) + bgPos
}

// ROUNDED RECTANGLE CANVAS FUNCTION
roundedRectangle = function(ctx,x, y, width, height, rounded) {
  const radiansInCircle = 2 * Math.PI
  const halfRadians = (2 * Math.PI)/2
  const quarterRadians = (2 * Math.PI)/4  

  ctx.beginPath()
  
  // top left arc
  ctx.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true)
  
  // line from top left to bottom left
  ctx.lineTo(x, y + height - rounded)

  // bottom left arc  
  ctx.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)  
  
  // line from bottom left to bottom right
  ctx.lineTo(x + width - rounded, y + height)

  // bottom right arc
  ctx.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)  
  
  // line from bottom right to top right
  ctx.lineTo(x + width, y + rounded)  

  // top right arc
  ctx.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true)  
  
  // line from top right to top left
  ctx.lineTo(x + rounded, y)  

      ctx.closePath()

}

function userCount(client,serverID,isBot) {
  let userCount = 0
  let botCount = 0
  for (let member of client.guilds.cache.get(serverID).members.cache) {
    if (member[1].user.bot == false){
      userCount += 1
    }
    else {
      botCount += 1
    }
  }
  if (isBot == true) {
    return botCount
  }
  else
    return userCount
}

function underline(ctx, text, x, y, size, color, thickness ,offset){
  var width = ctx.measureText(text).width
  switch(ctx.textAlign){
    case "center":{
      x -= (width/2) 
      break
    }
    case "right": {
      x -= width 
      break
    }
  }

     y += size+offset

     ctx.beginPath()
     ctx.strokeStyle = color
     ctx.lineWidth = thickness
     ctx.moveTo(x,y)
     ctx.lineTo(x+width,y)
     ctx.stroke()

}

module.exports = {
  userCount: function(client,serverID,isBot) {
  let botCount = 0
  let userCount = 0
  for (let member of client.guilds.cache.get(serverID).members.cache) {
    if (member[1].user.bot == false){
      userCount += 1
    }
    else {
      botCount += 1
    }
  }
  if (isBot == true) {
    return botCount
  }
  else
    return userCount
  },

  randomColor: function() {
    let random = Math.floor(Math.random() * 4) + 1
    let color
    switch (random){
      case 1:
        color = '#fc0356'
        break
      case 2:
        color = '#8b46fa'
        break
      case 3:
        color = '#46fa8e'
        break
      case 4:
        color = '#f05e41'
        break
    }
    return color
  },

  updateServers: function(client) {
      for (let guild of client.guilds.cache) {
        let server = client.guilds.cache.get(guild[0])
        if (!fs.existsSync("./servers/" + guild[0] + ".json")) {
          fs.writeFileSync("./servers/" + guild[0] + ".json",
          JSON.stringify( {
            name: server.name,
            settings: {
              autoDelete: 'off',
              banNotice: {
                enabled: false,
                channel: '',
              },
              greetings: {
                enter: {
                  channel: '',
                  message: '',
                  useCard: true
                },
                exit: {
                  channel: '',
                  message: '',
                  useCard: true
                }
              },
              warnings: {
                role: '',
                channel: '',
                maxWarnings: 2,
                users: []
              }
            },
            addRooms: [],
            tempRooms: [],
            inventory: {}
        },null,2))
      }
      readServer(server.id)
      serverData.name = server.name
      writeServer(server.id)
    }
      //Delete storage for any servers no longer using the bot
      serverFiles.forEach(file => { 
        fileID = file.slice(0,-5)
        if (!client.guilds.cache.find(x => x.id == fileID)){
          fs.unlinkSync("./servers/" + file)
        }
      })
    },

  updateRooms: function (client){
    serverFiles.forEach(file => {
      fileID = file.slice(0,-5)
      // Change file to server's file
      readServer(fileID)

      for (let channel of serverData.addRooms) {
        let server = client.guilds.cache.get(fileID)
        if (!server.channels.cache.find(x => x.channelID == channel.channelID)) {
          //Delete the channel
          serverData.addRooms.splice(server.channels.cache.find(x => x == channel.channelID),1)
        }
      }
      for (let channel of serverData.tempRooms) {
        let server = client.guilds.cache.get(fileID)
        if (!server.channels.cache.find(x => x.channelID == channel.roomID)) {
          //Delete the channel
          serverData.tempRooms.splice(server.channels.cache.find(x => x == channel.roomID),1)
        }
        if (server.channels.cache.get(channel.roomID)
            .members.size < 1) {
              server.channels.cache.get(channel.roomID).delete()
              .then(() => {
                readServer(fileID)
                let b = serverData.tempRooms.findIndex(x => x.roomID == oldState.channel.id)
                serverData.tempRooms.splice(b, 1)
                if (typeof serverData != 'undefined'){
                  writeServer(fileID)
                }}
              )
            }
      }
      writeServer(fileID)
    })
  },

  makeWelcomeCard: async function (member,gStorage,client,example) {
    client.guilds.cache.get(member.guild.id).members.fetch()
    .then(async () => {
      readServer(member.guild.id)
      if (gStorage.enter.channel != '' || example == true) {
      let member2
      if (example == true) {
        member2 = member
        member = member.member

      }
      let cWidth = 1000
      const canvas = Canvas.createCanvas(cWidth, cWidth/2.5)
      const ctx = canvas.getContext('2d')

      let imgNum = Math.floor(Math.random() * 10)
      const background = await Canvas.loadImage(tools.welcomeImg[imgNum])
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

      // AVATAR BACKGROUND
      let avatarBG = 
        {x: canvas.width/32, 
        y: canvas.height/11.5,
        width: canvas.width/3.05, 
        height: canvas.height/1.2}
      ctx.globalAlpha = 0.45
      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4

      ctx.fillRect(avatarBG.x, avatarBG.y, avatarBG.width, avatarBG.height)
      ctx.strokeRect(avatarBG.x, avatarBG.y, avatarBG.width, avatarBG.height)
      ctx.globalAlpha = 1.0

      // DRAW THE MEMBER NUMBER
      let isBot = false
      let botMark1 = ''
      let botMark2 = ''
      if (member.user.bot == true) {
        isBot = true
        botMark1 = 'BOT'
        botMark2 = ' 🤖'
      }

      let checkText = botMark1 + '#'+`${userCount(client,member.guild.id,isBot).toString()}`
      ctx.font = applyText(canvas,checkText, avatarBG.width)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(
        checkText,
        centerText(canvas,checkText,avatarBG.width,avatarBG.x), 
        canvas.height/1.15)

      // NAME & MESSAGE BACKGROUND
      ctx.globalAlpha = 0.45
      ctx.fillStyle = '#000000'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4

      let textBG =
        {x: canvas.width/2.55,
        y: canvas.height/11.5,
        width: canvas.width/1.73,
        height: canvas.height/1.2}

      ctx.fillRect(textBG.x, textBG.y, textBG.width, textBG.height)
      ctx.strokeRect(textBG.x, textBG.y, textBG.width, textBG.height)
      ctx.globalAlpha = 1.0

      // NAME TEXT
      checkText = `${member.displayName.toUpperCase()}`
      ctx.font = applyText(canvas, checkText, textBG.width)
      // Set text color
      ctx.fillStyle = '#ffffff'
      ctx.fillText(
        checkText, 
        centerText(canvas,checkText,textBG.width,textBG.x), 
        canvas.height/3)
      
      // NAME UNDERLINE
      underline(ctx, checkText, centerText(canvas,checkText,textBG.width,textBG.x), canvas.height/3, 20, '#ffffff', 5, -12)

      // MESSAGE TEXT LINE 1
      checkText = 'HAS JOINED!'
      ctx.font = applyText(canvas, checkText, textBG.width)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(checkText, centerText(canvas,checkText,textBG.width,textBG.x), canvas.height/1.68)

      /* MESSAGE TEXT LINE 2
      checkText = 'THE BATTLE!'
      ctx.font = applyText(canvas, checkText, textBG.width)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(checkText, centerText(canvas,checkText,textBG.width,textBG.x), canvas.height/1.46)*/

      // MESSAGE TEXT LINE 3
      let kaoRoll = Math.floor(Math.random() * 7)
      checkText = tools.kaomoji[kaoRoll]
      ctx.font = applyText(canvas, checkText, textBG.width)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(checkText, centerText(canvas,checkText,textBG.width,textBG.x), canvas.height/1.2)

      // DRAW THE AVATAR
      let avatarSize = canvas.width/4.6
      let avatarPos = 
        {x: ((avatarBG.width/2) - (avatarSize/2)) + avatarBG.x, y: canvas.height/7.3}

      roundedRectangle(ctx,avatarPos.x,avatarPos.y, avatarSize, avatarSize, 30)
      ctx.clip()
      
      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }))
      ctx.drawImage(avatar, avatarPos.x, avatarPos.y, avatarSize, avatarSize)



      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png')

      let destination, memberTag
      if (example == false) {
        destination = member.guild.channels.cache.get(gStorage.enter.channel)
        memberTag = member.user.toString()
      }
      else{
        destination = member2.channel
        memberTag = member.user.toString()
      }
      destination.send(
        gStorage.enter.message
          .replace('!SERVER!',member.guild.name)
          .replace("!USER!",memberTag)
          .replace("!MEMBERS!",userCount(client,member.guild.id,isBot) +
            botMark2)
          , attachment).then(x => {
            readServer(member.guild.id)
            if (example == true){
              if (serverData.settings.autoDelete == 'on'){
                x.delete({timeout: 10000})
              }
            }
        })
        .catch(console.error)
      }
      else {
        // fixthis - no channel set
      }
    })
    .catch(console.error)
  },

  makeExitCard: function(msg,color,gStorage,example,client){
    readServer(msg.guild.id)
    let description, person, destination
    if (example == true){
      person = msg.author
      destination = msg.channel
    }
    else {
        person = msg.user
        destination = msg.guild.channels.cache.get(gStorage.exit.channel)
    }
  
    let isBot = false
    let botMark = ''
    if (person.bot == true) {
      isBot = true
      botMark = ' 🤖'
    }

    if (gStorage.exit.message != ''){
      description = gStorage.exit.message
        .replace('!SERVER!', msg.guild.name)
        .replace('!USER!', person.tag)
        .replace('!MEMBERS!', userCount(client,msg.guild.id,isBot)+
          botMark)
    }
    else {
      description = "Your exit message here."
    }
    let exitCard = new Discord.MessageEmbed()
      .setColor(color)
      .setAuthor(person.tag,person.displayAvatarURL(),)
      .setDescription(description)
    if (gStorage.exit.channel != '' || example == true){
      destination.send(exitCard).then(x => {
        if (example == true){
          if (serverData.settings.autoDelete == 'on'){
            x.delete({timeout: 10000})
          }
        }
      })
      .catch(console.error)
    }
    else {
      // fixthis - no channel set
    }
  },

  giveCoin: function (amount,person,msg,serverData){
    serverData.inventory[person].coins += amount
  },

  takeCoin: function (amount,person,msg,serverData){
    serverData.inventory[person].coins -= amount
  },

  checkCoin: function (msg,serverData){
    return serverData.inventory[msg.author.id].coins
  },

  giveItem: function (item,amount,user,msg,serverData){
      serverData.inventory[user.id].items[item.name] += amount
  },

  takeItem: function (item,amount,user,msg,serverData){
      serverData.inventory[user.id].items[item.name] -= amount
    if (serverData.inventory[user.id].items[item.name] < 1){
      delete serverData.inventory[user.id].items[item.name]
    }
  },

  capitalize: function (str){
    let str2 = str.split(" ")
    for (let i = 0; i < str2.length; i++){
      str2[i] = str2[i].charAt(0).toUpperCase() + str2[i].substring(1)
    }
    return str2.join(' ')
  },

  checkUserCreate: function (userID,msg,serverData){
    if (!serverData.inventory.hasOwnProperty(userID)){
      serverData.inventory[userID] = {coins: 0, items: {}}
    }
  },

  checkUserClear: function (userID,msg,serverData) {
      if (serverData.inventory[userID].coins <= 0 && Object.keys(serverData.inventory[userID].items).length == 0) {
        delete serverData.inventory[userID]
      }
  },

  sellItem: function (item,amount,msg,serverData) {
    let footer1 = serverData.inventory[msg.author.id].coins
    let footer2 = 
      'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'
    if (itemDB.hasOwnProperty(item)){
      item = itemDB[item]
    }
    else {
      item = {name: 'abcdef'}
    }
    let s = 's'
    let s2 = 's'
    let donated = ' given away!'
    if (amount == 1)
      s = ''

    let items = serverData.inventory[msg.author.id].items
    if (!itemDB.hasOwnProperty(item.name) || !items.hasOwnProperty(item.name) || items[item.name] < amount){
      description = "You can't sell what you don't have!" +
        "\n\n╮(︶▽︶)╭"
      color = "#FF0000"
      thumbnail = 
        'https://1.bp.blogspot.com/-OnbnkHL2aM0/XobTDSKO3dI/AAAAAAABYEA/005kYGn41c47vfNDtcqucISdcGcoVSNsACNcBGAsYHQ/s1600/edo_syounin_bad.png'
    }
    else if (item.sellPrice == 'N/A'){
      description = "Sorry, we can't buy this from you." +
        "\n\n╮(︶︿︶)╭"
      color = "#FF0000"
      thumbnail = 
        'https://1.bp.blogspot.com/-OnbnkHL2aM0/XobTDSKO3dI/AAAAAAABYEA/005kYGn41c47vfNDtcqucISdcGcoVSNsACNcBGAsYHQ/s1600/edo_syounin_bad.png'
    }
    else {
      let earnings = amount * item.sellPrice
      takeItem(item,amount,msg.author,msg,serverData)
      giveCoin(earnings,msg.author.id,msg,serverData)
      if (earnings == 1)
        s2 = ''
        if (earnings != 0) {
          donated = " sold for **" + 
          earnings + "** coin" + s2 + "!"
        }
      description = "**" + amount + "** item" + s + donated + "\n\n(￣▽￣)ノ"
      color = '#22AAFF'
      thumbnail = 
        'https://1.bp.blogspot.com/-isX0WD87Lvs/XobTC4Ti6eI/AAAAAAABYD8/Yg8JHj0DQ5wzbHeFIiDclTrPugseaBNNQCNcBGAsYHQ/s1600/edo_syounin.png'
        footer1 = serverData.inventory[msg.author.id].coins

    }
    let sellMsg = new Discord.MessageEmbed()
      .setAuthor(msg.author.tag.toUpperCase(),  
        msg.author.displayAvatarURL(),)
      .setDescription(description)
      .setColor(color)
      .setFooter(footer1,footer2,)
      .setThumbnail(thumbnail)
    msg.channel.send(sellMsg)
  }

}