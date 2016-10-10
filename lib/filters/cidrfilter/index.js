
//reconised ip that we want to ignore;

module.exports = function(line, preference, cidrMatch) {
	if (line && preference && cidrMatch) {
		if (cidrMatch.contains(line[preference.in])) {
			return true;
		} else {
			return false;
		}
	} else {
		throw new Error('Missing parameters')
	}
};
