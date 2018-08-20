# chat_nodejs
Building a real time chat using node.js and socket.io module

The goal :

- When a user arrives on the page he's given a random username
- When other users arrive on the page the current user must know, and the new user is added to the connected users list
- When other users quit the page the current user must know, and the looged out user is removed from the connected users list
- When a user is typing the other users must know
- If a user sends "@username message" then the message will be sent only to that user
- If a user send "/ping", the server must answer "pong", only to this user
