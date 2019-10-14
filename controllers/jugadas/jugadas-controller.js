
'use strict'

var JugadasModel = require('./../../models/jugadas/jugadas-model'),
    JugadasController = () => {}

JugadasController.getAll = (req, res, next) => {
    JugadasModel.getAll((err, rows) => {
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
                title : 'Lista de Jugadas',
                data : rows
            }

            res.render('jugadas/index', locals)
        }
    })
}

JugadasController.getOne = (req, res, next) => {
    let id = req.body.id

    JugadasModel.getOne(id, (err, rows) => {
        if(err){
            let locals = {
                title : 'Error al buscar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            let locals = {
                title : 'Editar Jugada',
                data : rows
            }

            res.render('jugadas/edit-jugada', locals)
        }
    })
}

JugadasController.save = (req, res, next) => {
    let jugada = {
        Jugada : req.body.Jugada,
        Descripcion : req.body.Descripcion
    }

    if(req.body.save !== 'new'){
        jugada = {
            Id : req.body.id,
            Jugada : req.body.Jugada,
            Descripcion : req.body.Descripcion
        }
    }

    JugadasModel.save(jugada, (err) => {
        if(err){
            let locals = {
                title : 'Error al salvar el registro',
                description : 'Error de sintaxis SQL',
                error  : err
            }

            res.render('error', locals)
        }
        else{
            res.redirect('/jugadas')
        }
    })
}

JugadasController.delete = (req, res, next) => {
    let id = req.body.id

    JugadasModel.delete(id, (err) => {
        if(err){
            let locals = {
                title : 'Error al buscar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            res.redirect('/jugadas')
        }
    })
}

JugadasController.validar = (req, res, next) => {
    let data = {
        Jugada : req.body.Jugada
    }
    if(req.body.Id){
        data = {
            Id : req.body.Id,
            Jugada : req.body.Jugada
        }
    }

    JugadasModel.validar(data , (err, rows) => {
        if(err){
            let locals = {
                title : 'Error al validar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
             res.render('error', locals)
        }
        else{
            if(rows.length >= 1)    res.json({ ok : false })
            else    res.json({ ok : true })
        }
    })
}

JugadasController.puedoEliminar = (req, res, next) => {
    let id = req.body.id

    JugadasModel.puedoEliminar(id, (err, rows) => {
        if(err){
            let locals = {
                title : 'Error al buscar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            if(rows.length >= 1) res.json({ ok : false })
            else    res.json({ ok : true })
        }
    })
}

JugadasController.addForm = (req, res, next) => {
    res.render('jugadas/add-jugada', { title : 'Agregar Jugada' })
}

module.exports = JugadasController