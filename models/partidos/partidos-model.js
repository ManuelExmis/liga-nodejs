'use strict'

var conn = require('../liga-connection'),
    PartidosModel = () => {}

PartidosModel.getOne = (id, cb) => {
    conn.query('SELECT * FROM Partidos WHERE Id = ?', id, cb)
}

PartidosModel.getAll = (temporada, cb) => {
    conn.query(`SELECT p.* ,t.Inicia,t.Finaliza,(select Nombre from Equipos where Id = p.Local) AS ELocal,(select Nombre from Equipos where Id = p.Visitante) AS EVisitante 
	FROM partidos p INNER JOIN temporadas t ON p.Temporada = t.Id WHERE p.Temporada = ?`, temporada, cb)
}

PartidosModel.getEquipo = (id, cb) => {
    conn.query('SELECT * FROM Equipos WHERE Id = ?', id, cb)
}

PartidosModel.getJugadores = (data, cb) => {
    conn.query(`SELECT j.* FROM Jugadores j INNER JOIN Jug_Equipo je ON j.Id=je.Jugador 
                WHERE je.Equipo = ? AND je.Temporada = ?`,[data.idEquipo, data.idTemporada], cb)
}

PartidosModel.getTemporada = (id, cb) => {
    conn.query('SELECT * FROM Temporadas WHERE Id = ?', id, cb)
}

PartidosModel.inicioPartido = (partido, cb) => {
    conn.query('call InicioPartido(?)', partido, cb)
}

PartidosModel.getTitulares = (data, cb) => {
    conn.query('call GetTitulares(?,?)', [data.partido, data.temporada], cb)
}

PartidosModel.getSuplentes = (data, cb) => {
    conn.query('call GetSuplentes(?,?)', [data.partido, data.temporada], cb)
}

PartidosModel.getTarjetasAmarillas = (partido, cb) => {
    conn.query('call GetTarjetasAmarillas(?)', partido, cb)
}

PartidosModel.getTarjetasRojas = (partido, cb) => {
    conn.query('call GetTarjetasRojas(?)', partido, cb)
}

PartidosModel.getCambioSale = (partido, cb) => {
    conn.query('call GetCambioSale(?)', partido, cb)
}

PartidosModel.getCambioEntra = (partido, cb) => {
    conn.query('call GetCambioEntra(?)', partido, cb)
}

PartidosModel.finalizarPrimerTiempo = (data, cb) =>  {
    conn.query('call FinalizarPt(?,?,?)',[data.partido, data.minuto, data.tiempoR], cb)
}

PartidosModel.getPausaPartido = (partido, cb) => {
    conn.query('call GetPausaPartido(?)', partido, cb)
}

PartidosModel.terminarPausar = (data, cb) => {
    conn.query("select Id from jugadas where Jugada like 'terminar partido'", (err, rows) => {
        if(err) cb(err)
        else{
            let jugada = rows[0].Id
            conn.query('select * from Est_Equipo where Partido = ? and Jugada = ?', [data.partido, jugada], (err, rows) => {
                if(err) cb(err)
                else{console.log(data)
                    if(!rows.lenght > 0){//pausar el partido
                        conn.query('call PausarPartido(?,?)', [data.partido, data.minuto], cb)
                        console.log('\npausar\n')
                    }else{



                        //informar sobre el final del partido
                        console.log(rows)
                        console.log('\nterminar\n')
                    }
                }
            })
        }
    })
}

PartidosModel.addTitular = (data, cb) => {
    let Rows
    data.local.forEach(element => {
        conn.query('call AgregarTitular(?, ?)', [element, data.partido], (err, rows) => {
            if(err) cb(err)
            else Rows+=rows
        })
    })
    data.visitante.forEach(element => {
        conn.query('call AgregarTitular(?, ?)', [element, data.partido], (err, rows) => {
            if(err) cb(err)
            else Rows+=rows
        })
    })
    let rows = Rows
    cb(rows)
}

PartidosModel.addSuplente = (data, cb) => {
    let Rows
    data.local.forEach(element => {
        conn.query('call AgregarSuplente(?, ?)', [element, data.partido], (err, rows) => {
            if(err) cb(err)
            else Rows+=rows
        })
    })
    data.visitante.forEach(element => {
        conn.query('call AgregarSuplente(?, ?)', [element, data.partido], (err, rows) => {
            if(err) cb(err)
            else Rows+=rows
        })
    })
    let rows=Rows
    cb(rows)
}

PartidosModel.setJugadaJugador = (data, cb) => {
    conn.query('SELECT Id FROM jugadas WHERE jugada = ? LIMIT 1', data.jugada, (err, rows) =>{
        if(err) cb(err)
        else{
            let Est_Jugador = {
                Jugador : parseInt(data.jugador),
                Jugada : rows[0].Id,
                Minuto : data.Minuto,
                Partido : parseInt(data.partido),
                TReposicion : parseInt(data.MinutoR)
            }
            // console.log(Est_Jugador)
            if(data.jugada == 'autoGol'){
                conn.query("SELECT Id FROM jugadas WHERE jugada = 'gol en contra' LIMIT 1", (err, rows) =>{
                    if(err) cb(err)
                    else{
                        conn.query('INSERT INTO Est_Jugador SET ?', Est_Jugador, (err) =>{
                            if(err) cb(err)
                            else{
                                Est_Jugador.Jugada=rows[0].Id
                                conn.query('INSERT INTO Est_Jugador SET ?', Est_Jugador, cb)
                            }
                        })
                    }
                }) 
            }else{
                conn.query('INSERT INTO Est_Jugador SET ?', Est_Jugador, cb)
            }
        }
    })
}

PartidosModel.setJugadaEquipo = (data, cb) => {
    if(data.jugada == 'autoGol')    data.jugada='gol en contra'
    conn.query('SELECT Id FROM jugadas WHERE jugada = ? LIMIT 1', data.jugada, (err, rows) =>{
        if(err) cb(err)
        else{
            let Est_Equipo = {
                Equipo : parseInt(data.equipo),
                Jugada : rows[0].Id,
                Minuto : data.Minuto,
                Partido : parseInt(data.partido),
                TReposicion : 0
            }

            conn.query('INSERT INTO Est_Equipo SET ?', Est_Equipo, cb)
        }
    })
}

PartidosModel.getGolesPartido = (partido, cb) => {
    conn.query('SELECT * FROM Partidos WHERE Id = ?', partido, (err, rows) => {
        if(err) cb(err)
        else{
            let local = rows[0].Local,
                visitante = rows[0].Visitante,
                golesLocal = 0,
                IdGol = 0,
                golesVisitante = 0

            conn.query("SELECT Id FROM jugadas WHERE jugada = 'gol' LIMIT 1", (err, rows) => {
                if(err) console.log('error al buscar jugado gol')
                else{
                    IdGol=rows[0].Id

                    conn.query('SELECT count(*) AS goles FROM Est_Equipo WHERE Equipo = ? AND Jugada = ? AND Partido = ?', [local, IdGol, partido], (err, rows) =>{
                        if(err) cb(err)
                        else{
                            golesLocal = rows[0].goles
                            
                            conn.query('SELECT count(*) AS goles FROM Est_Equipo WHERE Equipo = ? AND Jugada = ? AND Partido = ?', [visitante, IdGol, partido], (err, rows) =>{
                                if(err) cb(err)
                                else{                            
                                    golesVisitante = rows[0].goles
                                    cb(err, { golesLocal : golesLocal, golesVisitante : golesVisitante})
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

PartidosModel.countJugadaJugador = (data, cb) => {
    conn.query('SELECT Id FROM jugadas WHERE jugada = ? LIMIT 1', data.jugada, (err, rows) => {
        if(err) cb(err)
        else{
            let jugada = parseInt(rows[0].Id)
            console.log('jugada '+jugada)
            conn.query('SELECT COUNT(*) AS nJugadas FROM Est_Jugador WHERE Jugador = ? AND Jugada = ? AND Partido = ?', [data.jugador, jugada, data.partido], cb)
        }
    })
}

module.exports = PartidosModel