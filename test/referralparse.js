'use strict';

const mocha 			= require('mocha');
const chai 				= require('chai');
const referralparse 	= require('../lib/filters/referralparse');
const expect 			= chai.expect;
let template 			= require('../lib/template.json');

const sampleObj 		= function() {
	return { 	ns_vid: 'ff7735a3e6b09dcb1bf3c46a27b2da9f',
						ns_utc: 1473856240054,
						name: 'news.page',
						ns_jspageurl: 'news',
						app_type: 'responsive-web',
						app_name: 'news',
						bbc_site: 'invalid-data',
						action_name: 'swipe',
						type: 'hidden',
						ip: '81.149.230.113',
						screen_resolution: '1024x768',
						agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13G36 Twitter for iPhone',
						referrer: "http://www.google.co.id/search?client=ms-opera-mini&channel=new&gws_rd=cr&hl=id&ie=UTF-8&q=Film+binatang+raksasa+2016",
						ns_st_pt: null 
					};
}

describe("Parse Referrer Agent", function() {
	it('should throw error if no preferences passed', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			referralparse(line, null);
		}).to.throw();;
	});

	it('should throw error if no line passed', function() {
		//arrange
		let line = new sampleObj();
		//assert
		expect(function() {
			//act
			referralparse(null, template);
		}).to.throw();;
	});

	it('should return an object with search data', function() {
		//arrange
		let line = new sampleObj();
		//act
		let res = referralparse(line, template.referrer);
		//assert
		let ex = { type: 'search',
     			name: 'Google',
     			search: 'Film binatang raksasa 2016',
     			host: 'www.google.co.id'
     		}
		expect(res.rp).to.eql(ex);
	});

	it('should return an object with social data', function() {
		//arrange
		let line = new sampleObj();
		//act
		line.referrer = "http://www.facebook.com";
		let res = referralparse(line, template.referrer);

		//assert
		let ex = { type: 'social',
     			name: 'Facebook',
     			host: 'www.facebook.com'
     		}
		expect(res.rp).to.eql(ex);
	});

	it('should return an object with news data', function() {
		//arrange
		let line = new sampleObj();
		//act
		line.referrer = "http://www.flipboard.com";
		let res = referralparse(line, template.referrer);
		//assert
		let ex = { 
					type: 'news',
     				name: 'Flipboard',
     				host: 'www.flipboard.com'
     			};
		expect(res.rp).to.eql(ex);
	});

	it('should return an object with user agent data', function() {
		//arrange
		let line = new sampleObj();
		//act
		delete line.referrer;
		let res = referralparse(line, template.referrer);

		//assert
		let ex = { type: 'social',
     			name: 'Twitter'
     		}
		expect(res.rp).to.eql(ex);
	});

	it('should return an object as direct traffic', function() {
		//arrange
		let line = new sampleObj();
		//act
		delete line.referrer;
		delete line.agent;
		let res = referralparse(line, template.referrer);

		//assert
		let ex = {type: 'direct'};    		
		expect(res.rp).to.eql(ex);
	});

	it('should return an object as normal unknown referrer', function() {
		//arrange
		let line = new sampleObj();
		//act
		line.referrer = "http://softwareengineeringdaily.com";
		let res = referralparse(line, template.referrer);
		//assert
		let ex = {	host: "softwareengineeringdaily.com"
				};    		
		expect(res.rp).to.eql(ex);
	});

});