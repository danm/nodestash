module.exports = function(country) {

	var continent = "";

	switch(country) {

		case "AO" :
		case "BF" :
		case "BI" :
		case "BJ" :
		case "BW" :
		case "CD" :
		case "CF" :
		case "CG" :
		case "CI" :
		case "CM" :
		case "CV" :
		case "DJ" :
		case "DZ" :
		case "EG" :
		case "EH" :
		case "ER" :
		case "ET" :
		case "GA" :
		case "GH" :
		case "GM" :
		case "GN" :
		case "GQ" :
		case "GW" :
		case "KE" :
		case "KM" :
		case "LR" :
		case "LS" :
		case "LY" :
		case "MA" :
		case "MG" :
		case "ML" :
		case "MR" :
		case "MU" :
		case "MW" :
		case "MZ" :
		case "NA" :
		case "NE" :
		case "NG" :
		case "RE" :
		case "RW" :
		case "SC" :
		case "SD" :
		case "SH" :
		case "SL" :
		case "SN" :
		case "SO" :
		case "ST" :
		case "SZ" :
		case "TD" :
		case "TG" :
		case "TN" :
		case "TZ" :
		case "UG" :
		case "YT" :
		case "ZA" :
		case "ZM" :
		case "ZW" : { continent = "AF"; break; }
		
		case "AQ" :
		case "BV" :
		case "GS" :
		case "HM" :
		case "TF" : { continent = "AN"; break; }

		case "AE" : 
		case "AF" : 
		case "AM" : 
		case "AP" : 
		case "AZ" : 
		case "BD" : 
		case "BH" : 
		case "BN" : 
		case "BT" : 
		case "CC" : 
		case "CN" : 
		case "CX" : 
		case "CY" : 
		case "GE" : 
		case "HK" : 
		case "ID" : 
		case "IL" : 
		case "IN" : 
		case "IO" : 
		case "IQ" : 
		case "IR" : 
		case "JO" : 
		case "JP" : 
		case "KG" : 
		case "KH" : 
		case "KP" : 
		case "KR" : 
		case "KW" : 
		case "KZ" : 
		case "LA" : 
		case "LB" : 
		case "LK" : 
		case "MM" : 
		case "MN" : 
		case "MO" : 
		case "MV" : 
		case "MY" : 
		case "NP" : 
		case "OM" : 
		case "PH" : 
		case "PK" : 
		case "PS" : 
		case "QA" : 
		case "SA" : 
		case "SG" : 
		case "SY" : 
		case "TH" : 
		case "TJ" : 
		case "TL" : 
		case "TM" : 
		case "TW" : 
		case "UZ" : 
		case "VN" : 
		case "YE" : { continent = "AN"; break; }

		case "AD" : 
		case "AL" : 
		case "AT" : 
		case "AX" : 
		case "BA" : 
		case "BE" : 
		case "BG" : 
		case "BY" : 
		case "CH" : 
		case "CZ" : 
		case "DE" : 
		case "DK" : 
		case "EE" : 
		case "ES" : 
		case "EU" : 
		case "FI" : 
		case "FO" : 
		case "FR" : 
		case "FX" : 
		case "GB" : 
		case "GG" : 
		case "GI" : 
		case "GR" : 
		case "HR" : 
		case "HU" : 
		case "IE" : 
		case "IM" : 
		case "IS" : 
		case "IT" : 
		case "JE" : 
		case "LI" : 
		case "LT" : 
		case "LU" : 
		case "LV" : 
		case "MC" : 
		case "MD" : 
		case "ME" : 
		case "MK" : 
		case "MT" : 
		case "NL" : 
		case "NO" : 
		case "PL" : 
		case "PT" : 
		case "RO" : 
		case "RS" : 
		case "RU" : 
		case "SE" : 
		case "SI" : 
		case "SJ" : 
		case "SK" : 
		case "SM" : 
		case "TR" : 
		case "UA" : 
		case "VA" : { continent = "EU"; break; }

		case "AG" :
		case "AI" :
		case "AN" :
		case "AW" :
		case "BB" :
		case "BL" :
		case "BM" :
		case "BS" :
		case "BZ" :
		case "CA" :
		case "CR" :
		case "CU" :
		case "DM" :
		case "DO" :
		case "GD" :
		case "GL" :
		case "GP" :
		case "GT" :
		case "HN" :
		case "HT" :
		case "JM" :
		case "KN" :
		case "KY" :
		case "LC" :
		case "MF" :
		case "MQ" :
		case "MS" :
		case "MX" :
		case "NI" :
		case "PA" :
		case "PM" :
		case "PR" :
		case "SV" :
		case "TC" :
		case "TT" :
		case "US" :
		case "VC" :
		case "VG" :
		case "VI" : { continent = "NA"; break; }

		case "AS" :
		case "AU" :
		case "CK" :
		case "FJ" :
		case "FM" :
		case "GU" :
		case "KI" :
		case "MH" :
		case "MP" :
		case "NC" :
		case "NF" :
		case "NR" :
		case "NU" :
		case "NZ" :
		case "PF" :
		case "PG" :
		case "PN" :
		case "PW" :
		case "SB" :
		case "TK" :
		case "TO" :
		case "TV" :
		case "UM" :
		case "VU" :
		case "WF" :
		case "WS" : { continent = "OC"; break; }

		case "AR" :
		case "BO" :
		case "BR" :
		case "CL" :
		case "CO" :
		case "EC" :
		case "FK" :
		case "GF" :
		case "GY" :
		case "PE" :
		case "PY" :
		case "SR" :
		case "UY" :
		case "VE" :	{ continent = "SA"; break; }
			
	}

	return continent;

};

