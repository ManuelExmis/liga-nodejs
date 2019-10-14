'use strict'

var EquiposController = require('../controllers/equipos/equipos-controller'),
    TemporadasController = require('../controllers/temporadas/temporadas-controller'),
    JugadasController = require('../controllers/jugadas/jugadas-controller'),
    MovieController = require('../controllers/movie-controller'),
    JugadoresController = require('../controllers/jugadores/jugadores-controller'),
    PartidosController = require('../controllers/partidos/partidos-controller'),
    express = require('express'),
    router = express.Router() 

router
    .get('/', MovieController.getAll)

    //----------- EQUIPOS -----------//
    .get('/equipos', EquiposController.getAll)
    .get('/equipos/agregar', EquiposController.addForm)
    .post('/equipos/agregar', EquiposController.save)
    .post('/equipos/editar', EquiposController.getOne)
    .put('/equipos/actualizar', EquiposController.save)
    .post('/equipos/puedoEliminar', EquiposController.puedoEliminar)
    .delete('/equipos/eliminar', EquiposController.delete)
    .post('/equipos/validar', EquiposController.validar)

    //----------- TEMPORADAS -----------//
    .get('/temporadas', TemporadasController.getAll)
    .get('/temporadas/agregar', TemporadasController.addForm)
    .post('/temporadas/agregar', TemporadasController.save)
    .post('/temporadas/editar', TemporadasController.getOne)
    .put('/temporadas/actualizar', TemporadasController.save)
    .post('/temporadas/puedoEliminar', TemporadasController.puedoEliminar)
    .delete('/temporadas/eliminar', TemporadasController.delete)
    .post('/temporadas/validar', TemporadasController.validar)

    //----------- JUGADAS -----------//
    .get('/jugadas', JugadasController.getAll)
    .get('/jugadas/agregar', JugadasController.addForm)
    .post('/jugadas/agregar', JugadasController.save)
    .post('/jugadas/editar', JugadasController.getOne)
    .put('/jugadas/actualizar', JugadasController.save)
    .post('/jugadas/puedoEliminar', JugadasController.puedoEliminar)
    .delete('/jugadas/eliminar', JugadasController.delete)
    .post('/jugadas/validar', JugadasController.validar)
    
        //----------- JUGADORES -----------//
    .get('/jugadores', JugadoresController.getAll)
    .get('/jugadores/agregar', JugadoresController.addForm)
    .post('/jugadores/agregar', JugadoresController.save )
    .post('/jugadores/editar', JugadoresController.getOne)
    .put('/jugadores/editar', JugadoresController.save)
    .post('/jugadores/puedoEliminar', JugadoresController.puedoEliminar)
    .delete('/jugadores/eliminar', JugadoresController.delete)

    //----------- PARTIDOS -----------//
    .get('/partidos', PartidosController.getAll)
    .post('/partidos/comenzar', PartidosController.getTeams)
    .post('/partidos/inicioPartido', PartidosController.inicioPartido)
    .post('/partidos/agregarConvocados', PartidosController.addSummoned)
    .post('/partidos/continuar', PartidosController.continuar)

    .get('/agregar', MovieController.addForm)
    // .post('/', MovieController.insert)
    .post('/', MovieController.save)
    .get('/editar/:movie_id', MovieController.getOne)
    //.post('/actualizar/:movie_id', MovieController.update)
    // .put('/actualizar/:movie_id', MovieController.update)
    .put('/actualizar/:movie_id', MovieController.save)
    //.post('/eliminar/:movie_id', MovieController.delete)
    .delete('/eliminar/:movie_id', MovieController.delete)
    .use(MovieController.error404)

module.exports = router