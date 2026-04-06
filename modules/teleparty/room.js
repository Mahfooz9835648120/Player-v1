/**
 * Teleparty Room UI — Create, join, leave, and display room state.
 */
import { EventBus, EVENTS } from '../utils/eventBus.js';
import { getState, setState } from '../utils/state.js';
import { createRoom, joinRoom, leaveRoom, syncPlay, syncPause, syncSeek } from './client.js';

export function initRoom() {
  const createBtn    = document.getElementById('create-room-btn');
  const joinBtn      = document.getElementById('join-room-btn');
  const leaveBtn     = document.getElementById('leave-room-btn');
  const copyBtn      = document.getElementById('copy-room-btn');
  const roomInput    = document.getElementById('room-id-input');
  const roomIdDisplay= document.getElementById('room-id-display');
  const partyCount   = document.getElementById('party-count');
  const createJoin   = document.getElementById('party-create-join');
  const activePanel  = document.getElementById('party-active');

  // Create room
  createBtn?.addEventListener('click', async () => {
    setState('party.isHost', true);
    await createRoom();
  });

  // Join room
  joinBtn?.addEventListener('click', async () => {
    const id = roomInput?.value.trim().toUpperCase();
    if (!id) { EventBus.emit(EVENTS.TOAST, { msg: 'Enter a room ID' }); return; }
    await joinRoom(id);
  });

  // Leave room
  leaveBtn?.addEventListener('click', () => {
    leaveRoom();
    showCreateJoinUI();
    EventBus.emit(EVENTS.TOAST, { msg: 'Left the room' });
  });

  // Copy room ID
  copyBtn?.addEventListener('click', () => {
    const id = getState('party.roomId');
    if (id) {
      navigator.clipboard?.writeText(id).then(() => EventBus.emit(EVENTS.TOAST, { msg: '✓ Room ID copied!' }));
    }
  });

  // Room joined
  EventBus.on(EVENTS.PARTY_JOIN, (msg) => {
    if (roomIdDisplay) roomIdDisplay.textContent = msg.roomId;
    if (partyCount)    partyCount.textContent    = msg.members || 1;
    showActiveUI();
    EventBus.emit(EVENTS.TOAST, { msg: `✓ Joined room ${msg.roomId}` });

    // Announce entry in chat
    EventBus.emit(EVENTS.PARTY_CHAT, { system: true, text: `You joined room ${msg.roomId}` });
  });

  // Members update
  EventBus.on(EVENTS.PARTY_MEMBERS, (count) => {
    if (partyCount) partyCount.textContent = count;
  });

  // Party leave
  EventBus.on(EVENTS.PARTY_LEAVE, () => { showCreateJoinUI(); });

  // ——— Sync video play/pause/seek to party ———
  EventBus.on(EVENTS.VIDEO_PLAY, () => {
    if (getState('party.roomId') && !getState('party.isSyncing')) syncPlay();
  });
  EventBus.on(EVENTS.VIDEO_PAUSE, () => {
    if (getState('party.roomId') && !getState('party.isSyncing')) syncPause();
  });
  EventBus.on(EVENTS.VIDEO_SEEK, ({ time }) => {
    if (getState('party.roomId') && !getState('party.isSyncing')) syncSeek(time);
  });

  function showActiveUI() {
    if (createJoin) createJoin.style.display = 'none';
    if (activePanel) activePanel.style.display = '';
  }
  function showCreateJoinUI() {
    if (createJoin) createJoin.style.display = '';
    if (activePanel) activePanel.style.display = 'none';
    setState('party.roomId', null);
    setState('party.members', 0);
  }
}
