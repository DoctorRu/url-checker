_data = require('./data');
let helpers = require('./helpers');


let handlers = {};

handlers.users = (data, callback) => {
    
    console.log(data);
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
handlers._users.post = (data, callback) => {
    //
    // console.log('data.payload');
    // console.log(data.payload);
    
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
        
        _data.read('users', phone, function (err, data) {
            if (err) {
                
                // Hash password
                let hashedPassword = helpers.hash(password);
                
                if (hashedPassword) {
                    
                    let userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };
                    
                    _data.create('users', phone, userObject, err => {
                        
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'})
                        }
                        
                    });
                    
                } else {
                    callback(500, {'Error': 'Could not has the user password'})
                }
                
            } else {
                callback(400, {'Error': 'A user with that phone number already exists'})
            }
            
        });
        
        
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
    
};


// Phone is required
handlers._users.get = (data, callback) => {
    
    let phone = typeof(data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim() : false;
    
    if (phone) {
        _data.read('users', phone, (err, data) => {
            
            if (!err && data) {
                delete data.hashedPassword;
                callback(200, data);
                
            } else {
                callback(404);
                
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field (phone)'})
    }
    
};

// phone is required
handlers._users.put = (data, callback) => {
    let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10
        ? data.payload.phone.trim() : false;
    
    
    let firstName = typeof(data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    
    let lastName = typeof(data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    
    let password = typeof(data.payload.password) == 'string'
    && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean'
        && data.payload.tosAgreement == true;
    
    // if this phone is invalid
    
    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            _data.read('users', phone, (err, userData) => {
                
                // update data
                if (!err && userData) {
                    
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    
                    // store the new update
                    
                    _data.update('users', phone, userData, err => {
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not update data'});
                        }
                    })
                    
                    
                } else {
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            })
            
        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
        
    } else {
        callback(400, {'Error': 'Missing required field'})
        
    }
};

// phone required
handlers._users.delete = (data, callback) => {
    
    let phone = typeof(data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim() : false;
    
    if (phone) {
        _data.read('users', phone, (err, data) => {
            
            if (!err && data) {

                _data.delete('users', phone, err => {
                    
                    if(!err){
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete user'})
                    }
                })
                
            } else {
                callback(400, {'Error': 'Could not find specified user'})
                
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field (phone)'})
    }
};


handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;


