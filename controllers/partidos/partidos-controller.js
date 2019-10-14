'use strict'

var PartidosModel = require('./../../models/partidos/partidos-model'),
    PartidosController = () => {},
    timer = null,
    segundos = 0,
    minutos = 0,
    segundosR = 0,
    minutosR = 0,
    partido = 0,
    primerTiempo = true,
    timerDescanso = null,
    minutosDescanso = 0,
    segundosDescanso = 0

PartidosController.getAll = (req, res, next) => {
    // let temporada = req.body.temporada

    PartidosModel.getAll(14, (err, rows) => {
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
                title : 'Calendario',
                pathjs : '/js/partidos/index.js',
                data : rows
            }
            //console.log(rows)
            res.render('partidos/index', locals)
        }
    })
}

PartidosController.addSummoned = (req, res, next) => {
    let titulares = {},
        suplentes = {}
    
    titulares.local = JSON.parse( req.body.titularesLocal)
    titulares.visitante = JSON.parse( req.body.titularesVisitante)
    titulares.partido = req.body.partido
    suplentes.partido = req.body.partido
    suplentes.local = JSON.parse(req.body.suplentesLocal)
    suplentes.visitante = JSON.parse(req.body.suplentesVisitante)

    PartidosModel.addTitular(titulares, (err, rows) => {
        if(err){
            console.log(err)
            res.json({ result : false , error : err})
        }else{
            console.log(rows)
            PartidosModel.addSuplente(suplentes, (err, rows) => {
                if(err){
                    console.log(err)
                    res.json({ result : false , error : err})
                }else{
                    res.json({ result : true})
                }
            })
        }
    })
}

PartidosController.inicioPartido = (req, res, next) => {
    PartidosModel.inicioPartido(req.body.partido, (err, rows) => {
        if(err){
            let locals = {
                title : 'Error al consultar el sp en la base de datos',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        }
        else{
            let nfilas = rows[0][0].contador,
                inicioPartido = (nfilas == 0) ? false : true

            // console.log(rows)
            // console.log(rows[0][0].contador)
            res.json({ inicioPartido : inicioPartido })
        }
    })
}
PartidosController.init = (socket) => {
    let minut = 0
    console.log('---------------USUARIO CONECTADO---------------')

    function timerInterval(){
        if(primerTiempo) console.log('----> INICIANDO PARTIDO')
        else    console.log('----> INICIANDO SEGUNDO TIEMPO')
        
    
        timer = setInterval(function(){
            if(primerTiempo && minutos >= 45){
                if(segundosR>=59){
                    segundosR=0
                    minutosR++
                }else{
                    segundosR++
                }
            }
            else if(minutos >= 90){
                if(segundosR>=59){
                    segundosR=0
                    minutosR++
                }else{
                    segundosR++
                }
            }
            else if(segundos>=59){
                segundos=0
                minutos++
                minut = minutos
                console.log('minutos ',minutos)
            }
            else{
                segundos++
            }
    
            socket.emit('timer', { minutos : (minutos < 10) ? '0'+minutos : minutos, segundos : (segundos < 10) ? '0'+segundos : segundos, minutosR : (minutosR < 10) ? '0'+minutosR : minutosR, segundosR : (segundosR < 10) ? '0'+segundosR : segundosR })
        }, 1000)
    }

    socket.on('iniciar partido', timerInterval)

    socket.on('fin tiempo', (data) => {
        PartidosModel.finalizarPrimerTiempo({ partido:partido, minuto:minutos, tiempoR:minutosR }, (err, rows) => {
            if(err){
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
            }
            else{
                clearInterval(timer)
                minutosR=0
                segundosR=0
                primerTiempo=false
                timerDescanso = setInterval(() => {
                    if(segundosDescanso>=59){
                        minutosDescanso++
                        segundosDescanso=0
                    }
                    else    segundosDescanso++
                    if(minutosDescanso==15){
                        clearInterval(timerDescanso)
                        socket.emit('fin del descanso',{})
                    }
                    socket.emit('timerDescanso', {minutos : minutosDescanso, segundos : segundosDescanso})
                }, 1000);
                socket.emit('descanso', {})
            }
        })
    })

    socket.on('saveGame', (data) => {
        console.log('\nsaveGame\n')
        partido = parseInt(data.partido)
    })

        //-- GOL
    socket.on('gol', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaGol = new Promise( (resolve, reject) => {
            PartidosModel.setJugadaJugador(data, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        } )

        promesaGol
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise)=> {
                return new Promise( (resolve, reject) => {
                    PartidosModel.getGolesPartido(data.partido, (err, data) => {
                        return (err) ? reject(err) : resolve(data)
                    })
                } )
            } )
            .then( (dataGolesPartido) => {
                socket.emit('goles', dataGolesPartido)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar un gol \nStack : ' + err.stack})
            } )
    })
        //-- AUTOGOL
    socket.on('autogol', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaAutogol = new Promise( (resolve, reject) => {
            PartidosModel.setJugadaJugador(data, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        } )

        promesaAutogol
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise) => {
                data.jugada='Gol'
                data.equipo=data.otroEquipo

                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.getGolesPartido(data.partido, (err, data) => {
                        return (err) ? reject(err) : resolve(data)
                    })
                } )
            } )
            .then( (dataGolesPartido) => {
                socket.emit('goles', dataGolesPartido)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar un gol \nStack : ' + err.stack})
            } )
    })
        //-- TARJETA AMARILLA
    socket.on('tarjeta amarilla', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaTarjetaAmarilla = new Promise( (resolve, reject) => {
            PartidosModel.setJugadaJugador(data, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        } )

        promesaTarjetaAmarilla
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.countJugadaJugador(data, (err, rows) => {
                        return (err) ? reject(err) : resolve(rows)
                    })
                } )
            } )
            .then( (rows) => {
                if(rows[0].nJugadas >= 2){
                    data.jugada = 'tarjeta roja'
                    return new Promise( (resolve, reject) => {
                        PartidosModel.setJugadaJugador(data, (err) => {
                            return (err) ? reject(err) : resolve(true)
                        })
                    } )
                }else{
                    let datos = {
                        Minuto : data.Minuto,
                        MinutoR : data.MinutoR,
                        IdJugador : data.jugador,
                        tipoEquipo : data.tipoEquipo,
                        nombre : data.nombreJ
                    }

                    socket.emit('tarjeta amarilla', datos)
                }
            } )
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise) => {
                let datos = {
                    Minuto : data.Minuto,
                    MinutoR : data.MinutoR,
                    IdJugador : data.jugador,
                    tipoEquipo : data.tipoEquipo,
                    nombre : data.nombreJ
                }
                socket.emit('doble amarilla', datos)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar un gol \nStack : ' + err.stack})
            } )
    })
        //-- TARJETA ROJA
    socket.on('tarjeta roja', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaTarjetaRoja = new Promise((resolve, reject) =>{
            PartidosModel.setJugadaJugador(data, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        })

        promesaTarjetaRoja
            .then( (dataPromise) => {
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaEquipo(data, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                })
            } )
            .then( (dataPromise) => {
                let datos = {
                    Minuto : data.Minuto,
                    MinutoR : data.MinutoR,
                    IdJugador : data.jugador,
                    tipoEquipo : data.tipoEquipo,
                    nombre : data.nombreJ
                }
                socket.emit('tarjeta roja', datos)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar la tarjeta roja \nStack : ' + err.stack})
            } )
    })
    //-- FALTA
    socket.on('falta', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaFalta = new Promise((resolve, reject) =>{
            PartidosModel.setJugadaEquipo(data, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        })

        promesaFalta
            .then( (dataPromise) => {
                let datos = {
                    Minuto : data.Minuto
                }
                socket.emit('falta', datos)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar la falta \nStack : ' + err.stack})
            } )
    })
    //-- CAMBIO
    socket.on('cambio', (data) => {
        data.Minuto = minutos
        data.MinutoR = minutosR
        let promesaCambio = new Promise((resolve, reject) => {
            let datosJugadorEntra = {
                jugada : 'cambio jugador entra',
                jugador : data.jugadorEntra,
                Minuto : data.Minuto,
                MinutoR : data.MinutoR,
                partido : data.partido
            }
            PartidosModel.setJugadaJugador(datosJugadorEntra, (err) => {
                return (err) ? reject(err) : resolve(true)
            })
        })

        promesaCambio
            .then( (dataPromise) => {
                let datosJugadorSale = {
                    jugada : 'cambio jugador sale',
                    jugador : data.jugadorSale,
                    Minuto : data.Minuto,
                    MinutoR : data.MinutoR,
                    partido : data.partido
                } 
                return new Promise( (resolve, reject) => {
                    PartidosModel.setJugadaJugador(datosJugadorSale, (err) => {
                        return (err) ? reject(err) : resolve(true)
                    })
                } )
            } )
            .then( (dataPromise) => {
                socket.emit('cambio', data)
            } )
            .catch( (err) => {
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
                socket.emit('error', { message : 'ocurrio un error al ingresar el cambio \nStack : ' + err.stack})
            } )
    })
 
    socket.on('disconnect', () => {
        console.log('---------------USUARIO DESCONECTADO---------------'+minutos+' , '+ minut)
        
        PartidosModel.terminarPausar({ minuto : minut, partido : partido}, (err, rows) => {
            if(err){
                console.log('\nOCURRIO UN ERROR:')
                console.log(err)
            }
        })

        clearInterval(timer)
    })
}
        //-- OBTENER PLANTILLA PARA COMBOCAR JUGADORES
PartidosController.getTeams = (req, res, next) => {
    let idPartido = req.body.idPartido,
        idLocal = req.body.idLocal,
        idVisitante = req.body.idVisitante,
        idTemporada = req.body.idTemporada,
        locals = {
            title : 'Iniciar Partido',
            pathjs : '/js/partidos/iniciar.js',
            pathcss : '/css/partidos/iniciar.css',
            data : {}
        }
    let promesaGetTeams = new Promise( (resolve, reject) => {
        PartidosModel.getEquipo(idLocal, (err, rows) => {
            return (err) ? reject(err) : resolve(rows)
        })
    } )

    promesaGetTeams
        .then( (rows) => {
            locals.data.equipoL=rows
            
            return new Promise( (resolve, reject) => {
                PartidosModel.getEquipo(idVisitante, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.equipoV=rows
            let data = {
                idEquipo : idLocal,
                idTemporada : idTemporada
            }
            
            return new Promise( (resolve, reject) => {
                PartidosModel.getJugadores(data, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.jugadoresL=rows
            let data = {
                idEquipo : idVisitante,
                idTemporada : idTemporada
            }
            
            return new Promise( (resolve, reject) => {
                PartidosModel.getJugadores(data, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.jugadoresV=rows
            
            return new Promise( (resolve, reject) => {
                PartidosModel.getTemporada(idTemporada, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.temporada=rows

            return new Promise( (resolve, reject) => {
                PartidosModel.getOne(idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.partido=rows
            locals.data.continuar = false
            res.render('partidos/add-partido', locals)
        } )
        .catch( (err) => {
            let locals = {
                title : 'Error al consultar la base de datos',
                description : 'Error de sintaxis SQL',
                error : err
            }

            res.render('error', locals)
        } )
}
        //-- OBTENER JUGADORES CONVOCADOS
PartidosController.continuar = (req, res, next) => {
    let idPartido = req.body.idPartido,
        idLocal = req.body.idLocal,
        idVisitante = req.body.idVisitante,
        idTemporada = req.body.idTemporada,
        locals = {
            title : 'Continuar Partido',
            pathjs : '/js/partidos/iniciar.js',
            pathcss : '/css/partidos/iniciar.css',
            data : {}
        }
    let promesaContinuar = new Promise( (resolve, reject) => {
        PartidosModel.getEquipo(idLocal, (err, rows) => {
            return (err) ? reject(err) : resolve(rows)
        })
    } )

    promesaContinuar
        .then( (rows) => {
            locals.data.equipoL=rows

            return new Promise( (resolve, reject) => {
                PartidosModel.getEquipo(idVisitante, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.equipoV=rows

            return new Promise( (resolve, reject) => {
                PartidosModel.getTemporada(idTemporada, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.temporada=rows

            return new Promise( (resolve, reject) => {
                PartidosModel.getOne(idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            locals.data.partido=rows

            return new Promise( (resolve, reject) => {
                PartidosModel.getTitulares({ partido:idPartido, temporada:idTemporada }, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            let local = locals.data.partido[0].Local,
                titularesLocal = [],
                titularesVisit = []
            
            rows[0].forEach(element => {
                if(element.equipo == local){
                    titularesLocal.push(element)
                }else{
                    titularesVisit.push(element)
                }
            })
            locals.data.titularesLocal = titularesLocal
            locals.data.titularesVisit = titularesVisit

            return new Promise( (resolve, reject) => {
                PartidosModel.getSuplentes({ partido:idPartido, temporada:idTemporada}, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            let local = locals.data.partido[0].Local,
                suplentesLocal = [],
                suplentesVisit = []

            rows[0].forEach(element => {
                if(element.equipo == local){
                    suplentesLocal.push(element)
                }else{
                    suplentesVisit.push(element)
                }
            })
            locals.data.suplentesLocal = suplentesLocal
            locals.data.suplentesVisit = suplentesVisit
            locals.data.continuar = true

            return new Promise( (resolve, reject) => {
                PartidosModel.getTarjetasAmarillas( idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                } )
            } )
        } )
        .then( (rows) => {
            let nuevoArray = []
            rows[0].forEach((item) => {
                let nelementos
                if(nuevoArray.length>0){
                    nelementos = nuevoArray.filter((element) => {
                        // console.log('elemento.jugador '+element.jugador+'  == '+item.jugador+'  item.jugador')
                        return (element.jugador == item.jugador)
                    }).length 
                }
                
                if( !(nelementos > 0) ){
                    let ntarjetas=rows[0].filter((x) => {
                            return x.jugador == item.jugador
                        })
                    nuevoArray.push(ntarjetas[0])
                    if(ntarjetas.length > 1)   nuevoArray.push(ntarjetas[1])
                }
            })

            let local = locals.data.partido[0].Local,
                amarillasLocal = [],
                amarillasVisit = []

            nuevoArray.forEach(element => {
                if(element.equipo == local){
                    amarillasLocal.push(element)
                }else{
                    amarillasVisit.push(element)
                }
            })
            locals.data.amarillasLocal = amarillasLocal
            locals.data.amarillasVisit = amarillasVisit

            return new Promise( (resolve, reject) => {
                PartidosModel.getTarjetasRojas( idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                } )
            } )
        } )
        .then( (rows) => {
            let nuevoArray = []
            rows[0].forEach((item) => {
                let nelementos
                if(nuevoArray.length>0){
                    nelementos = nuevoArray.filter((element) => {
                        // console.log('elemento.jugador '+element.jugador+'  == '+item.jugador+'  item.jugador')
                        return (element.jugador == item.jugador)
                    }).length 
                }
                
                if( !(nelementos > 0) ){
                    let ntarjetas=rows[0].filter((x) => {
                            return x.jugador == item.jugador
                        })
                    nuevoArray.push(ntarjetas[0])
                    if(ntarjetas.length > 1)   nuevoArray.push(ntarjetas[1])
                }
            })

            let local = locals.data.partido[0].Local,
                rojasLocal = [],
                rojasVisit = []

            nuevoArray.forEach(element => {
                if(element.equipo == local){
                    rojasLocal.push(element)
                }else{
                    rojasVisit.push(element)
                }
            })
            locals.data.rojasLocal = rojasLocal
            locals.data.rojasVisit = rojasVisit

            locals.data.titularesLocal.forEach((titular, index) => {
                locals.data.rojasLocal.forEach((expulsado) => {
                    if(titular.jugador == expulsado.jugador){
                        locals.data.titularesLocal[index].expulsado = true
                    }
                })
            })
            locals.data.titularesVisit.forEach((titular, index) => {
                locals.data.rojasVisit.forEach((expulsado) => {
                    if(titular.jugador == expulsado.jugador){
                        locals.data.titularesVisit[index].expulsado = true
                    }
                })
            })

            return new Promise( (resolve, reject) => {
                PartidosModel.getCambioSale(idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            let local = locals.data.partido[0].Local,
                cambioSaleLocal = [],
                cambioSaleVisit = []

            rows[0].forEach((element) => {
                if(element.equipo == local){
                    cambioSaleLocal.push(element)
                }else{
                    cambioSaleVisit.push(element)
                }
            })
            locals.data.titularesLocal.forEach((titular, index) => {
                cambioSaleLocal.forEach((jugadorSale) => {
                    if(jugadorSale.jugador == titular.jugador){
                        locals.data.titularesLocal.splice(index, 1)
                    }
                })
            } )
            locals.data.titularesVisit.forEach((titular, index) => {
                cambioSaleVisit.forEach((jugadorSale) => {
                    if(jugadorSale.jugador == titular.jugador){
                        locals.data.titularesVisit.splice(index, 1)
                    }
                })
            } )
            cambioSaleLocal.forEach((jugador) => {
                jugador.cambioSale = true
                locals.data.suplentesLocal.push(jugador)
            })
            cambioSaleVisit.forEach((jugador) => {
                jugador.cambioSale = true
                locals.data.suplentesVisit.push(jugador)
            })

            return new Promise( (resolve, reject) => {
                PartidosModel.getCambioEntra(idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            let local = locals.data.partido[0].Local,
                cambioEntraLocal = [],
                cambioEntraVisit = []

            rows[0].forEach((element) => {
                if(element.equipo == local){
                    locals.data.titularesLocal.push(element)
                }else{
                    locals.data.titularesVisit.push(element)
                }
            })
            locals.data.suplentesLocal.forEach((suplente, index) => {
                rows[0].forEach((cambioEntra) => {
                    if(suplente.equipo == cambioEntra.equipo && suplente.jugador == cambioEntra.jugador){
                        locals.data.suplentesLocal.splice(index,1)
                    }
                })
            })
            locals.data.suplentesVisit.forEach((suplente, index) => {
                rows[0].forEach((cambioEntra) => {
                    if(suplente.equipo == cambioEntra.equipo && suplente.jugador == cambioEntra.jugador){
                        locals.data.suplentesVisit.splice(index,1)
                    }
                })
            })

            return new Promise( (resolve, reject) => {
                PartidosModel.getPausaPartido(idPartido, (err, rows) => {
                    return (err) ? reject(err) : resolve(rows)
                })
            } )
        } )
        .then( (rows) => {
            segundos = segundosR = 0
            minutos = minutosR = rows[0][0].Minuto
            locals.data.minutos = (minutos < 10) ? '0'+minutos : minutos
            locals.data.segundos = (segundos < 10) ? '0'+segundos : segundos
            console.log(rows[0])
            res.render('partidos/add-partido', locals)
        } )
        .catch( (err) => {
            let locals = {
                title : 'Error al consultar la base de datos jjj',
                description : 'Error de sintaxis SQL',
                error : err
            }           

            res.render('error', locals)
        } )
}

module.exports = PartidosController
module.exports.init = PartidosController.init