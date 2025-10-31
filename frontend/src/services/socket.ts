import io, { Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000', {
      auth: {
        token: token,
      },
    });
  }
  return socket;
};
