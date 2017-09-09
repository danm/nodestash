'use strict';

const url = require('url');
const Referral = require('referral-parser');
const opts = { bbc: true };
module.exports = function(line, preference) {

    //check to make sure all data is there
    //in future check for object types
    if (!line) {
        throw new Error('Missing Line');
    } else if (!preference) {
        throw new Error('Missing Preference');
    }

    //if you have exceptions where you do not want to parse each and every line, put them here

    //if we detect that someting is coming from FIA, we overright all other refferals
    if (line[preference.appin]) {
        if (line[preference.appin] === 'fia') {
            line[preference.out] = {
                type: 'social',
                name: 'Facebook',
                orginal: line[preference.appin],
            };

            return line;
        }
    }

    if (line[preference.refin]) {

        //make sure we are collecting the bbc area that the traffic came from.

        //create new object, and pass in the log,
        //and runs methods on itself returning a fully parsed referrer
        let res = new Referral(line[preference.refin], opts);

        //we want to check that something has been returned
        if (res === null || res === undefined || res.refferal === undefined) {
            //looks like it hasn't, so we want to return an unknown referer type.
            //we can do something here to handle uknown data
        } else {
            //it has returned information,
            //we just want to check it was good information, if it is, build a new object and add data.
            if (res.refferal.type ||
                res.refferal.name ||
                res.refferal.page ||
                res.refferal.search ||
                res.refferal.host) {
                line[preference.out] = {};
            }
            if (res.refferal.type) { line[preference.out].type = res.refferal.type; }
            if (res.refferal.name) { line[preference.out].name = res.refferal.name; }
            if (res.refferal.page) { line[preference.out].page = res.refferal.page; }
            if (res.refferal.search) { line[preference.out].search = res.refferal.search; }
            if (res.refferal.host) { line[preference.out].host = res.refferal.host; }
        }
    } else {
        //at some stage lets create a seperate class for this. Just incase it gets way bigger

        //there was no referrer url found, so lets check the user agent of the browser.
        //if there is no referrer, usually this means a direct entry from social media - we call this dark social
        //most of the time, if there is no referrer, we do not investigate any more. but the user agent helps us identify dark social

        //check there is an User Agent property
        if (preference.agentin &&
            line[preference.agentin]) {
            //check for Twitter
            if (line[preference.agentin].indexOf('Twitter') >= 0) {
                line[preference.out] = {
                    type: 'social',
                    name: 'Twitter'
                };
                //check for Facebook
            } else if (line[preference.agentin].indexOf('FBAV') >= 0) {
                line[preference.out] = {
                    type: 'social',
                    name: 'Facebook'
                };
                //check for Flipboard
            } else if (line[preference.agentin].indexOf('Flipboard') >= 0) {
                line[preference.out] = {
                    type: 'news',
                    name: 'Flipboard'
                };
            }
        }

        //no user referrer, no useful useragent, lets just say this was direct traffic.
        if (!line[preference.out]) {
            line[preference.out] = {
                type: 'direct'
            };
        }
    }
    
    if (line[preference.out]) {
        line[preference.out].orginal = line[preference.refin];
    } else { 
        line[preference.out] = {};
        line[preference.out].orginal = line[preference.refin];
    }

    return line;
};