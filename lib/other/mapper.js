var fs 	   = require('fs');
var byline = require('byline');
var reader = byline(fs.createReadStream('./lib/logs.log'));

var added;
var w = [];
var lines = 0;

var mapper = {};

reader.on('data', function(line) {
  	  
  	found = false; 
  	var json = JSON.parse(line);

    if (json && json.agent) {
      if (json.agent.indexOf('Flipboard') >= 0) {
        console.log(json.agent);
      }
    }
});

reader.on('end', () => {
	fs.writeFile('missing.json', JSON.stringify(mapper), function() {
		console.log('done');	
	});
});
