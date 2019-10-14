'use strict'

var conn = require('../liga-connection'),
    EquiposModel = () => {}

EquiposModel.getAll = (cb) => {
    conn.query('SELECT * FROM Equipos', cb)
}

EquiposModel.getOne = (id, cb) => {
    conn.query('SELECT * FROM Equipos WHERE Id = ?', id, cb)
}

EquiposModel.save = (data, cb) => {
    if(data.Id){
        conn.query('UPDATE Equipos SET ? WHERE Id = ?', [data, data.Id], cb)
    }
    else{
        conn.query('INSERT INTO Equipos SET ?', data, cb)
    }
}

EquiposModel.delete = (id, cb) => {
    conn.query('DELETE FROM Equipos WHERE Id = ?', id, cb)
}

EquiposModel.validar = (data, cb) => {
    if(data.Id){
        conn.query('SELECT * FROM Equipos WHERE Id != ? AND Nombre = ?', [data.Id, data.Nombre], cb)
    }
    else{
        conn.query('SELECT * FROM Equipos WHERE Nombre = ?', data.Nombre, cb)
    }
}

EquiposModel.puedoEliminar = (id, cb) => {
    conn.query('SELECT * FROM Equipos WHERE equipos.Id = ? AND (equipos.Id IN (select equipo from est_equipo) OR equipos.Id IN (select equipo from jug_equipo))', id, cb)
}

module.exports = EquiposModel