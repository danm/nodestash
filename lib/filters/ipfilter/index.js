//reconised ip that we want to ignore;

module.exports = function(line, preference) {
	if (line && preference && line[preference.in]) {
		if (preference.data.includes(line[preference.in])) {
			return true;
		} else {
			return false;
		}
	} else {
		throw new Error('Missing parameters')
	}
};