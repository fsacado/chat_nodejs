// CONNECTION
let socket = io.connect('http://localhost:3000');


// Query DOM


let message = $('#message_input');
users = $('#connected_users');
form = $('#main_form');
output = $('#output_field');
info = $('#info_field');


// FUNCTIONS


function showNewMessage(username, username_color, date, content, content_color) {
    output.append( // appending the new element to the screen
        `<div class="my-2">
            <div class="block username_date">
                <span class="username" style="color:${username_color}">${username}</span>
                <span class="date">${date}</span>
            </div>
            <span style="color:${content_color}">${content}</span> 
        </div>`
    );
    output.animate({ // auto-scroll to the bottom
        scrollTop: 1000
    }, 'slow'); 
}


// EMIT EVENTS


// emits when page first loads
socket.emit('new user');

// when form is submited
form.submit(() => {
    socket.emit('chat message', message.val()); // emit "chat message" event 
    message.val(''); // empty the input
    socket.emit('user typing', false);
    return false;
});

message.on('keyup', () => {
    if (message.val().length === 0) {
        socket.emit('user typing', false); // when the message input is empty, set "user typing" to false
    } else {
        socket.emit('user typing', true); // when the user is writing, set "user typing" to true
    }
});


// LISTEN FOR EVENTS


socket.on('logged as', (data) => {
    $('.logged_as').text(data.username);
});

socket.on('user has logged', (data) => { 
    showNewMessage(data.username, data.username_color, data.date, data.content, data.content_color);
});

// when the message is ok show it on the output
socket.on('message ok', (data) => {
    showNewMessage(data.username, data.username_color, data.date, data.content, data.content_color);
});

// when received "user typing" event from the server, fill the div with "username is typing"
socket.on('user typing', (data) => {
    info.text(data.username + ' is typing...');
});

// when received "user not typing" event from the server, empty the div
socket.on('user not typing', () => {
    info.text('');
});