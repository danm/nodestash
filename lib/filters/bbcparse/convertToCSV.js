const fs = require('fs');

module.exports = (x) => {
    let flat = {
        "ns_vid": x.ns_vid || null,
        "ns_utc": x.ns_utc || null,
        "date": x.date || null,
        "agent": x.agent || null,
        "ip": x.ip || null,
        "screen_resolution": x.screen_resolution || null,
        "ns_v_platform": x.ns_v_platform || null,
        "ns_jspageurl": x.ns_jspageurl || null,
        "referrer": x.referrer || null,
        "type": x.type || null,
        "bbc_name": x.name || null,
        "bbc_section": x.section || null,
        "bbc_page_type": x.page_type || null,
        "bbc_site_type": x.app_type || null,
        "bbc_site_name": x.app_name || null,
        "bbc_service_name": x.bbc_site || null,
        "bbc_referring_object": x.referring_object || null,
        "bbc_action_name": x.action_name || null,
        "bbc_action_type": x.action_type || null,
        "bbc_postid": x.postID || null,
        "bbc_ocid": x.ocid || null,
        "bbc_cps_asset_id": x.cps_asset_id || null,
        "bbc_app_name": x.app && x.app.name || null,
        "bbc_app_major": x.app && x.app.major || null,
        "bbc_app_minor": x.app && x.app.minor || null,
        "loc_range_lat": x.loc && x.loc.ll[0] || null,
        "loc_range_long": x.loc && x.loc.ll[1] || null,
        "loc_country": x.loc && x.loc.country || null,
        "loc_region": x.loc && x.loc.region || null,
        "loc_city": x.loc && x.loc.city || null,
        "loc_cont": x.loc && x.loc.cont || null,
        "ua_family": x.ua && x.ua.family || null,
        "ua_major": x.ua && x.ua.major || null,
        "ua_minor": x.ua && x.ua.minor || null,
        "ua_patch": x.ua && x.ua.patch || null,
        "ua_device_family": x.ua && x.ua.device && x.ua.device.family || null,
        "ua_device_major": x.ua && x.ua.device && x.ua.device.major || null,
        "ua_device_minor": x.ua && x.ua.device && x.ua.device.minor || null,
        "ua_device_patch": x.ua && x.ua.device && x.ua.device.patch || null,
        "ua_os_family": x.ua && x.ua.os && x.ua.os.family || null,
        "ua_os_major": x.ua && x.ua.os && x.ua.os.major || null,
        "ua_os_minor": x.ua && x.ua.os && x.ua.os.minor || null,
        "ua_os_patch": x.ua && x.ua.os && x.ua.os.patch || null,
        "rp_type": x.rp && x.rp.type || null,
        "rp_name": x.rp && x.rp.name || null,
        "rp_host": x.rp && x.rp.host || null,
        "rp_page": x.rp && x.rp.page || null,
        "rp_search": x.rp && x.rp.search || null
    };

    let line = '';
    let i = 0;
    for (let row in flat) {
        if (flat[row] !== null && typeof flat[row] === 'string') {
            flat[row] = flat[row].replace(/,/g, "\\,");
            flat[row] = flat[row].replace(/'/g, "\\'");
        }

        if (i === 0) {
            if (flat[row] === null || typeof flat[row] === 'number') {
                line += flat[row];
            } else {
                line += '"' + flat[row] + '"';
            }

        } else {
            if (flat[row] === null || typeof flat[row] === 'number') {
                line += ', ' + flat[row];
            } else {
                line += ', "' + flat[row] + '"';
            }

        }
        i++;
    }
    line += '\n';

    fs.appendFileSync('./temp.csv', line);

    return null;
};