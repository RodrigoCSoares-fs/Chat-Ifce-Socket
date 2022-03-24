const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');





const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Definindo pasta estatica
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat IFCE ';

// Execulta quando os clientes se conectam
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Boas vindas ao usuario atual
    socket.emit('message', formatMessage(botName, `${username} logado para iniciar o chat!`));

    // Conexao de usuario a sala
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} entrou no chat`)
      );

    // Enviando usuarios e informacoes da sala
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Mensagem
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Usuario desconectado
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} deixou o chat`)
      );

      // Enviar usuarios e informacoes da sala
      io.to(user.room).emit('Usuários da sala', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
