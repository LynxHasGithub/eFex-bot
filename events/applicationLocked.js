const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, application, executor) => {

    if (!config.Applications.Logs.Enabled) return;
    
    let guild = bot.guilds.cache.get(application.guild);
    let applicant = guild.member(application.creator);
    let logs = Utils.findChannel(config.Applications.Logs.Channel, guild)

    if (!logs) return

    logs.send(Utils.Embed({
        title: lang.TicketModule.Logs.Applications.Locked.Title,
        fields: [
            {
                name: lang.TicketModule.Logs.Applications.Locked.Fields[0],
                value: application.channel_name
            }, {
                name: lang.TicketModule.Logs.Applications.Locked.Fields[1],
                value: applicant ? applicant : application.creator
            }, {
                name: lang.TicketModule.Logs.Applications.Locked.Fields[2],
                value: executor
            }
        ]
    }))
}
// 239232   8501   2229706    63250   1613689679   NULLED BY 0xEB   2229706