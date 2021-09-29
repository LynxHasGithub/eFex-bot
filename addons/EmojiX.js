const Utils = require('../modules/utils')
const CommandHandler = require('../modules/handlers/CommandHandler')
const Embed = Utils.Embed;
const Discord = require("discord.js");
const ZUtils = require('../ZUtils.js')

module.exports = async bot => {
    const CustomConfig = require('../modules/CustomConfig.js');
    const config = new CustomConfig('./addon_configs/EmojiX-Steal.yml', {
        PermissionRole: "Staff",
        Embeds: {
            NoPermission: "You do not have permission to run this command.",
            NotAEmoji: "It's not an emoji.",
            NoLink: "Please Specify a link to add the emoji.",
            NoName: "Please Specify a name for emoji." 
        }
    })
    CommandHandler.set({
        name: "steal",
        run: async (bot, message, args, { prefixUsed, commandUsed }) => {

            switch(args[0]){

                case 'link':
                    if (!Utils.hasPermission(message.member, config.PermissionRole)) return message.channel.send(Embed({ title: config.Embeds.NoPermission }))
                    if (!args[1]) return message.channel.send(Embed({ title: config.Embeds.NoLink}))
                    if (!args[2]) return message.channel.send(Embed({ title: config.Embeds.NoName}))
                    message.guild.emojis.create(args[1], args[2])
                    .then(emojiParsedByLink => message.channel.send(Embed({ description: `**Emoji Added!**\n\nName: **${emojiParsedByLink.name}**\nID: **${emojiParsedByLink.id}**\nAnimated: **${emojiParsedByLink.animated}**` })))
                break;

                default:
                    if (!Utils.hasPermission(message.member, config.PermissionRole)) return message.channel.send(Embed({ title: config.Embeds.NoPermission }))
                    if (!args[0]) return message.channel.send(Embed({ title: config.Embeds.NotAEmoji}))
                    Object.values(args).forEach(async (h, i) =>  {
                    let emojiToAdd = Discord.Util.parseEmoji(args[i]);
                    message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emojiToAdd.id}.${emojiToAdd.animated ? "gif" : "png"}`, emojiToAdd.name)
                    .then(emojiParsed => message.channel.send(Embed({ description: `**Emoji Added!**\n\nName: **${emojiParsed.name}**\nID: **${emojiParsed.id}**\nAnimated: **${emojiParsed.animated}**` })))
                    })
                break;
            }
        },
        description: "Steals an provided emoji/link",
        usage: "steal <emoji/link> <emoji/link>",
        aliases: [],
        type: "general"
    })

    CommandHandler.set({
        name: "enlarge",
        run: async (bot, message, args, { prefixUsed, commandUsed }) => {

            if (!args[0]) return message.channel.send(Embed({ title: "Please provide a emoji."}))
            Object.values(args).forEach(async (h, i) =>  {
                let emoji = Discord.Util.parseEmoji(args[i]);
                message.channel.send(Embed({ image: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`}))
            })
        },
        description: "Steals an provided emoji/link",
        usage: "steal <emoji/link> <emoji/link>",
        aliases: [],
        type: "general"
    })


    CommandHandler.set({
        name: "emojify",
        run: async (bot, message, args, { prefixUsed, commandUsed }) => {
            let Characters = {
                "0": ":zero:",
                "1": ":one:",
                "2": ":two:",
                "3": ":three:",
                "4": ":four:",
                "5": ":five:",
                "6": ":six:",
                "7": ":seven:",
                "8": ":eight:",
                "9": ":nine:",
                "#": ":hash:",
                "*": ":asterisk:",
                "a": "🇦",
                "b": "🇧",
                "c": "🇨",
                "d": "🇩",
                "e": "🇪",
                "f": "🇫",
                "g": "🇬",
                "h": "🇭",
                "i": "🇮",
                "j": "🇯",
                "k": "🇰",
                "l": "🇱",
                "m": "🇲",
                "n": "🇳",
                "o": "🇴",
                "p": "🇵",
                "q": "🇶",
                "r": "🇷",
                "s": "🇸",
                "t": "🇹",
                "u": "🇺",
                "v": "🇻",
                "w": "🇼",
                "x": "🇽",
                "y": "🇾",
                "z": "🇿",
                "?": "?",
                "!": "!",
                " ": " ",
                ".": ".",
                ",": ",",
                ":": ":",
                ";": ";",
                "\"": "\"",
                "'": "'",
                "-": "-",
                "_": "_",
                "+": "+",
                "%": "%",
                "=": "=",
                "$": "$",
                "₹": "₹",
                "(": "(",
                ")": ")",
                "{": "{",
                "}": "}",
                "[": "[",
                "]": "]",
                "<": "<",
                ">": ">",
                "|": "|",
                "/": "/",
                "\~": "\~",
                "\\": "\\",
                "@": "@",
                "&": "&",
                "^": "^",
                "`": "`"
            }
            let toConvert = args.slice().join(" ")
            if (!toConvert) return message.channel.send(Embed({ title: "Please provide a message to emojify." }))
            if(toConvert.length >= 2000) return message.channel.send(Embed({ title: "Message exceeds 1000 Characters" }))
            let converted = toConvert.toLowerCase().split('').map(letter => { return `${Characters[letter]} `}).join('')
            try {
                message.channel.send(converted)
            } catch(err){
                message.channel.send(Embed({ title: "Message Exceeds Character Limit." }))
                console.log(error)
                return;   
            }
        },
        description: "emojifys provided text",
        usage: "emojify <text>",
        aliases: [],
        type: "general"
    })
}
ZUtils.LoadAddon("EmojiX")