const socket = io.connect('http://185.13.90.140:8081/');

class ViewModel {
    constructor(socket) {
        this.onMessage = this.onMessage.bind(this);

        this.socket = socket;
        this.nickname = "Guest";
        this.messages = [];
        this.onChange = () => {};

        this.socket.on('message', this.onMessage);        
    }

    onMessage(message) {
        if (message.message.startsWith(this.nickname)) {
            return;
        }

        this.messages.push(message);
        this.onChange();
    }

    sendMessage(message) {
        socket.emit('message', message);
        
        this.messages.push({
            message: message.message
        });

        this.onChange();
    }
}

class View {
    constructor(viewModel) {
        this.viewModel = viewModel;
        this.viewModel.onChange = () => { this.render(); };

        this.messagesElement = document.getElementById('messages');
        this.nicknameElement = document.getElementById('nickname');
        this.messageElement = document.getElementById('message');
        this.sendElement = document.getElementById('send');

        this.onMessageKeyDown = this.onMessageKeyDown.bind(this);
        this.onSendClick = this.onSendClick.bind(this);
        this.onNicknameChange = this.onNicknameChange.bind(this);

        this.messageElement.onkeydown = this.onMessageKeyDown;
        this.sendElement.onclick = this.onSendClick;
        this.nicknameElement.onchange = this.onNicknameChange;
    }

    onMessageKeyDown(args) {
        if (args.code === 'Enter') {
            this.sendMessage();
        }
    }

    onSendClick() {
        this.sendMessage();
    }

    onNicknameChange() {
        this.viewModel.nickname = this.nicknameElement.value;
    }

    sendMessage() {
        this.viewModel.sendMessage({
            user: this.nicknameElement.value,
            message: this.messageElement.value
        });

        this.messageElement.value = "";
    }

    render() {
        this.nicknameElement.value = this.viewModel.nickname;
        
        while (this.messagesElement.firstChild) {
            this.messagesElement.removeChild(this.messagesElement.firstChild);
        }

        for (const message of this.viewModel.messages) {
            const messageElement = document.createElement('div');
            

            if (message.user) {
                messageElement.innerText = `${message.user}: ${message.message}`;
            } else {
                messageElement.innerText = message.message;
                messageElement.style = "text-align: right;"
            }
        
            this.messagesElement.appendChild(messageElement);
        }

        this.messagesElement.scrollTo({
            behavior: 'smooth',
            top: this.messagesElement.scrollHeight,
        });
    }
}

new View(new ViewModel(socket)).render();
