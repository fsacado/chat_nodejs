
// Connection
let socket = io.connect('http://localhost:3000');


// Query DOM

let input = $('#message_input');
    form = $('#main_form');
    output = $('#output_field');
    info = $('#info');


// Emit events

form.submit(() => {
    socket.emit('chat message', input.val());
    input.val('');
    return false;
});

socket.on('message ok', (msg) => {
    output.val(output.val() + msg);
});



input.on('keypress', () => {
    socket.emit('user_typing');
});

socket.on('user_typing', () => {
    info.val('a user is typing');
});

