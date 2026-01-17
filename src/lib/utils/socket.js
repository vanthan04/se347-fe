import { io } from "socket.io-client";
import { CONFIG } from "@/config/config";

let socketInstance = null;

/**
 * Initialize socket connection
 * @param {string} userId - User ID
 * @param {string} token - Authentication token
 * @returns {Socket} Socket instance
 */
export const initSocket = (userId, token) => {
  // If socket already exists and is connected, return it
  if (socketInstance?.connected) {
    console.log("🔌 Socket already connected:", socketInstance.id);
    return socketInstance;
  }

  // Disconnect existing socket if any
  if (socketInstance) {
    socketInstance.disconnect();
  }

  console.log("🔌 Initializing new socket connection...");

  // Create new socket instance
  socketInstance = io(CONFIG.SOCKET_URL, {
    auth: {
      token: `Bearer ${token}`,
      userId,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  // Event listeners
  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  socketInstance.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
  });

  socketInstance.on("reconnect_error", (error) => {
    console.error("❌ Socket reconnection error:", error.message);
  });

  socketInstance.on("reconnect_failed", () => {
    console.error("❌ Socket reconnection failed");
  });

  return socketInstance;
};

/**
 * Get current socket instance
 * @returns {Socket|null} Current socket instance
 */
export const getSocket = () => {
  return socketInstance;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("🔌 Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Emit event to socket
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitSocketEvent = (event, data) => {
  if (socketInstance?.connected) {
    socketInstance.emit(event, data);
  } else {
    console.warn("⚠️ Socket not connected. Cannot emit event:", event);
  }
};

/**
 * Listen to socket event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const onSocketEvent = (event, callback) => {
  if (socketInstance) {
    socketInstance.on(event, callback);
  }
};

/**
 * Remove socket event listener
 * @param {string} event - Event name
 * @param {Function} callback - Callback function (optional)
 */
export const offSocketEvent = (event, callback) => {
  if (socketInstance) {
    if (callback) {
      socketInstance.off(event, callback);
    } else {
      socketInstance.off(event);
    }
  }
};
