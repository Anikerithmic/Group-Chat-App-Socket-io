require('dotenv').config();
const { Server } = require("socket.io");
const http = require('http');
const express = require('express');
const port = 5000;
const path = require('path');
const jwt = require('jsonwebtoken');
const userAuthentication = require('./middleware/auth');
const sequelize = require('./util/database');
const User = require('./models/User');
const Message = require('./models/Message');
const Group = require('./models/Group');
const GroupHandler = require('./models/GroupHandler');
const groupRoute = require('./routes/groupRoute');
const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//socket.io

io.on('connection', (socket) => {
    console.log('A new user has connected:', socket.id);

    // Handling chat messages
    socket.on('chatMessage', (data) => {
        try {
            const decoded = jwt.verify(data.token, process.env.SECRET_KEY);
            createGroupMessages(data, decoded);

            // Sending the message to all connected clients
            io.emit('chatMessage', data);
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    });
    socket.on('fileUploaded', (data) => {
        console.log('fileUploaded', data)
        const decoded = jwt.verify(data.token, process.env.SECRET_KEY);
        storeFileToDB(data, decoded);

        // sending file message to all connected clients
        io.emit('fileMessage', data);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

    });
});

createGroupMessages = async (data, decoded) => {
    try {
        const msg = await Message.create({
            message: data.message,
            groupId: data.chatId,
            userId: decoded.userId
        });

    } catch (err) {
        console.error('Error creating message:', err);
    }
};

storeFileToDB = async (data, decoded) => {
    try {
        const msg = await Message.create({
            message: data.message,
            groupId: data.chatId,
            userId: decoded.userId
        });

    } catch (err) {
        console.error('Error creating file message:', err);
    }
}



app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.json());

app.use(userRoute);
app.use(chatRoute);
app.use(groupRoute);

User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

Group.belongsToMany(User, { through: GroupHandler });
User.belongsToMany(Group, { through: GroupHandler });

server.listen(port, () => console.log(`Server started at ${port}`))

sequelize
    .sync()
    .then(result => {
        // app.listen(port, () => {
        //     console.log(`Server is running on port ${port}`);
        // });     
    })
    .catch(err => {
        console.log(err);
    });
