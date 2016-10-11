var hash = require('string-hash');

module.exports = function(line, preference, _this) {

  if (!preference || !line) { 
    throw new Error ('No valid data or preference');
  }

  let cps;

  if (line.bbc_site === 'invalid-data') {
    //remove bbc_site from app
    delete line.bbc_site;
  }

  if (!line.cps_asset_id) {
    //add CPS to the articles which do not include them
    //this should also be a string
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
      cpsPattern.exec(line.name)
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

      delete line.bbc_site;
      delete line.ns_jspageurl;

      const appregex = /(BBCNews)(?:\/)(\d{1})(?:\.)(\d{1})/;
      const app = appregex.exec(line.agent);
      if (app !== null) {
        line.app = {
          name:   app[1],
          major:  app[2],
          minor:  app[3]
        }
      }
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
    }

    if (!line.cps_asset_id && _this) {
      _this.emit('warning', {'bbcparse':line});
    }

    return line;
};