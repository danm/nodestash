'use strict';

const mocha 	= require('mocha');
const chai 		= require('chai');
const geoipparse = require('../lib/filters/geoipparse');
const expect 	= chai.expect;
let   template 	= require('./template.json');

const sampleObj = function() {
	return { 	ns_vid: 'ff7735a3e6b09dcb1bf3c46a27b2da9f',
						ns_utc: 1473856240054,
						name: 'news.page',
						ns_jspageurl: 'news',
						app_type: 'mobile-app',
						app_name: 'news',
						bbc_site: 'invalid-data',
						action_name: 'swipe',
						type: 'hidden',
						ip: '81.149.230.113',
						screen_resolution: '1024x768',
						agent: 'BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0',
						ns_st_pt: null 
					};
}

describe("Parse GEOIP", function() {
	it('should throw error if no parameters passed', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			geoipparse(line, null);
		}).to.throw();;
	});

	it('should return an object about the geo location', function() {
		//arrange
		let line = new sampleObj();
		//act
		let result = geoipparse(line, template.geoip);
		//assert
		expect(result.loc).to.include.all.keys('range', 'country', 'region', 'city', 'll', 'metro', 'cont');
	})
});