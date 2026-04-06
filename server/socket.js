/**
 * WebSocket handler — manages connections and routes messages.
 */
import { WebSocketServer } from 'ws';
import { RoomManager } from './rooms.js';

const rooms = new RoomManager();

export function initSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log(`[WS] Client connected from ${req.socket.remoteAddress}`);
    let currentUserId = null;
    let currentRoomId = null;

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      const { type, userId, roomId } = msg;
      currentUserId = userId || currentUserId;

      switch (type) {
        case 'room:create': {
          const room = rooms.create(userId, ws);
          currentRoomId = room.id;
          send(ws, { type: 'room:created', roomId: room.id, members: 1 });
          console.log(`[WS] Room created: ${room.id} by ${userId}`);
          break;
        }

        case 'room:join': {
          const room = rooms.get(roomId?.toUpperCase());
          if (!room) {
            send(ws, { type: 'error', message: `Room "${roomId}" not found` });
            return;
          }
          rooms.join(room.id, userId, ws);
          currentRoomId = room.id;
          send(ws, { type: 'room:joined', roomId: room.id, members: room.members.size });
          broadcast(room, { type: 'room:members', count: room.members.size }, ws);
          broadcastSystem(room, `User ${userId?.slice(0, 6)} joined`, ws);
          console.log(`[WS] ${userId} joined room ${room.id}`);
          break;
        }

        case 'room:leave': {
          handleLeave(ws, currentRoomId, currentUserId);
          currentRoomId = null;
          break;
        }

        case 'sync:play':
        case 'sync:pause': {
          const room = rooms.get(currentRoomId);
          if (room) broadcast(room, { type, userId }, ws);
          break;
        }

        case 'sync:seek': {
          const room = rooms.get(currentRoomId);
          if (room) broadcast(room, { type: 'sync:seek', time: msg.time, userId }, ws);
          break;
        }

        case 'chat:message': {
          const room = rooms.get(currentRoomId);
          if (room && msg.text?.trim()) {
            const payload = { type: 'chat:message', user: userId, text: msg.text.slice(0, 300) };
            broadcast(room, payload, null); // include sender too
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected: ${currentUserId}`);
      handleLeave(ws, currentRoomId, currentUserId);
    });

    ws.on('error', (err) => {
      console.warn(`[WS] Error for ${currentUserId}:`, err.message);
    });
  });

  console.log('[WS] WebSocket server initialized at /ws');
}

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function broadcast(room, data, excludeWs) {
  room.members.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  });
}

function broadcastSystem(room, text, excludeWs) {
  broadcast(room, { type: 'chat:message', system: true, text }, excludeWs);
}

function handleLeave(ws, roomId, userId) {
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;

  rooms.leave(roomId, userId);

  if (room.members.size === 0) {
    rooms.delete(roomId);
    console.log(`[WS] Room ${roomId} deleted (empty)`);
  } else {
    broadcast(room, { type: 'room:members', count: room.members.size }, null);
    broadcastSystem(room, `User ${userId?.slice(0, 6)} left`, null);
  }

  send(ws, { type: 'room:left', roomId });
}
