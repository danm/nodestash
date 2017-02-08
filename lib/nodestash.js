'use strict';

//node modules
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

const Init = class Nodestash extends Transform {
    constructor(preferences) {
        super(preferences);
        this.leftOver = null;
        this.preferences = (preferences) ? preferences : new Preferences().prefs;
        this.total = 0;

        if (this.preferences.cidrblock && this.preferences.cidrblock.active === true) {
            cidrMatch = new CIDRMatcher(this.preferences.cidrblock.data);
        }
        Transform.call(this, { objectMode: true });
    }

    _transform(buffer, encoding, callback) {
        let self = this;
        let data = buffer.toString();
        if (self.lastLine) data = self.lastLine + data;

        let lines = data.split(self.preferences.Nodestash.lineSepatator);
        self.lastLine = lines.splice(lines.length - 1, 1)[0];

        for (var i = 0; i < lines.length; i++) {
            var obj = self.processRow(lines[i], self.total);
            self.total++;
            if (obj) {
                self.emit('parsed', obj);
                self.push(JSON.stringify(obj) + '\n');
            } else if (obj === null) {
                self.emit('skipped', lines[i]);
            }
        }

        callback();
    }

    _flush(callback) {
        let self = this;
        if (self.lastLine) self.push(self.lastLine);
        self.lastLine = null;
        callback();
    }

};

Init.prototype.processRow = function(line, i) {

    if (this.preferences.csv && this.preferences.csv.active === true) {
        line = csvparse(line, this.preferences.csv, i);
        if (this.preferences.csv.skipHeaderRow === true && i === 0) return null;
    }

    //parse json
    if (this.preferences.json && this.preferences.json.active === true) {
        line = JSON.parse(line);
    }

    //parse the date
    if (this.preferences.date && this.preferences.date.active === true) {
        line = dateparse(line, this.preferences.date);
    }

    //filter cidr
    if (this.preferences.cidrblock && this.preferences.cidrblock.active === true) {
        if (cidrfilter(line, this.preferences.cidrblock, cidrMatch) === true) return null;
    }

    //filter ips
    if (this.preferences.ipblock && this.preferences.ipblock.active === true) {
        if (ipfilter(line, this.preferences.ipblock) === true) return null;
    }

    //parse geoip
    if (this.preferences.geoip && this.preferences.geoip.active === true) {
        line = geoipparse(line, this.preferences.geoip);
    }

    //user agent parse
    if (this.preferences.useragent && this.preferences.useragent.active === true) {
        line = uaparse(line, this.preferences.useragent);
    }

    //referrer parse
    if (this.preferences.referrer && this.preferences.referrer.active === true) {
        line = referralparse(line, this.preferences.referrer);
    }

    //bbc parse
    if (this.preferences.bbc && this.preferences.bbc.active === true) {
        line = bbcparse(line, this.preferences.referrer);
    }

    return line;
};

const Preferences = class Preferences {
    constructor() {
        delete require.cache[require.resolve('./template.json')];
        this.prefs = require('./template.json');
    }
};

module.exports = {
    Init: Init,
    Preferences: Preferences
};