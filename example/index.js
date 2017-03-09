const Nodestash = require('../index.js');
const nodestashConfig = require('./nodestash-config.json');
const fs = require('fs');

const reader = fs.createReadStream('./2017-03-08-00-27-newstravelweather-pdg-22405308.csv');
const writer = fs.createWriteStream('./2017-03-08-00-27-newstravelweather-pdg-22405308.json');
const nodestash = new Nodestash.Init(nodestashConfig);


let stream = reader
    .pipe(nodestash)
    .pipe(writer);