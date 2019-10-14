'use strict'

var EquiposModel = require('./../../models/equipos/equipos-model'),
    EquiposController = () => {}

EquiposController.getAll = (req, res, next) => {
    EquiposModel.getAll((err, rows) => {
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
                title : 'Lista de Equipos',
                data : rows
            }
            //console.log(rows)
            res.render('equipos/index', locals)
        }
    })
}

EquiposController.getOne = (req, res, next) => {
    let id = req.body.id
    console.log('getOne ... '+id)

    EquiposModel.getOne(id, (err, rows) => {
        if(err)
        {
            let locals = {
                title : `Error al buscar el registro`,
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else
        {
            console.log('getOne rows ... '+rows)
            let locals = {
                title : 'Editar Equipo',
                data : rows
            }

            res.render('equipos/edit-equipo', locals)
        }
    })
}

EquiposController.save = (req, res, next) => {
    let equipo = {
        Nombre : req.body.nombre,
        Iniciales : req.body.iniciales,
        Lugar : req.body.lugar,
        Logo : req.body.logo
    }

    if(req.body.save !== 'new'){
        equipo.Id = req.body.id
    }

    console.log('save equipo ... ' + equipo)
    EquiposModel.save(equipo, (err) => {
        if(err){
            let locals = {
                title : 'Error al salvar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }
            console.log('save err ... ' + locals)
            res.render('error', locals)
        }    
        else{
            console.log('todo OK jose luis jjj')
            res.redirect('/equipos')
        }
    })
}

EquiposController.delete = (req, res, next) => {
    let id = req.body.id
    console.log('id = '+ id)

    EquiposModel.delete(id, (err, rows) => {
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
            res.redirect('/equipos')
        }
    })
}

EquiposController.validar = (req, res, next) => {
    let data = {
        Nombre : req.body.nombre
    }
    if(req.body.id){
        data = {
            Id : req.body.id,
            Nombre : req.body.nombre
        }
    }

    console.log('validar equipo : '+ data.Nombre)

    EquiposModel.validar(data, (err, rows) => {
        if(err){
            let locals = {
                title : 'Error al consultar el registro',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            console.log(rows.length)
            if(rows.length >= 1)    res.json({ ok : false})
            else    res.json({ ok : true })
        }
    })
}

EquiposController.puedoEliminar = (req, res, next) => {
    let id = req.body.id

    EquiposModel.puedoEliminar(id, (err, rows) => {
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

EquiposController.addForm = (req, res, next) => {
    res.render('equipos/add-equipo', { title : 'Agregar Equipo'})
}

module.exports = EquiposController