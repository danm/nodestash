'use strict';

module.exports = function(line, preferences) {
  
  if (!preferences || preferences === undefined || preferences === {}) {
    //no settings passed to this module
    throw new Error('No valid prefences');
  }

  if (!line || line === undefined) {
    //no settings passed to this module
    return new Error ('No valid input');
  }

  let obj = {};
  var cells = line.split(preferences.cellSeparator);

  cells.forEach(function(cell, idx) {
    if (cell && cell.length > 0) {
      if (preferences.data[idx].type === 'string') {
        obj[preferences.data[idx].value] = String(cell);
      } else if(preferences.data[idx].type === 'int') {
        obj[preferences.data[idx].value] = parseInt(cell) || null;
      }
    }
  });

  return obj;
};