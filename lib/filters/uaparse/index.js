'use strict';
const useragent = require('useragent');

module.exports = function(line, preference) {
	if (line && preference) {
		const jsonAgent = useragent.lookup(line[preference.in]);

		const browser = {
			family: jsonAgent.family || null,
			major: jsonAgent.major || null,
			minor: jsonAgent.minor || null,
			patch: jsonAgent.patch || null,
		};

		const os = (jsonAgent.os && jsonAgent.os.toJSON()) || null;
		const device = (jsonAgent.device && jsonAgent.device.toJSON()) || null;

		line[preference.out] = {
			browser,
			os,
			device,
		}

  	return line;
	} else {
		throw new Error('Missing parameters');
	}
  
};