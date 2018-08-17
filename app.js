const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const io = require('socket.io')(server);


// TEMPLATE ENGINE


// setting engine to ejs
app.set('view engine', 'ejs');


// MIDDLEWARES


// use folder assets by default for static files
app.use(express.static('assets'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

// session object
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


// ROUTES


// serving template index.html when url is on '/'
app.get('/', (req, res) => {
    // if (req.session.error) { // if there's an error in session...
    //     res.locals.error = req.session.error; // ...affect the value to locals.error, so that we can retrieve it on the front end side
    //     req.session.error = undefined; // destroy session error
    // }
    res.render('index');
});

// retrieving post values
// app.post('/', (req, res) => {
//     if (req.body.message == 'undefined' || req.body.message === '') { // if the message sent is empty or undefined... 
//         // res.render('index', {error: 'You didn\'t send any message, please try again ;)'});
//         req.session.error = 'You didn\'t send any message'; // ...set an error in session object
//         res.redirect('/'); // and redirect
//     }
//     res.render('index');
// });


io.on('connection', (socket) => {
    console.log('A user hast just logged in', socket.id);
    
    socket.on('chat message', (message) => {
        if (message !== '' || message !== undefined) {
            // socket.broadcast.emit('user typing', message); // emits message to all the others but not me
            io.emit('message ok', message); // sending the message back to everyone
        }
    });

    socket.on('user_typing', () => {
        socket.broadcast.emit('user_typing');
    });

    socket.on('disconnect', () => {
        console.log('A user has logged out');
    });
});





// listen on port 3000
server.listen(3000, () => {
    console.log('Listening on port 3000');
});

