const Utils = require("./modules/utils.js");
const chalk = require('chalk');
const { normalize } = require("ffmpeg-static");

module.exports = {
    Prefix: {
        Addon: chalk.hex("#00DCFF").bold("[Zorino-Addon] "), 
        EconomyX: chalk.hex("#00DCFF").bold("[EconomyX] ")
    },
    LoadAddon: function(name){
        console.log(module.exports.Prefix.Addon + name + " Has been Loaded!")
    },
    InstallModule: async function(name) {
        if (process.argv.slice(2).map(a => a.toLowerCase()).includes("--no-install"));
        else {
            const { exec } = require('child_process');
            const showInfo = process.argv.slice(2).map(a => a.toLowerCase()).includes("--show-install-output");
            console.log(module.exports.Prefix.Addon + `Installing Dependency Module (${name})`);
            await exec(`npm i ${name}`, (error, stdout) => {
                if (error) {
                    if(showInfo) console.log(module.exports.Prefix.Addon + error)
                } else {
                    if(showInfo) console.log(module.exports.Prefix.Addon + stdout)
                }
            });
        }
    },
    setupDatabase: async function (name = 'ZAddons.db') {
        return new Promise(async (resolve, reject) => {
          try {
            const SqlDatabase = require('better-sqlite3');
            const db = new SqlDatabase(name);
            resolve(db);
          } catch (err) {
            reject(err);
          }
        })
    },
    setupTable: async function (db, tableName, values) {
        return new Promise(async (resolve, reject) => {
            console.log(module.exports.Prefix.Addon + `Setting up Database. (${tableName})`)
          try {
            db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} (${values})`).run()
            console.log(module.exports.Prefix.Addon + `Database Ready. (${tableName})`)
          } catch (err) {
            console.log(module.exports.Prefix.Addon + `An error occured while setting up database. (${tableName})`)
            reject(err);
          }
        })
    },
}