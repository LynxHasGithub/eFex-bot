const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, role) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0)  {
        if (!Utils.variables.config.Logs.Enabled.includes("RoleDeleted")) return;

        const logs = Utils.findChannel(Utils.variables.config.Logs.Channels.RoleDeleted, role.guild);

        if (logs) logs.send(Utils.Embed({
            title: lang.LogSystem.RoleDeleted.Title,
            fields: [
                {
                    name: lang.LogSystem.RoleDeleted.Field,
                    value: role.name
                }
            ]
        }))
    }
}
// 239232   8501   2229706    63250   1613689679   NULLED BY 0xEB   2229706