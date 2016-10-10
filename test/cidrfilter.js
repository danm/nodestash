'use strict';

const mocha 	= require('mocha');
const chai 		= require('chai');
const cidrfilter = require('../lib/filters/cidrfilter');
const expect 	= chai.expect;
let   template 	= require('./template.json');

const CIDRMatcher         = require('cidr-matcher');
let   cidrMatch;


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

describe("Parse CIDR", function() {
	it('should throw error if no parameters passed', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			cidrfilter(line, null);
		}).to.throw();;
	});

	it('should return true because the ip is in a block cidr', function() {
		//arrange
		let line = new sampleObj();
		cidrMatch = new CIDRMatcher(template.cidrblock.data);  
		line.ip = '10.0.0.10';
		//act
		let res = cidrfilter(line, template.cidrblock, cidrMatch);
		//assert
		expect(res).to.be.true;
	});

	it('should return false because the ip is not in a block cidr', function() {
		//arrange
		let line = new sampleObj();
		cidrMatch = new CIDRMatcher(template.cidrblock.data);  
		//act
		let res = cidrfilter(line, template.cidrblock, cidrMatch);
		//assert
		expect(res).to.be.false;
	});
});

