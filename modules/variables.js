const Utils = require('./utils.js');

module.exports = {
    set: function (variable, value, expireAfter = 0) {
        if (variable == 'set') return Utils.error('Cannot set variable \'set\'');
        this[variable] = value;
        if (expireAfter > 0)
            setTimeout(function () {
                delete this[variable];
            }, expireAfter);
        return value;
    }
}
// 239232   8501   2229706    63250   1613689679   NULLED BY 0xEB   2229706