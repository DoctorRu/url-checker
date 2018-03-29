// library for storing and editing data

let fs = require('fs');
let path = require('path');


let lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
    
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            
            // convert data to string
            let stringData = JSON.stringify(data);
            
            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
                
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing the file')
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
                
            });
            
        } else {
            callback('Could not create new file, itmay already exist')
        }
    });
};


lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function (err, data) {
        callback(err, data);
    })
};


lib.update = (dir, file, data, callback) => {
    
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        
        if (!err && fileDescriptor) {
            let stringData = JSON.stringify(data);
            
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            
                            fs.close(fileDescriptor, function (err) {
                                
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                            
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                    
                } else {
                    callback('Error truncating the file');
                }
                
            })
            
        } else {
            
            callback('Could not open the file for uploading, it may not exist');
        }
    });
    
};

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
        
        if (!err) {
            callback(false);
            
        } else {
            callback('Error deleting the file');
        }
    });
};

module.exports = lib;
