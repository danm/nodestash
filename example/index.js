const start = new Date();
const Nodestash = require('../index.js');
const config = require('./config.json');
const Abacus = require('@bbc/abacus-framework');
const zlib = require("zlib");
const fs = require('fs');

process.on('unhandledRejection', (err) => {  
  console.error('unhandledRejection', err);
  process.exit(1);
})

process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
  process.exit(1);
});

const init = async () => {

  const getListOfFiles = () => {
    return new Promise((resolve, reject) => {
      const s3 = new abacus.aws.S3({apiVersion: '2006-03-01'});
      s3.listObjects({ Bucket: 'puddle-csv-sampled.tools.bbc.co.uk' }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    })
  };

  const handleNextFile = (list, index) => {

    if (fs.existsSync('./redshift-hidden.csv')) fs.renameSync('./redshift-hidden.csv', `./redshift-hidden/${list[index].Key}`);
    if (fs.existsSync('./redshift-video.csv')) fs.renameSync('./redshift-video.csv', `./redshift-video/${list[index].Key}`);
    if (fs.existsSync('./redshift-view.csv')) fs.renameSync('./redshift-view.csv', `./redshift-views/${list[index].Key}`);
    if (fs.existsSync('./tmp_mongo.ndjson')) fs.renameSync('./tmp_mongo.ndjson', `./mongo/${list[index].Key}`);
    if (fs.existsSync('./elastic.ndjson')) fs.renameSync('./elastic.ndjson', `./elastic/${list[index].Key}`);

    if (index < list.length) {
      index++;
      console.log('waiting 5 seconds');
      setTimeout(() => {
        runNodestash(list, index);
      }, (1000 * 5));
    }
  };
  
  const runNodestash = (list, index) => {
    
    const error = 0;

    const s2Params = {
      Bucket: 'puddle-csv-sampled.tools.bbc.co.uk',
      Key: '2017-09-09-17-35-news-v2-128-sampled-pageviews-26624818-0.csv.gz',
      // Key: list[index].Key,
    };
      
    console.log(`starting ${s2Params.Key}`);
  
    const s3 = new abacus.aws.S3({apiVersion: '2006-03-01'});
    const gunzip = zlib.createGunzip();
    const nodestash = new Nodestash.Init(config.nodestash, abacus);
    const writer = fs.createWriteStream(`./output/${list[index].Key}`);
    const file = s3.getObject(s2Params).createReadStream()
      .pipe(gunzip)
      .pipe(nodestash)
      .pipe(writer);

      file.on('close', () => {
        console.log('reader has closed');
      });

    writer.on('finish', () => {
      file.destroy();
      nodestash.destroy();
      console.log(`finished ${list[index].Key}`);
      handleNextFile(list, index);
    });

    writer.on('error', (e) => {
      console.log(e.message);
      if (error < 5) {
        index--;
        file.destroy();
        nodestash.destroy();
      } else {
        file.destroy();
        nodestash.destroy();
      }
    });
  };

  const abacus = new Abacus(config);  
  await abacus.mongo.setup();

  if (fs.existsSync('./output.ndjson')) fs.unlinkSync('./output.ndjson');
  if (fs.existsSync('./redshift-hidden.csv')) fs.unlinkSync('./redshift-hidden.csv');
  if (fs.existsSync('./redshift-video.csv')) fs.unlinkSync('./redshift-video.csv');
  if (fs.existsSync('./redshift-view.csv')) fs.unlinkSync('./redshift-view.csv');
  if (fs.existsSync('./tmp_mongo.ndjson')) fs.unlinkSync('./tmp_mongo.ndjson');
  if (fs.existsSync('./elastic.ndjson')) fs.unlinkSync('./elastic.ndjson');

  const list = await getListOfFiles();
  runNodestash(list.Contents, 0);
};

init();
