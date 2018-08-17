
// CONNECTION
let socket = io.connect('http://localhost:3000');


// Query DOM

let message = $('#message_input');
    form = $('#main_form');
    output = $('#output_field');
    info = $('#info');


// EMIT EVENTS


// emits when page first loads
socket.emit('new user');

// when form is submited
form.submit(() => {
    socket.emit('chat message', message.val()); // emit "chat message" event 
    message.val(''); // empty the input
    socket.emit('user stop typing'); // emit "user stop typing" event
    return false;
});


// when the user is writing, fire "user typing" event
message.on('keyup', () => {
    if (message.val().length === 0) {
        socket.emit('user stop typing');
    } else {
        socket.emit('user typing');
    }
});


// LISTEN FOR EVENTS


socket.on('new user', (data) => {
    $('.logged_as').text(data.username);
});

// when the message is ok show it on the output
socket.on('message ok', (data) => {
    output.append('<div class="my-2"><div class="block"><span class="username">' + data.username + ' </span><span class="date">' + data.date + '</span></div> ' + data.message + '</div>');
    output.animate({scrollTop: 1000}, 'slow'); // auto-scroll to the bottom
});

// when received "user typing" event from the server, fill the div with "username is typing"
socket.on('user typing', (data) => {
    info.text(data.username +' is typing...');
});

// when received "user stop typing" event from the server, empty the div
socket.on('user stop typing', () => {
    info.text('');
});
