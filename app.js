'use strict'

var express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    restFul = require('express-method-override')('_method'),
    routes = require('./routes/movie-router'),
    faviconURL = `${__dirname}/public/img/liga-favicon.png`,
    publicDir = express.static(`${__dirname}/public`),
    viewDir = `${__dirname}/views`,
    port = (process.env.PORT || 3000),
    app = express()

app
    //configurando app
    .set('views', viewDir)
    .set('view engine', 'jade')
    .set('port', port)
    //ejecutando middlewares
    .use( favicon(faviconURL) )
    // parse application/json
    .use( bodyParser.json() )
    // parse application/x-www-form-urlencoded
    .use( bodyParser.urlencoded({extended : false}) )
    .use(restFul)
    .use( morgan('dev') )
    .use( publicDir )
    //ejecuto el middleware enrutador
    .use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
    .use('/js', express.static(__dirname + '/node_modules/jquery/dist'))
    .use('/js', express.static(__dirname + '/node_modules/popper.js/dist/umd'))
    .use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
    .use(routes)

module.exports = app