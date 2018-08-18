const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const random_name = require('node-random-name');
const date = require('date-and-time');


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

    let username = random_name({
        first: true
    }); // assign a random username
    console.log(username, 'has just logged in');

    // send the new username to client side
    socket.on('new user', () => {
        socket.emit('new user', {
            username: username
        });
    });

    socket.on('chat message', (message) => {
        let now = new Date();
        let formatted_date = date.format(now, 'HH:mm');

        if (message !== '' && message !== undefined) { // if the received message is complete...

            let dataObj = {
                message: message,
                username: username,
                date: formatted_date,
                color: 'black'
            };

            socket.broadcast.emit('message ok', dataObj); // ...send it back to everyone
            dataObj.username = 'Me'; // changing username to 'Me' so that the current user doesn't see his username each time
            dataObj.color = 'red'; // and the 'Me' will be in red
            socket.emit('message ok', dataObj); // send only to the current user
        }
    });

    // tell everyone but me that I'm writing
    socket.on('user typing', () => {
        socket.broadcast.emit('user typing', {
            username: username
        });
    });

    // stop showing everyone that I'm writing
    socket.on('user stop typing', () => {
        socket.broadcast.emit('user stop typing');
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