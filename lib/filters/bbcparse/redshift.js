const fs = require('fs');

const mysql_real_escape_string = (str) => {
  if (str === 'NULL') return str;
  if (isNaN(str) === false) return str;

  if (str === undefined || str === null) {
      return 'NULL';
  }

  return str.replace(/[\0\x08\x09\x1a\n\r"',\\\%]/g, function(char) {
    switch (char) {
      case "\0":
          return "\\0";
      case "\x08":
          return "\\b";
      case "\x09":
          return "\\t";
      case "\x1a":
          return "\\z";
      case "\n":
          return "\\n";
      case "\r":
          return "\\r";
      case ",":
          return "\\,";
      case "\"":
      case "'":
      case "\\":
      case "%":
          return "\\" + char;
    }
  });
};

module.exports = (line) => {

  let date = new Date(line.date);
  let dateString = '';
  dateString += date.getFullYear();
  dateString += '-';
  dateString += date.getMonth() + 1;
  dateString += '-';
  dateString += date.getDate();

  const redshiftRow = [];
  
  redshiftRow.push(new Date(line.date).toISOString().slice(0, 19).replace('T', ' '));

  redshiftRow.push(String(line.bbc.cpsid) || 'NULL');
  redshiftRow.push(line.bbc.site || 'NULL');
  redshiftRow.push(line.bbc.pagetype || 'NULL');
  redshiftRow.push(line.bbc.section || 'NULL');
  redshiftRow.push(line.bbc.countername || 'NULL');
  redshiftRow.push(line.bbc.platform || 'NULL');

  redshiftRow.push(line.rp.type || 'NULL');
  redshiftRow.push(line.rp.name || 'NULL');
  redshiftRow.push(line.rp.page || 'NULL');
  redshiftRow.push(line.rp.host || 'NULL');
  redshiftRow.push(line.rp.search || 'NULL');

  redshiftRow.push(line.loc.country || 'NULL');
  redshiftRow.push(line.loc.cont || 'NULL');
  redshiftRow.push(line.loc.city || 'NULL');

  redshiftRow.push(line.ua.type || 'NULL');
  redshiftRow.push(line.ua.family || 'NULL');
  redshiftRow.push((line.ua.os && line.ua.os.family) || 'NULL');
  redshiftRow.push((line.ua.device && line.ua.device.family) || 'NULL');

  redshiftRow.push(line.user.hid || 'NULL');
  redshiftRow.push(line.user.cookie || 'NULL');
  redshiftRow.push(line.user.age || 'NULL');
  redshiftRow.push(line.user.gender || 'NULL');

  redshiftRow.push((line.video && line.video.vpid) || 'NULL');
  redshiftRow.push((line.video && line.video.type) || 'NULL');
  redshiftRow.push((line.video && line.video.playid) || 'NULL');
  redshiftRow.push((line.video && line.video.event) || 'NULL');
  redshiftRow.push((line.video && parseInt(line.video.timeline, 10)) || 'NULL');
  redshiftRow.push((line.video && parseInt(line.video.playtime, 10)) || 'NULL');
  redshiftRow.push((line.video && parseInt(line.video.length, 10)) || 'NULL');

  const redshiftClean = redshiftRow.map(row => mysql_real_escape_string(row));

  if (line.type === 'view') {
    fs.appendFileSync('./redshift-view.csv', `${redshiftClean.join(', ')}\n`);
  } else if (line.type === 'hidden' && line.video && line.video.vpid) {
    fs.appendFileSync('./redshift-video.csv', `${redshiftClean.join(', ')}\n`);
  } else {
    // fs.appendFileSync('./redshift-hidden.tmp', `${redshiftClean.join(', ')}\n`);
    // we dont about hidden for now
  }
};