'use strict';

let loadSchema;
let checkSchema;
let clearIsOnline;
let checkType;
let constructObj;
let readObj;
let updateObj;
let destroyObj;

let mongodb = require('mongodb');
let mongoClient= mongodb.MongoClient;
let mongoUrl = 'mongodb://localhost:27017';
let mongoConfig = { useNewUrlParser: true };

let fsHandle = require('fs');
let JSV = require('JSV').JSV;
let validator = JSV.createEnvironment();
let objTypeMap = {
    user : {}
};

loadSchema = function(schema_name, schema_path) {
    fsHandle.readFile(schema_path, 'utf8', function(err, data) {
        objTypeMap[schema_name] = JSON.parse(data);
    });
};

checkSchema = function(obj_type, obj_map, callback) {
    let schema_map = objTypeMap[obj_type];
    let report_map = validator.validate(obj_map, schema_map);

    callback(report_map.errors);
};

clearIsOnline = function() {
    updateObj(
        'user',
        { is_online : true },
        { is_online : false },
        function(response_map) {
            console.log('All users set to offline', response_map);
        }
    );
};

checkType = function(obj_type) {
    if (!objTypeMap[obj_type]) {
        return ({ error_msg : 'Object type "' + obj_type + '" is not supported.' });
    }
    return null;
};

constructObj = function(obj_type, obj_map, callback) {
    let type_check_map = checkType(obj_type);
    if (type_check_map) {
        callback(type_check_map);
        return;
    }

    checkSchema(
        obj_type,
        obj_map,
        function(error_list) {
            if (error_list.length === 0) {
                mongoClient.connect(mongoUrl, mongoConfig, function(err, client) {
                    let db = client.db('spa');
                    db.collection(obj_type, function(err, collection) {
                        let options_map = { safe : true };
                        collection.insertOne(
                            obj_map,
                            options_map,
                            function(err, result_map) {
                                callback(result_map);
                                client.close();
                            }
                        );
                    });
                });
            } else {
                callback({
                    error_msg : 'Input document not valid',
                    error_list : error_list
                });
            }
        }
    );
};

readObj = function(obj_type, find_map, fields_map, callback) {
    let type_check_map = checkType(obj_type);
    if (type_check_map) {
        callback(type_check_map);
        return;
    }

    mongoClient.connect(mongoUrl, mongoConfig, function(err, client) {
        let db = client.db('spa');
        db.collection(obj_type, function(err, collection) {
            collection.find(find_map, fields_map).toArray(function(err, map_list) {
                callback(map_list);
                client.close();
            });
        });
    });
};

updateObj = function(obj_type, find_map, set_map, callback) {
    let type_check_map = checkType(obj_type);
    if (type_check_map) {
        callback(type_check_map);
        return;
    }

    checkSchema(
        obj_type,
        set_map,
        function(error_list) {
            if (error_list.length === 0) {
                mongoClient.connect(mongoUrl, mongoConfig, function(err, client) {
                    let db = client.db('spa');
                    db.collection(obj_type, function(err, collection) {
                        collection.updateMany(
                            find_map,
                            { $set : set_map },
                            { safe : true, multi : true, upsert : false },
                            function(err, update_count) {
                                callback({ update_count : update_count });
                                client.close();
                            }
                        );
                    });
                });
            } else {
                callback({
                    error_msg : 'Input document not valid',
                    error_list : error_list
                });
            }
        }
    );
};

destroyObj = function(obj_type, find_map, callback) {
    let type_check_map = checkType(obj_type);
    if (type_check_map) {
        callback(type_check_map);
        return;
    }

    mongoClient.connect(mongoUrl, mongoConfig, function(err, client) {
        let db = client.db('spa');
        db.collection(request.params.obj_type, function(err, collection) {
            let options_map = { safe : true, single : true };
            collection.deleteMany(
                find_map,
                options_map,
                function(err, delete_count) {
                    callback({ delete_count : delete_count });
                    client.close();
                }
            );
        });
    });
};

module.exports = {
    makeMongoId : mongodb.ObjectID,
    checkType : checkType,
    construct : constructObj,
    read : readObj,
    update : updateObj,
    destroy : destroyObj
};

clearIsOnline();

(function() {
    let schema_name;
    let schema_path;
    for (schema_name in objTypeMap) {
        if (objTypeMap.hasOwnProperty(schema_name)) {
            schema_path = __dirname + '\\' + schema_name + '.json';
            loadSchema(schema_name, schema_path);
        }
    }
})();
