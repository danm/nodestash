module.exports = (line, preferences, i) => {
    
    if (!preferences || preferences === undefined || preferences === {}) {
        //no settings passed to this module
        throw new Error('No valid prefences');
    }

    if (!line || line === undefined) {
        //no settings passed to this module
        return new Error('No valid input');
    }

    let obj = {};
    var cells = line.split(preferences.cellSeparator);

    if (cells.length !== preferences.data.length) { 
        throw new Error('Header and row mismatch on line ' + i);
    }

    cells.forEach(function(cell, idx) {

        if (cell && preferences.data[idx]) {
            if (preferences.data[idx].type === 'string') {
                obj[preferences.data[idx].value] = String(cell);
            } else if (preferences.data[idx].type === 'int') {
                obj[preferences.data[idx].value] = parseInt(cell) || null;
            }
        }
    });
    return obj;
};