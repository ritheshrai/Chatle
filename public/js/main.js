// Getting the DOM
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const UserList = document.getElementById('users')

// Get username & room from URL 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
})

// Initializing socket.io
const socket = io()

// Join the room
socket.emit('joinRoom', { username, room })

// Get room and users 
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

// Socket server

socket.on('message', message =>{
    console.log(message)
    outputMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Submit message
chatForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    // Get message 
    const msg = e.target.elements.msg.value

    // Emit message to the server
    socket.emit('chatMessage', msg)

    // Clear input 
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// Output message

function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM 
function outputRoomName(room) {
    roomName.innerText = room
}

// Add users to DOM 
function outputUsers(users) {
    UserList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}