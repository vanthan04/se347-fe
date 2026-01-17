import { create } from "zustand";

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,

  setSocket: (socket) =>
    set({
      socket,
      isConnected: socket?.connected || false,
    }),

  setConnected: (isConnected) =>
    set({
      isConnected,
    }),

  clearSocket: () =>
    set({
      socket: null,
      isConnected: false,
    }),
}));

export default useSocketStore;
