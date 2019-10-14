'use strict'

var mysql = require('mysql'),
    conf = require('./dbLiga-conf'),
    dbOptions = {
        host : conf.mysql.host,
        port : conf.mysql.port,
        user : conf.mysql.user,
        password : conf.mysql.pass,
        database : conf.mysql.db
    },
    myConn = mysql.createConnection(dbOptions)

myConn.connect((err) => {
    return (err) ? console.log(`Error al conectarse a MySQL: ${err.stack}`) : console.log(`Coneción establecida con MySQL N°: ${myConn.threadId}`)
})

module.exports = myConn