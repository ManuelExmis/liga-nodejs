'use strict'

$('#btnComenzar').click(function(e){
    let idPartido = $(this).siblings('input:hidden[name="idPartido"]').val(),
        input= this
    $.post('/partidos/inicioPartido', { partido : idPartido}, function(data){
        
        if(data.inicioPartido){//el partido ya habia iniciado antes
            var deleteOk = confirm('El partido ya habia iniciado antes... ¿Desea continuarlo?')
            if(deleteOk){
                // document.getElementById('formulario').submit()
                //llamar controlador de continuar juego
                $(input).parent().attr('action','/partidos/continuar')
                $(input).parent().submit()
            }      
        }
        else{
            $(input).parent().submit()
        }
    })
    e.preventDefault()
})