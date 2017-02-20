const fs = require('fs');

const mysql_real_escape_string = (str) => {

    if (str === undefined) {
        return 'NULL';
    }

    return str.replace(/[\0\x08\x09\x1a\n\r"',\\\%]/g, function(char) {
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
            case ",":
                return "\\,";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char;
        }
    });
};

module.exports = (x) => {
    let flat = [{
            "name": "ns_vid",
            "value": x.ns_vid || 'NULL',
            "type": "string"
        },
        {
            "name": "ns_utc",
            "value": x.ns_utc || 0,
            "type": "bigint"
        },
        {
            "name": "date",
            "value": x.date || 'NULL',
            "type": "date"
        },
        // {
        //     "name": "agent",
        //     "value": x.agent || null,
        //     "type": "string"
        // },
        {
            "name": "ip",
            "value": x.ip || 'NULL',
            "type": "string"
        },
        {
            "name": "screen_resolution",
            "value": x.screen_resolution || 'NULL',
            "type": "string"
        },
        {
            "name": "ns_v_platform",
            "value": x.ns_v_platform || 'NULL',
            "type": "string"
        },
        {
            "name": "ns_jspageurl",
            "value": x.ns_jspageurl || 'NULL',
            "type": "string"
        },
        {
            "name": "referrer",
            "value": x.referrer || 'NULL',
            "type": "string"
        },
        {
            "name": "type",
            "value": x.type || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_name",
            "value": x.name || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_section",
            "value": x.section || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_page_type",
            "value": x.page_type || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_site_type",
            "value": x.app_type || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_site_name",
            "value": x.app_name || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_service_name",
            "value": x.bbc_site || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_referring_object",
            "value": x.referring_object || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_action_name",
            "value": x.action_name || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_action_type",
            "value": x.action_type || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_postid",
            "value": x.postID || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_ocid",
            "value": x.ocid || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_cps_asset_id",
            "value": x.cps_asset_id || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_app_name",
            "value": x.app && x.app.name || 'NULL',
            "type": "string"
        },
        {
            "name": "bbc_app_major",
            "value": x.app && x.app.major || 0,
            "type": "int"
        },
        {
            "name": "bbc_app_minor",
            "value": x.app && x.app.minor || 0,
            "type": "int"
        },
        {
            "name": "loc_range_lat",
            "value": x.loc && x.loc.ll[0] || 0,
            "type": "float"
        },
        {
            "name": "loc_range_long",
            "value": x.loc && x.loc.ll[1] || 0,
            "type": "float"
        },
        {
            "name": "loc_country",
            "value": x.loc && x.loc.country || 'NULL',
            "type": "string"
        },
        {
            "name": "loc_region",
            "value": x.loc && x.loc.region || 'NULL',
            "type": "string"
        },
        {
            "name": "loc_city",
            "value": x.loc && x.loc.city || 'NULL',
            "type": "string"
        },
        {
            "name": "loc_cont",
            "value": x.loc && x.loc.cont || 'NULL',
            "type": "string"
        },
        {
            "name": "ua_family",
            "value": x.ua && x.ua.family || 'NULL',
            "type": "string"
        },
        {
            "name": "ua_major",
            "value": x.ua && x.ua.major || 0,
            "type": "int"
        },
        {
            "name": "ua_minor",
            "value": x.ua && x.ua.minor || 0,
            "type": "int"
        },
        {
            "name": "ua_patch",
            "value": x.ua && x.ua.patch || 0,
            "type": "int"
        },
        {
            "name": "ua_device_family",
            "value": x.ua && x.ua.device && x.ua.device.family || 'NULL',
            "type": "string"
        },
        {
            "name": "ua_device_major",
            "value": x.ua && x.ua.device && x.ua.device.major || 0,
            "type": "int"
        },
        {
            "name": "ua_device_minor",
            "value": x.ua && x.ua.device && x.ua.device.minor || 0,
            "type": "int"
        },
        {
            "name": "ua_device_patch",
            "value": x.ua && x.ua.device && x.ua.device.patch || 0,
            "type": "int"
        },
        {
            "name": "ua_os_family",
            "value": x.ua && x.ua.os && x.ua.os.family || 'NULL',
            "type": "string"
        },
        {
            "name": "ua_os_major",
            "value": x.ua && x.ua.os && x.ua.os.major || 0,
            "type": "int"
        },
        {
            "name": "ua_os_minor",
            "value": x.ua && x.ua.os && x.ua.os.minor || 0,
            "type": "int"
        },
        {
            "name": "ua_os_patch",
            "value": x.ua && x.ua.os && x.ua.os.patch || 0,
            "type": "int"
        },
        {
            "name": "rp_type",
            "value": x.rp && x.rp.type || 'NULL',
            "type": "string"
        },
        {
            "name": "rp_name",
            "value": x.rp && x.rp.name || 'NULL',
            "type": "string"
        },
        {
            "name": "rp_host",
            "value": x.rp && x.rp.host || 'NULL',
            "type": "string"
        },
        {
            "name": "rp_page",
            "value": x.rp && x.rp.page || 'NULL',
            "type": "string"
        },
        {
            "name": "rp_search",
            "value": x.rp && x.rp.search || 'NULL',
            "type": "string"
        },
        {
            "name": "vid_id",
            "value": x.ns_st_ci || 'NULL',
            "type": "string"
        },
        {
            "name": "vid_watch_id",
            "value": x.ns_st_id || 'NULL',
            "type": "string"
        },
        {
            "name": "vid_event",
            "value": x.ns_st_ev || 'NULL',
            "type": "string"
        },
        {
            "name": "vid_position",
            "value": x.ns_st_po || 0,
            "type": "int"
        },
        {
            "name": "vid_accumulated",
            "value": x.ns_st_pt || 0,
            "type": "int"
        },
        {
            "name": "vid_length",
            "value": x.ns_st_cl || 0,
            "type": "int"
        }
    ];

    let line = '';
    let i = 0;

    for (let row in flat) {
        if (i > 0) {
            line += ',';
        }

        if (flat[row].type !== undefined && flat[row].value !== undefined) {
            if (flat[row].type === 'string') {
                line += mysql_real_escape_string(String(flat[row].value));
            } else if (flat[row].type === 'int') {
                let num = Number(flat[row].value);
                if (isNaN(num)) {
                    line += '0';
                } else {
                    num = String(Math.trunc(num));
                    if (num.length > 8) {
                        num = num.slice(0, 8);
                    }
                    line += num;
                }
            } else if (flat[row].type === 'bigint') {
                let num = Number(flat[row].value);
                if (isNaN(num)) {
                    line += '0';
                } else {
                    line += String(Math.trunc(num));
                }
            } else if (flat[row].type === 'float') {
                let num = Number(flat[row].value);
                if (isNaN(num)) {
                    line += '0';
                } else {
                    line += String(num);
                }
            } else if (flat[row].type === 'date') {
                line += new Date(flat[row].value).toISOString().slice(0, 19).replace('T', ' ');
            } else {
                throw new Error(JSON.stringify(flat[row]) + ' Unknown type');
            }
        } else {
            throw new Error(JSON.stringify(flat[row]) + ' Error with object');
        }

        i++;
    }
    line += '\n';
    fs.appendFileSync('./nodestash-tmp.csv', line);
    return null;
};