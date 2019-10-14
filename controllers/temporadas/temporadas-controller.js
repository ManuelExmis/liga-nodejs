'use strict'

var TemporadasModel = require('./../../models/temporadas/temporadas-model'),
    TemporadasController = () => {}

TemporadasController.getAll = (req, res, next) => {
    TemporadasModel.getAll((err, rows) => {
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
                title : 'Lista de Temporadas',
                data : rows
            }

            res.render('temporadas/index', locals)
        }
    })
}

TemporadasController.getOne = (req, res, next) => {
    let id = req.body.id
    console.log('getOne ... '+id)

    TemporadasModel.getOne(id, (err, rows) => {
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
                title : 'Editar Equipo',
                data : rows
            }

            res.render('temporadas/edit-temporada', locals)
        }
    })
}

TemporadasController.save = (req, res, next) => {
    let temporada = {
        Inicia : req.body.Inicia,
        Finaliza : req.body.Finaliza
    }

    if(req.body.save !== 'new'){
        temporada = {
            Id : req.body.id,
            Inicia : req.body.Inicia,
            Finaliza : req.body.Finaliza
        }
    }
    console.log('save ....  '+temporada)
    TemporadasModel.save(temporada, (err) => {
        if(err){
            let locals = {
                title : 'Error al salvar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            if(err.message == 'La fecha de la temporada ya existe!'){
                locals = {
                    title : 'Error al salvar el registro',
                    description : 'La fecha de la temporada ya existe en otro registro!',
                    error : err
                }   
            }

            res.render('error', locals)
        }
        else{
            res.redirect('/temporadas')
        }
    })
}

TemporadasController.delete = (req, res, next) => {
    let id = req.body.id

    TemporadasModel.delete(id, (err, rows) => {
        if(err)
        {
            let locals = {
                title : 'Error al eliiminar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            res.render('error', locals)
        }
        else
        {
            console.log('delete ok')
            res.redirect('/temporadas')
        }
    })
}

TemporadasController.validar = (req, res, next) => {
    let data = {
        Inicia : req.body.Inicia
    }
    if(req.body.Id){
        data = {
            Id : req.body.Id,
            Inicia : req.body.Inicia
        }
    }
    console.log('Validar temporada : '+data.Inicia)

    TemporadasModel.validar(data, (err, rows) => {
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

TemporadasController.puedoEliminar = (req, res, next) => {
    let id = req.body.id

    TemporadasModel.puedoEliminar(id, (err, rows) => {
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
            console.log(rows.length)
            if(rows.length >= 1)    res.json({ ok : false})
            else    res.json({ ok : true})
        }
    })
}

TemporadasController.addForm = (req, res, next) => {
    res.render('temporadas/add-temporada', { title : 'Agregar Temporada'})
}

module.exports = TemporadasController