const fs = require('fs');

const mysql_real_escape_string = (str) => {
    console.log(str);
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char; // prepends a backslash to backslash, percent,
                // and double/single quotes
        }
    });
};

module.exports = (x) => {
    let flat = [{
            "name": "ns_vid",
            "value": x.ns_vid || null,
            "type": "string"
        },
        {
            "name": "ns_utc",
            "value": x.ns_utc || null,
            "type": "number"
        },
        {
            "name": "date",
            "value": x.date || null,
            "type": "string"
        },
        // {
        //     "name": "agent",
        //     "value": x.agent || null,
        //     "type": "string"
        // },
        {
            "name": "ip",
            "value": x.ip || null,
            "type": "string"
        },
        {
            "name": "screen_resolution",
            "value": x.screen_resolution || null,
            "type": "string"
        },
        {
            "name": "ns_v_platform",
            "value": x.ns_v_platform || null,
            "type": "string"
        },
        {
            "name": "ns_jspageurl",
            "value": x.ns_jspageurl || null,
            "type": "string"
        },
        {
            "name": "referrer",
            "value": x.referrer || null,
            "type": "string"
        },
        {
            "name": "type",
            "value": x.type || null,
            "type": "string"
        },
        {
            "name": "bbc_name",
            "value": x.name || null,
            "type": "string"
        },
        {
            "name": "bbc_section",
            "value": x.section || null,
            "type": "string"
        },
        {
            "name": "bbc_page_type",
            "value": x.page_type || null,
            "type": "string"
        },
        {
            "name": "bbc_site_type",
            "value": x.app_type || null,
            "type": "string"
        },
        {
            "name": "bbc_site_name",
            "value": x.app_name || null,
            "type": "string"
        },
        {
            "name": "bbc_service_name",
            "value": x.bbc_site || null,
            "type": "string"
        },
        {
            "name": "bbc_referring_object",
            "value": x.referring_object || null,
            "type": "string"
        },
        {
            "name": "bbc_action_name",
            "value": x.action_name || null,
            "type": "string"
        },
        {
            "name": "bbc_action_type",
            "value": x.action_type || null,
            "type": "string"
        },
        {
            "name": "bbc_postid",
            "value": x.postID || null,
            "type": "string"
        },
        {
            "name": "bbc_ocid",
            "value": x.ocid || null,
            "type": "string"
        },
        {
            "name": "bbc_cps_asset_id",
            "value": x.cps_asset_id || null,
            "type": "string"
        },
        {
            "name": "bbc_app_name",
            "value": x.app && x.app.name || null,
            "type": "string"
        },
        {
            "name": "bbc_app_major",
            "value": x.app && x.app.major || null,
            "type": "number"
        },
        {
            "name": "bbc_app_minor",
            "value": x.app && x.app.minor || null,
            "type": "number"
        },
        {
            "name": "loc_range_lat",
            "value": x.loc && x.loc.ll[0] || null,
            "type": "number"
        },
        {
            "name": "loc_range_long",
            "value": x.loc && x.loc.ll[1] || null,
            "type": "number"
        },
        {
            "name": "loc_country",
            "value": x.loc && x.loc.country || null,
            "type": "string"
        },
        {
            "name": "loc_region",
            "value": x.loc && x.loc.region || null,
            "type": "string"
        },
        {
            "name": "loc_city",
            "value": x.loc && x.loc.city || null,
            "type": "string"
        },
        {
            "name": "loc_cont",
            "value": x.loc && x.loc.cont || null,
            "type": "string"
        },
        {
            "name": "ua_family",
            "value": x.ua && x.ua.family || null,
            "type": "string"
        },
        {
            "name": "ua_major",
            "value": x.ua && x.ua.major || null,
            "type": "number"
        },
        {
            "name": "ua_minor",
            "value": x.ua && x.ua.minor || null,
            "type": "number"
        },
        {
            "name": "ua_patch",
            "value": x.ua && x.ua.patch || null,
            "type": "number"
        },
        {
            "name": "ua_device_family",
            "value": x.ua && x.ua.device && x.ua.device.family || null,
            "type": "string"
        },
        {
            "name": "ua_device_major",
            "value": x.ua && x.ua.device && x.ua.device.major || null,
            "type": "number"
        },
        {
            "name": "ua_device_minor",
            "value": x.ua && x.ua.device && x.ua.device.minor || null,
            "type": "number"
        },
        {
            "name": "ua_device_patch",
            "value": x.ua && x.ua.device && x.ua.device.patch || null,
            "type": "number"
        },
        {
            "name": "ua_os_family",
            "value": x.ua && x.ua.os && x.ua.os.family || null,
            "type": "string"
        },
        {
            "name": "ua_os_major",
            "value": x.ua && x.ua.os && x.ua.os.major || null,
            "type": "number"
        },
        {
            "name": "ua_os_minor",
            "value": x.ua && x.ua.os && x.ua.os.minor || null,
            "type": "number"
        },
        {
            "name": "ua_os_patch",
            "value": x.ua && x.ua.os && x.ua.os.patch || null,
            "type": "number"
        },
        {
            "name": "rp_type",
            "value": x.rp && x.rp.type || null,
            "type": "string"
        },
        {
            "name": "rp_name",
            "value": x.rp && x.rp.name || null,
            "type": "string"
        },
        {
            "name": "rp_host",
            "value": x.rp && x.rp.host || null,
            "type": "string"
        },
        {
            "name": "rp_page",
            "value": x.rp && x.rp.page || null,
            "type": "string"
        },
        {
            "name": "rp_search",
            "value": x.rp && x.rp.search || null,
            "type": "string"
        }
    ];

    let line = '';
    let i = 0;
    for (let row in flat) {
        if (i === 0) {
            if (flat[row].value === null) {
                line += 'NULL';
            } else if (flat[row].value !== undefined && flat[row].type === 'string') {
                line += "'" + mysql_real_escape_string(flat[row].value) + "'";
            } else {
                line += Number(flat[row].value);
            }
        } else {
            if (flat[row].value === null) {
                line += ', NULL';
            } else if (flat[row].value !== undefined && flat[row].type === 'string') {
                line += ", '" + mysql_real_escape_string(flat[row].value) + "'";
            } else {
                line += ', ' + Number(flat[row].value);
            }
        }
        i++;
    }
    line += '\n';
    fs.appendFileSync('./temp.csv', line);
    return null;
};