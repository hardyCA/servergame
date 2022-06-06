const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')

const cors = require('cors')

app.use(cors())
const server = http.createServer(app)

const PORT = parseInt(process.env.PORT)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
})
//BARIALES  GLOBALES
let usuarios = []
let juego1 = []
let juego2 = []
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    //conectr usuario
    socket.on('usuario_conectado', (data) => {
        data.idsocket = socket.id
        data.estado = true
        usuarios = [...usuarios, data]
        socket.usuarios = usuarios
        io.emit('usuario_activos', usuarios)

    })
    ////PONER ACTIVO O NO ACTIVO
    socket.on('ensala', (data) => {
        console.log(usuarios)
        usuarios = usuarios.map((p) => {
            if (p.idsocket == data) {
                return {
                    ...p,
                    estado: false,

                };
            } else {
                return p;
            }
        });
        io.emit('ensala_mandar', usuarios)
    })
    socket.on('ensala_activo', (data) => {
        console.log(usuarios)
        usuarios = usuarios.map((p) => {
            if (p.idsocket == data) {
                return {
                    ...p,
                    estado: true,

                };
            } else {
                return p;
            }
        });
        io.emit('ensala_mandar', usuarios)
    })
    ///BUSCAR PARTIDA

    socket.on('buscar_partida', (data) => {
        if (data.idjuego == 1) {
            if (juego1.length == 0) {
                console.log('esperando')
                juego1 = [...juego1, data]

            } else {
                let invitar = {
                    idserver1: data.idsocket,
                    idserver2: juego1[0].idsocket,
                    uid1: data.uid,
                    uid2: juego1[0].uid,
                    monto: data.cantidad,
                    idjuego: data.idjuego,
                    juego: data.nombrejuego,
                    nombre1: data.nombre,
                    nombre2: juego1[0].nombre,
                    sala: data.idsocket + juego1[0].idsocket,
                };

                console.log('partida encontrada')
                io.to(data.idsocket).emit('partida_encontrada', invitar)
                io.to(juego1[0].idsocket).emit('partida_encontrada', invitar)
                juego1 = juego1.filter((r) => r.uid !== juego1[0].uid);
            }
        } else if (data.idjuego == 2) {
            if (juego2.length == 0) {
                console.log('esperando')
                juego2 = [...juego2, data]
                io.to(data.idsocket).emit('partida_encontrada', {})
            } else {
                let invitar = {
                    idserver1: data.idsocket,
                    idserver2: juego2[0].idsocket,
                    uid1: data.uid,
                    uid2: juego2[0].uid,
                    monto: data.cantidad,
                    idjuego: data.idjuego,
                    juego: data.nombrejuego,
                    nombre1: data.nombre,
                    nombre2: juego2[0].nombre,
                    sala: data.idsocket + juego2[0].idsocket,
                };
                console.log('partida encontrada')
                io.to(data.idsocket).emit('partida_encontrada', invitar)
                io.to(juego2[0].idsocket).emit('partida_encontrada', invitar)
                juego2 = juego2.filter((r) => r.uid !== juego2[0].uid);
            }
        }

    })
    socket.on('cancelar_partida', (data) => {
        console.log(data)
        if (data.idjuego == 1) {
            juego1 = juego1.filter((r) => r.idsocket !== data.idesession);
            io.to(data.idesession).emit('cancelar', data)
        } else if (data.idjuego == 2) {
            juego2 = juego2.filter((r) => r.idsocket !== data.idesession);
            io.to(data.idesession).emit('cancelar', data)
        } else {
            console.log('no existe')
        }

    })

    ///INVITACION//
    socket.on('invitacion', (data) => {
        io.to(data.idserver2).emit('mandar_invitacion', data)
    })
    socket.on('empesar', data => {
        io.to(data.idserver1).emit('empesar_juego', data)
    })
    socket.on('empesar_dos', data => {
        io.to(data.idserver1).emit('empesar_juego', data)
        io.to(data.idserver2).emit('empesar_juego', data)
    })
    socket.on('rechazar', data => {
        io.to(data.idserver1).emit('rechazar_invitacion', data)
    })
    socket.on('cancelar', data => {
        io.to(data.idserver1).emit('cancelar_invitacion', data)
        io.to(data.idserver2).emit('cancelar_invitacion', data)
    })
    ///JANKENPON//
    socket.on('seleccionar_uno', (data) => {
        console.log(data)
        io.to(data.idserver).emit('seleccionar_dos', data)
    })
    ///PULSADOR///
    socket.on('pulsar', (data) => {
        io.to(data.server).emit('pulsar_recive', data)
    })


    // //desconectar

    socket.on('desconectar_session', id => {
        usuarios = usuarios.filter((r) => r.uid !== id);
        juego1 = juego1.filter((r) => r.uid !== id)
        juego2 = juego2.filter((r) => r.uid !== id)
        console.log('usuario desconectado : ', socket.id)
        io.emit('usuario_activos', usuarios)
        socket.disconnect(true);
    });

    socket.on('disconnect', function () {
        usuarios = usuarios.filter((r) => r.idsocket !== socket.id);
        juego1 = juego1.filter((r) => r.uid !== id)
        juego2 = juego2.filter((r) => r.uid !== id)
        console.log('usuario desconectado : ', socket.id)
        io.emit('usuario_activos', usuarios)
    })


})



server.listen(PORT, () => {
    console.log('puerto servidor ', PORT)
})


//////// DOS
// const express = require('express');
// const app = express();


// const http = require('http')
// const server = http.createServer(app);

// //soquet io
// const { Server } = require('socket.io');
// const io = new Server(server);

// io.on('connection', (socket) => {
//     console.log('usuario conectado nuevo');

//     // socket.on('chat', (mensaje) => {
//     //     console.log('mensaje recibido', mensaje);
//     // })

//     socket.on('chat', (mensaje) => {
//         console.log(mensaje)
//         io.emit('chat', mensaje);
//     })
// })



// server.listen(3000, () => {
//     console.log('server is running on port 3000');
// })