const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')
const http = require('http')
const {Server} = require('socket.io')
dotenv.config({ path: './config.env' })


const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => console.log('DB connection successful'))

const port = process.env.PORT || 5000
let rooms = []
let admin
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: [
            "Access-Control-Allow-Origin",
            "Access-Control-Header",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Methods",
          ],
          credentials: true,
    }
})
io.on('connection', (socket) => {
    console.log(`USER CONNECTED: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data)
        rooms.push({
            userSocketId: socket.id,
            room: data,
            messages: []
        })
        if (admin) {
            console.log(admin)
            io.to(admin.adminSocketId).emit('update_users', rooms)
        }
        console.log(`User with ID: ${socket.id} joined room: ${data}`)
    })

    socket.on("login_admin", (data) => {
  
        admin = {
            name: 'admin',
            isOnline: true,
            adminSocketId: socket.id
        }
        console.log('ADMIN CONNECTED')

    })
    socket.on("get_users_list", () => {
        io.to(socket.id).emit('update_users', rooms)
    }) 
    socket.on("send_message", (data) => {   
        socket.to(data.room).emit("receive_message", data)
     
     rooms.map(r => {
            if (r.room === data.room) {
                r.messages.push({message: data.message, isAdmin: data.isAdmin, time: data.time})
            }
        } )
       
    })  
    socket.on("admin_join_room", (data) => {
        socket.join(data.room)
    })
    socket.on("change_room", (data) => {
        console.log(data)
        const newRoom = rooms.find(r => r.userSocketId === data.userSocketId)
        io.to(admin.adminSocketId).emit('receive_new_room', newRoom)
    })
    socket.on('disconnect', () => {
        console.log('User Disconnect', socket.id)
        const newRooms = rooms.filter(r => r.userSocketId !== socket.id)
        rooms = newRooms
        if (admin) {
            io.to(admin.adminSocketId).emit('update_users', newRooms)
            io.to(admin.adminSocketId).emit('user_disconnect', socket.id)
        }
    })

})



server.listen(port, () => {
    console.log(`App running on port ${port}`)
    console.log(process.env.NODE_ENV)
})

//handle rejection ex: connect db failed (wrong password)
process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLER REJECTION! shutting down...')
    server.close(() => {
        process.exit(1)
    })
})