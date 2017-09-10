const fs = require('fs');
const hash = require('string-hash');

const convertToCSV = require('./convertToCSV');
const editions = require('./editions');
const getHid = require('./getHid');
const getMetaData = require('./getMetaData');
const getLengthOfVideo = require('./getLengthOfVideo');
const elasticSearch = require('./elasticSearch');
const redshift = require('./redshift');

const referralparse = require('../referralparse');

let i = 0;
let io = 0;

module.exports = function(line, preference, _this) {
    return new Promise(async (resolve, reject) => {
        i++;
        if (!preference || !line) {
            reject(new Error('No valid data or preference'));
        }

        const tempLine = {
            bbc: {},
            rp: {},
            loc: {},
            ua: {},
            user: {},
        };

        // cps_asset_id 
        let cps;
        //add CPS to the articles which do not include them
        if (!line.cps_asset_id) {
          //this should also be a string
          //this is creating problems. it is extractin uuid data and puttin it in the cps id section
          let pattern = new RegExp(/\d{8}/);
          cps = pattern.exec(line.name);
          if (cps !== null) {
            tempLine.bbc.cpsid = String(cps[0]);
          }
        } else {
            tempLine.bbc.cpsid = line.cps_asset_id;
        }

        // name
        tempLine.bbc.countername = line.name || null

        // app type
        tempLine.bbc.platform = line.app_type || null;

        // for_nation
        if (line.for_nation) tempLine.bbc.edition = editions(line.for_nation);
        
        // pagetype, section, sitename
        // we get this data from Redis or the content store.
        if (tempLine.bbc.cpsid) {
            let meta;
            try {
                meta = await getMetaData(tempLine.bbc.cpsid, tempLine.bbc.countername, _this.abacus);
            } catch (e) {
                _this.abacus.c.a(`Error getting CPS meta data for id ${tempLine.bbc.cpsid}: ${e.message}`, 2, 'bbc-parse');
            } 
    
            if (meta !== undefined) {
                tempLine.bbc.section = meta.section_uri;
                tempLine.bbc.page = meta.type;
                tempLine.bbc.site = meta.site_name;
            }
        }
        
        // date
        tempLine.date = line.ns_utc;

        // deprecated labels 
        if (line.action_name || line.action_name || line.action_type || line.extlink_url || line.referring_object) tempLine.deb = {};
        if (line.action_name) tempLine.deb.action_name = line.action_name;
        if (line.action_type) tempLine.deb.action_type = line.action_type;
        if (line.extlink_url) tempLine.deb.extlink_url = line.extlink_url;
        if (line.referring_object) tempLine.deb.referring_object = line.referring_object;

        // ip and geolocation
        if (line.loc) tempLine.loc = line.loc;

        // ns_jspageurl
        if (line.ns_jspageurl) tempLine.ns_jspageurl = line.ns_jspageurl;

        // type (view, hidden)
        if (line.type) tempLine.type = line.type;

        // referrer and rp
        if (line.rp) tempLine.rp = line.rp;

        // check if we should use int_link_from_url instead of refferrer
        if (tempLine.rp.type === 'direct' && line.intlink_from_url !== undefined) {
            const newLine = referralparse(line, preference.intlink);
            tempLine.rp = newLine.rp;
        }

        // transform topic names
        if (line.topic_names) {
            tempLine.bbc.topics = line.topic_names.split('!');
        }

        // if page is a live page and on the app, we shoudl assosiate this to the app
        if ((tempLine.ns_jspageurl && tempLine.ns_jspageurl.includes('?app=')) && 
        tempLine.bbc.platform === 'responsive' &&
        (tempLine.rp && tempLine.rp.type && tempLine.rp.type === 'direct') &&
        tempLine.type === 'view') {
            tempLine.rp = {
                type: 'bbc',
                name: 'news',
                page: 'app',
                host: 'app',
            };
            tempLine.bbc.platform = 'mobile-app';
        }

        //catch social flow share id or post id
        let postid;
        if (tempLine.type === 'view' && tempLine.ns_jspageurl && tempLine.ns_jspageurl !== undefined) {
                  //get post id
          if (tempLine.ns_jspageurl.indexOf("&post_id=") > 0) {
            postid = tempLine.ns_jspageurl.substr(tempLine.ns_jspageurl.indexOf("&post_id=") + 9);
            if (postid.indexOf(";") > 0) {
              postid = postid.substr(0, postid.indexOf(";"));
            }
            tempLine.rp.postID = postid;
          }
          if (tempLine.ns_jspageurl.indexOf("?ocid=") > 0) {
            let start = tempLine.ns_jspageurl.indexOf("?ocid") + 6;
            let end = tempLine.ns_jspageurl.indexOf("&");
            end = end - start;
            tempLine.rp.ocid = tempLine.ns_jspageurl.substr(start, end);
          }
        }

        // always capture the edition of the page. the edition isn't just for home_page, but multiple indexes
        if (tempLine.bbc.edition !== undefined &&
            tempLine.rp !== undefined &&
            tempLine.rp.type !== undefined &&
            tempLine.rp.type === 'bbc' && 
            tempLine.rp.name !== undefined &&
            tempLine.rp.name == 'news' &&
            tempLine.rp.page !== undefined &&
            isNaN(tempLine.rp.page) === true) 
        {
            // test to see if it is a cps page
            tempLine.rp.page = tempLine.rp.page + ':' + tempLine.bbc.edition;
        }

        // user agent
        if (line.ua) tempLine.ua = line.ua;
        
        //get app version
        if (tempLine.bbc.platform === 'mobile-app') {
            //pulls out the app version 
            //example
            //'BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0';
            //BBCNews
            //3
            //9
            tempLine.ua.app = {};
            const appregex = /(BBCNews)(?:\/)(\d{1})(?:\.)(\d{1})/;
            const app = appregex.exec(line.agent);
            if (app !== null) {
                tempLine.ua.app = {
                    family: app[1], 
                    major: app[2],
                    minor: app[3]
                };
            }
        }

        // device type
        if (line.ns_v_platform) {
            if (tempLine.ua === undefined) {
                tempLine.ua = { type: line.ns_v_platform };
            } else {
                tempLine.ua.type = line.ns_v_platform;
            }
        }

        // cookie and user data
        if (line.ns_vid) {
            tempLine.user.cookie = line.ns_vid;
        }
        if (line.hid) {
            let bbc_hid;
            tempLine.user.hid = line.hid; 
            try {
                bbc_hid = await getHid(tempLine.user.hid, _this.abacus);
                if (bbc_hid) {
                    if (bbc_hid && bbc_hid.age && bbc_hid.gender) {
                        tempLine.user.age = bbc_hid.age;
                        tempLine.user.gender = bbc_hid.gender;
                    }
                }
            } catch (e) {
                _this.abacus.c.a(`Error getting getHid ${e.message}`, 2, 'bbc-parse');
            }
        }

        // video data 
        // we still need to get some meta data from nitro for this.
        if (line.ns_st_ci) {
            tempLine.video = {
              vpid: line.ns_st_ci || null,
              type: line.ns_st_ty || null,
              playid: line.ns_st_id || null,
              event: line.ns_st_ev || null,
              timeline: line.ns_st_po || null,
              playtime: line.ns_st_pt || null,
              length: line.ns_st_cl || null,
            };

            // get the video length
            try {
                tempLine.video.length = await getLengthOfVideo(tempLine.video.vpid, _this.abacus);
            } catch (e) {
                _this.abacus.c.a(`Error getting video length ${e.message}`, 2, 'bbc-parse');
            }
        }

        // distribute the files

        if (_this.abacus.config.s3.mongo) {
            if (tempLine.bbc.cpsid && tempLine.type === 'view') {
                fs.appendFileSync('./tmp/mongo.ndjson', `${JSON.stringify(tempLine)} \n`);
            }
        }

        if (_this.abacus.config.s3.elastic) {
            if (tempLine.bbc.cpsid && tempLine.type === 'view') {
                elasticSearch(tempLine);
            }
        }

        if (_this.abacus.config.s3.redshift) {
            redshift(tempLine)
        }
        
        resolve(tempLine);
    });
};