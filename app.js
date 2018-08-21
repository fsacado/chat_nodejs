const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const random_name = require('node-random-name');
let Message = require('./Message');
const validator = require('validator');
const date = require('date-and-time');
const os = require('os');


// TEMPLATE ENGINE


// setting engine to ejs
app.set('view engine', 'ejs');


// MIDDLEWARES


// use folder assets by default for static files
app.use(express.static('assets'));


// ROUTES


// serving template index.html when url is on '/'
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/room', (req, res) => {
    res.render('room');
});


// SOCKETS


let users = [ // it will contain the users list
    [],
    [],
    []
]; 


// when someone connects, open a new socket
io.on('connection', (socket) => {

    const username = random_name({ // assign a random username to the user
        first: true
    });

    let messageLoggedIn = new Message(username, 'has joined the channel', 'black', 'grey');

    let realRoomNumber; // create global variables
    let roomNumber;

    socket.on('join', (data) => { // when the client side goes to one room

        roomNumber = data.room; // assign data.room to roomNumber so we can reuse it further down
        realRoomNumber = data.room - 1; // assign data.room -1 (for indexed in the array)

        socket.join(data.room); // the user joins the room

        users[realRoomNumber].push({ // push current user in the array, depending on his room
            username: username,
            id: socket.id
        });

        socket.emit('logged as', messageLoggedIn); // tell the user his username
        
        users[realRoomNumber].forEach(function (user) { // for each logged user in the same room, send his information to the current user
            if (user.username !== username) { // the user doesn't have to see his own username on the list
                let messageAlreadyIn = new Message(user.username, 'is already on the channel', 'black', 'grey');
                socket.emit('users already connected', messageAlreadyIn);
            }
        });        
        
        socket.broadcast.to(roomNumber).emit('user has logged', messageLoggedIn); // tell everyone on the same room that a new user has logged

    });


    socket.on('chat message', (message) => {

        let messageToBot = message; // keep authentic message for bot use
        message = validator.escape(message); // for oher users, replace <, >, &, ', " and / with HTML entities

        if (message !== '' && message !== undefined) { // if the received message is complete...

            let messageToOtherUsers = new Message(username, message);
            let messageToCurrentUser = new Message('Me', message, 'red');

            let message_words = message.split(" "); // split each word of the message into an array
            let destinationUsername = message_words[0].substring(1); // get the first word (= potential username) without potential '@'
            let checkDestinationUserIndex = users[realRoomNumber].map((e) => { // checking that the destination user exists
                return e.username;
            }).indexOf(destinationUsername);
            message_words.splice(0, 1); // remove the first element (@username) so it looks better without it
            let destinationUserMessage = message_words.join(' '); // make a string from the array

            if (message.substring(0, 1) === '@' && checkDestinationUserIndex !== -1) { // if the first character is an '@' AND if the following word is a logged username

                let messageToOneUser = new Message(username, destinationUserMessage, 'blue');
                let destinationUserId = users[realRoomNumber][checkDestinationUserIndex].id; // get the destination user id...

                io.to(destinationUserId).emit('message ok', messageToOneUser); // ...send him the message...
                socket.emit('message ok', messageToCurrentUser); // ...and send it to the current user

            } else if (messageToBot === "/ping") { // if the user sends "/ping"
                let messagePong = new Message('bot', 'pong', 'yellow');
                socket.emit('message ok', messagePong);

            } else if (messageToBot === "/date") { // if the user sends "/date"
                let now = new Date();
                let completeDate = date.format(now, 'YYYY/MM/DD');
                let messageDate = new Message('bot', completeDate, 'yellow');
                socket.emit('message ok', messageDate);

            } else if (messageToBot === "/whoami") { // if the user sends "/whoami"
                let ip = os.networkInterfaces().wlp3s0[0].address;
                if (!ip) { // if ip is not defined
                    ip = 'sorry, functionnality not available';
                }
                let messageWhoami = new Message('bot', ip, 'yellow');
                socket.emit('message ok', messageWhoami);

            } else { // otherwise...
                socket.broadcast.to(roomNumber).emit('message ok', messageToOtherUsers); // ... send it back to everyone in the same room...
                socket.emit('message ok', messageToCurrentUser); // ...and send it to the current user
            }
        }
    });


    socket.on('user typing', (isTyping) => {
        if (isTyping === true) { // if the user is typing...
            socket.broadcast.to(roomNumber).emit('user typing', { // ...tell everyone else in the same room
                username: username
            });
        } else { // otherwise don't tell it
            socket.broadcast.to(roomNumber).emit('user not typing');
        }
    });

    // if a user disconnects
    socket.on('disconnect', () => {

        let messageLoggedOut = new Message(username, 'has left the channel', 'black', 'grey');

        let usernameIndex = users[realRoomNumber].map((e) => {
            return e.id;
        }).indexOf(socket.id); // get index of the user..
        users[realRoomNumber].splice(usernameIndex, 1); // ...and remove him from the array

        socket.broadcast.to(roomNumber).emit('user has logged out', messageLoggedOut); // tell everyone is the same room that the user has logged out
    });

});


// listen on port 3000
server.listen(3000, () => {
    console.log('Listening on port 3000');
});