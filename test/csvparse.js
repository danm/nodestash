'use strict';

const fs = require('fs');
const Nodestash = require('../index.js');

const mocha = require('mocha');
const chai = require('chai');
const csvparse = require('../lib/filters/csvparse');
const expect = chai.expect;
let template = require('../lib/template.json');

describe("Parse CSV", function() {
    it('should split each line by comma', function() {
        //arrange
        var line = "ff7735a3e6b09dcb1bf3c46a27b2da9f, 1473856240054, , news.page, , news, , mobile-app, news, invalid-data, , , , swipe, hidden, 81.149.230.113, 1024x768, BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0, , , , , , landscape, , ";
        template.csv.cellSeparator = ', ';
        //act
        var result = csvparse(line, template.csv);
        //assert
        expect(result).to.include.all.keys('action_type', 'agent', 'app_name', 'app_type', 'bbc_site', 'ip', 'name', 'ns_jspageurl', 'ns_st_pt', 'ns_utc', 'ns_vid', 'screen_resolution', 'type');
    });

    it('should split each line by tab', function() {
        //arrange
        var line = "ff7735a3e6b09dcb1bf3c46a27b2da9f	1473856240054		news.page		news		mobile-app	news	invalid-data				swipe	hidden	81.149.230.113	1024x768	BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0						landscape		";
        template.csv.cellSeparator = '\t';
        //act
        var result = csvparse(line, template.csv);
        //assert
        expect(result).to.include.all.keys('action_type', 'agent', 'app_name', 'app_type', 'bbc_site', 'ip', 'name', 'ns_jspageurl', 'ns_st_pt', 'ns_utc', 'ns_vid', 'screen_resolution', 'type');
    });

    it('should convert into types', function() {
        //arrange
        var line = "ff7735a3e6b09dcb1bf3c46a27b2da9f	1473856240054		news.page		news		mobile-app	news	invalid-data				swipe	hidden	81.149.230.113	1024x768	BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0						landscape		";
        template.csv.cellSeparator = '\t';
        //act
        var result = csvparse(line, template.csv);
        //assert
        expect(result.ns_utc).to.be.a('number');
    });

    it('should throw error if no preference', function() {
        //arrange
        var line = "ff7735a3e6b09dcb1bf3c46a27b2da9f	1473856240054		news.page		news		mobile-app	news	invalid-data				swipe	hidden	81.149.230.113	1024x768	BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0						landscape		";
        template.csv.cellSeparator = '\t';

        //assert
        expect(function() {
            //act
            csvparse(line, null);
        }).to.throw();;
    });

    it('should throw error if no line input', function() {
        //arrange
        var line = "ff7735a3e6b09dcb1bf3c46a27b2da9f	1473856240054		news.page		news		mobile-app	news	invalid-data				swipe	hidden	81.149.230.113	1024x768	BBCNews/3.9.3.14 CFNetwork/758.5.3 Darwin/15.6.0						landscape		";
        var err = new ReferenceError('No valid input');
        template.csv.cellSeparator = '\t';
        //assert
        expect(function() {
            //act
            csvparse({}, template.csv);
        }).to.throw();;
    });
});