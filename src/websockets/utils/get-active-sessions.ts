import { Server } from 'socket.io';

export const getActiveSessions = (server: Server) => {
    const activeSockets = Array.from(server.sockets.sockets.values());
    return activeSockets.map((socket) => ({
      socketId: socket?.id,
      userId: socket?.data?.user?.id,
    }));
}