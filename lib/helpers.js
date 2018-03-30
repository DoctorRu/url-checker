let crypto = require('crypto');
let config = require('./config');

// Container for all functions
helpers = {};

// create a SHA256 Hash
helpers.hash = str => {
    if (typeof(str) === 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
        
    } else {
        return false;
    }
};

// parse JSON string int to an object in all cases, withou throwing

helpers.parseJsonToObject = str => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {}
    }
};

module.exports = helpers;