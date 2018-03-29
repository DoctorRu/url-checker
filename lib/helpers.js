let crypto = require('crypto');

helpers = {};

helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        
    } else {
        return false;
    }
};

module.exports = helpers;