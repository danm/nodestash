'use strict';
const geoip = require('geoip-lite');
const countryToContinent = require('./countryToContinent');

module.exports = function(line, preference) {
    if (line && preference) {
        if (line[preference.in]) {
            line[preference.out] = geoip.lookup(line[preference.in]);
            //geoip doesn't give back continent, so we have to get that seperately
            if (line[preference.out] &&
                line[preference.out].country) {
                line[preference.out].cont = countryToContinent(line[preference.out].country, preference.bbc);
            }
            return line;
        } else {
            return line;
        }
    } else {
        throw new Error('Missing parameters');
    }
};