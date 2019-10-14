'use strict'

var conn = require('../liga-connection'),
    JugadoresModel = () => {}

JugadoresModel.getAll = (cb) => {
    conn.query(`select J.*,JE.Equipo as IdEquipo,JE.Temporada as IdTemporada,E.Nombre as Equipo,T.Inicia,T.Finaliza,JE.Tiempo 
                    from Jugadores J inner join Jug_equipo JE on J.Id = JE.Jugador 
                    inner join Equipos E on E.Id = JE.Equipo 
                    inner join Temporadas T on T.Id = JE.Temporada`, cb)
}

JugadoresModel.getOne = (datos, cb) => {
    conn.query(`select J.*,JE.Equipo as IdEquipo,JE.Temporada as IdTemporada,E.Nombre as Equipo,T.Inicia,T.Finaliza,JE.Tiempo 
                    from Jugadores J inner join Jug_equipo JE on J.Id = JE.Jugador 
                    inner join Equipos E on E.Id = JE.Equipo 
                    inner join Temporadas T on T.Id = JE.Temporada
                    WHERE J.Id = ? AND JE.Temporada = ? AND JE.Equipo = ?`, [datos.Id, datos.IdTemporada, datos.IdEquipo], cb)
}

JugadoresModel.save = (datos, cb) => {
    if(datos.Jugador.Id){
        conn.query('UPDATE Jugadores SET ? WHERE Id = ?', [datos.Jugador, datos.Jugador.Id], (err) => {
            if(err) cb(err)
            else{
                let jug_equipo = {
                    Temporada : datos.Temporada,
                    Equipo : datos.Equipo,
                    Jugador : datos.Jugador.Id,
                    Tiempo : datos.Tiempo
                }

                conn.query('UPDATE Jug_Equipo SET ? WHERE Temporada = ? AND Equipo = ? AND Jugador = ?', [jug_equipo, datos.OldTemporada, datos.OldEquipo, datos.Jugador.Id], cb)
            }
        })
    }
    else{
        conn.query('INSERT INTO Jugadores SET ?', datos.Jugador, (err) => {
            if(err) cb(err)
            else{
                conn.query('SELECT Id FROM Jugadores ORDER BY Id DESC LIMIT 1', (err, rows) => {
                    if(err) cb(err)
                    else{
                        let jug_equipo = {
                            Temporada : datos.Temporada,
                            Equipo : datos.Equipo,
                            Jugador : rows[0].Id,
                            Tiempo : datos.Tiempo
                        }

                        conn.query('INSERT INTO Jug_Equipo SET ?', jug_equipo, cb)
                    }
                })
            }
        })        
    }
}

JugadoresModel.delete = (id, cb) => {
    conn.query('DELETE FROM Jug_Equipo WHERE Jugador = ?', id, (err) => {
        if(err) cb(err)
        else{
            conn.query('DELETE FROM Jugadores WHERE Id = ?', id, cb)
        }
    })
}

JugadoresModel.puedoEliminar = (id, cb) => {
    conn.query('SELECT * FROM Est_Jugador WHERE Jugador = ?', id, cb)
}

JugadoresModel.getTemporadas = (cb) => {
    conn.query('SELECT * FROM Temporadas', cb)
}

JugadoresModel.getEquipos = (cb) => {
    conn.query('SELECT Id, Nombre FROM Equipos', cb)
}

module.exports = JugadoresModel