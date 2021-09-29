const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, emoji) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0)  {
        if (!Utils.variables.config.Logs.Enabled.includes("EmojiCreated")) return;
        
        const logs = Utils.findChannel(Utils.variables.config.Logs.Channels.EmojiCreated, emoji.guild);
        
        logs.send(Utils.Embed({
            title: lang.LogSystem.EmojiCreated.Title,
            fields: [
                {
                    name: lang.LogSystem.EmojiCreated.Fields[0],
                    value: emoji.name
                }, {
                    name: lang.LogSystem.EmojiCreated.Fields[1],
                    value: emoji.id
                }, {
                    name: lang.LogSystem.EmojiCreated.Fields[2],
                    value: emoji.animated ? "Yes" : "No"
                }, {
                    name: lang.LogSystem.EmojiCreated.Fields[3],
                    value: `<:${emoji.name}:${emoji.id}>`
                }
            ],
            timestamp: Date.now()
        }))
    }
}
// 239232   8501   2229706    63250   1613689679   NULLED BY 0xEB   2229706