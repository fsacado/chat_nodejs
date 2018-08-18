const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const random_name = require('node-random-name');
const date = require('date-and-time');
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


// when someone connects, open a new socket
io.on('connection', (socket) => {

    const username = random_name({ // assign a random username to the user
        first: true
    }); 
    
    let messageLoggedIn = new Message(username, 'has joined the channel', 'black', 'grey');
    
    console.log(username, 'has just logged in');
    
    // send the new username to client side
    socket.on('new user', () => {
        socket.emit('logged as', messageLoggedIn);
        socket.broadcast.emit('user has logged', messageLoggedIn);
    });

    socket.on('chat message', (message) => {

        if (message !== '' && message !== undefined) { // if the received message is complete...

            let messageToOtherUsers = new Message(username, message);
            let messageToCurrentUser = new Message('Me', message, 'red');

            socket.broadcast.emit('message ok', messageToOtherUsers); // ... send it back to everyone...
            socket.emit('message ok', messageToCurrentUser); // ...and send new modifications only to the current user
        }
    });

    
    socket.on('user typing', (isTyping) => {
        if (isTyping === true) { // if user is typing
            socket.broadcast.emit('user typing', {
                username: username
            });
        } else { // if user is not typing
            socket.broadcast.emit('user not typing');
        }
    });

    // if a user disconnects
    socket.on('disconnect', () => {
        console.log('A user has logged out');
    });
});





// listen on port 3000
server.listen(3000, () => {
    console.log('Listening on port 3000');
});