// Setting the Static folder
const path = require('path')

// Setting the Server
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

// Server
const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(express.static(path.join(__dirname, 'public'))) // static folder (public)
const admin = 'Chatle'

// When a user enters a room 
io.on('connection', socket => {
    // Join the room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        // Welcome the user
        socket.emit('message', formatMessage(admin, 'Welcome to Chatle'))

        // Tell everyone that a user has joined
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(admin,`${user.username} is online`))

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users : getRoomUsers(user.room)
            })

    })

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // When user leaves the room
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(admin,`${user.username} is offline`))
        };
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users : getRoomUsers(user.room)
            })
    })
})
const PORT = process.env.PORT || 3000  // port to run the app

// Running the server
server.listen(PORT, () => console.log(`Server is live on ${PORT}`))
