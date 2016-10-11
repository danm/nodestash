'use strict';

const mocha 	= require('mocha');
const chai 		= require('chai');
const dateparse 	= require('../lib/filters/dateparse');
const expect 	= chai.expect;
let template 			= require('../lib/template.json');

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

describe("Parse Date", function() {
	it('should throw error if no preference', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			dateparse(line, null);
		}).to.throw();;
	});

	it('should throw error if no valid date', function() {
		//arrange
		let line = new sampleObj();
		line.ns_utc = 'sdfds';
		//assert
		expect(function() {
			//act
			dateparse(line, template.date);
		}).to.throw();
	});

	it('should group a time into a 15 minute period', function() {
		//arrange
		let line = new sampleObj();
		//act
		let result = dateparse(line, template.date);
		//assert
		expect(result.date).to.equal('2016-09-14T12:30:00.000Z');
	});
});