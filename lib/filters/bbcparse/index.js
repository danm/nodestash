const hash = require('string-hash');
const convertToCSV = require('./convertToCSV');
const editions = require('./editions');

module.exports = function(line, preference, _this) {
    return new Promise(async (resolve, reject) => {
        line.bbc = {};

        if (!preference || !line) {
            reject(new Error('No valid data or preference'));
        }

        let cps;

        if (line.bbc_site === 'invalid-data' || line.bbc_site === undefined) {
            //remove bbc_site from app
            line.bbc_site = line.name.substring(0, line.name.indexOf('.'));
        }
        if (line.app_name === undefined) {
            //remove bbc_site from app
            line.app_name = line.name.substring(0, line.name.indexOf('.'));
        }

        if (!line.cps_asset_id) {
            //add CPS to the articles which do not include them
            //this should also be a string

            //this is creating problems. it is extractin uuid data and puttin it in the cps id section
            let pattern = new RegExp(/\d{8}/);
            cps = pattern.exec(line.name);
            if (cps !== null) {
                line.cps_asset_id = String(cps[0]);
            }
        }

        //business 
        //there are a lot of business pages, we don't really care about them so lets group them toghether
        if (line.name.indexOf('news.business.market_data.') >= 0) {
            //this is a market data page, just group it into one page
            line.name = "news.business.market_data.x";
            line.cps_asset_id = String(hash('news.business.market_data.x'));

        } else if (line.name.indexOf('news.business.markets.') >= 0) {
            //this is a mareks page, just group it into one page
            line.cps_asset_id = String(hash('news.business.markets.x'));
            line.name = "news.business.markets.x";
        }

        //get app version
        if (line.app_type === 'mobile-app') {
            //pulls out the app version 
            //example
            //'BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0';
            //BBCNews
            //3
            //9

            delete line.ns_jspageurl;

            const appregex = /(BBCNews)(?:\/)(\d{1})(?:\.)(\d{1})/;
            const app = appregex.exec(line.agent);
            if (app !== null) {
                line.app = {
                    name: app[1],
                    major: app[2],
                    minor: app[3]
                };
            }
        }

        // if page is a live page
        if ((line.ns_jspageurl && line.ns_jspageurl.includes('?app=')) && 
        (line.app_type && line.app_type === 'responsive') &&
        (line.rp && line.rp.type && line.rp.type === 'direct') &&
        (line.type === 'view')) {
            line.rp = {
            type: 'bbc',
            name: 'news',
            page: 'app',
            host: 'app',
            };
            line.app_type = 'mobile-app';
        }

        //catch social flow share id
        let postid;
        if (line.type === 'view' && line.ns_jspageurl && line.ns_jspageurl !== undefined) {
            //get post id
            if (line.ns_jspageurl.indexOf("&post_id=") > 0) {
                postid = line.ns_jspageurl.substr(line.ns_jspageurl.indexOf("&post_id=") + 9);

                if (postid.indexOf(";") > 0) {
                    postid = postid.substr(0, postid.indexOf(";"));
                }
                line.postID = postid;
            }

            if (line.ns_jspageurl.indexOf("?ocid=") > 0) {
                let start = line.ns_jspageurl.indexOf("?ocid") + 6;
                let end = line.ns_jspageurl.indexOf("&");
                end = end - start;
                line.ocid = line.ns_jspageurl.substr(start, end);
            }
        }

        if (!line.cps_asset_id && _this) {
            _this.emit('warning', { 'bbcparse': line });
        }

        // always capture the edition of the page. the edition isn't just for home_page, but multiple indexes
        if (line.for_nation !== undefined &&
            line.rp !== undefined &&
            line.rp.type !== undefined &&
            line.rp.type === 'bbc' && 
            line.rp.name !== undefined &&
            line.rp.name == 'news' &&
            line.rp.page !== undefined &&
            isNaN(line.rp.page) === true) 
        {
            // test to see if it is a cps page
            line.rp.page = line.rp.page + ':' + editions(line.for_nation);
        }

        // get meta data about story
        // const meta = await getMetaData(c.cps_asset_id);
        // if (meta) {
        //     obj.bbc_section = meta.section_uri;
        //     obj.bbc_page = meta.type;
        //     obj.bbc_site = meta.site_name;
        // }

        // if (cpsMeta.section_uri) obj.bbc_section = cpsMeta.section_uri;
        // if (cpsMeta.type) obj.bbc_page = cpsMeta.type;
        // if (cpsMeta.site_name) obj.bbc_site = cpsMeta.site_name;
        
        // user details
        line.user = {};
        line.user.cookie = line.ns_vid;
        delete line.ns_vid;

        // let bbc_hid;
        // try {
        //     if (line.bbc_hid) {
        //         line.user.hid = line.bbc_hid;
        //         bbc_hid = await getHid(line.user.hid);
        //         delete line.bbc_hid;
        //         if (bbc_hid.age && bbc_hid.gender) {
        //             line.user.age = line.age;
        //             line.user.gender = line.gender;
        //         }
        //     }
        // } catch (e) {
        //     console.log(e.message);
        // }

        // convertToCSV(line);
        resolve(line);
    });
};