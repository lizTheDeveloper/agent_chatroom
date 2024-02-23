const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = {}; //not a real backend, just for testing
let rooms = {
    "general": {
        "name": "general",
        "public": "true", // "true" or "false
        "allowed_users": [],
        "current_users": [],
        "messages": []
    }
}; //not a real backend, just for testing

// read from the users.json file
fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    users = JSON.parse(data);
});

fs.readFile('rooms.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    rooms = JSON.parse(data);
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    socket.current_room = "general";
    console.log('a user connected');
    if (!socket.username) {
        socket.emit(socket.current_room, 'Please register or login with /register <username> <password> or /login <username> <password>');
    }
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    for (let room in rooms) {
        console.log(room)
        socket.on(room, handleChatMessage);
    }

    function handleChatMessage (msg) {
        console.log(socket.current_room + ' message: ' + msg);

        // handle slash commands
        if (msg.startsWith('/')) {
            const command = msg.split(' ')[0];
            const args = msg.split(' ').slice(1);
            switch (command) {
                case '/register':
                    if (users[args[0]]) {
                        socket.emit(socket.current_room, 'Username already taken');
                        return;
                    } else {
                        socket.emit(socket.current_room, 'Registered');
                        users[args[0]] = {
                            "password": args[1]
                        };
                        rooms.general.allowed_users.push(args[0]);
                    }
                    break;
                case '/login':
                    // check the password
                    if (users[args[0]]["password"] === args[1]) {
                        socket.emit(socket.current_room, 'Logged in');
                        socket.username = args[0];
                        users[args[0]]["socket"] = socket;
                    } else {
                        socket.emit(socket.current_room, 'Invalid username or password');
                    }
                    break;
                // create a new room, add to the list of rooms, /create <room> <public | private> <user handles that are authorized for private rooms>
                case '/create':
                    if (rooms[args[0]]) {
                        socket.emit(socket.current_room, 'Room already exists');
                        return;
                    } else {
                        socket.emit(socket.current_room, args[0] + 'Room created');
                        rooms[args[0]] = {
                            "name": args[0],
                            "public": args[1],
                            "allowed_users": args[1] === "private" ? args.slice(2) : [],
                            "current_users": [],
                            "messages": []
                        };
                        socket.on(args[0], handleChatMessage);
                    }
                    break;
                case '/join': // /join <room>
                    if (!rooms[args[0]]) {
                        socket.emit(socket.current_room, 'Room does not exist');
                        return;
                    }
                    if (rooms[args[0]].public === "private" && !rooms[args[0]].allowed_users.includes(socket.username)) {
                        socket.emit(socket.current_room, 'You are not authorized to join this room');
                        return;
                    }
                    // leave the current room
                    socket.emit(socket.current_room, 'Left room ' + socket.current_room);
                    rooms[socket.current_room].current_users = rooms[socket.current_room].current_users.filter(user => user !== socket.username);
                    socket.emit(socket.current_room, 'Joined room ' + args[0]);
                    rooms[args[0]].current_users.push(socket.username);
                    socket.current_room = args[0];
                    break;
                case '/dm': // /dm <username> <message string>
                    // same as /create, but room is private & only 2 users are allowed in it
                    
                    // build room name
                    let recipientUsername = args[0];
                    let dmRoomName = socket.username + '_' + recipientUsername;
                    let reversedDmRoomName = recipientUsername + '_' + socket.username;

                    // check if room exists
                    let dmRoomObj;
                    if (rooms[dmRoomName]) {
                        dmRoomObj = rooms[dmRoomName];
                    } else if (rooms[reversedDmRoomName]) {
                        dmRoomObj = rooms[reversedDmRoomName]
                    } else {
                        // create room since it doesn't exist
                        rooms[dmRoomName] = {
                            "name": dmRoomName,
                            "public": "false",
                            "allowed_users": [socket.username, recipientUsername],
                            "current_users": [],
                            "messages": []
                        };
                    }
                    // send message
                    const directMessage = args.slice(1).join(" ");
                    socket.emit(
                        socket.current_room, socket.username + ": " + directMessage
                    );
                    const recipientSocket = users[recipientUsername]["socket"];
                    recipientSocket.emit(
                        recipientSocket.current_room, socket.username + ": " + directMessage
                    );
                    break;
                default:
                    socket.emit(socket.current_room, 'Unknown command');
            }
            return;
        } else {
            if (!socket.username) {
                socket.emit(socket.current_room, 'Please register or login with /register <username> <password> or /login <username> <password>');
                return;
            }
            io.emit(socket.current_room, socket.username + " " + msg);
        }
    }
});

server.listen(3535, () => {
  console.log('server running at http://localhost:3535');
});
