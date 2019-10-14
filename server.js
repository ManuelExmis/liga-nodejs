'use strict'

var app = require('./app.js'),
    server = app.listen(app.get('port'), ()=>{
        console.log('Iniciando Express el el puerto '+ app.get('port'))
    }),
    io = require('socket.io')(server),
    PartidosController = require('./controllers/partidos/partidos-controller')

io.on('connection', PartidosController.init)
