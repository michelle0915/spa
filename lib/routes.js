'use strict';

let configRoutes;
let crud = require('./crud');
let chat = require('./chat');

let makeMongoId = crud.makeMongoId;

configRoutes = function(app, server) {
    app.get('/', function(request, response) {
        response.redirect('/spa.html');
    });

    app.all('/:obj_type/*?', function(request, response, next) {
        response.contentType('json');
        next();
    });

    app.get('/:obj_type/list', function(request, response) {
        crud.read(
            request.params.obj_type,
            {},
            {},
            function(map_list) { response.send(map_list); }
        );
    });

    app.post('/:obj_type/create', function(request, response) {
        crud.construct(
            request.params.obj_type,
            request.body,
            function(result_map) { response.send(result_map) }
        );
    });

    app.get('/:obj_type/read/:id', function(request, response) {
        crud.read(
            request.params.obj_type,
            { _id : makeMongoId(request.params.id) },
            {},
            function(map_list) { response.send(map_list); }
        );
    });

    app.post('/:obj_type/update/:id', function(request, response) {
        let find_map = { _id : makeMongoId(request.params.id) };
        let obj_type = request.params.obj_type;
        let obj_map = request.body;
        crud.update(
            request.params.obj_type,
            { _id : makeMongoId(request.params.id) },
            request.body,
            function(result_map) { response.send(result_map); }
        );
    });

    app.get('/:obj_type/delete/:id', function(request, response) {
        let find_map = { _id : makeMongoId(request.params.id) };
        crud.destroy(
            request.params.obj_type,
            { _id : makeMongoId(request.params.id) },
            function(result_map) { response.send(result_map); }
        );
    });

    chat.connect(server);
};

module.exports = { configRoutes : configRoutes };
