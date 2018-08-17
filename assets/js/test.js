const EventEmitter = require('events');

class Logger extends EventEmitter {
    
    log(message, user) {
        
        console.log(`${user} is logged in !`);
        console.log(message);

        this.emit('messageLogged', {
            id: 1,
            url: 'http://'
        }); // this will trigger the event listener above

    }

}

// equivaut à
// function log(name) {}

// console.log(__filename);
// console.log(__dirname);


module.exports = Logger;