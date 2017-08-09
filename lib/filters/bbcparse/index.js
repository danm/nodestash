const hash = require('string-hash');
const convertToCSV = require('./convertToCSV');
const editions = require('./editions');

module.exports = function(line, preference, _this) {

    line.bbc = {};

    if (!preference || !line) {
        throw new Error('No valid data or preference');
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

    //if there is still no cps, we need to do some stuff
    if (!line.cps_asset_id || line.cps_asset_id === undefined) {
        //pulls out the guid of the ldp
        if (line.name.includes('.ldp.page')) {
            let cpsPattern = /(\d+)/g;
            cpsPattern.exec(line.name);
            line.cps_asset_id = line.name.match(cpsPattern).join('');
            //pulls out the guid of the idt
        } else if (line.name.includes('.idt.')) {
            //idt pages we have to grabthe guid from the url as it is not currently in the counter
            const idtPattern = /(idt-\w*-\w*-\w*-\w*-\w*)/;
            let guid = idtPattern.exec(line.ns_jspageurl);
            if (guid !== null && guid[1]) {
                let cpsPattern = /\d+/g;
                let res = guid[1].match(cpsPattern);
                if (res && res[1]) {
                    line.cps_asset_id = res.join('');
                }
            }
        } else {
            //looks through a list of pages we have which do not have counternames

            // if (cps && cps[line.name]) {
            //   line.cps_asset_id = cps[line.name].cps_asset_id;
            // }
        }
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
    if (line.for_nation !== undefined && line.rp !== undefined && line.rp.page !== undefined) {
        line.rp.page = line.rp.page + ':' + line.for_nation;
    }

    convertToCSV(line);
    return line;
};