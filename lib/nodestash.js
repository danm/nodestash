'use strict';

//node modules
const Transform           = require('stream').Transform;

//npm modules
const CIDRMatcher         = require('cidr-matcher');
let   cidrMatch;

//custom modules
const csvparse            = require('./filters/csvparse');
const dateparse           = require('./filters/dateparse');
const cidrfilter          = require('./filters/cidrfilter');
const ipfilter            = require('./filters/ipfilter');
const geoipparse          = require('./filters/geoipparse');
const uaparse             = require('./filters/uaparse');
const referralparse       = require('./filters/referralparse');

const Init = class Nodestash extends Transform {
  constructor(preferences) {
    super(preferences);
    this.leftOver = null;
    this.preferences = (preferences)? preferences.prefs: new Preferences().prefs;
    this.total = 0;

    if (this.preferences.cidrblock && this.preferences.cidrblock.active === true) {
      cidrMatch = new CIDRMatcher(this.preferences.cidrblock.data);
    }
    Transform.call(this);
  }

  _transform(buffer, encoding, callback) {

    let buffered;
    let lines;

    //check to see if there was something left over
    if (this.leftOver !== null) {
      //yes there was,
      //convert new line to string and append to last.
      buffered = this.leftOver + buffer.toString();
    } else {
      //prob a brand new file, nothing to append
      buffered = buffer.toString();
    }

    //we need to split up the data here, but lines
    lines = buffered.split(this.preferences.Nodestash.lineSepatator);

    //make sure it returned more then 1 item
    if (lines && Array.isArray(lines)) {
      if (lines.length > 2) {
        //pop off the last element in the array.
        //we think that the last line is not complete and needs to be appeneded
        //to the next stream. the last element is removed from the current array
        //the q array is them pushed back to the buffer
        this.leftOver = lines.pop();

        for (var i = 0 ; i < lines.length ; i++) {
          var obj = this.processRow(lines[i], this.total);
          if (obj) {
            this.emit('parsed', obj);
            this.push(JSON.stringify(obj) + '\n');
          } else if (obj === null) {
            this.emit('skipped', lines[i]);
          }
          this.total++;
        }
      } else {
        //there was only one element in the array, so we will leave that for the stream
        this.leftOver = lines + '\n';
      }
    }

    //we need to check that left over isn't the last bugger in the stream.

      callback();
  }

  _flush(callback) {
    if (Array.isArray(this.leftOver)) {
      this.push(this.leftOver.join('\n'));
    } else {
      this.push(this.leftOver);
    }
    callback();
  }
};

Init.prototype.processRow = function(line, i) {

  if (this.preferences.csv && this.preferences.csv.active === true) {
    if (this.preferences.csv.skipHeaderRow === true && i===0) return null;
    line = csvparse(line, this.preferences.csv);
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

  return line;
};

const Preferences = class Preferences {
  constructor() {
    delete require.cache[require.resolve('./template.json')];
    this.prefs = require('./template.json');
  }
};

module.exports = {
  Init:Init,
  Preferences:Preferences
};
