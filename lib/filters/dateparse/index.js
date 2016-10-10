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
        
        const mins  = date.getMinutes();

        if (mins >= 0 && mins < 15) {
          date.setMinutes(0,0,0);
        } else if (mins >= 15 && mins < 30) {
          date.setMinutes(15,0,0);
        } else if (mins >= 30 && mins < 45) {
          date.setMinutes(30,0,0);
        } else if (mins >= 45 && mins <= 59) {
          date.setMinutes(45,0,0);
        }

        //set time
        line[preference.out] = date.toJSON();  

        return line;
  } else {
    return new Error ('No valid data or preference');
  }
  
};