const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('☆*:.｡.o(≧▽≦)o.｡.:*☆'))

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))

// ================= START BOT CODE ===================
// DEPENDENCIES & IMPORTANT VARIABLES
const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
const functions = require('./functions.js')
const tools = require('./tools.js')
const alerts = require('./alerts.js')
const commands = require('./commands.js')

const errorImg = tools.errorImg
const successImg = tools.successImg
const helpMsg = alerts.helpMsg

var serverData

// IMPORTANT FUNCTIONS
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

client.on('ready', () => {
	setInterval(() => {
		//Update number of servers in status every 60 seconds
		client.user.setActivity('in ' + client.guilds.cache.size + 
      ' servers!', {type: 'PLAYING'})
	}, 60000)

	//Update servers info every 10 seconds
  functions.updateServers(client)
  functions.updateRooms(client)
	setInterval(() => {
		functions.updateServers(client)
		functions.updateRooms(client)
	}, 10000) // Runs this every 10 seconds.
	console.log(`${client.user.tag} is ready to go!`)
})

// ================= ON: USER MESSAGE ===================
client.on('message', async msg => {
	commands.readCommand(msg,client)
})

// ================= ON: CHANNEL DELETE ===================
client.on('channelDelete', channel => {
  readServer(channel.guild.id)
	//Delete room info from table on channel deletion
	//Check if room is a temp room
	if (serverData.tempRooms.find(x => x.roomID == channel.id)) {
		let a = serverData.tempRooms.findIndex(x => x.roomID == channel.id)
		serverData.tempRooms.splice(a, 1)
	}
	//Delete category info from table on channel deletion
	//Check if room is a temp room category
	if (serverData.addRooms.find(x => x.channelID == channel.id)) {
		let b = serverData.addRooms.findIndex(x => x.channelID == channel.id)
		serverData.addRooms.splice(b, 1)
	}
	writeServer(channel.guild.id)
})

// ================= ON: VOICE STATE CHANGE ===================
client.on('voiceStateUpdate', (oldState, newState) => {
  readServer(newState.guild.id)
  if (typeof serverData == 'undefined'){
    readserver(oldState.guild.id)
  }
	let newChannel = newState.channelID
	let oldChannel = oldState.channelID
	let jfc
	let roomName

	// User joins specified channel
	if (serverData.addRooms.find(x => x.channelID == newChannel)) {
		for (let x in newState.guild.channels.cache.get(newChannel)) {
			if ((x = 'parentID')) {
				jfc = newState.guild.channels.cache.get(newChannel)[x]
			}
		}
		//Create new VC channel
		let room = serverData.addRooms.find(x => x.channelID == newState.channel.id)

    let counter = 1
    let roomName = room.roomName
    let lastChar = room.header.charAt(room.header.length-1)
    console.log(lastChar)
    
    if (room.header != '' && !lastChar.match("[\\uff01-\\uff5E]")) {
			roomName = ' ' + roomName
		}

    for (let x of serverData.tempRooms){
      if (newState.guild.channels.cache.get(x.roomID).name == room.header + roomName.replace('!INC!',counter) && 
      x.parentID == newState.channelID) {
        counter += 1
      }
      else
        break
    }

    roomName = roomName.replace('!INC!',counter)

		newState.guild.channels
			.create(
				room.header + roomName,
				{
					type: 'voice',
					parent: jfc
				}
			)
			//Move user to newly created channel & store ID
			.then(createdChannel => {
        readServer(oldState.guild.id)
        // Set the channel position
        let chPos = oldState.guild.channels.cache.get(createdChannel.id)
        let chPos2 = oldState.guild.channels.cache.get(newState.channelID).position
        chPos.setPosition(chPos2+counter)
				newState.setChannel(createdChannel.id)
				serverData.tempRooms.push({
					roomID: createdChannel.id,
					renamesLeft: 2,
					parentID: newState.channelID
				})
        if (typeof serverData != 'undefined'){
          writeServer(oldState.guild.id)
          readServer(oldState.guild.id)
         } 
        else {
          console.log('FUCKING ERROR MAN')
        }
				createdChannel.setParent(jfc)
			})
			.catch(console.error)
	}

	//Check to see if room is a temporary room & delete
	if (
		serverData.tempRooms.find(
			x => x.roomID == oldState.channelID
		) &&
		oldState.channel.members.size < 1
	) {
		oldState.channel.delete().then(() => {
      readServer(oldState.guild.id)
      let b = serverData.tempRooms.findIndex(x => x.roomID == oldState.channel.id)
		serverData.tempRooms.splice(b, 1)
    if (typeof serverData != 'undefined'){
      writeServer(oldState.guild.id)
    }
    else {
      console.log('FUCKING ERROR 2')
    }
    })
    .catch(console.error)
	}

  if (typeof serverData != 'undefined'){
    writeServer(oldState.guild.id)
  }
  else {
    console.log('FUCKING ERROR 2')
  }
})

// ================= ON: GUILD CHANGE ===================
client.on('guildUpdate', (oldGuild, newGuild) => {
  readServer(oldGuild.id)
	serverData.name = newGuild.name
	writeServer(newGuild.id)
})

// ================= ON: MEMBER BAN ===================
client.on('guildBanAdd', async (guild, user) => {
  readServer(guild.id)
	if (user.id != '744122183940440095') {
    const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD',
      })
    const banLog = fetchedLogs.entries.first()
    const { executor, target } = banLog
		let bannedUser = ''
		let bannedReason = ''
		let gStorage = serverData.settings.banNotice
		if (gStorage.enabled == true) {
			if (!gStorage.channel == '') {
				// ban code
				guild.fetchBan(user).then(x => {
					bannedUser = x.user.tag + ' WAS BANNED'
					if (x.reason == null) {
						bannedReason = 'No reason was specified.'
					} else {
						bannedReason = x.reason
					}
					bannedAvatar = user.displayAvatarURL()

					const banNotice = new Discord.MessageEmbed()
						.setAuthor(bannedUser.toUpperCase(), bannedAvatar)
						.setColor(functions.randomColor())
						.setThumbnail(
							'https://www.clipartmax.com/png/full/5-57742_keeping-track-of-modis-government-in-india-kick-out-clip-art.png'
						)
						.setDescription(bannedReason + '\n\n' + 'Goodbye! ¯\\_(ツ)_/¯')
            .setFooter(executor.tag,executor.displayAvatarURL(),)
					guild.channels.cache
						.get(serverData.settings.banNotice.channel)
						.send(banNotice)
				})
        .catch(console.error)
			}
		} else {
			const banNotSet = new Discord.MessageEmbed()
				.setColor('#FF0000')
				.setTitle('ERROR#401')
				.setDescription(
					'Starbot notices are enabled, but no channel has been set.\n' +
						'Please set with `!sb bannotice [#channel]`.'
				)
				.setThumbnail(errorImg)
			msg.member.createDM().then(x => {
				x.id.send(banNotSet)
			})
      .catch(console.error)
		}
	}
  writeServer(guild.id)
})

// ================= ON: MEMBER JOIN ===================
client.on('guildMemberAdd', async member => {
    readServer(member.guild.id)
    let isBot = false
    let botMark = ''
    if (member.user.bot == true) {
      isBot = true
      botMark = '(🤖)'
    }
    let gStorage = serverData.settings.greetings
    let channel = gStorage.enter.channel
    if (channel != '') {
      if (gStorage.enter.useCard == true) {
        functions.makeWelcomeCard(member, gStorage, client, false)
      } 
      else {
        member.guild.channels.cache.get(channel).send(gStorage.enter.message
          .replace('!SERVER!',member.guild.id)
            .replace('!USER!', member.user.toString())
            .replace('!MEMBERS!', functions.userCount(client,member.guild.id,isBot)+ botMark)
          )
      }
    }
    writeServer(member.guild.id)
})

// ================= ON: MEMBER LEAVE ===================
client.on('guildMemberRemove', member => {
  readServer(member.guild.id)
	let gStorage = serverData.settings.greetings
	if (member.id != '744122183940440095' ) {
		functions.makeExitCard(
			member,
			functions.randomColor(),
			gStorage,
			false,
			client
		)
	}
  writeServer(member.guild.id)
})
// You really don't want your token here since your repl's code
// is publically available. We'll take advantage of a Repl.it
// feature to hide the token we got earlier.
client.login(process.env.DISCORD_TOKEN)
