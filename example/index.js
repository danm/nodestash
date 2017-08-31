const start = new Date();
const Nodestash = require('../index.js');
const nodestashConfig = require('./nodestash-config.json');
const fs = require('fs');

const reader = fs.createReadStream('./2017-08-30-23-27-news-v2-26408978-0.csv');
const writer = fs.createWriteStream('./2017-08-30-23-27-news-v2-26408978-0.json');
const abacus = {
    hello: 'how are you',
};
const nodestash = new Nodestash.Init(nodestashConfig, abacus);

let stream = reader
    .pipe(nodestash)
    .pipe(writer);

    writer.on('finish', () => {
        const end = new Date();
        console.log(end.getTime() - start.getTime());
    });

    writer.on('close', () => {
        const end = new Date();
        console.log(end.getTime() - start.getTime());
    });