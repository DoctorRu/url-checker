_data = require('./data');
let helpers = require('./helpers');


let handlers = {};

handlers.handlers = (data, callback) => {
    let acceptableMethods = [ 'post', 'get', 'put', 'delete' ];
    
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[ data.method ](data, callback);
    } else {
        // 405: A request was made of a resource using a request method not supported
        // by that resource; for example, using GET on a form which requires data
        // to be presented via POST, or using PUT on a read-only resource.
        callback(405)
    }
};

handlers._users = {};

// required data: firstName, lastName, phone, password, tosAgreement
// optional: none
handlers._users.post = (data, calback) => {
    let firstName = typeof(data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    
    let lastName = typeof(data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    
    let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10
        ? data.payload.phone.trim()
        : false;
    
    let password = typeof(data.payload.password) == 'string'
    && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean'
        && data.payload.tosAgreement == true;
    
    if (firstName && lastName && phone && password && tosAgreement) {
    
        _data.read('users', phone, function(err, data){
            if(!err){
                let hashedPassword = helpers.hash(password);
            
            } else {
                callback(400, {'Error' : 'A user with that phone number already exists'})
            }
        
        });
        
        
    } else {
        callback(400, {'Error' : 'Missing required fields'});
    }
    
};

handlers._users.get = (data, calback) => {

};

handlers._users.put = (data, calback) => {

};

handlers._users.delete = (data, calback) => {

};


handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;


