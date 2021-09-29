const Utils = require("../modules/utils.js");
const { config, lang, commands, embeds, db } = Utils.variables;
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const CommandHandler = require('../modules/handlers/CommandHandler');
const eventHandler = require('../modules/handlers/EventHandler');
const CustomConfig = require('../modules/CustomConfig.js');
const utilsPlus = require("../59Utils.js");

module.exports = async bot => {
  const addonConfig = new CustomConfig("./addon_configs/Afk.yml", {
    Afk: {
      RequiredRole: '@everyone',
      NoReason: 'This user did not specify why he is afk.',
      DeleteMessage: false,
      AfkRole: "afk",
      AfkTag: "[AFK] {oldName}",
      ChannelNotification: {
        Enabled: true,
        ChannelName: "Afk-Notifications"
      },
      Command: {
        name: "afk",
        description: "Mark yourself as afk letting everyone know your afk.",
        usage: "afk <reason>",
        aliases: [],
        type: 'other'
      }
    },
    AfkList: {
      RequiredRole: '@everyone',
      Command: {
        name: "afklist",
        description: "list all afk members.",
        usage: "afklist <page>",
        aliases: [],
        type: 'other'
      }
    },
    Embeds: {
      Success: {
        NowAfk: {
          Description: 'You are now afk!'
        },
        WelcomeBack: {
          Description: 'Welcome back {user-mention}! You were AFK for ``{time}``!'
        },
        UserIsAfk: {
          Description: '{user-mention} has been afk for {time}.\n**Reason:** ``{reason}``'
        },
        UserNowAfk: {
          Title: "New Afk Member",
          Fields: [
            {
              name: "馃檸鈥嶁檪锔� User",
              value: "{user-mention} ({user-id})",
              inline: false
            },
            {
              name: "馃摪 Reason",
              value: "{reason}",
              inline: false
            },
          ]
        },
        UserNolongerAfk: {
          Description: "{user-mention} ({user-id}) was afk for {time}",
        },
        AfkList: {
          Title: "Afk Members (Page {currentPage}/{totalPages})",
          Description: "{AfkMembers}",
          Format: "**{index}.** {member-mention} - {time}"
        }
      },
      Errors: {
        AlreadyAfk: {
          Title: "ERROR",
          Description: "You are already afk!",
          Color: config.EmbedColors.Error
        },
        NotEnoughPower: {
          Title: "ERROR",
          Description: "Please make sure my role is the highest in the server.",
          Color: config.EmbedColors.Error
        }
      }
    }
  }, true)
  const database = await utilsPlus.setupDatabase()
  database.prepare('CREATE TABLE IF NOT EXISTS Afk_Members(user TEXT, guild TEXT, reason TEXT, date TEXT)').run();
  const getMembers = database.prepare("SELECT * FROM Afk_Members WHERE guild=?");
  CommandHandler.set({
    name: addonConfig.Afk.Command.name,
    run: async (bot, message, args) => {
      if (!Utils.hasPermission(message.member, addonConfig.Afk.RequiredRole)) return message.channel.send(Embed({ preset: 'nopermission' }))
      if (await getMembers.all(message.guild.id).find(m => m.user === message.author.id && m.guild === message.guild.id)) return message.channel.send(Utils.setupEmbed({
        configPath: addonConfig.Embeds.Errors.AlreadyAfk
      }))
      const reason = args.length > 0 ? args.join(' ') : addonConfig.Afk.NoReason
      await database.prepare("INSERT INTO Afk_Members (user, guild, reason, date) VALUES (?, ?, ?, ?)").run(message.author.id, message.guild.id, reason, Date.now())
      if (addonConfig.Afk.AfkRole) {
        let role = Utils.findRole(addonConfig.Afk.AfkRole, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        message.member.roles.add(role).catch(err => { })
      }
      if (addonConfig.Afk.AfkTag) {
        const nickname = message.member.nickname ? message.member.nickname : message.author.username
        message.member.setNickname(addonConfig.Afk.AfkTag.replace(/{oldName}/g, nickname)).catch(err => {
          if (err.code === 50013) {
            message.channel.send(Utils.setupEmbed({
              configPath: addonConfig.Embeds.Errors.NotEnoughPower,
            }))
          } else {
            message.channel.send(Embed({ preset: 'console' }))
            console.log(err)
          }
        })
      }
      if (addonConfig.Afk.ChannelNotification.Enabled) {
        const channel = Utils.findChannel(addonConfig.Afk.ChannelNotification.ChannelName, message.guild)
        if (!channel) return;
        channel.send(Utils.setupEmbed({
          configPath: addonConfig.Embeds.Success.UserNowAfk,
          variables: [
            ...Utils.userVariables(message.member, 'user'),
            { searchFor: /{reason}/g, replaceWith: reason }
          ]
        })).catch(err => {
          message.channel.send(Embed({ preset: 'console' }))
          console.log(err)
        })
      }
      message.channel.send(Utils.setupEmbed({
        configPath: addonConfig.Embeds.Success.NowAfk
      }))
    },
    description: addonConfig.Afk.Command.description,
    usage: addonConfig.Afk.Command.usage,
    aliases: addonConfig.Afk.Command.aliases,
    type: addonConfig.Afk.Command.type
  })
  CommandHandler.set({
    name: addonConfig.AfkList.Command.name,
    run: async (bot, message, args) => {
      if (!Utils.hasPermission(message.member, addonConfig.AfkList.RequiredRole)) return message.channel.send(Embed({ preset: 'nopermission' }))
      const page = parseInt(args[0]) ? parseInt(args[0]) : 1
      const members = getMembers.all(message.guild.id);
      message.channel.send(Utils.setupEmbed({
        configPath: addonConfig.Embeds.Success.AfkList,
        variables: [
          { searchFor: /{currentPage}/g, replaceWith: page },
          { searchFor: /{totalPages}/g, replaceWith: Math.ceil(members.length / 10) < 1 ? 1 : Math.ceil(members.length / 10) },
          { searchFor: /{AfkMembers}/g, replaceWith: members.length > 0 ? members.slice((page - 1), page * 10).sort((a, b) => a.date - b.date).map((m, i) => addonConfig.Embeds.Success.AfkList.Format.replace(/{index}/g, i + 1).replace(/{member-mention}/g, `<@${m.user}>`).replace(/{time}/g, Utils.DDHHMMSSfromMS(Date.now() - m.date))).join("\n") : '``none``' }
        ]
      }))
    },
    description: addonConfig.AfkList.Command.description,
    usage: addonConfig.AfkList.Command.usage,
    aliases: addonConfig.AfkList.Command.aliases,
    type: addonConfig.AfkList.Command.type
  })
  eventHandler.set('message', async (bot, message) => {
    if (message.channel.type === 'dm') return;
    const guildPrefixes = [`<@!${bot.user.id}>`, await db.get.getPrefixes(message.guild.id), config.prefix]
    if (message.author.bot || guildPrefixes.find(p => message.content.startsWith(p))) return;
    const members = getMembers.all(message.guild.id)
    const mentioned = message.mentions.members.first();
    if (members.some(m => m.user === message.author.id)) {
      database.prepare("DELETE FROM Afk_Members WHERE guild=? AND user=?").run(message.guild.id, message.author.id)
      message.channel.send(Utils.setupEmbed({
        configPath: addonConfig.Embeds.Success.WelcomeBack,
        variables: [
          ...Utils.userVariables(message.member, 'user'),
          { searchFor: /{time}/g, replaceWith: Utils.DDHHMMSSfromMS(Date.now() - members.find(m => m.user === message.author.id).date) }
        ]
      }))
      if (addonConfig.Afk.AfkRole) {
        let role = Utils.findRole(addonConfig.Afk.AfkRole, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (message.member.roles.cache.has(role)) return;
        message.member.roles.remove(role).catch(err => { })
      }
      if (addonConfig.Afk.AfkTag && message.member.nickname) {
        const reg = new RegExp(`(${addonConfig.Afk.AfkTag.replace(' ', '|').replace(/\[/g, '\\[').replace(/\]/g, '\\]')})`, 'g')
        message.member.setNickname(message.member.nickname.replace(reg, '')).catch(err => {
          if (err.code === 50013) {
            message.channel.send(Utils.setupEmbed({
              configPath: addonConfig.Embeds.Errors.NotEnoughPower,
            }))
          } else {
            message.channel.send(Embed({ preset: 'console' }))
            console.log(err)
          }
        })
      }
      if (addonConfig.Afk.ChannelNotification.Enabled) {
        const channel = Utils.findChannel(addonConfig.Afk.ChannelNotification.ChannelName, message.guild)
        if (!channel) return;
        channel.send(Utils.setupEmbed({
          configPath: addonConfig.Embeds.Success.UserNolongerAfk,
          variables: [
            ...Utils.userVariables(message.member, 'user'),
            { searchFor: /{time}/g, replaceWith: Utils.DDHHMMSSfromMS(Date.now() - members.find(m => m.user === message.author.id).date) }
          ]
        }))
      }
    }
    if (mentioned && members.some(m => m.user === mentioned.id)) {
      const status = members.find(m => m.user === mentioned.id);
      if (addonConfig.Afk.DeleteMessage) message.delete()
      message.channel.send(Utils.setupEmbed({
        configPath: addonConfig.Embeds.Success.UserIsAfk,
        variables: [
          ...Utils.userVariables(mentioned, 'user'),
          { searchFor: /{reason}/g, replaceWith: status.reason },
          { searchFor: /{time}/g, replaceWith: Utils.DDHHMMSSfromMS(Date.now() - status.date) }
        ]
      }))
    }
  })
}