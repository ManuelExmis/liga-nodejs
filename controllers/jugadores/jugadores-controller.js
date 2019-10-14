'use strict'

var JugadoresModel = require('./../../models/jugadores/jugadores-model'),
    JugadoresController = () => {}

JugadoresController.getAll = (req, res, next) => {
    JugadoresModel.getAll((err, rows) => {
        if(err){
            let locals = {
                title : 'Error al consultar la base de datos',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            let locals = {
                title : 'Lista de Jugadores',
                data : rows
            }

            res.render('jugadores/index', locals)
        }
    })
}

JugadoresController.getOne = (req, res, next) => {
    let datos = {
        Id : req.body.id,
        IdTemporada : req.body.idTemporada,
        IdEquipo : req.body.idEquipo
    }
    var locals = {
        title : 'Editar Jugador',
        data : {}
    }
    JugadoresModel.getTemporadas((err, rows) => {
        if(err){
            let locals = {
                title : 'Error al consultar la base de datos',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            locals.data.temporadas = rows

            JugadoresModel.getEquipos((err, rows) => {
                if(err){
                    let locals = {
                        title : 'Error al consultar la base de datos',
                        description : 'Error de sintaxis SQL',
                        error : err
                    }
        
                    res.render('error', locals)
                }
                else{
                    locals.data.equipos = rows
                    
                    JugadoresModel.getOne(datos, (err, rows) => {
                        if(err){
                            let locals = {
                                title : 'Error al consultar la base de datos',
                                description : 'Error de sintaxis SQL',
                                error : err
                            }
                
                            res.render('error', locals)
                        }
                        else{
                            let fecha = new Date(rows[0].FNacimiento),
                                dia = fecha.getDate(),
                                mes = fecha.getMonth()

                            rows[0].FNacimiento = `${fecha.getFullYear()}-${(mes>9) ? mes : '0'+mes }-${(dia>9) ? dia : '0'+dia}`
                            locals.data.editar = rows
                
                            res.render('jugadores/edit-jugador.jade', locals)
                        }
                    })
                }
            })
        }
    })
}

JugadoresController.save = (req, res, next) => {
    let datos = {
        Jugador : {
            Nombre : req.body.nombre,
            Apellido : req.body.apellido,
            FNacimiento : req.body.fNacimiento,
            Sexo : req.body.sexo,
            NombreFut : req.body.nombreFut
        },
        Equipo : req.body.equipo,
        Temporada : req.body.temporada,
        Tiempo : req.body.tiempo
    }

    if(req.body.save != 'new'){
        datos.Jugador.Id=req.body.id,
        datos.OldEquipo=req.body.idOldEquipo,
        datos.OldTemporada=req.body.idOldTemporada
    }

    JugadoresModel.save(datos, (err) => {
        if(err){
            let locals = {
                title : 'Error al salvar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            res.render('error', locals)
        }    
        else{
            res.redirect('/jugadores')
        }
    })
}

JugadoresController.delete = (req, res, next) => {
    let id = req.body.id
    console.log('id jugador : '+id)
    JugadoresModel.delete(id, (err) => {
        if(err)
        {
            let locals = {
                title : 'Error al eliiminar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            console.log('delete err ... ' + locals)
            res.render('error', locals)
        }
        else
        {
            console.log('delete ok')
            res.redirect('/jugadores')
        }
    })
}

JugadoresController.puedoEliminar = (req, res, next) => {
    let id = req.body.id

    JugadoresModel.puedoEliminar(id, (err, rows) => {
        if(err)
        {
            let locals = {
                title : 'Error al buscar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            console.log('puedo eliminar err ... ' + locals)
            res.render('error', locals)
        }
        else
        {
            console.log('rows ... '+rows.length)
            if(rows.length >= 1)    res.json({ ok : false})
            else    res.json({ ok : true})
        }
    })
}

JugadoresController.addForm = (req, res, next) => {
    var locals = {
        title : 'Agregar un nuevo jugador',
        data : {}
    },
    fecha = new Date(),
    mes = parseInt(fecha.getMonth())+1,
    dia= parseInt(fecha.getDate())
    
    fecha.setFullYear(fecha.getFullYear()-15)
    locals.data.fecha=`${fecha.getFullYear()}-${(mes>9) ? mes : '0'+mes }-${(dia>9) ? dia : '0'+dia}`

    JugadoresModel.getTemporadas((err, rows) => {
        if(err){
            let locals = {
                title : 'Error al consultar la base de datos',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            locals.data.temporadas = rows

            JugadoresModel.getEquipos((err, rows) => {
                if(err){
                    let locals = {
                        title : 'Error al consultar la base de datos',
                        description : 'Error de sintaxis SQL',
                        error : err
                    }
        
                    res.render('error', locals)
                }
                else{
                    locals.data.equipos = rows

                    console.log(locals)
                    res.render('jugadores/add-jugador', locals)
                }
            })
        }
    })
}

module.exports = JugadoresController