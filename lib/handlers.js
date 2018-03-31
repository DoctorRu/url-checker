// 400 Bad Request
// The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing)

// 403 Forbidden
// The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource, or may need an account of some sort.
//

// 405 Method Not Allowed
// A request method is not supported for the requested resource; for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.

// 500 Internal Server Error
// A generic error message, given when an unexpected condition was encountered and no more specific message is suitable
//

// 501 Not Implemented
// The server either does not recognize the request method, or it lacks the ability to fulfil the request. Usually this implies future availability (e.g., a new feature of a web-service API).[61]


_data = require('./data');
let helpers = require('./helpers');


let handlers = {};


// HANDLER USERS

handlers.users = (data, callback) => {
    
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
        
        // Get the token from headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        
        // Check if  the given token is valid for the phone number
        
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                
                _data.read('users', phone, (err, data) => {
                    
                    if (!err && data) {
                        delete data.hashedPassword;
                        callback(200, data);
                        
                    } else {
                        callback(404);
                        
                    }
                })
                
            } else {
                callback(403, {'Error': 'Missing required token in heade, or token is invalid'});
                
            }
            
        });
        
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
            
            let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                
                if (tokenIsValid) {
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
                                if (!err) {
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
                    callback(403, {'Error': 'Token is invalid'});
                    
                }
                
                
            });
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
        
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            
            if (tokenIsValid) {
                
                _data.read('users', phone, (err, data) => {
                    
                    if (!err && data) {
                        
                        _data.delete('users', phone, err => {
                            
                            if (!err) {
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
                
            }
        });
        
        
    } else {
        callback(400, {'Error': 'Missing required field (phone)'})
    }
};


// HANDLER USERS

handlers.tokens = (data, callback) => {
    
    let acceptableMethods = [ 'post', 'get', 'put', 'delete' ];
    
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[ data.method ](data, callback);
    } else {
        // 405: A request was made of a resource using a request method not supported
        // by that resource; for example, using GET on a form which requires data
        // to be presented via POST, or using PUT on a read-only resource.
        callback(405)
    }
};

// Container for all the tokens methods

handlers._tokens = {};

// required data: phone, password
handlers._tokens.post = (data, callback) => {
    
    let phone = typeof(data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10
        ? data.payload.phone.trim()
        : false;
    
    let password = typeof(data.payload.password) == 'string'
    && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;
    
    if (phone && password) {
        
        // look the user who matches that phone number
        
        _data.read('users', phone, (err, userData) => {
            
            if (!err && userData) {
                // hash the sent password and compare it with the stored password
                
                let hashedPassword = helpers.hash(password);
                
                if (hashedPassword == userData.hashedPassword) {
                    // if valid set token expiration date to 1 hour
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, {'Error': 'Could not create the new token'})
                        }
                    })
                    
                    
                } else {
                    callback(400, {'Error': 'Password did not match'})
                }
                
                
            } else {
                callback(400, {'Error': 'Could not find the specified user'})
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field(s)'})
    }
};

handlers._tokens.get = (data, callback) => {
    
    // ex :
    // GET localhost:3000/tokens?id=6b2o0nznlttkhnif9oek
    
    let id = typeof(data.queryStringObject.id) == 'string'
    && data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id.trim() : false;
    
    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            
            if (!err && tokenData) {
                callback(200, tokenData);
                
            } else {
                callback(404);
                
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field (id)'})
    }
};

handlers._tokens.put = (data, callback) => {
    
    // eg?
    // POST JSON type object
    // {
    //     "id"		: "22iw8kpt9aht27ycw5zg",
    //     "extend"	:	true
    // }
    console.log('id');
    console.log(data.payload.id);
    
    
    let id = typeof(data.payload.id) == 'string'
    && data.payload.id.trim().length == 20
        ? data.payload.id.trim()
        : false;
    
    let extend = typeof(data.payload.extend) == 'boolean'
        && data.payload.extend == true;
    
    if (id && extend) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    
                    
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not update the token expiration'});
                        }
                    });
                    
                    
                } else {
                    callback(400, {'Error': 'Token ahas already epired ad cannont be extended'});
                    
                }
                
            } else {
                callback(400, {'Error': 'Token does not exist'})
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field (id or extend)'})
        
    }
};

handlers._tokens.delete = (data, callback) => {
    // DELETE
    // eg localhost:3000/tokens?id=8g1nya0m2j66no43fj7k
    
    let id = typeof(data.queryStringObject.id) == 'string'
    && data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id.trim() : false;
    
    if (id) {
        _data.read('tokens', id, (err, data) => {
            
            if (!err && data) {
                
                _data.delete('tokens', id, err => {
                    
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete token'})
                    }
                })
                
            } else {
                callback(400, {'Error': 'Could not find specified token'})
                
            }
        })
        
    } else {
        callback(400, {'Error': 'Missing required field (token)'})
    }
};

// verify if a given token id is valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    
    // lookup the token
    _data.read('tokens', id, (err, tokenData) => {
            
            if (!err && tokenData) {
                
                if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
                
            } else {
                callback(false);
            }
        }
    )
};

// PING
handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404);
};


module.exports = handlers;


