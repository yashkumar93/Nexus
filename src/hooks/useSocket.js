'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';

/** @type {import('socket.io-client').Socket | null} */
let socketSingleton = null;
let singletonToken = null;

/**
 * Get or create the shared Socket.IO connection.
 * A single socket is reused across all hook instances so long as the
 * auth token hasn't changed.
 * @param {string} token
 * @returns {import('socket.io-client').Socket}
 */
function getSocket(token) {
  if (socketSingleton && singletonToken === token && socketSingleton.connected) {
    return socketSingleton;
  }

  // Disconnect stale connection
  if (socketSingleton) {
    socketSingleton.disconnect();
    socketSingleton = null;
    singletonToken = null;
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;

  socketSingleton = ioClient(wsUrl, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    autoConnect: true,
  });

  singletonToken = token;
  return socketSingleton;
}

/**
 * React hook for managing a Socket.IO connection.
 *
 * Connects using the JWT stored in localStorage. Returns connection state
 * and helpers for emitting/listening to events.
 *
 * @returns {{
 *   socket: import('socket.io-client').Socket | null,
 *   isConnected: boolean,
 *   emit: (event: string, data?: any, ack?: Function) => void,
 *   on: (event: string, handler: Function) => void,
 *   off: (event: string, handler?: Function) => void,
 * }}
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  /** @type {React.MutableRefObject<import('socket.io-client').Socket | null>} */
  const socketRef = useRef(null);

  useEffect(() => {
    // Retrieve auth token from localStorage
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('continuum_access_token')
        : null;

    if (!token) {
      console.warn('[useSocket] No auth token found, socket not connected');
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;
    setSocket(socket);

    function onConnect() {
      setIsConnected(true);
      console.log('[useSocket] Connected:', socket.id);
    }

    function onDisconnect(reason) {
      setIsConnected(false);
      console.log('[useSocket] Disconnected:', reason);
    }

    function onConnectError(err) {
      console.error('[useSocket] Connection error:', err.message);
      setIsConnected(false);
    }

    function onReconnect(attempt) {
      console.log('[useSocket] Reconnected after', attempt, 'attempts');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect', onReconnect);

    // If already connected (singleton reuse), update state immediately
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect', onReconnect);
      // Don't disconnect the singleton — other components may still need it.
      // It disconnects only when the token changes or the page unloads.
    };
  }, []);

  /**
   * Emit an event through the socket.
   * @param {string} event
   * @param {any} [data]
   * @param {Function} [ack]
   */
  const emit = useCallback((event, data, ack) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn(`[useSocket] Cannot emit '${event}': not connected`);
      return;
    }
    if (typeof ack === 'function') {
      socket.emit(event, data, ack);
    } else {
      socket.emit(event, data);
    }
  }, []);

  /**
   * Subscribe to a socket event.
   * @param {string} event
   * @param {Function} handler
   */
  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) {
      console.warn(`[useSocket] Cannot listen to '${event}': no socket`);
      return;
    }
    socket.on(event, handler);
  }, []);

  /**
   * Unsubscribe from a socket event.
   * @param {string} event
   * @param {Function} [handler]
   */
  const off = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return;
    if (handler) {
      socket.off(event, handler);
    } else {
      socket.removeAllListeners(event);
    }
  }, []);

  return {
    socket,
    isConnected,
    emit,
    on,
    off,
  };
}

export default useSocket;
