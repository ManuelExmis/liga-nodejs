'use strict'

var conn = require('../liga-connection'),
    TemporadasModel = () => {}

TemporadasModel.getAll = (cb) => {
    conn.query('SELECT * FROM Temporadas', cb)
}

TemporadasModel.getOne = (id, cb) => {
    conn.query('SELECT * FROM Temporadas WHERE Id = ?', id, cb)
}

TemporadasModel.save = (data, cb) => {
    if(data.Id){
        conn.query('UPDATE Temporadas SET ? WHERE Id = ?', [data, data.Id], cb)
    }
    else{
        conn.query('SELECT * FROM Temporadas WHERE Inicia = ?', data.Inicia, (err, rows) => {
            if(err) cb(err)
            else if(rows.length >= 1){
                cb(new Error('La fecha de la temporada ya existe!'))
            }
            else{
                conn.query('INSERT INTO Temporadas SET ?', data, cb)
            }
        })
    }
}

TemporadasModel.delete = (id, cb) => {
    conn.query('DELETE FROM Temporadas WHERE Id = ?', id, cb)
}

TemporadasModel.validar = (data, cb) => {
    if(data.Id){
        conn.query('SELECT * FROM Temporadas WHERE Id != ? AND Inicia = ?', [data.Id, data.Inicia], cb)
    }
    else{
        conn.query('SELECT * FROM Temporadas WHERE Inicia = ?', data.Inicia, cb)
    }
}

TemporadasModel.puedoEliminar = (id, cb) => {
    conn.query('SELECT * FROM Temporadas as T WHERE T.Id = ? AND (T.Id IN (select Temporada from Partidos) OR T.Id IN (select Temporada from jug_equipo))', id, cb)
}

module.exports = TemporadasModel