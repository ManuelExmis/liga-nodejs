'use strict'

// import { parse } from "url";

var socket = io()
socket.emit('saveGame', { partido : $('#resultado').parent().attr('idPartido'), })
//SELECCIONAR LOCAL O VISITANTE
$('#tabs-conf').change(function(){
    let valor = $('#tabs-conf').val()
    if(valor == 'local'){
        $('#local-players').removeClass('hide')
        $('#visit-players').addClass('hide')
    }
    else{
        $('#local-players').addClass('hide')
        $('#visit-players').removeClass('hide')
    }
})
//SELECCIONAR JUGADOR COMO TITULAR
$('.titular-option').click(function(){
    let equipo=$('#tabs-conf').val(),
        jugador = $(this).siblings().last().text(),
        idj = $(this).parent().attr('idj'),
        listaTitulares = $(this).parent().parent().siblings('div.players-selected').first().children('ol.titulares-conf').first(),
        li = '<li idj="'+idj+'" class="py-2 my-2 bg-success">'+
                '<div onClick="quitarJugador(this)" class="px-3 mx-1 d-inline btn btn-danger btn-sm font-weight-bold">x</div>'+
                '<div class="px-3 mx-1 d-inline text-white text-uppercase font-weight-bold">'+jugador+'</div>'+
            '</li>'
    
    if(listaTitulares.find('li').length < 11){
        listaTitulares.append(li)
        $(this).parent().hide()
    }else{
        $('#closeAlert').next().text('Usted ya selecciono 11 jugadores títulares, si desea agregar otro primero elimine uno de la lista de titulares!')
        $('#alertMessage').show()
    }
})
//SELECCIONAR JUGADOR COMO SUPLENTE
$('.bench-option').click(function(){
    let equipo=$('#tabs-conf').val(),
        jugador = $(this).siblings().last().text(),
        idj = $(this).parent().attr('idj'),
        listaSuplentes = $(this).parent().parent().siblings('div.players-selected').first().children('ol.bench-conf').first(),
        li = '<li idj="'+idj+'" class="py-2 my-2 bg-warning">'+
                '<div onClick="quitarJugador(this)" class="px-3 mx-1 d-inline btn btn-danger btn-sm font-weight-bold">x</div>'+
                '<div class="px-3 mx-1 d-inline text-dark text-uppercase font-weight-bold">'+jugador+'</div>'+
            '</li>'
    if(listaSuplentes.find('li').length < 7){
        listaSuplentes.append(li)
        $(this).parent().hide()
    }else{
        $('#closeAlert').next().text('Usted ya selecciono 7 jugadores suplentes, si desea agregar otro primero elimine uno de la lista de suplentes!')
        $('#alertMessage').show()
    }
})

$('#closeAlert').click(function(){
    $('#alertMessage').hide()
})

function quitarJugador(btn){
    let estadoEquipo = ( ($('#tabs-conf').val()) == 'local' ? '#local-players' : '#visit-players'),
        idj = btn.parentNode.getAttribute('idj')

    $(estadoEquipo+' .teams-players li[idj="'+idj+'"]').show()
    btn.parentNode.remove()
}
//MOSTRAR O OCULTAR JUGADORES DE LOCAL Y VISITANTES
$('#tabs-game ul li .nav-link').click(function(){
    $(this).parent().siblings().children('a').removeClass('active')
    $(this).addClass('active')
})

$('#link-local').click(function(){
    $('#local-team').show()
    $('#visit-team').hide()
})

$('#link-visit').click(function(){
    $('#local-team').hide()
    $('#visit-team').show()
})

$('#configurar').click(function(){
    let titularesLocal = $('#local-players .players-selected .titulares-conf').find('li'),
        titularesVisitante = $('#visit-players .players-selected .titulares-conf').find('li'),
        suplentesLocal = $('#local-players .players-selected .bench-conf').find('li'),
        suplentesVisitante = $('#visit-players .players-selected .bench-conf').find('li'),
        localTeamTitulares = $('#local-team .local-tit-players'),
        visitTeamTitulares = $('#visit-team .visit-tit-players'),
        localTeamSuplentes = $('#local-team .local-ben-players'),
        visitTeamSuplentes = $('#visit-team .visit-ben-players')
    
    if(titularesLocal.length < 9){
        $('#closeAlert').next().text('El equipo local tiene que tener como minimo 9 jugadores títulares!')
        $('#alertMessage').show()
    }
    else if(titularesVisitante.length < 9){
        $('#closeAlert').next().text('El equipo visitante tiene que tener como minimo 9 jugadores títulares!')
        $('#alertMessage').show()
    }
    else{
        let arrayTitLocal = [],
            arrayTitVisit = [],
            arrayBenLocal = [],
            arrayBenVisit = [],
            datos = {}

        datos.partido = $('#resultado').parent().attr('idPartido')
        titularesLocal.each(function(){
            arrayTitLocal.push($(this).attr('idj'))
        })
        suplentesLocal.each(function(){
            arrayBenLocal.push($(this).attr('idj'))
        })
        titularesVisitante.each(function(){
            arrayTitVisit.push($(this).attr('idj'))
        })
        suplentesVisitante.each(function(){
            arrayBenVisit.push($(this).attr('idj'))
        })
        datos.titularesLocal=JSON.stringify(arrayTitLocal)
        datos.titularesVisitante=JSON.stringify(arrayTitVisit)
        datos.suplentesLocal=JSON.stringify(arrayBenLocal)
        datos.suplentesVisitante=JSON.stringify(arrayBenVisit)
        console.log(datos)

        $.post('/partidos/agregarConvocados', datos, function(data){
            if(!data.result){
                console.log(data.error)
                alert('Ocurrio un error al ingresar los titulares a la bd')
            }
            else{
                titularesLocal.each(function(){
                    let idJ = $(this).attr('idj'),
                        nombreJ = $(this).find('div').last().text(),
                        li = '<li idj="'+idJ+'" class="bg-secondary my-2 py-2">'+
                                '<label class="pl-2 float-left text-uppercase font-weight-bold">'+nombreJ+'</label>'+
                                '<ul class="player-actions d-inline float-right">'+
                                    '<li class="d-inline mx-1 btn btn-success btn-sm gol">G</li>'+
                                    '<li class="d-inline mx-1 btn btn-dark btn-sm text-white autoGol">A</li>'+
                                    '<li class="d-inline mx-1 btn btn-warning btn-sm tarjetaA">TA</li>'+
                                    '<li class="d-inline mx-1 btn btn-danger btn-sm tarjetaR">TR</li>'+
                                    '<li class="d-inline mx-1 btn btn-primary btn-sm falta">F</li>'+
                                '</ul>'+
                                '</li>'
                    
                    localTeamTitulares.append(li)
                })
        
                suplentesLocal.each(function(){
                    let idJ = $(this).attr('idj'),
                        nombreJ = $(this).find('div').last().text(),
                        li = '<li idj="'+idJ+'" class="bg-primary my-2 py-2">'+
                                '<label class="pl-2 float-left text-uppercase text-white font-weight-bold">'+nombreJ+'</label>'+
                                '<div class="d-inline float-right mx-1 btn btn-success cambio" data-toggle="modal" data-target="#modalCambios">C</div>'
                                '</li>'
        
                    localTeamSuplentes.append(li)
                })
        
                titularesVisitante.each(function(){
                    let idJ = $(this).attr('idj'),
                        nombreJ = $(this).find('div').last().text(),
                        li = '<li idj="'+idJ+'" class="bg-secondary my-2 py-2">'+
                                '<label class="pl-2 float-left text-uppercase font-weight-bold">'+nombreJ+'</label>'+
                                '<ul class="player-actions d-inline float-right">'+
                                    '<li class="d-inline mx-1 btn btn-success btn-sm gol">G</li>'+
                                    '<li class="d-inline mx-1 btn btn-dark btn-sm text-white autoGol">A</li>'+
                                    '<li class="d-inline mx-1 btn btn-warning btn-sm tarjetaA">TA</li>'+
                                    '<li class="d-inline mx-1 btn btn-danger btn-sm tarjetaR">TR</li>'+
                                    '<li class="d-inline mx-1 btn btn-primary btn-sm falta">F</li>'+
                                '</ul>'+
                            '</li>'
                    
                    visitTeamTitulares.append(li)
                })
        
                suplentesVisitante.each(function(){
                    let idJ = $(this).attr('idj'),
                        nombreJ = $(this).find('div').last().text(),
                        li = '<li idj="'+idJ+'" class="bg-primary my-2 py-2">'+
                                '<label class="pl-2 float-left text-uppercase text-white font-weight-bold">'+nombreJ+'</label>'+
                                '<div class="d-inline float-right mx-1 btn btn-success cambio" data-toggle="modal" data-target="#modalCambios">C</div>'
                                '</li>'
        
                    visitTeamSuplentes.append(li)
                })
        
                $('#teams-config').hide()
                $('#game,#jugadas').show()
            }
        })
    }
})

$('.local-ben-players,.visit-ben-players').on('click', '.cambio', function(){
    let jugadoresJugando = $(this).parent().parent().siblings('ul').children('li'),
        equipo = $(this).parent().parent().parent().attr('idE'),
        esvisitante = $(this).parent().parent().hasClass('visit-ben-players'),
        jugadores='<form id="formulario" name="formulario" idE="'+ equipo +'" isvisit="'+ esvisitante +'">',
        jugadorEntra=$(this).parent().attr('idj')

    jugadoresJugando.each(function(index, elemento){
        let tachado = $(elemento).children('label').hasClass('tachado')
        if(!tachado){
            jugadores += '<input type="radio" name="jugadorJugando" value="'+ $(elemento).attr('idJ') +'" required>' +$(elemento).find('label').text() +'<br>'  
        }
    })
    jugadores+='</form>'
    $('#btnOkCambiar').attr('idjEntra', jugadorEntra)
    $('#btnOkCambiar').attr('form', 'formulario')
    $('#modalCambios div div .modal-body p').html(jugadores)
})

//-- CAMBIO
$('#btnOkCambiar').click(function(){
    let valor = $(this).parent().siblings('.modal-body').find('input:radio[name="jugadorJugando"]:checked').val(),
        inputs = document.getElementById('formulario'),
        partido = $('#resultado').parent().attr('idPartido'),
        equipo = $('#formulario').attr('idE'),
        isvisit = $('#formulario').attr('isvisit')

    if(inputs.checkValidity()){
        let data = {
            jugadorEntra : $(this).attr('idjEntra'),
            jugadorSale : valor,
            partido : partido,
            equipo : equipo,
            isvisit : isvisit
        }
        socket.emit('cambio', data)
    }else{
        console.log('no es valido')
    }
})
socket.on('cambio', function(data){
    let isvisit = (data.isvisit === 'true'),
        divEquipo = (isvisit) ? '#visit-team' : '#local-team',
        jugadorSale = $(divEquipo).find('ul').first().find('li[idj="'+data.jugadorSale+'"]'),
        jugadorEntra = $(divEquipo).find('ul').last().find('li[idj="'+data.jugadorEntra+'"]'),
        liJugadorSale = '<li idj="'+data.jugadorSale+'" class="bg-primary my-2 py-2">'+
        '<label class="pl-2 float-left text-uppercase text-white font-weight-bold">'+jugadorSale.find('label').text()+'</label></li>'
    let nombreJugadorEntra = jugadorEntra.find('label').text()

    jugadorSale.find('label').text(nombreJugadorEntra)
    jugadorSale.attr('idj', data.jugadorEntra)
    $(divEquipo).find('ul').last().append(liJugadorSale)
    jugadorEntra.remove()
    // jugadorEntra.find('label').addClass('tachado')
    // jugadorEntra.find('label').removeClass('d-inline')
    // jugadorEntra.find('div').last().remove()
    // jugadorEntra.find('label').addClass('hide')

    $('#modalCambios').modal('hide')
})

$('.local-tit-players,.visit-tit-players').on('click', '.gol', function(){
    let jugador = $(this).parent().parent().attr('idj'),
        equipo = $(this).parent().parent().parent().parent().attr('idE'),
        jugada = 'Gol',
        partido = $('#resultado').parent().attr('idPartido')

    socket.emit('gol', { jugada : jugada, jugador : jugador, equipo : equipo, partido : partido})
})

$('.local-tit-players,.visit-tit-players').on('click', '.autoGol', function(){
    let jugador = $(this).parent().parent().attr('idj'),
        equipo = $(this).parent().parent().parent().parent().attr('idE'),
        jugada = 'autoGol',
        partido = $('#resultado').parent().attr('idPartido'),
        tipoEquipo = $(this).parent().parent().parent().parent().attr('id'),
        otroEquipo = ''

    if(tipoEquipo == 'local-team')  otroEquipo = $('#visit-team').attr('idE')
    else    otroEquipo = $('#local-team').attr('idE')

    socket.emit('autogol', { jugada : jugada, jugador : jugador, equipo : equipo, partido : partido, otroEquipo : otroEquipo})
})

//-- TARJETA AMARILLA
$('.local-tit-players,.visit-tit-players').on('click', '.tarjetaA', function(){
    let jugador = $(this).parent().parent().attr('idj'),
        equipo = $(this).parent().parent().parent().parent().attr('idE'),
        jugada = 'tarjeta amarilla',
        partido = $('#resultado').parent().attr('idPartido'),
        claseul = $(this).parent().parent().parent().attr('class'),
        tipoEquipo = (claseul == 'local-tit-players') ? 'local' : 'visitante',
        nombreJ = $(this).parent().siblings('label').first().text()

    socket.emit('tarjeta amarilla', { jugada : jugada, jugador : jugador, equipo : equipo, partido : partido, tipoEquipo : tipoEquipo, nombreJ : nombreJ })
})
socket.on('tarjeta amarilla', function(data){
    let minutos = (data.MinutoR > 0) ? data.Minuto+' + '+data.MinutoR+'\'' : data.Minuto+'\'',
        li = '<li idJ="'+data.IdJugador+'">'+data.nombre+'<span class="ml-2">'+minutos+'</span></li>'

    if(data.tipoEquipo == 'local'){
        $('#jugadas').find('.ta-local').append(li)
    }else{
        $('#jugadas').find('.ta-visitante').append(li)
    }
})

//-- TARJETA ROJA
$('.local-tit-players,.visit-tit-players').on('click', '.tarjetaR', function(){
    let jugador = $(this).parent().parent().attr('idj'),
        equipo = $(this).parent().parent().parent().parent().attr('idE'),
        jugada = 'tarjeta roja',
        partido = $('#resultado').parent().attr('idPartido'),
        claseul = $(this).parent().parent().parent().attr('class'),
        tipoEquipo = (claseul == 'local-tit-players') ? 'local' : 'visitante',
        nombreJ = $(this).parent().siblings('label').first().text()
        

    socket.emit('tarjeta roja', { jugada : jugada, jugador : jugador, equipo : equipo, partido : partido, tipoEquipo : tipoEquipo, nombreJ : nombreJ })
})
socket.on('tarjeta roja', function(data){
    let minutos = (data.MinutoR > 0) ? data.Minuto+' + '+data.MinutoR+'\'' : data.Minuto+'\'',
        ul = null,
        liroja = '<li idJ="'+data.IdJugador+'">'+data.nombre+'<span class="ml-2">'+minutos+'</span></li>'
    if(data.tipoEquipo == 'local')  ul = $('#jugadas div div .tr-local')
    else   ul = $('#jugadas div div .tr-visitante')

    ul.append(liroja)

    if(data.tipoEquipo == 'local'){
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('label').classList.add("tachado")
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.remove("d-inline")
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.add("hide")
    }else{
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('label').classList.add("tachado")
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.remove("d-inline")
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.add("hide")
    }
})

//-- FALTA
$('.local-tit-players,.visit-tit-players').on('click', '.falta', function(){
    let equipo = $(this).parent().parent().parent().parent().attr('idE'),
        jugada = 'falta',
        partido = $('#resultado').parent().attr('idPartido')        

    socket.emit('falta', { jugada : jugada, equipo : equipo, partido : partido })
})
socket.on('falta', function(data){
    $('#closeAlert').next().text('falta cometida en el minuto '+data.Minuto+'\'')
    $('#alertMessage').show()
})

socket.on('timer', function(data){
    $('#minutos').text(data.minutos)
    $('#segundos').text(data.segundos)
    if(data.minutosR > 0 || data.segundosR > 0){
        $('#minutosR').text(' + '+data.minutosR)
        $('#segundosR').text(data.segundosR)
    }
    if(data.minutos == 44 && data.segundos==59) $('#btn-comenzar').removeAttr('disabled')
})

socket.on('goles', function(data){
    $('#resultado').text(' '+data.golesLocal+' vs '+data.golesVisitante+' ')
})

socket.on('doble amarilla', function(data){
    let minutos = (data.MinutoR > 0) ? data.Minuto+' + '+data.MinutoR+'\'' : data.Minuto+'\'',
        li = null,
        ulroja = null,
        liroja = '<li idJ="'+data.IdJugador+'">'+data.nombre+'<span class="ml-2">'+minutos+'</span></li>'
    if(data.tipoEquipo == 'local')  li = $('#jugadas div div .ta-local').find('li[idJ="'+data.IdJugador+'"]')
    else   li = $('#jugadas div div .ta-visitante').find('li[idJ="'+data.IdJugador+'"]')

    li.append('<span class="ml-2">'+minutos+'</span>')    
    if(data.tipoEquipo == 'local')  ulroja = $('#jugadas div div .tr-local')
    else   ulroja = $('#jugadas div div .tr-visitante')
    ulroja.append(liroja)

    if(data.tipoEquipo == 'local'){
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('label').classList.add("tachado")
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.remove("d-inline")
        document.getElementById('local-team').querySelector('.local-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.add("hide")
    }else{
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('label').classList.add("tachado")
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.remove("d-inline")
        document.getElementById('visit-team').querySelector('.visit-tit-players').querySelector('li[idJ="'+data.IdJugador+'"]').querySelector('.player-actions').classList.add("hide")
    }
})

socket.on('descanso', function(data){
    $('#btn-comenzar').attr('disabled', 'disabled')
    $('#closeAlert').next().text('inicia el descanso')
    $('#alertMessage').show()
})

socket.on('timerDescanso', function(data){
    console.log(data.minutos +' : ' + data.segundos)
})

socket.on('fin del descanso', function(data){
    $('#btn-comenzar').removeAttr('disabled')
})

socket.on('actualizar tablero', function(data){
    $('#minutos').text(data.minutos)
})

socket.on('error', function(data){
    $('#closeAlert').next().text(data.message)
    $('#alertMessage').show()
})

$('#btn-comenzar').click(function(){
    let textBoton = $(this).val()
    if(textBoton == 'Fin del pt' || textBoton == 'Fin del st'){
        let message = (textBoton == 'Fin del pt') ? 'primer tiempo' : 'segundo tiempo'
        let finalizar = confirm('Esta seguro de finalizar el '+message)
        if(finalizar){
            socket.emit('fin tiempo', { tiempo : message })
        }
    }
    else{
        socket.emit('iniciar partido', {})  
        console.log('hola')

        $(this).attr('disabled', 'true')
        $(this).val('Fin del pt')   
    }
})