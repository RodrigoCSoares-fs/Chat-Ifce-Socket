const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Obter o nome de usuario e a sala (URL)
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Entrou no chat
socket.emit('joinRoom', { username, room });

// Obter salas e usuarios
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Mensagem do Servidor
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Rolar para baixo
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Mensagem enviada
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Obter texto da mensagem
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emitir mensagem para o servidor
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Mensagem de saida para DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Adicionar o nome da sala ao DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Adicionar usuarios ao Dom
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Mensagem ao sair da sala
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Tem certeza de que deseja sair da sala de chat IFCE?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
