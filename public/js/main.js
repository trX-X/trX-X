//Select the form in the chat
const chatForm = document.getElementById('chat-form')
//Select the main div i.e chat-messages div
const chatMessages = document.querySelector('.chat-messages');
//Select the room-name 
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')


//Get username and room from URL
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});


const socket = io();

//Join Chat Room
socket.emit('joinRoom', { username, room});

//Get room and users
socket.on('roomUsers', ({room, users})=> {
    outputRoomName(room);
    outputUsers(users);
})

//Catch the emit / Message from server
socket.on('message', message =>{
    console.log(message);
    //outputMessage displays the message on to the screen
    outputMessage(message);

    //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit / Adding the event listener on the form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get the forms text, and add to the msg variable
    const msg = e.target.elements.msg.value;
    
    //Emitting a message to the server
    socket.emit('chatMessage', msg);

    //After we emit, we will clear out input in the form
    e.target.elements.msg.value ='';
    e.target.elements.msg.focus();
})


// outputMessage to DOM
function outputMessage(mes){
    //Create a div
    const div = document.createElement('div');
    //Add a class to div
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${mes.username} <span> ${mes.time}</span></p>
    <p class="text">
       ${mes.text} 
    </p>`;

    //Add the created div to the main div with class of chat-messages
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function  outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function  outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}      
