'use strict';
const useragent = require('useragent');

module.exports = function(line, preference) {
	if (line && preference) {
		line[preference.out] = useragent.lookup(line[preference.in]);
  		return line;		
	} else {
		throw new Error('Missing parameters');
	}
  
};