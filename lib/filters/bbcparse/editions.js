module.exports = (country) => {
  switch (country) {
    case "gb":
    case "gg":
    case "je":
    case "im": return 'domestic';
    case "as":
    case "ca":
    case "gu":
    case "mp":
    case "pr":
    case "um":
    case "us":
    case "vi": return 'us';
    case 'af':
    case 'au':
    case 'bd':
    case 'bn':
    case 'bt':
    case 'ck':
    case 'cn':
    case 'fj':
    case 'fm':
    case 'hk':
    case 'id':
    case 'in':
    case 'jp':
    case 'kg':
    case 'kh':
    case 'ki':
    case 'kp':
    case 'kr':
    case 'kz':
    case 'la':
    case 'lk':
    case 'mh':
    case 'mm':
    case 'mn':
    case 'mo':
    case 'mv':
    case 'my':
    case 'nc':
    case 'np':
    case 'nr':
    case 'nu':
    case 'nz':
    case 'pf':
    case 'pg':
    case 'ph':
    case 'pk':
    case 'pw':
    case 'sb':
    case 'sg':
    case 'th':
    case 'tj':
    case 'tk':
    case 'tl':
    case 'tm':
    case 'to':
    case 'tv':
    case 'tw':
    case 'uz':
    case 'vn':
    case 'vu':
    case 'ws': return 'asia';
    default: return 'international';
  }
};
