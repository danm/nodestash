'use strict';

const mocha 	= require('mocha');
const chai 		= require('chai');
const bbcparse 	= require('../lib/filters/bbcparse');
const expect 	= chai.expect;
let   template 	= require('./template.json');

const sampleObj = function() {
	return  { 	ns_vid: 'ff7735a3e6b09dcb1bf3c46a27b2da9f',
				ns_utc: 1473856240054,
				name: 'news.business.story.37618618.page',
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

describe("Parse BBC Data", function() {
	it('should throw error if no parameters passed', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			bbcparse(line);
		}).to.throw();
	});

	it('should return a CPS id from the countername', function() {
		//arrange
		let line = new sampleObj();
		//act
		let result = bbcparse(line, template.bbc);
		//assert
		expect(result.cps_asset_id).to.equal('37618618');
	});

	it('should return a LDP id from the countername', function() {
		//arrange
		let line = new sampleObj();
		line.name = "news.mobile-phones.986d714c-6f18-43ff-9f37-e4b0267aeaf9.ldp.page";
		//act
		let result = bbcparse(line, template.bbc);
		//assert
		expect(result.cps_asset_id).to.equal('98671461843937402679');
	});

	it('should return a IDT id from the countername', function() {
		//arrange
		let line = new sampleObj();
		line.name = "news.resource.idt.shorthand_purple_aki.page"
		line.ns_jspageurl = "http://www.bbc.co.uk/news/resources/idt-6d083913-0bfb-4988-8cd8-d126fa6dcff1";
		//act
		let result = bbcparse(line, template.bbc);
		//assert
		expect(result.cps_asset_id).to.equal('6083913049888812661');
	});

	it('should return version of the BBCApp', function() {
		//arrange
		let line = new sampleObj();
		//act
		let result = bbcparse(line, template.bbc);
		//assert
		expect(result.app).to.eql({name:'BBCNews',major:'3',minor:'9'});
	});

	it('should return a hash id for business string', function() {
		//arrange
		let line = new sampleObj();
		line.name = "news.business.market_data.x.page";
		//act
		let result = bbcparse(line, template.bbc);
		//assert
		expect(result.cps_asset_id).to.eql('527075313');
	});
});