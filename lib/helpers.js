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

// create a string of random alphanumeric characters, of a given length
helpers.createRandomString = strLength => {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    
    if (strLength) {
        const possibleCharacteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        
        for (i = 1; i <= strLength; i++) {
            let randomCharacter = possibleCharacteres.charAt(Math.floor(Math.random() * possibleCharacteres.length));
            
            str += randomCharacter
        }
        
        return str;
        
    } else {
        return false;
    }
};


module.exports = helpers;