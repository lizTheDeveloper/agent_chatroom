const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = {}; //not a real backend, just for testing

// read from the users.json file
fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    users = JSON.parse(data);
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    if (!socket.username) {
        socket.emit('general', 'Please register or login with /register <username> <password> or /login <username> <password>');
    }
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('general', (msg) => {
        console.log('message: ' + msg);

        // handle slash commands
        if (msg.startsWith('/')) {
            const command = msg.split(' ')[0];
            const args = msg.split(' ').slice(1);
            switch (command) {
                case '/register':
                    if (users[args[0]]) {
                        socket.emit('general', 'Username already taken');
                        return;
                    } else {
                        socket.emit('general', 'Registered');
                        users[args[0]] = args[1];
                    }
                    fs.writeFileSync('users.json', JSON.stringify(users));
                    break;
                case '/login':
                    // check the password
                    if (users[args[0]] === args[1]) {
                        socket.emit('general', 'Logged in');
                        socket.username = args[0];
                    } else {
                        socket.emit('general', 'Invalid username or password');
                    }
                    break;
                default:
                    socket.emit('general', 'Unknown command');
            }
            return;
        } else {
            if (!socket.username) {
                socket.emit('general', 'Please register or login with /register <username> <password> or /login <username> <password>');
                return;
            }
            io.emit('general', socket.username + " " + msg);
        }
    });
});

server.listen(3535, () => {
  console.log('server running at http://localhost:3535');
});
