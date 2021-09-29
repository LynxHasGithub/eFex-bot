const Discord = require("discord.js")
const CommandHandler = require('../modules/handlers/CommandHandler');
const EventHandler = require('../modules/handlers/EventHandler');
const Utils = require('../modules/utils')
const Embed = Utils.Embed;
const request = require('request-promise')
const path = require(`path`);

module.exports = async bot => {
 
  const CustomConfig = require('../modules/CustomConfig.js');
    const config = new CustomConfig(`./addon_configs/nuke.yml`, {
      Permission: "admin",
      Messages: {
        NoPermission:{
          Title: "You do not have permission to this command"
        },
        NoChannel: {
          Title: "That channel does not exisit."
        },
        NoArgs: {
          Title: "Correct Usage: nuke <channel>"
        },
        NukeMessage: {
          Title: "The channel has been nuked!",
          Description: "Why the fuck did I make this addon?"
        },
        Nuked: {
          Title: "That channel has been nuked k"
        }
      }
    }, {development: false})
    CommandHandler.set({
      name: "nuke",
      run: async (bot, message, args, { prefixUsed, commandUsed  }) => {
        if (!Utils.hasPermission(message.member, config.Permission)) return message.channel.send(Utils.setupEmbed({
          configPath: config.Messages.NoPermission,
        }))
        var channel;
        if (!args[0]) return message.channel.send(Utils.setupEmbed({
          configPath: config.Messages.NoArgs
        }))
        channel = Utils.ResolveChannel(message)
        if (!channel) return message.channel.send(Utils.setupEmbed({
          configPath: config.Messages.NoChannel
        }))
        let pos = [];
        pos.push(channel.position)
        channel.delete().then(() => {
          channel.clone().then(async channels => {
            await channels.setPosition(pos);
            channels.send(Utils.setupEmbed({
              configPath: config.Messages.NukeMessage,
            }))
            if (channel.id !== message.channel.id)message.channel.send(Utils.setupEmbed({
              configPath: config.Messages.Nuked
            }))
          })
        })


      },
      description: `Nukes a channel what is provided`,
      usage: `nuke <#channel>`,
      aliases: ["a"],
      type: 'general'
    })

}