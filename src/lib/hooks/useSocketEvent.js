import { useEffect } from 'react';
import { useSocket } from "@/context/SocketContext';

/**
 * Custom hook để lắng nghe các socket events
 * @param {string} eventName - Tên event cần lắng nghe
 * @param {function} callback - Callback function khi nhận event
 */
export const useSocketEvent = (eventName, callback) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    // Cleanup: Remove listener khi component unmount
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

/**
 * Custom hook để emit socket events
 * @returns {function} emit function
 */
export const useSocketEmit = () => {
  const { socket } = useSocket();

  const emit = (eventName, data, callback) => {
    if (!socket) {
      console.warn('Socket not connected');
      return;
    }
    socket.emit(eventName, data, callback);
  };

  return emit;
};
