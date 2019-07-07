'use strict';

let http = require('http');
let express = require('express');
let routes = require('./lib/routes');
let logger = require('morgan');
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let errorHandler = require('errorhandler');
//let basicAuth = require('basic-auth-connect');

let app = express();
let server = http.createServer(app);
let env = app.settings.env;
console.log(env);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
//app.use(basicAuth('user', 'spa'));
//app.use(methodOverride());
if (env === 'development') {
    app.use(logger('dev'));
}
if (env === 'production') {
//    app.use(errorHandler);
}

routes.configRoutes(app, server);

server.listen(3000);
