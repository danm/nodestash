const fs = require('fs');

module.exports = (line) => {
    
      let date = new Date(line.date);
      let dateString = '';
      dateString += date.getFullYear();
      dateString += '-';
      dateString += date.getMonth() + 1;
      dateString += '-';
      dateString += date.getDate();
    
      const elastic = {};
    
      if (line.bbc.cpsid) elastic.bbc_cpsid = line.bbc.cpsid;
      if (line.bbc.site) elastic.bbc_site = line.bbc.site;
      if (line.bbc.pagetype) elastic.bbc_pagetype = line.bbc.pagetype;
      if (line.bbc.section) elastic.bbc_section = line.bbc.section;
      if (line.bbc.countername) elastic.bbc_countername = line.bbc.countername;
      if (line.bbc.platform) elastic.bbc_platform = line.bbc.platform;
      if (line.bbc.topics) elastic.bbc_topics = line.bbc.topics;
      
      if (line.rp.type) elastic.rp_type = line.rp.type;
      if (line.rp.name) elastic.rp_name = line.rp.name;
      if (line.rp.page) elastic.rp_page = line.rp.page;
      if (line.rp.host) elastic.rp_host = line.rp.host;
      if (line.rp.search) elastic.rp_search = line.rp.search;
      
      if (line.loc.country) elastic.loc_country = line.loc.country;
      if (line.loc.cont) elastic.loc_cont = line.loc.cont;
      if (line.loc.city) elastic.loc_city = line.loc.city;
      if (line.loc.ll) elastic.loc_ll = line.loc.ll;
    
      if (line.ua.type) elastic.ua_type = line.ua.type;
      if (line.ua.type) elastic.ua_os = line.ua.os.family;
      if (line.ua.type) elastic.ua_browser = line.ua.family;
      if (line.ua.type) elastic.ua_device = line.ua.device.family;
    
      if (line.user.age) elastic.user_age = line.user.age;
      if (line.user.gender) elastic.user_gender = line.user.gender;
    
      const meta = JSON.stringify({ index: { '_index': 'comscore-' + dateString, '_type': 'view' } });
      fs.appendFileSync('./elastic.ndjson', meta + '\n');
      fs.appendFileSync('./elastic.ndjson', JSON.stringify(elastic) + '\n');
      
    };