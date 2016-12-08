# Nodestash
---------

Heavily influenced by [Elastic's Logstash](https://github.com/elastic/logstash), is Nodestash. A log processor to parse, filter and enrich logs in [Node](http://nodejs.org) using streams.

```js
const zlib = require('zlib');
const consumer = require('sqs-consumer');
const Nodestash = require('nodestash');
const AWS = require('aws-sdk');

consumer.create({
    queueUrl: 'sqs-url',
    handleMessage: (message, done) => {
        const json = JSON.parse(message.Body);

            let download = () => new AWS.S3().getObject({ Bucket: bucket, Key: key }).createReadStream();
            let gunzip = zlib.createGunzip();
            let zipper = zlib.createGzip();
            let nodestash = new Nodestash.Init();

            let stream = download()
                .pipe(gunzip)
                .pipe(nodestash)
                .pipe(zipper);

            let writeParams = { Bucket: writeBucket, Key: writeKey, Body: stream };
            var s3Up = new AWS.S3().upload(writeParams, (err, res) => {
                done();
            });

        } else {
            done(throw new Error(message));
        }
    }
}).start();
```

## Installation

```bash
$ npm install nodestash
```

## Features


  * CSV Parsing
  * Geoip parsing using [MaxMind](http://maxmind.com) and [node-geoip](https://github.com/bluesmoon/node-geoip)
  * Useragent Parsing using [browserscope.org](browserscope.org) and [useragent](https://github.com/3rd-Eden/useragent)
  * Referrer Parsing using [referer-parser](https://github.com/snowplow/referer-parser) and [piwik](https://github.com/piwik/)
  * CIDR filtering using [cidr-matcher](https://github.com/pracucci/node-cidr-matcher)
  * Error handling and notifications using events
  * Easy to expand processing
  * Fast multithreaded processing
  * Fully ES6 


## Philosophy

Nodestash exists because Logstash was becoming limiting for the amount of log processing I required. More customisation, quicker processing as well as a better understanding of why some logs failed to parse holding up the queue or failing completely. Nodestash accomplishes this by created a very limited log processing tool with the help of many processing modules already available.

## Quick Start

You can either manually change the preference object or use the default settings. 

Use default prefences 

```js
const Nodestash = require('nodestash');
const ns = Nodestash.Init();
```

Or use custom prefences

```js
const Nodestash = require('nodestash');
let prefs = new Nodestash.Preferences();
prefs.geoip.active = false;
let ns = new Nodestash.init(prefs);
```

Nodestash will accept line seperated JSON or CSV. If you already have structured data:

```js
const fs = require('fs');
const Nodestash = require('nodestash');
let prefs = new Nodestash.Prefences();

prefs.csv.active = false;
prefs.json.active = false;

const ns = new Nodestash.Init(prefs);

let reader = fs.createReadStream('./beacon_20160901_130000.log');
let writer = fs.createWriteStream('./output.log');

reader.pipe(ns).pipe(writer);
```
For a CSV file, manually map, type and name your fields
(todo, allow this to happen automatically if the first row are names)

```js
const fs = require('fs');
const Nodestash = require('nodestash');
let prefs = new Nodestash.Prefences();

prefs.csv.active = true;
prefs.csv.cellSeparator = ','; // whatever your cell seperator is (usually , or \t)
prefs.csv.data =  [
                    {
                      "type": "string",
                      "value": "message"
                    },
                    {
                      "type": "string",
                      "value": "ip"
                    },
                    {
                      "type": "int",
                      "value": "date"
                    },
                  ];

const ns = new Nodestash.Init(prefs);

let reader = fs.createReadStream('./beacon_20160901_130000.log');
let writer = fs.createWriteStream('./output.log');

reader.pipe(ns).pipe(writer);
```

## Preferences

Default prefence file. Modify to the structure of your log.

```js
{
  "Nodestash": {
    "lineSepatator": "\r\n" //how each line is seperated 
  },
  "csv": { // convert a CSV file to JSON
    "active": true, //bool - on or off
    "cellSeparator": "\t", //string - how to serpate each cell
    "data": [ //array of cells
      {
        "type": "string", //type of cell to convert data (int/string)
        "value": "ns_vid" //name of property
      },
    ]
  },
  "json": { //whether data is already in JSON format and needs to be parsed
    "active": false //bool
  },
  "date": { //convert string into JS date object
    "active": true, //bool
    "in": "ns_utc", //input property name
    "out": "date"   //input property name to place data - you can replace the in property with this data
  },
  "cidrblock": { //CIDR blocks to ignore (known bots, spam, internal testing)
    "active": true,
    "in": "ip",
    "data":[   //array of CIDR's
        "10.0.0.0/8", 
    ]
  },
  "ipblock": { //Single IPs to ignore (known bots, spam, internal testing)
    "active": true,
    "in": "ip",
    "data":  [
        "132.185.144.122" //array of IP's
    ]
  },
  "geoip": { //take an IP address and parse it against maxminds dataset returning a location object
    "active": true, //bool
    "in": "ip", //input property
    "out": "loc" //output property
  },
  "useragent": { //take a useragent and parse it against the useragent dataset
    "active": true,
    "in": "agent",
    "out": "ua"
  },
  "referrer": { //take a referral url and return useful data
    "active": true,
    "refin": "referrer",
    "agentin": "agent",
    "out":"rp"
  }
}
```

## Extend

There are many things that are still due to be extended but it is faily easy to add your own.
Add your filter to `/nodestash/lib/filters/{dir}/index.js`
Add filter preferences to `/nodestash/lib/template.json`
Add tests to mocha test file in `/nodestash/test/{filter}.js`
Add conditional filter and module require to `/nodestash/lib/nodestash.js`

Your filter should pass two arguments, the line and preference object
If your filter enriches, you should return a single object to `line`
If your filter blocks, return null if true

If you want to commit to this library, fork and raise a PR. All help welcome!

## Test

```bash
npm install
npm test
```


## License

  [MIT](LICENSE)

