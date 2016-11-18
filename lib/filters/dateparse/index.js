'use strict';

module.exports = function(line, preference) {

  if (preference !== undefined &&
      preference.in !== undefined &&
      preference.out !== undefined &&
      line !== undefined) {
        //convert mins to 15 min batches
        let date = new Date(line[preference.in]);
        if (date == 'Invalid Date') {
          throw new Error('No valid date found');
        }

        date.setSeconds(0);
        date.setMilliseconds(0);

        //set time
        line[preference.out] = date.toJSON();

        return line;
  } else {
    return new Error ('No valid data or preference');
  }

};
