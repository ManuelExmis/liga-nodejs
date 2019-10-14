'use strict'

var conn = require('../liga-connection'),
    JugadasModel = () => {}

JugadasModel.getAll = (cb) => {
    conn.query('SELECT * FROM Jugadas', cb)
}

JugadasModel.getOne = (id, cb) => {
    conn.query('SELECT * FROM Jugadas WHERE Id = ?', id, cb)
}

JugadasModel.save = (data, cb) => {
    if(data.Id){
        conn.query('UPDATE Jugadas SET ? WHERE Id = ?', [data, data.Id], cb)
    }
    else{
        conn.query('INSERT INTO Jugadas SET ?', data, cb)
    }
}

JugadasModel.validar = (data, cb) => {
    if(data.Id){
        conn.query('SELECT * FROM Jugadas WHERE Id != ? AND Jugada = ?', [data.Id, data.Jugada], cb)
    }
    else{
        conn.query('SELECT * FROM Jugadas WHERE Jugada = ?', data.Jugada, cb)
    }
}

JugadasModel.delete = (id, cb) => {
    conn.query('DELETE FROM Jugadas WHERE Id = ?', id, cb)
}

JugadasModel.puedoEliminar = (id, cb) => {
    conn.query('SELECT * FROM Jugadas WHERE Jugadas.Id = ? AND (Jugadas.Id IN (select jugada from est_jugador) OR Jugadas.Id IN (select jugada from est_equipo))', id, cb)
}

module.exports = JugadasModel