// DEPENDENCIES
const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
const functions = require('./functions.js')
const tools = require('./tools.js')
const alerts = require('./alerts.js')

// DATABASES

var itemDB = fs.readFileSync('itemDB.json')
itemDB = JSON.parse(itemDB)

var gachaDB = fs.readFileSync('gachaDB.json')
gachaDB = JSON.parse(gachaDB)

var sendDB = fs.readFileSync('sendDB.json')
sendDB = JSON.parse(sendDB)

// SERVER READ/WRITE FUNCTIONS

function readServer(serverID) {
	serverID = './servers/' + serverID
	serverData = fs.readFileSync(serverID + '.json')
	serverData = JSON.parse(serverData)
}

function writeServer(serverID) {
	serverID = './servers/' + serverID
	serverData = JSON.stringify(serverData, null, 2)
	serverData = fs.writeFileSync(serverID + '.json', serverData)
}

// CONSTANT VARIABLES
const errorImg = tools.errorImg
const successImg = tools.successImg
const helpMsg = alerts.helpMsg
const adminError = alerts.adminError
const onCooldown = new Set()
const prefix = '!sb2 '
const bannedServers = {
  '767298610819366922': 'This is a test.'
}

// COMMAND HANDLING
module.exports = {
	readCommand: function(msg, client) {
		const commandBody = msg.content.slice(prefix.length)
		const args = commandBody.split(' ')
		const command = args.shift()

		if (msg.author.bot) return
		if (msg.channel.type == 'dm') {
			msg.channel.send("Don't talk to me, please.")
			return
		}

    // SERVER BAN HANDLING
		if (bannedServers.hasOwnProperty(msg.guild.id)) {
			let serverBanMsg = new Discord.MessageEmbed()
				.setColor('#FF0000')
				.setAuthor(msg.guild.name.toUpperCase(), msg.guild.iconURL())
				.setTitle('THIS SERVER IS BANNED!')
				.setDescription(
					'**Reason:** ' +
						bannedServers[msg.guild.id] +
						"\n\n If you believe this is a mistake, please contact the bot's owner."
				)
				.setFooter('Shaynicide#6562', client.user.displayAvatarURL())
				.setThumbnail(
					'https://4.bp.blogspot.com/-8a_ogYRbZJI/UdIwxd3Rf9I/AAAAAAAAV0c/1_BrYeEIXjk/s602/kinshi.png'
				)
			msg.channel.send(serverBanMsg)
			fs.unlinkSync('./servers/' + msg.guild.id + '.json')
			msg.guild.leave()
			return
		}

		readServer(msg.guild.id)

    // COIN PER MESSAGE HANDLER
		if (!onCooldown.has(msg.author.id) && !msg.content.startsWith(prefix)) {
			functions.checkUserCreate(msg.author.id, msg, serverData)
			serverData.inventory[msg.author.id].coins += 1
			onCooldown.add(msg.author.id)
			writeServer(msg.guild.id)
			readServer(msg.guild.id)
			setTimeout(() => {
				onCooldown.delete(msg.author.id)
			}, 15000)
		}

		// REVERSE TEXT CHANNEL
		if (
			msg.channel.id == '778423884146802688' ||
			msg.channel.id == '778480084147372054'
		) {
			let reversed = new Discord.MessageEmbed()
				.setColor(functions.randomColor())
				.setAuthor(msg.author.tag.toUpperCase(), msg.author.displayAvatarURL())
				.setDescription(
					msg.content
						.replace(/<@(.*?)>/, '')
						.split('')
						.reverse()
						.join('')
				)
			msg.delete()
			msg.channel.send(reversed)
		}

		// ================= COMMAND LIST ===================
		if (!msg.content.startsWith(prefix)) return
		switch (command) {
			// ================= COMMAND: GREETINGS ===================
			case 'greetings': {
				let gStorage = serverData.settings.greetings
				if (msg.member.hasPermission('ADMINISTRATOR') || args[0] == 'example') {
					let color, title, description, thumbnail
					//For welcome channel
					if (args[0] == 'enter') {
						//If argument is 'off'
						if (args[1] == 'off') {
							color = '#00FF00'
							title = 'SUCCESS!'
							description
							('Welcome messages have been turned `OFF`. \n\n(*￣▽￣)b')
							thumbnail = successImg
							serverData.settings.greetings.enter.channel = ''
						} 
            else if (args[1] == 'card') {
							if (args[2] == 'on') {
								serverData.settings.greetings.enter.useCard = true
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'Welcome message style set to `CARD`.\n\n(*￣▽￣)b'
								thumbnail = successImg
							} 
              else if (args[2] == 'off') {
								serverData.settings.greetings.enter.useCard = false
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'Welcome message style set to `TEXT ONLY`.\n\n(*￣▽￣)b'
								thumbnail = successImg
							}
						}
						//If there is a channel mentioned, set to that channel
						else if (
							msg.guild.channels.cache.find(
								x => x == msg.mentions.channels.first()
							)
						) {
							let channel = msg.mentions.channels.first().id
							serverData.settings.greetings.enter.channel = channel
							color = '#00FF00'
							title = 'SUCCESS!'
							description =
								'Welcome messages will be sent to ' +
								'<#' +
								msg.mentions.channels.first().id +
								'>.'
							thumbnail = successImg
							//Then also check if there is a non-blank message
							if (
								!args
									.slice(3)
									.join('')
									.toString()
									.replace('\\s+', '') == ''
							) {
								serverData.settings.greetings.enter.message = args
									.slice(3)
									.join(' ')
								let isBot = false
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'The welcome message\n' +
									args
										.slice(3)
										.join(' ')
										.replace('!SERVER!', msg.guild.name)
										.replace('!USER!', msg.author.toString())
										.replace(
											'!MEMBERS!',
											functions.userCount(client, msg.guild.id, isBot)
										) +
									'\n will be sent to ' +
									'<#' +
									msg.mentions.channels.first().id +
									'>.'
								thumbnail = successImg
							}
						} 
            else {
							color = '#FF0000'
							title = 'ERROR#303'
							description =
								'No channel was tagged.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
							thumbnail = errorImg
						}
					} 
          else if (args[0] == 'exit') {
						//If argument is 'off'
						if (args[1] == 'off') {
							color = '#00FF00'
							title = 'SUCCESS!'
							description =
								'Exit messages have been turned `OFF`.\n\n(*￣▽￣)b'
							thumbnail = successImg
							serverData.settings.greetings.exit.channel = ''
						} 
            else if (args[1] == 'card') {
							if (args[2] == 'off') {
								serverData.settings.greetings.exit.useCard = false
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'Exit message style set to `TEXT ONLY`.\n\n(*￣▽￣)b'
								thumbnail = successImg
							} 
              else if (args[2] == 'on') {
								serverData.settings.greetings.exit.useCard = true
								color = '#00FF00'
								title = 'SUCCESS!'
								description = 'Exit message style set to `CARD`.\n\n(*￣▽￣)b'
								thumbnail = successImg
							}
						}
						//If there is a channel mentioned, set to that channel
						else if (
							msg.guild.channels.cache.find(
								x => x == msg.mentions.channels.first()
							)
						) {
							let channel = msg.mentions.channels.first().id
							serverData.settings.greetings.exit.channel = channel
							color = '#00FF00'
							title = 'SUCCESS!'
							description =
								'Exit messages will be sent to ' +
								'<#' +
								msg.mentions.channels.first().id +
								'>.'
							thumbnail = successImg
							//Then also check if there is a non-blank message
							if (
								!args
									.slice(3)
									.join('')
									.toString()
									.replace('\\s+', '') == ''
							) {
								serverData.settings.greetings.exit.message = args
									.slice(3)
									.join(' ')
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'The exit message\n' +
									args
										.slice(3)
										.join(' ')
										.replace('!SERVER!', msg.guild.name)
										.replace('!USER!', msg.author.tag)
										.replace(
											'!MEMBERS!',
											functions.userCount(client, msg.guild.id)
										) +
									'\n will be sent to ' +
									'<#' +
									msg.mentions.channels.first().id +
									'>.'
								thumbnail = successImg
							}
						} 
            else {
							color = '#FF0000'
							title = 'ERROR#303'
							description =
								'No channel was tagged.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
							thumbnail = errorImg
						}
					} 
          else {
						color = '#FF0000'
						title = 'ERROR#301'
						description =
							'Missing or invalid arguments.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
						thumbnail = errorImg
					}
					//Shows an example of the greetings cards
					if (args[0] == 'make' && msg.mentions.users.size > 0) {
            functions.makeWelcomeCard(
              msg.mentions.members.first().id, gStorage, client, false)
					}
					if (args[0] == 'example') {
						// Enter message
						if (gStorage.enter.useCard == true) {
							functions.makeWelcomeCard(msg, gStorage, client, true)
							setTimeout(() => {
								if (gStorage.exit.useCard == true) {
									functions.makeExitCard(
										msg,
										functions.randomColor(),
										gStorage,
										true,
										client
									)
								} else {
									if (gStorage.exit.message == '') {
										msg.channel.send('Your exit message here.')
									} else {
										msg.channel.send(
											gStorage.exit.message
												.replace('!SERVER!', msg.guild.name)
												.replace('!USER!', msg.author.tag)
												.replace(
													'!MEMBERS!',
													functions.userCount(client, msg.guild.id, false)
												)
										)
									}
								}
							}, 2500)
						} 
            else {
							msg.channel.send(
								gStorage.enter.message
									.replace('!SERVER!', msg.guild.name)
									.replace('!USER!', msg.author.tag)
									.replace(
										'!MEMBERS!',
										functions.userCount(client, msg.guild.id, false)
									)
							)

							if (gStorage.exit.useCard == true) {
								functions.makeExitCard(
									msg,
									functions.randomColor(),
									gStorage,
									false,
									client
								)
							} 
              else {
								if (gStorage.exit.message == '') {
									msg.channel.send('Your exit message here.').then(x => {
                    readServer(msg.guild.id)
										if (serverData.settings.autoDelete == 'on') {
											x.delete({ timeout: 10000 })
										}
									})
                  .catch(console.error)
								} 
                else {
									msg.channel
										.send(
											gStorage.exit.message
												.replace('!SERVER!', msg.guild.name)
												.replace('!USER!', msg.author.tag)
												.replace(
													'!MEMBERS!',
													functions.userCount(client, msg.guild.id, false)
												)
										)
										.then(x => {
                      readServer(msg.guild.id)
											if (serverData.settings.autoDelete == 'on') {
												x.delete({ timeout: 10000 })
											}
										})
                    .catch(console.error)
								}
							}
						}
					} 
          else {
						let greetingMsg = new Discord.MessageEmbed()
							.setColor(color)
							.setTitle(title)
							.setDescription(description)
							.setThumbnail(thumbnail)
						msg.channel.send(greetingMsg).then(x => {
              readServer(msg.guild.id)
							if (serverData.settings.autoDelete == 'on') {
								x.delete({ timeout: 10000 })
							}
						})
            .catch(console.error)
					}
				} else {
					msg.channel.send(adminError).then(x => {
            readServer(msg.guild.id)
						if (serverData.settings.autoDelete == 'on') {
							x.delete({ timeout: 10000 })
						}
					})
          .catch(console.error)
				}
				break
			}

			case 'autodelete': {
				let color
				let title
				let description
				if (args.join('') == 'on') {
					serverData.settings.autoDelete = 'on'
					color = '#00FF00'
					title = 'SUCCESS!'
					description = 'Auto-Delete has been set to `ON`!\n\n(*￣▽￣)b'
					thumbnail = successImg
				} else if (args.join('') == 'off') {
					serverData.settings.autoDelete = 'off'
					color = '#00FF00'
					title = 'SUCCESS!'
					description = 'Auto-Delete has been set to `OFF`!\n\n(*￣▽￣)b'
					thumbnail = successImg
				} else {
					color = '#FF0000'
					title = 'ERROR#104'
					description =
						'Invalid argument for command.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
					thumbnail = errorImg
				}
				let autoDeleteMsg = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(title)
					.setDescription(description)
					.setThumbnail(thumbnail)
				msg.channel.send(autoDeleteMsg).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on') {
						x.delete({ timeout: 10000 })
					}
				})
        .catch(console.error)
				break
			}

			// ================= COMMAND: SETUP ===================
			case 'settings': {
				let autoDelete,
					banNotice,
					welcome,
					welcome2,
					goodbye,
					goodbye2,
					warningRole,
					warningChannel,
					enterCard,
					exitCard
				// This is the code for Auto-Delete
				if (serverData.settings.autoDelete == 'off') {
					autoDelete = '`OFF`'
				} else {
					autoDelete = '`ON`'
				}

				// This is the code for Ban Notices
				if (serverData.settings.banNotice.enabled == true) {
					banNotice =
						'`ON` ' + '[<#' + serverData.settings.banNotice.channel + '>]'
				} else {
					banNotice = '`OFF`'
				}

				//This is the code for welcome messages
				if (!serverData.settings.greetings.enter.channel == '') {
					welcome =
						'`ON`' +
						' [<#' +
						serverData.settings.greetings.enter.channel +
						'>]'
				} else {
					welcome = '`OFF`'
				}
				if (!serverData.settings.greetings.enter.message == '') {
					welcome2 = serverData.settings.greetings.enter.message
				} else {
					welcome2 = '`N/A`'
				}

				//This is the code for exit messages
				if (!serverData.settings.greetings.exit.channel == '') {
					goodbye =
						'`ON`' + ' [<#' + serverData.settings.greetings.exit.channel + '>]'
				} else {
					goodbye = '`OFF`'
				}

				if (!serverData.settings.greetings.exit.message == '') {
					goodbye2 = serverData.settings.greetings.exit.message
				} else {
					goodbye2 = '`N/A`'
				}

				//Code for warnings
				if (!serverData.settings.warnings.role == '') {
					warningRole = '<@&' + serverData.settings.warnings.role + '>'
				} else {
					warningRole = '`N/A`'
				}

				if (!serverData.settings.warnings.channel == '') {
					warningChannel = '<#' + serverData.settings.warnings.channel + '>'
				} else {
					warningChannel = '`N/A`'
				}
				// Welcome card format
				if (serverData.settings.greetings.enter.useCard == true) {
					enterCard = '`CARD`'
				} else {
					enterCard = '`TEXT ONLY`'
				}
				//Exit card format
				if (serverData.settings.greetings.exit.useCard == true) {
					exitCard = '`CARD`'
				} else {
					exitCard = '`TEXT ONLY`'
				}

				let s = ''
				let i = 1
				if (serverData.addRooms.length > 0) {
					for (let cat of serverData.addRooms) {
						s +=
							'`' +
							i +
							'`' +
							'｜' +
							msg.guild.channels.cache.get(cat.channelID).name +
							' `[' +
							cat.header +
							']`\n'
						i += 1
					}
				} else {
					s = 'There are no channels available.'
				}
				const settingsMsg = new Discord.MessageEmbed()
					.setColor('#22AAFF')
					.setTitle('SETTINGS')
					.setDescription(
						'__**Greetings**__\n' +
							'Welcome Messages: ' +
							welcome +
							'\n' +
							'Current Message: `' +
							welcome2 +
							'`\n' +
							'Format: ' +
							enterCard +
							'\n\n' +
							'Exit Messages: ' +
							goodbye +
							'\n' +
							'Current Message: `' +
							goodbye2 +
							'`\n' +
							'Format: ' +
							exitCard +
							'\n\n' +
							'__**Warnings**__\n' +
							'Warning Role: ' +
							warningRole +
							'\n' +
							'Warning Channel: ' +
							warningChannel +
							'\n' +
							'Warnings Before Ban: ' +
							serverData.settings.warnings.maxWarnings +
							'\n\n' +
							'__**Miscellaneous**__\n' +
							'Auto-Delete: ' +
							autoDelete +
							'\n' +
							'Ban Notifications: ' +
							banNotice +
							'\n\n' +
							'__**Temporary VC Categories**__\n' +
							s
					)
					.setThumbnail(
						'https://3.bp.blogspot.com/-dxDKUaKwMP8/V5Xcuv7fzLI/AAAAAAAA8tA/JZ8m_pCug9kB1v-Sn5_ng23I0x7ysLcSQCLcB/s800/breaker_siwtch.png'
					)
				msg.channel.send(settingsMsg).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on') {
						x.delete({ timeout: 30000 })
					}
				})
        .catch(console.error)
				break
			}

			case 'help': {
				msg.channel.send(helpMsg).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on') {
						x.delete({ timeout: 30000 })
					}
				})
        .catch(console.error)
				break
			}

			// ================= COMMAND: REIZER ===================
			case 'reizer': {
				const reizerNoelle = new Discord.MessageEmbed()
					.setColor('#CC2355')
					.setTitle('REIZER IS NOELLE!')
					.setDescription('Reizer has become Noelle.\n\n' + 'VERY VERY NOELLE!')
					.setThumbnail(
						'https://static.wikia.nocookie.net/gensin-impact/images/a/a5/Character_Noelle_Portrait.png/revision/latest/scale-to-width-down/1000?cb=20200916183843'
					)

				msg.client.guilds.cache
					.get(msg.guild.id)
					.members.fetch()
					.then(x =>
						x.find(y => y == '463363981885702171').setNickname('Noelle')
					)
          .catch(console.error)

				msg.channel.send(reizerNoelle)
				break
			}

			// ================= COMMAND: SEND ===================
			case 'send': {
				let color = '#FF0000'
				let title, thumbnail
				let description = ''
				let item = functions.capitalize(args[0].toLowerCase())

				functions.checkUserCreate(msg.author.id, msg, serverData)

				// Check if requesting list of items
				if (args[0] == 'list') {
					color = '#22AAFF'
					title = 'AVAILABLE ITEMS'
					thumbnail =
						'https://1.bp.blogspot.com/-r7LqBL2a1GA/XaKa2g3kWXI/AAAAAAABVjY/tryXn3QOacc1U9WGpKPjsggNRsIyUEhHwCNcBGAsYHQ/s1600/document_list.png'
					for (let thing in sendDB) {
						description += '\n' + thing
					}
				}

				// Check if item is in database
				else if (!sendDB.hasOwnProperty(item)) {
					title = 'SORRY!'
					description =
						"We couldn't find what you were looking for...\n" +
						'Please try again with something else!\n' +
						'.･ﾟﾟ･(／ω＼)･ﾟﾟ･.'
					thumbnail =
						'https://1.bp.blogspot.com/-O0be-YZrwxM/VPQTvmJKGJI/AAAAAAAAsBQ/lvNy3XVOj3I/s800/apron_man2-4think.png'
				} else {
					// Check if the user has enough coins
					if (serverData.inventory[msg.author.id].coins < 1) {
						title = 'INSUFFICIENT FUNDS'
						description =
							"Sorry, you don't have enough coins to send anything!" +
							'\n\n(っ´ω`)ﾉ(╥ω╥)'
						thumbnail =
							'https://1.bp.blogspot.com/-oprrZCV9lro/X3hGCBvmhbI/AAAAAAABbnE/AI_pfFR-3-McDcdG4SILSMsE6UVNgcF5gCNcBGAsYHQ/s1600/money_saifu_kara_man.png'
					}

					// Check if user was mentioned
					else if (msg.mentions.members.size == 0) {
						title = 'DELIVERY FAILED!'
						description = sendDB[item].onFail
						thumbnail = sendDB[item].onFailImg
					}
					// Send the item and take coins
					else {
						functions.takeCoin(1, msg.author.id, msg, serverData)
						color = '#22AAFF'
						title = item.toUpperCase() + ' DELIVERED!'
						description =
							msg.author.toString() +
							' sent ' +
							msg.mentions.users.first().toString() +
							' ' +
							sendDB[item].nominal +
							' ' +
							item.toLowerCase() +
							'.\n\n Enjoy! ✧ﾟ(〃＾▽＾〃)ﾟ✧'
						thumbnail = sendDB[item].img
					}
				}
				let sendMsg = new Discord.MessageEmbed()
					.setFooter(
						serverData.inventory[msg.author.id].coins,
						'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'
					)
					.setColor(color)
					.setDescription(description)
					.setThumbnail(thumbnail)
					.setAuthor(
						msg.author.tag.toUpperCase(),
						msg.author.displayAvatarURL()
					)
					.setTitle(title)
				msg.channel.send(sendMsg)
				break
			}

			// ================= COMMAND: MAKECHANNEL ===================
			case 'makechannel': {
        readServer(msg.guild.id)
        if (!msg.member.hasPermission('ADMINISTRATOR')){
          msg.channel.send(adminError)
        }
        else if (args.length == 0){
          msg.channel.send(invalidMsg)
        }
        else {
          msg.guild.channels.create(
            args.slice(0).join(' '),
            {type: 'voice'}
          )
          .then(x => {
            readServer(msg.guild.id)
            serverData.addRooms.push({
              channelID: x.id,
              catName: args.slice(0).join(' '),
              header: '',
              roomName: 'New Room'
            })
            writeServer(msg.guild.id)
          })
          .catch(console.err)
          let addChSuccess = new Discord.MessageEmbed()
            .setColor('#22AAFF')
            .setTitle('SUCCESS!')
            .setThumbnail(successImg)
            .setDescription(
              'Channel `' + args.slice(0).join(' ') +
							'` successfully created!\n'+'\nExample: `New Room`' + '\n\nYou can change the header and default roomname with\n`!sb setheader [header]`\n.' + 
              '`!sb setroomname [roomname]`\n' +
              'Use `!INC!` to use dynamic room numbers.'
            )
            msg.channel.send(addChSuccess)
        }
        break
      }

      case 'setheader': {
        let color = '#FF0000'
        let title, description
        if (!msg.member.hasPermission('ADMINISTRATOR')){
          msg.channel.send(adminError)
        }
        else if (args.length == 0) {
          msg.channel.send(alerts.invalidMsg)
        }
        else if (args[0] > serverData.addRooms.length || 
                 args[0].match(/^[0-9]+$/) == null){
          title = "ERROR#203"
          description = 'The category you are trying to modify does not exist.\n\n☆ｏ(＞＜；)○'
          thumbnail = errorImg
        }
        else {
          let roomNum = parseInt(args[0]-1)
          serverData.addRooms[roomNum].header = args.slice(1).join(' ')
          title = "SUCCESS!"
          description = "Header of category #" + args[0] + 
            " has been set to `" + args.slice(1).join(' ') + "`!" +
            "\n\nヽ(o＾▽＾o)ノ"
            thumbnail = successImg
            color = '#22AAFF'
        }
        let headerMsg = new Discord.MessageEmbed()
          .setTitle(title)
          .setDescription(description)
          .setColor(color)
          .setThumbnail(thumbnail)
        msg.channel.send(headerMsg)
        break
      }

      case 'setroomname': {
        let color = '#FF0000'
        let title, description
        let roomNum = args[0].toString
        if (!msg.member.hasPermission('ADMINISTRATOR')){
          msg.channel.send(adminError)
        }
        else if (args.length == 0) {
          msg.channel.send(invalidMsg)
        }
        else if (args[0] > serverData.addRooms.length || 
                 args[0].match(/^[0-9]+$/) == null){
          title = "ERROR#501"
          description = 'The category you are trying to modify does not exist.\n\n☆ｏ(＞＜；)○'
          thumbnail = errorImg
        }
        else {
          let roomNum = parseInt(args[0]-1)
          serverData.addRooms[roomNum].roomName = args.slice(1).join(' ')
          title = "SUCCESS!"
          description = "Room name of category #" + args[0] + 
            " has been set to `" + args.slice(1).join(' ') + "`!" +
            "\n\nヽ(o＾▽＾o)ノ"
            thumbnail = successImg
            color = '#22AAFF'
        }
        let headerMsg = new Discord.MessageEmbed()
          .setTitle(title)
          .setDescription(description)
          .setColor(color)
          .setThumbnail(thumbnail)
        msg.channel.send(headerMsg)
        break
      }

			// ================= COMMAND: RENAME ===================
			case 'rename': {
				let gStorage = serverData.tempRooms
				serverData.tempRooms.find(y => y.roomID == msg.member.voice.channelID)
					.renamesLeft--

				let renamesLeft = gStorage.find(
					y => y.roomID == msg.member.voice.channelID
				).renamesLeft

				if (msg.member.voice.channel != null) {
					if (renamesLeft >= 0) {
						//Find current room's parentID
						let theParentID = gStorage.find(
							x => x.roomID == msg.member.voice.channelID
						).parentID
						//Find the parent's header
						let theHeader = serverData.addRooms.find(
							x => x.channelID == theParentID
						).header

						msg.member.voice.channel.setName(theHeader + args.join(' '))
						writeServer(msg.guild.id)
						const renameMsg = new Discord.MessageEmbed()
							.setColor('#00FF00')
							.setTitle('SUCCESS!')
							.setDescription(
								'Room name successfully changed to `' +
									args.join(' ') +
									'`!\n' +
									'Name changes remaining: ' +
									renamesLeft
							)
							.setThumbnail(successImg)
						msg.channel.send(renameMsg).then(x => {
              readServer(msg.guild.id)
							if (serverData.settings.autoDelete == 'on') {
								x.delete({ timeout: 10000 })
							}
						})
            .catch(console.error)
					} else {
						msg.channel.send(renameError2).then(x => {
              readServer(msg.guild.id)
							if (serverData.settings.autoDelete == 'on') {
								x.delete({ timeout: 10000 })
							}
						})
            .catch(console.error)
						serverData.tempRooms.find(
							y => y.roomID == msg.member.voice.channelID
						).renamesLeft = 0
						break
					}
				} else {
					msg.channel.send(renameError1)
				}
				break
			}

      // ================= COMMAND: SHOWROOMS ===================
      case 'showchannels': {
        let description = '**__List of Channels__**'
        if (serverData.addRooms.length > 0){
          let element = 1
          for (let room of serverData.addRooms){

            description +=
              "\n`" + element + " - " + room.catName + 
              " (" + room.header + room.roomName + ")`"
              element += 1
          }
        }
        else {
          description = "There are currently no temporary voice channel categories."
        }
        let roomsMsg = new Discord.MessageEmbed()
          .setAuthor(msg.guild.name.toUpperCase(), msg.guild.iconURL())
          .setDescription(description)
        msg.channel.send(roomsMsg)
        break
      }

			// ================= COMMAND: BANNOTICE ===================
			case 'bannotice': {
				let color
				let title
				let message
				if (msg.member.hasPermission('ADMINISTRATOR')) {
					if (
						msg.guild.channels.cache.find(
							x => x == msg.mentions.channels.first()
						)
					) {
						serverData.settings.banNotice.channel = msg.mentions.channels.first().id
						serverData.settings.banNotice.enabled = true
						color = '#00FF00'
						title = 'SUCCESS!'
						message =
							'Notice channel has successfully been changed to: ' +
							'<#' +
							msg.mentions.channels.first().id +
							'>'
						thumbnail = successImg
					} else {
						if (args.join('') == 'off') {
							serverData.settings.banNotice.enabled = false
							color = '#22AAFF'
							title = 'NOTIFICATIONS'
							message = 'Ban notifications have been turned `OFF`.'
						} else if (args == '' || !args) {
							color = '#FF0000'
							title = 'ERROR#301'
							message =
								'No channel was entered. Please tag a channel.' +
								'\n\nρ(- ω -、)ヾ(￣ω￣ )'
							thumbnail = errorImg
						} else {
							color = '#FF0000'
							title = 'ERROR#302'
							message =
								'Make sure to mention the desired channel.' +
								'\n\nρ(- ω -、)ヾ(￣ω￣ )'
							thumbnail = errorImg
						}
					}
					const noticeSet = new Discord.MessageEmbed()
						.setColor(color)
						.setTitle(title)
						.setDescription(message)
						.setThumbnail(thumbnail)
					msg.channel.send(noticeSet).then(x => {
						if (serverData.settings.autoDelete == 'on') {
							x.delete({ timeout: 10000 })
						}
					})
				} else {
					msg.channel.send(adminError).then(x => {
            readServer(msg.guild.id)
						if (serverData.settings.autoDelete == 'on') {
							x.delete({ timeout: 10000 })
						}
					})
          .catch(console.error)
				}
				break
			}

			// ================= COMMAND: SHUTUP ===================
			case 'shutup': {
				let title
				let description
				let thumbnail
				let color
				let nickname
				if (msg.member.hasPermission('MUTE_MEMBERS')) {
					nickname = msg.mentions.members.first().displayName

					if (
						msg.mentions.members.first().id != '744122183940440095' &&
						msg.mentions.members.first().id != '220763215355707394'
					) {
						msg.mentions.members.first().voice.setMute(true)
						title = nickname + 'はうるさい！'
						description =
							'ミュートだな\n少々黙ってください\n' +
							msg.mentions.users.first().toString() +
							' Σ(▼□▼メ)'
						thumbnail =
							'https://images.vexels.com/media/users/3/176941/isolated/preview/43fc9bbec3e306f9e6e5db5958cc7334-monkey-muzzle-silent-flat-sticker-by-vexels.png'
						color = '#BB13F2'
					} else {
						nickname = msg.member.displayName

						msg.member.voice.setMute(true)
						title = nickname + 'はうるさい！'
						description =
							'ばかめ\n' +
							'賢いと思ったのか？\n' +
							msg.author.toString() +
							' Σ(▼□▼メ)'
						thumbnail =
							'https://images.vexels.com/media/users/3/176941/isolated/preview/43fc9bbec3e306f9e6e5db5958cc7334-monkey-muzzle-silent-flat-sticker-by-vexels.png'
						color = '#BB13F2'
					}
				} else {
					color = '#FF0000'
					title = 'ERROR#102'
					description =
						'You do not have the permissions required to perform this action.' +
						'\n\nρ(- ω -、)ヾ(￣ω￣ )'
					thumbnail = errorImg
				}
				let shutupMsg = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(title)
					.setDescription(description)
					.setThumbnail(thumbnail)
				msg.channel.send(shutupMsg)
				break
			}

			// ================= COMMAND: WARN ===================
			case 'warn': {
				let gStorage = serverData.settings.warnings
				if (msg.member.hasPermission('KICK_MEMBERS')) {
					let author, color, title, description2, thumbnail
					let description = ''
					// Check warning command
					if (args[0] == 'check') {
						let user = msg.mentions.users.first()
						color = '#22AAFF'
						title = 'WARNINGS'
						thumbnail =
							'https://3.bp.blogspot.com/-wf5p8ilIxOQ/U00KH4pCHPI/AAAAAAAAfOk/CcOEZqgGMKY/s800/mark_chuui.png'

						// Check a single user
						if (msg.mentions.members.size > 0) {
							if (
								serverData.settings.warnings.users.find(x => x.id == user.id)
							) {
								description =
									'**' +
									msg.mentions.users.first().tag +
									'**\nThis user has ' +
									serverData.settings.warnings.users.find(x => x.id == user.id)
										.count +
									'/' +
									(serverData.settings.warnings.maxWarnings + 1) +
									' warnings.'
							} else {
								description =
									'**' +
									msg.mentions.users.first().tag +
									'**\nThis user has no warnings.'
							}
						}
						// Or just give the whole list
						else {
							description = '**__Warned Users__**'
							if (serverData.settings.warnings.users.length > 0) {
								for (let warnedMember of serverData.settings.warnings.users) {
									description +=
										'\n' +
										warnedMember.name +
										' - **' +
										warnedMember.count +
										'/' +
										(serverData.settings.warnings.maxWarnings + 1) +
										'**'
								}
							} else {
								description += '\nThere are currently no warned users.'
							}
						}
					} else if (args[0] == 'set') {
						if (msg.mentions.roles.size > 0) {
							serverData.settings.warnings.role = msg.mentions.roles.first().id
							description +=
								'Set the warning role to <@&' +
								serverData.settings.warnings.role +
								'>.\n'
						}
						if (msg.mentions.channels.size > 0) {
							serverData.settings.warnings.channel = msg.mentions.channels.first().id
							description +=
								'Set the warning channel to <#' + gStorage.channel + '>.\n'
						}
						if (args[1].match(/^\d+$/)) {
							serverData.settings.warnings.maxWarnings = parseInt(args[3])
							description +=
								'Set the max warnings to `' + gStorage.maxWarnings + '`.\n'
						}

						color = '#00FF00'
						title = 'SUCCESS!'
						description += '\nヽ(`⌒´メ)ノ'
						thumbnail = successImg
					}
					//If warning a user
					else if (
						args.length > 0 &&
						(args[0].includes('<@') || args[1].includes('<@'))
					) {
						let banCheck
						let reason
						let user = msg.mentions.members.first()
						if (!user.hasPermission('ADMINISTRATOR')) {
							//If warnings are setup
							if (!gStorage.channel == '' && !gStorage.role == '') {
								if (
									!args
										.slice(1)
										.join(' ')
										.replace('\\s+', '') == ''
								) {
									reason = args.slice(1).join(' ')
								} else {
									reason = 'No reason was specified.'
								}
								if (!gStorage.users.find(x => x.id == user.id)) {
									serverData.settings.warnings.users.push({
										name: msg.mentions.users.first().tag,
										id: msg.mentions.users.first().id,
										count: 1
									})
									reason +=
										'\nWarning count: ' +
										serverData.settings.warnings.users.find(
											x => x.id == user.id
										).count +
										'/' +
										(serverData.settings.warnings.maxWarnings + 1)
									if (
										serverData.settings.warnings.users.find(
											x => x.id == user.id
										).count == serverData.settings.warnings.maxWarnings
									) {
										reason += '\nThis is their last warning!. ┐(￣ヘ￣)┌'
									}
								} else if (
									gStorage.users.find(x => x.id == user.id).count ==
									gStorage.maxWarnings
								) {
									reason +=
										'\nWarning count: ' +
										(serverData.settings.warnings.maxWarnings + 1)
									serverData.settings.warnings.users.splice(
										serverData.settings.warnings.users.find(
											x => x.id == user.id
										),
										1
									)
									msg.mentions.members
										.first()
										.ban({
											days: 0,
											reason: 'Reached max number of warnings.'
										})
									banCheck = true
								} else {
									serverData.settings.warnings.users.find(
										x => x.id == user.id
									).count += 1
									reason +=
										'\nWarning count: ' +
										serverData.settings.warnings.users.find(
											x => x.id == user.id
										).count +
										'/' +
										(serverData.settings.warnings.maxWarnings + 1)
								}

								msg.mentions.members.first().roles.add(gStorage.role)
								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'You have successfully warned **' +
									msg.mentions.members.first().user.tag +
									'**.' +
									'\n\n(*￣▽￣)b **(' +
									serverData.settings.warnings.users.find(x => x.id == user.id)
										.count +
									'/' +
									(serverData.settings.warnings.maxWarnings + 1) +
									')**'
								if (banCheck == true) {
									description += "\n...and they've been banned. (ノ_<。)"
								}
								thumbnail = successImg

								let warnPost = new Discord.MessageEmbed()
									.setAuthor(
										msg.mentions.members.first().user.tag.toUpperCase() +
											' WAS WARNED',
										msg.mentions.members.first().user.displayAvatarURL()
									)
									.setColor('#FFFF00')
									.setDescription(reason + '\n')
									.setThumbnail(
										'https://2.bp.blogspot.com/-o-tX_ZQ4rlk/XAY5iBz8l7I/AAAAAAABQcI/sgNfuTzSRScAfrWnPvlpfOCp2xnrBkImACLcBGAs/s800/animal_chara_inu_police_shinken.png'
									)
									.setFooter(msg.author.tag, msg.author.displayAvatarURL())

								msg.guild.channels.cache
									.get(serverData.settings.warnings.channel)
									.send(warnPost)
							} else {
								color = '#FF0000'
								title = 'ERROR#401'
								description =
									'Role or channel not currently set.' +
									'\n\nρ(- ω -、)ヾ(￣ω￣ )'
								thumbnail = errorImg
							}
						} else {
							color = '#FF000'
							title = 'ERROR#402'
							description = 'You cannot warn an admin.' + '\n\n┌∩┐(◣_◢)┌∩┐'
							thumbnail = errorImg
						}
					} else {
						color = '#FF0000'
						title = 'ERROR#301'
						description =
							'Invalid command or arguments.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
						thumbnail = errorImg
					}

					let warnResponse = new Discord.MessageEmbed()
						.setColor(color)
						.setTitle(title)
						.setDescription(description)
						.setThumbnail(thumbnail)

					msg.channel.send(warnResponse).then(x => {
            readServer(msg.guild.id)
						if (serverData.settings.autoDelete == 'on' && command != 'give') {
							x.delete({ timeout: 10000 })
						}
					})
          .catch(console.error)
				}
				break
			}

			// ================= COMMAND: UNWARN ===================
			case 'unwarn': {
				let gStorage = serverData.settings.warnings
				if (msg.member.hasPermission('KICK_MEMBERS')) {
					let author, color, title, description2, thumbnail
					let description = ''
					color = '#00FF00'
					title = 'SUCCESS!'
					description += '\nヽ(`⌒´メ)ノ'
					thumbnail = successImg
				}
				//If unwarning a user
				if (
					args.length > 0 &&
					(args[0].includes('<@') || args[1].includes('<@'))
				) {
					let reason
					let user = msg.mentions.users.first()
					if (!gStorage.channel == '' && !gStorage.role == '') {
						if (!gStorage.users.find(x => x.id == user.id)) {
							color = '#FF0000'
							title = 'ERROR#403'
							description =
								'This user has no warnings, are you okay?\n\n' +
								'(⁄ ⁄•⁄ω⁄•⁄ ⁄)'
							thumbnail = errorImg
						} else {
							if (user == msg.author.id) {
								color = '#FF0000'
								title = 'ERROR#404'
								description =
									"Nice try, but you can't unwarn yourself.\n\n" +
									'(⁄ ⁄•⁄ω⁄•⁄ ⁄)'
								thumbnail = errorImg
							} else {
								serverData.settings.warnings.users.splice(
									serverData.settings.warnings.users.find(x => x.id == user.id),
									1
								)
								msg.mentions.members.first().roles.remove(gStorage.role)
								reason =
									"\nThis user's warnings have been removed.\n\n" +
									'☆ヾ(*´・∀・)ﾉヾ(・∀・`*)ﾉ☆'

								color = '#00FF00'
								title = 'SUCCESS!'
								description =
									'You have successfully unwarned ' +
									msg.mentions.members.first().user.tag +
									'.' +
									'\n\n(*￣▽￣)b'
								thumbnail = successImg

								let unwarnPost = new Discord.MessageEmbed()
									.setAuthor(
										msg.mentions.members.first().user.tag.toUpperCase() +
											' WAS UNWARNED',
										msg.mentions.members.first().user.displayAvatarURL()
									)
									.setColor('#FFFF00')
									.setDescription(reason)
									.setThumbnail(
										'https://4.bp.blogspot.com/-HiGln9A3BIo/V8VFGtK-zmI/AAAAAAAA9Zo/oyGGN-VifzofbVCSiUO3_eQE7B_5aA4hgCLcB/s800/smartphone_shimon_ninsyou.png'
									)
									.setFooter(msg.author.tag, msg.author.displayAvatarURL())

								msg.guild.channels.cache
									.get(serverData.settings.warnings.channel)
									.send(unwarnPost)
							}
						}
					} else {
						color = '#FF0000'
						title = 'ERROR#401'
						description =
							'Role or channel not currently set.' +
							'\n\nρ(- ω -、)ヾ(￣ω￣ )'
						thumbnail = errorImg
					}
				} else {
					color = '#FF0000'
					title = 'ERROR#301'
					description =
						'Invalid command or arguments.' + '\n\nρ(- ω -、)ヾ(￣ω￣ )'
					thumbnail = errorImg
				}
				let unwarnResponse = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(title)
					.setDescription(description)
					.setThumbnail(thumbnail)

				msg.channel.send(unwarnResponse).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on' && command != 'give') {
						x.delete({ timeout: 10000 })
					}
				})
        .catch(console.error)

				break
			}

			/*****************************************************************/
			/*                       CURRENCY COMMANDS                       */
			/*****************************************************************/
			// GACHA COMMAND
			case 'gacha': {
				// MAKE SURE THAT USER EXISTS
				functions.checkUserCreate(msg.author.id, msg, serverData)
				let balance = serverData.inventory[msg.author.id].coins
				let bet = parseInt(args[0])
				if (args.length < 1 || !args[0].match(/^[1-9][0-9]*$/)) {
					bet = 1
				}
				let color = '#22AAFF'
				if (balance < 1 || balance < args[0]) {
					color = '#FF0000'
					thumbnail =
						'https://1.bp.blogspot.com/-sZbaFXJ4y0A/UnyGKAJjwbI/AAAAAAAAacE/RYDWRq73Hsc/s800/gachagacha.png'
					description =
						"You don't have enough coins for this transaction." +
						'\n\n｡･ﾟ･(ﾉД`)ヽ(￣ω￣ )'
					thumbnail =
						'https://3.bp.blogspot.com/-QjlaX1HDfoc/WerK8JZ244I/AAAAAAABHrw/cWw8YmN-TNsb7PAvVNPQJSpMIdfMNtLNgCLcBGAs/s800/money_chokin_shippai_man.png'
				} else {
					let winnings = {}
					let tier = 1000
					let spots = 1000
					// Take bet coins from user
					functions.takeCoin(bet, msg.author.id, msg, serverData)
					description = '**__List of Winnings__**'

					while (bet > 0) {
						let roll = Math.floor(Math.random() * spots) + 1
						if (bet >= tier) {
							let base = 0
							for (let prize in gachaDB[tier.toString()]) {
								if (
									roll >= base + 1 &&
									roll <= spots * gachaDB[tier.toString()][prize] + base
								) {
									// Give prize
									if (winnings.hasOwnProperty(prize)) {
										winnings[prize] += 1
									} else {
										winnings[prize] = 1
									}
									if (!prize.charAt(0).match(/\d/)) {
										functions.giveItem(
											itemDB[prize],
											1,
											msg.author,
											msg,
											serverData
										)
									} else {
										functions.giveCoin(
											parseInt(prize.split(' ')[0]),
											msg.author.id,
											msg,
											serverData
										)
									}
									break
								} else {
									base += spots * gachaDB[tier.toString()][prize]
								}
							}
							bet -= tier
						} else {
							tier /= 10
						}
					}

					if (Object.keys(winnings).length < 1) {
						description += "\nSorry, you didn't win anything..."
					} else {
						for (let prize in winnings) {
							description += '\n`' + winnings[prize] + ' × ' + prize + '`'
						}
					}
					if (
						serverData.inventory[msg.author.id].items.hasOwnProperty(
							'Empty Capsule'
						)
					) {
						delete serverData.inventory[msg.author.id].items['Empty Capsule']
					}
				}
				let newBalance = functions.checkCoin(msg, serverData)
				let change = ''
				if (balance > newBalance) {
					change = '  (-'
				} else if (newBalance >= balance) {
					change = '  (+'
				}
				footer = newBalance + change + Math.abs(newBalance - balance) + ')'
				// GACHA MESSAGE CREATION
				let gachaMsg = new Discord.MessageEmbed()
					.setAuthor(
						msg.author.tag.toUpperCase(),
						msg.author.displayAvatarURL()
					)
					.setDescription(description)
					.setThumbnail(
						'https://1.bp.blogspot.com/-sZbaFXJ4y0A/UnyGKAJjwbI/AAAAAAAAacE/RYDWRq73Hsc/s800/gachagacha.png'
					)
					.setColor(color)
					.setFooter(
						footer,
						'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'
					)
				msg.channel.send(gachaMsg)
				// CLEAR USERS WITH NO COINS FOR SPACE
				functions.checkUserClear(msg.author.id, msg, serverData)
				break
			}
			///////////////////////////////// CRAFT COMMANDS ////////////////
			case 'craft': {
				functions.checkUserCreate(msg.author.id, msg, serverData)
				let item = functions.capitalize(args.join(' ').toLowerCase())
				let color = '#2266FF'
				let thumbnail, description
				let reqCheck = true

				// Check that item is in database
				if (!itemDB.hasOwnProperty(item)) {
					color = '#FF0000'
					description =
						"I don't know what you're trying to make." + '\n\n(￣ ￣|||)'
					thumbnail =
						'https://1.bp.blogspot.com/-_2ULJd4wnpY/Vt_t4uvo6_I/AAAAAAAA4p8/g9GiJFMKIvw/s800/figure_break_hammer.png'
				}

				// Check if the item is craftable
				else if (itemDB[item].materials == 'N/A') {
					color = '#FF0000'
					description = 'This item is not craftable.' + '\n\n(￣ ￣|||)'
					thumbnail =
						'https://1.bp.blogspot.com/-_2ULJd4wnpY/Vt_t4uvo6_I/AAAAAAAA4p8/g9GiJFMKIvw/s800/figure_break_hammer.png'
				} else {
					// Check that the user has enough materials
					for (let req in itemDB[item].materials) {
						if (
							!serverData.inventory[msg.author.id].items.hasOwnProperty(req)
						) {
							serverData.inventory[msg.author.id].items[req] = 0
						}
						if (
							serverData.inventory[msg.author.id].items[req] <
							itemDB[item].materials[req]
						) {
							reqCheck = false
						}
					}

					// Check if any materials were missing
					if (reqCheck == false) {
						color = '#FF0000'
						thumbnail =
							'https://1.bp.blogspot.com/-_2ULJd4wnpY/Vt_t4uvo6_I/AAAAAAAA4p8/g9GiJFMKIvw/s800/figure_break_hammer.png'
						description =
							"You don't have enough materials to craft this.\n\n" +
							'__Required Materials__'

						for (let req in itemDB[item].materials) {
							description +=
								'\n' +
								req +
								's: **' +
								serverData.inventory[msg.author.id].items[req] +
								'/' +
								itemDB[item].materials[req] +
								'**'
						}
						description += '\n\n(￣ ￣|||)'
					}

					// If all criteria is met
					else {
						for (let req in itemDB[item].materials) {
							functions.takeItem(
								itemDB[req],
								itemDB[item].materials[req],
								msg.author,
								msg,
								serverData
							)
						}

						// Roll for the itemDB
						let roll = Math.floor(Math.random() * (1 / itemDB[item].rate)) + 1
						if (roll != 1) {
							item = itemDB[item].onFail
						}
						functions.giveItem(itemDB[item], 1, msg.author, msg, serverData)

						// Craft the message
						description =
							'Crafting complete!\n\n' +
							'**__Materials Received__**\n' +
							'`1 × ' +
							itemDB[item].name +
							'`' +
							'\n\n(*￣▽￣)b'
						thumbnail = itemDB[item].img
					}
				}

				let craftMsg = new Discord.MessageEmbed()
					.setAuthor(
						msg.author.tag.toUpperCase(),
						msg.author.displayAvatarURL()
					)
					.setColor(color)
					.setDescription(description)
					.setThumbnail(thumbnail)
				msg.channel.send(craftMsg).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on') {
						x.delete({ timeout: 20000 })
					}
				})
        .catch(console.error)
				break
			}

			case 'check': {
				let description, thumbnail
				let footer1 = ''
				let footer2 = ''
				let s = 's'
				switch (args[0]) {
					case 'coins': {
						if (serverData.inventory.hasOwnProperty(msg.author.id)) {
							balance = serverData.inventory[msg.author.id].coins
						} else {
							balance = 0
						}
						if (balance == 1) {
							s = ''
						}
						description =
							'You currently have **' + balance + '** coins.' + '\n\n♡( ◡‿◡ )'
						thumbnail =
							'https://2.bp.blogspot.com/-L9Y0azgioZM/VUIKAyE9VyI/AAAAAAAAtcs/yVsc3Bbi-YQ/s800/tatemono_bank_money.png'
						footer1 = balance
						footer2 =
							'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'

						break
					}
					case 'items': {
						let itemList = ''
						if (
							Object.keys(serverData.inventory[msg.author.id].items).length == 0
						) {
							itemList = '\nYou currently have no items.'
						} else {
							for (let item in serverData.inventory[msg.author.id].items) {
								itemList +=
									'\n`' +
									serverData.inventory[msg.author.id].items[item] +
									' × ' +
									item +
									'`'
							}
						}
						description = '**__Your Items__**' + itemList + '\n\n♡( ◡‿◡ )'
						thumbnail =
							'https://4.bp.blogspot.com/-7d9gtgZP8zk/UsZtOUSG02I/AAAAAAAAczw/OkFZohxAjcI/s800/rucksack_backpack.png'
						break
					}
					default: {
						color = '#FF0000'
						description =
							"I don't know what you're trying to check!" + '\n\n(￣ ￣|||)'
						thumbnail =
							'https://3.bp.blogspot.com/-crV1Malk_E0/Vq880bMqpGI/AAAAAAAA3fc/RdzWT01dDKU/s800/pose_english_why_man.png'
					}
				}
				let checkMsg = new Discord.MessageEmbed()
					.setAuthor(
						msg.author.tag.toUpperCase(),
						msg.author.displayAvatarURL()
					)
					.setColor('#22AAFF')
					.setDescription(description)
					.setFooter(footer1, footer2)
					.setThumbnail(thumbnail)
				msg.channel.send(checkMsg).then(x => {
          readServer(msg.guild.id)
					if (serverData.settings.autoDelete == 'on') {
						x.delete({ timeout: 20000 })
					}
				})
        .catch(console.error)
				break
			}

			case 'give': {
				switch (args[0]) {
					case 'coins': {
						functions.checkUserCreate(msg.author.id, msg, serverData)
						let balance = serverData.inventory[msg.author.id].coins
						let description
						let footer1 = ''
						let footer2 = ''
						let thumbnail =
							'https://2.bp.blogspot.com/-L9Y0azgioZM/VUIKAyE9VyI/AAAAAAAAtcs/yVsc3Bbi-YQ/s800/tatemono_bank_money.png'
						let color = '#22AAFF'
						// Check to make sure valid coin amount was input
						if (!args[1].match(/^[1-9][0-9]*$/)) {
							description =
								'Please enter a valid coin amount.' + '\n\n(￣▽￣*)ゞ	'
							color = '#FF0000'
						}
						// Make sure the donee is not a bot
						else if (msg.mentions.users.first().bot == true) {
							description = "Bots can't have coins!" + '\n\n☆ｏ(＞＜；)○'
							color = '#FF0000'
						}
						// Then check if user has enough coins
						else if (parseInt(args[1]) == 0 || parseInt(args[1]) > balance) {
							description =
								"You don't have enough coins for this transaction." +
								'\n\n｡･ﾟ･(ﾉД`)ヽ(￣ω￣ )'
							color = '#FF0000'
							thumbnail =
								'https://3.bp.blogspot.com/-QjlaX1HDfoc/WerK8JZ244I/AAAAAAABHrw/cWw8YmN-TNsb7PAvVNPQJSpMIdfMNtLNgCLcBGAs/s800/money_chokin_shippai_man.png'
						} else {
							// Make sure there is a spot for the donee
							functions.checkUserCreate(
								msg.mentions.users.first().id,
								msg,
								serverData
							)

							// Do the exchange
							let amount = parseInt(args[1])
							let person1 = msg.author.id
							let person2 = msg.mentions.users.first().id
							functions.takeCoin(amount, person1, msg, serverData)
							functions.giveCoin(amount, person2, msg, serverData)

							// Set the message
							let s = 's'
							if (args[1] == '1') s = ''
							description =
								'You have successfully given ' +
								args[1] +
								' coin' +
								s +
								' to ' +
								msg.mentions.users.first().toString() +
								'!' +
								'\n\n☆^:.｡.o(≧▽≦)o.｡.:^☆'
							thumbnail =
								'https://2.bp.blogspot.com/-yXgWyAkRew4/V-H4c28KFmI/AAAAAAAA-Bg/_wM5iOCl7hA9rEMfR9XhcbzuAdhOhiFxACLcB/s800/money_futoppara.png'
							footer1 = balance - amount
							footer2 =
								'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'
						}
						let checkMsg = new Discord.MessageEmbed()
							.setAuthor(
								msg.author.tag.toUpperCase(),
								msg.author.displayAvatarURL()
							)
							.setColor(color)
							.setDescription(description)
							.setFooter(footer1, footer2)
							.setThumbnail(thumbnail)
						msg.channel.send(checkMsg)
					}
				}
				break
			}

			case 'sell': {
				let item, amount
				if (args.length < 2 || !args[0].match(/^\d+$/)) {
					args.unshift('1')
				}
				item = functions.capitalize(
					args
						.slice(1)
						.join(' ')
						.toLowerCase()
				)
				amount = args[0]
				functions.sellItem(item, amount, msg, serverData)
				break
			}

			case 'reset': {
				let footer1 = ''
				let footer2 = ''
				let thumbnail, description, color
				if (msg.member.hasPermission('ADMINISTRATOR')) {
					switch (args[0]) {
						case 'coins': {
							if (msg.mentions.members.size > 0) {
								functions.checkUserCreate(
									msg.mentions.users.first().id,
									msg,
									serverData
								)
								writeServer(msg.guild.id)
								readServer(msg.guild.id)
								footer1 =
									serverData.inventory[msg.mentions.users.first().id].coins +
									' coins were stolen!'
								serverData.inventory[msg.mentions.users.first().id].coins = 0
								functions.checkUserClear(
									msg.mentions.users.first().id,
									msg,
									serverData
								)
								description =
									'Oh no! A thief has stolen all of ' +
									msg.mentions.users.first().toString() +
									"'s coins!" +
									'\n\n･ﾟ･(｡>ω<｡)･ﾟ･'
								thumbnail =
									'https://1.bp.blogspot.com/-x1TYmvuJ0fk/WtRy4O60tbI/AAAAAAABLiU/gkNqSBKD-tEmPOwkilATzE_ukevNfWcdQCLcBGAs/s800/dorobou_money_kasoutsuuka_coin.png'
								footer2 =
									'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'

								writeServer(msg.guild.id)
								readServer(msg.guild.id)
							} else if (args[1] == 'all') {
								let stolenCoins = 0
								for (let member in serverData.inventory) {
									stolenCoins += serverData.inventory[member].coins
									serverData.inventory[member].coins = 0
									functions.checkUserClear(member, msg, serverData)
								}
								description =
									"Oh no! A thief has stolen everyone's coins!" +
									'\n\n･ﾟ･(｡>ω<｡)･ﾟ･'
								thumbnail =
									'https://1.bp.blogspot.com/-x1TYmvuJ0fk/WtRy4O60tbI/AAAAAAABLiU/gkNqSBKD-tEmPOwkilATzE_ukevNfWcdQCLcBGAs/s800/dorobou_money_kasoutsuuka_coin.png'
								footer1 = stolenCoins + ' coins were stolen!'
								footer2 =
									'https://1.bp.blogspot.com/-LegKewUIfcU/Wmf8QN1m58I/AAAAAAABJyg/B8cia110bPkYs4krzeM2SBhm9fXhO04tgCLcBGAs/s800/money_kasoutsuuka_kusa.png'
							} else {
								color = '#FF0000'
								description = 'Invalid or missing commands.' + '\n\n	|ʘ‿ʘ)╯'
								thumbnail = errorImg
							}
							break
						}
						case 'items': {
							thumbnail =
								'https://4.bp.blogspot.com/-7d9gtgZP8zk/UsZtOUSG02I/AAAAAAAAczw/OkFZohxAjcI/s800/rucksack_backpack.png'
							let stolenItems = 0
							if (msg.mentions.members.size > 0) {
								functions.checkUserCreate(
									msg.mentions.users.first().id,
									msg,
									serverData
								)
								for (let stuff in serverData.inventory[
									msg.mentions.users.first().id
								].items) {
									stolenItems +=
										serverData.inventory[msg.mentions.users.first().id].items[
											stuff
										]
								}
								serverData.inventory[msg.mentions.users.first().id].items = {}
								description =
									'Oh no! A thief has stolen all of ' +
									msg.mentions.users.first().toString() +
									"'s items!" +
									'\n\n･ﾟ･(｡>ω<｡)･ﾟ･'
								functions.checkUserClear(
									msg.mentions.users.first().id,
									msg,
									serverData
								)
								thumbnail =
									'https://2.bp.blogspot.com/-_qyJ_LAl06A/VMIvo_ua0mI/AAAAAAAAq_A/efeVzmfa_Oo/s800/yasai_dorobou.png'
								footer1 = stolenItems + ' items were stolen!'
								footer2 =
									'https://4.bp.blogspot.com/-7d9gtgZP8zk/UsZtOUSG02I/AAAAAAAAczw/OkFZohxAjcI/s800/rucksack_backpack.png'
							} else if (args[1] == 'all') {
								for (let member in serverData.inventory) {
									for (let stuff in serverData.inventory[member].items) {
										stolenItems += serverData.inventory[member].items[stuff]
									}
									serverData.inventory[member].items = {}
									functions.checkUserClear(member, msg, serverData)
								}
								description =
									"Oh no! A thief has stolen everyone's items!" +
									'\n\n･ﾟ･(｡>ω<｡)･ﾟ･'
								thumbnail =
									'https://2.bp.blogspot.com/-_qyJ_LAl06A/VMIvo_ua0mI/AAAAAAAAq_A/efeVzmfa_Oo/s800/yasai_dorobou.png'
								footer1 = stolenItems + ' items were stolen!'
								footer2 =
									'https://4.bp.blogspot.com/-7d9gtgZP8zk/UsZtOUSG02I/AAAAAAAAczw/OkFZohxAjcI/s800/rucksack_backpack.png'
							} else {
								color = '#FF0000'
								description = 'Invalid or missing commands.' + '\n\n	|ʘ‿ʘ)╯'
								thumbnail = errorImg
							}
							break
						}
						default: {
							color = '#FF0000'
							description = 'What are you trying to reset!?' + '\n\n	|ʘ‿ʘ)╯'
							thumbnail = errorImg
						}
					}
				} else {
					color = '#FF0000'
					thumbnail = errorImg
					description =
						"You don't have permissions to do this." + '\n\nψ( ` ∇ ´ )ψ'
				}
				let resetMsg = new Discord.MessageEmbed()
					.setDescription(description)
					.setThumbnail(thumbnail)
					.setFooter(footer1, footer2)
					.setColor(color)
					.setAuthor(
						msg.author.tag.toUpperCase(),
						msg.author.displayAvatarURL()
					)
				msg.channel.send(resetMsg)
				break
			}
			default: {
				msg.channel.send(alerts.commandErrorMsg)
			}
		}

		if (serverData.settings.autoDelete == 'on') {
      readServer(msg.guild.id)
			msg.delete({ timeout: 10000 })
		}
		writeServer(msg.guild.id)
	}
}
