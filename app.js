const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const random_name = require('node-random-name');
let Message = require('./Message');


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


// SOCKETS

let users = []; // it will contain the users list

// when someone connects, open a new socket
io.on('connection', (socket) => {

    const username = random_name({ // assign a random username to the user
        first: true
    });

    users.push(username); // push current user in the array

    console.log(username, 'has just logged in');
    let messageLoggedIn = new Message(username, 'has joined the channel', 'black', 'grey');


    // send the new username to client side
    socket.on('new user', () => {
        socket.emit('logged as', messageLoggedIn);

        users.forEach(function (user) { // for each logged user, send his information to the current user
            if (user !== username) { // the user doesn't have to see his own username on the list
                let messageAlreadyIn = new Message(user, 'is already on the channel', 'black', 'grey');
                socket.emit('users already connected', messageAlreadyIn);
            }
        });

        socket.broadcast.emit('user has logged', messageLoggedIn);
    });


    socket.on('chat message', (message) => {
        if (message !== '' && message !== undefined) { // if the received message is complete...

            let messageToOtherUsers = new Message(username, message);
            let messageToCurrentUser = new Message('Me', message, 'red');

            socket.broadcast.emit('message ok', messageToOtherUsers); // ... send it back to everyone...
            socket.emit('message ok', messageToCurrentUser); // ...and send it to the current user, with different color and text
        }
    });


    socket.on('user typing', (isTyping) => {
        if (isTyping === true) { // if the user is typing...
            socket.broadcast.emit('user typing', { // ...tell everyone else
                username: username
            });
        } else { // otherwise don't tell it
            socket.broadcast.emit('user not typing');
        }
    });


    // if a user disconnects
    socket.on('disconnect', () => {
        console.log('A user has logged out');
        let messageLoggedOut = new Message(username, 'has left the channel', 'black', 'grey');

        let usernameIndex = users.indexOf(username); // get the index of the user from the users array...
        users.splice(usernameIndex, 1); // ...and remove him
        
        socket.broadcast.emit('user has logged out', messageLoggedOut);
    });
});


// listen on port 3000
server.listen(3000, () => {
    console.log('Listening on port 3000');
});
