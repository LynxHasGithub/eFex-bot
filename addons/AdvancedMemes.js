const Utils = require("../modules/utils.js");
const { config, lang, commands } = Utils.variables;
const Embed = Utils.Embed;
const CommandHandler = require('../modules/handlers/CommandHandler');
const eventHandler = require('../modules/handlers/EventHandler');
const CustomConfig = require('../modules/CustomConfig.js');
const utilsPlus = require("../59Utils.js");
const request = require("request-promise")

module.exports = async bot => {
    const addonConfig = new CustomConfig("./addon_configs/AdvancedMemes.yml", {
        RequiredRole: "@everyone",
        "~1": 'What role is required to run the meme command?',
        AllowNsfw: true,
        "~2": 'Should posts that are rated 18+ be allowed',
        SubReddit: {
            Type: "fixed",
            "~3": 'Used when a user doesnt define a subreddit or',
            "~33": 'AllowCustomSubreddits is set to false (Fixed/Random)',
            AllowCustomSubreddits: true,
            "~4": 'Should users be able to define what subreddit?',
            Default: 'dankmemes',
            "~5": 'What subreddit do you want to use if ',
            "~55": 'AllowCustomSubReddits is false and Type is set to Fixed',
            Limit: 20,
            "~6": 'How many memes should be grabbed at once? Higher numbers may cause lag',
            BlackListed: [
                "example1",
                "example2",
                "example3"
            ],
            "~7": 'List of blacklisted subreddits',
            RandomSubReddits: [
                "dankmemes",
                "memes",
                "wholesomememes",
                "raimimemes",
                "memeeconomy",
                "metal_me_irl"
            ],
            "~8": 'List of random subreddits, only used if Type is set to "Random"',
        },
        AutoPost: {
            Enabled: false,
            "~10": 'Should autoposting memes be enabled',
            Type: "Random",
            "~11": 'What subreddit type should be used (Fixed/Random)',
            Interval: 60000,
            "~12": 'Time in milliseconds',
            Guild: {
                Id: '678289470642061323',
                "~13": 'What is the id for the guild where memes are posted',
                Channel: 'AutoMemes',
                "~14": 'What is the name of the channel to which memes are posted in',
            }
        },
        Embeds: {
            Success: {
                MemeEmbed: {
                    Title: '{title}',
                    URL: '{url}',
                    Image: '{image}',
                    Footer: '馃憤 {ups} | 馃挰 {comments} ({category})',
                    "~9": 'Global vars are {title}, {url}, {ups}, {comments}, {category}, {image}',
                    Color: config.EmbedColors.Success
                },
            },
            Errors: {
                ErrorFetching: {
                    Description: 'There was an error fetching memes from this subreddit. Please try another subreddit',
                    Color: config.EmbedColors.Error
                },
                PrivateCategory: {
                    Description: 'This category is private. Please try another category',
                    Color: config.EmbedColors.Error
                }
            }
        }
    })
    async function getRandomMeme(subreddit, callback) {
        const memes = [];
        request("https://reddit.com/r/" + subreddit + "/.json?limit=" + addonConfig.SubReddit.Limit, async function (error, response, body) {
            const content = await JSON.parse(body)
            if (error) {
                console.log(utilsPlus.addonPrefix + Utils.errorPrefix + `There was an error fecting memes. Error: ${error.message}`)
                return callback()
            }
            if (content.error) {
                console.log(utilsPlus.addonPrefix + Utils.errorPrefix + `There was an error fetching memes. Reason: ${content.reason} ErrorCode: ${content.error}`)
                return callback(content.error)
            }
            content.data.children.forEach(entry => {
                let imageUrl = entry.data.url;
                if (addonConfig.AllowNsfw == false && entry.data.over_18 == true || entry.data.is_video == true) return;
                if (!imageUrl || imageUrl.includes('gfycat') || imageUrl.includes('.gifv') || imageUrl.includes('imgur.com') || imageUrl.includes('makeagif.com') || imageUrl.includes('v.redd.it') || !imageUrl.includes('i.redd.it')) return;
                if (!imageUrl.includes('gfycat') && !imageUrl.includes('.gifv') && !imageUrl.includes('png') && !imageUrl.includes('jpg') && !imageUrl.includes('gif')) {
                    imageUrl = imageUrl + '.png'
                }
                memes.push({
                    title: entry.data.title,
                    imageUrl: imageUrl,
                    url: "https://reddit.com" + entry.data.permalink,
                    ups: entry.data.ups,
                    comments: entry.data.num_comments
                })
            })
            callback(memes)
        })
    }
    //Command
    CommandHandler.set({
        name: 'meme',
        run: async (bot, message, args) => {
            let role = Utils.findRole(addonConfig.RequiredRole, message.guild)
            if (!role) return message.channel.send(Embed({ preset: 'console' }));
            if (!Utils.hasPermission(message.member, addonConfig.RequiredRole)) return message.channel.send(Embed({ preset: 'nopermission' }))
            const category = addonConfig.SubReddit.Type.toLowerCase() === 'fixed' && addonConfig.SubReddit.AllowCustomSubreddits === false ? addonConfig.SubReddit.Default : addonConfig.SubReddit.Type.toLowerCase() === 'random' && addonConfig.SubReddit.AllowCustomSubreddits === false ? addonConfig.SubReddit.RandomSubReddits[Math.floor(Math.random() * addonConfig.SubReddit.RandomSubReddits.length)] : addonConfig.SubReddit.Type.toLowerCase() === 'fixed' && addonConfig.SubReddit.AllowCustomSubreddits === true ? addonConfig.SubReddit.Default : args[0] || addonConfig.SubReddit.Default
            if (addonConfig.SubReddit.BlackListed.find(c => c.toLowerCase() == category.toLowerCase())) return message.channel.send(Embed({ color: config.EmbedColors.Error, description: 'This category is blacklisted, please try another one.' }))
            await getRandomMeme(category, function (memes) {
                if (memes == 403) return message.channel.send(Utils.setupEmbed({
                    configPath: addonConfig.Embeds.Errors.PrivateCategory
                }))
                if (!memes || memes.length === 0) {
                    return message.channel.send(Utils.setupEmbed({
                        configPath: addonConfig.Embeds.Errors.ErrorFetching
                    }))
                } else {
                    let curMeme = memes[Math.floor(Math.random() * memes.length)]
                    console.log(curMeme)
                    message.channel.send(Utils.setupEmbed({
                        configPath: addonConfig.Embeds.Success.MemeEmbed,
                        variables: [
                            { searchFor: /{ups}/g, replaceWith: curMeme.ups },
                            { searchFor: /{image}/g, replaceWith: curMeme.imageUrl },
                            { searchFor: /{comments}/g, replaceWith: curMeme.comments },
                            { searchFor: /{title}/g, replaceWith: curMeme.title },
                            { searchFor: /{url}/g, replaceWith: curMeme.url },
                            { searchFor: /{category}/g, replaceWith: category }
                        ]
                    }))
                }
            })
        },
        description: "Get a meme from a subreddit",
        usage: 'meme [subreddit]',
        aliases: [],
        type: 'fun'
    })

    if (addonConfig.AutoPost.Enabled) {
        setInterval(() => {
        const category = addonConfig.AutoPost.Type.toLowerCase() === 'fixed' ? addonConfig.SubReddit.Default : addonConfig.AutoPost.Type.toLowerCase() === 'random' ? addonConfig.SubReddit.RandomSubReddits[Math.floor(Math.random() * addonConfig.SubReddit.RandomSubReddits.length)] : addonConfig.SubReddit.Default
        const guild = bot.guilds.cache.get(addonConfig.AutoPost.Guild.Id)
        if (!guild) return;
        const channel = Utils.findChannel(addonConfig.AutoPost.Guild.Channel, guild);
        if (!channel) return;
            getRandomMeme(category, function (memes) {
                if (memes == 403) return message.channel.send(Utils.setupEmbed({
                    configPath: addonConfig.Embeds.Errors.PrivateCategory
                }))
                if (!memes || memes.length === 0) {
                    return message.channel.send(Utils.setupEmbed({
                        configPath: addonConfig.Embeds.Errors.ErrorFetching
                    }))
                } else {
                    let curMeme = memes[Math.floor(Math.random() * memes.length)]
                    channel.send(Utils.setupEmbed({
                        configPath: addonConfig.Embeds.Success.MemeEmbed,
                        variables: [
                            { searchFor: /{ups}/g, replaceWith: curMeme.ups },
                            { searchFor: /{image}/g, replaceWith: curMeme.imageUrl },
                            { searchFor: /{comments}/g, replaceWith: curMeme.comments },
                            { searchFor: /{title}/g, replaceWith: curMeme.title },
                            { searchFor: /{url}/g, replaceWith: curMeme.url },
                            { searchFor: /{category}/g, replaceWith: category }
                        ]
                    }))
                }
            })
        }, parseInt(addonConfig.AutoPost.Interval))
    }
    utilsPlus.loadAddon(__filename, '.js')
}