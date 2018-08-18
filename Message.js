
const date = require('date-and-time');

class Message
{
    getDate() { // get the current date as hours:minutes
        let now = new Date();
        let formatted_date = date.format(now, 'HH:mm');

        return formatted_date;
    }

    constructor(username, content, username_color = 'black', content_color = 'black') {
        this.username = username;
        this.date = this.getDate();
        this.content = content;
        this.username_color = username_color;
        this.content_color = content_color;
    }

}

module.exports = Message;