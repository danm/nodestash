//node modules
const fs = require('fs');
const Transform = require('stream').Transform;

//npm modules
const CIDRMatcher = require('cidr-matcher');
let cidrMatch;

//custom modules
const csvparse = require('./filters/csvparse');
const dateparse = require('./filters/dateparse');
const cidrfilter = require('./filters/cidrfilter');
const ipfilter = require('./filters/ipfilter');
const geoipparse = require('./filters/geoipparse');
const uaparse = require('./filters/uaparse');
const referralparse = require('./filters/referralparse');
const bbcparse = require('./filters/bbcparse');

const processRow = async (line, preferences, i, app, t) => {
    return new Promise(async (resolve, reject) => {
        if (preferences.csv && preferences.csv.active === true) {
            line = csvparse(line, preferences.csv, i);
            if (preferences.csv.skipHeaderRow === true && i === 0) {
                resolve();
                return;
            }
        }
        
        //parse json
        if (preferences.json && preferences.json.active === true) {
            line = JSON.parse(line);
        }
        
        //parse the date
        if (preferences.date && preferences.date.active === true) {
            line = dateparse(line, preferences.date);
        }

        //filter cidr
        if (preferences.cidrblock && preferences.cidrblock.active === true) {
            if (cidrfilter(line, preferences.cidrblock, cidrMatch) === true) {
                resolve();
                return;
            }
        }

        //filter ips
        if (preferences.ipblock && preferences.ipblock.active === true) {
            if (ipfilter(line, preferences.ipblock) === true) {
                resolve();
                return;
            }
        }

        //parse geoip
        if (preferences.geoip && preferences.geoip.active === true) {
            line = geoipparse(line, preferences.geoip);
        }

        //user agent parse
        if (preferences.useragent && preferences.useragent.active === true) {
            line = uaparse(line, preferences.useragent);
        }

        //referrer parse
        if (preferences.referrer && preferences.referrer.active === true) {
            line = referralparse(line, preferences.referrer);
        }
        
        //bbc parse
        if (preferences.bbc && preferences.bbc.active === true) {
            try {
                line = await bbcparse(line, preferences, app);
            } catch(e) {
                app.abacus.c.a(`Error parsing bbc content ${e.message}`, 2, 'nodestash');
            }
            
            if (line === null) {
                resolve(null);
            }
        }

        resolve(`${JSON.stringify(line)} \n`);
    });
};

const Init = class Nodestash extends Transform {
    constructor(preferences, abacus) {
        super(preferences);
        this.leftOver = null;
        this.preferences = (preferences) ? preferences : new Preferences().prefs;
        this.total = 0;
        if (abacus) this.abacus = abacus;

        // make sure no file already exists to append to.

        if (this.preferences.cidrblock && this.preferences.cidrblock.active === true) {
            cidrMatch = new CIDRMatcher(this.preferences.cidrblock.data);
        }
        Transform.call(this, { objectMode: true });
    }

    _transform(buffer, encoding, callback) {
        return new Promise(async (resolve, reject) => {
            
            let data = buffer.toString();
            
            const promises = [];
            if (this.lastLine) data = this.lastLine + data;
            
            let lines = data.split(this.preferences.Nodestash.lineSepatator);
            this.lastLine = lines.splice(lines.length - 1, 1)[0];
            for (let i = 0; i < lines.length; i++) {
                try {
                    const row = processRow(lines[i], this.preferences, i, this, this.total)
                    promises.push(row);
                } catch (e) {
                    abacus.c.a(`Error processing line ${e.message}`, 2, 'nodestash');
                }

                // if ((this.total / 10000) % 1 === 0) console.log(`${this.total} of 1000000`);
                // this.total++;
            }
            
            Promise.all(promises).then((res) => {
                res.forEach((row) => {
                    if (row) {
                        this.push(JSON.stringify(row) + '\n');
                    }
                });
                callback();
            }).catch((e) => {
                abacus.c.a(`Error processing line ${e.message}`, 2, 'nodestash');
                callback();
            })
        });
    }

    _flush(callback) {
        let self = this;
        if (self.lastLine) self.push(self.lastLine);
        self.lastLine = null;
        callback();
    }
};

const Preferences = class Preferences {
    constructor() {
        delete require.cache[require.resolve('./template.json')];
        this.prefs = require('./template.json');
    }
};

module.exports = {
    Init,
    Preferences,
};
