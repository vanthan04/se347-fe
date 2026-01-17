import { create } from "zustand";

const useChatStore = create((set) => ({
  messages: [],
  listMessages: [],
  onlineUsers: [],

  // Action cập nhật danh sách tin nhắn
  setMessages: (messages) => set({ messages }),
  
  // Action thêm 1 tin nhắn mới (dùng khi socket báo về)
  addMessage: (newMessage) => set((state) => ({ 
    messages: [newMessage, ...state.messages] 
  })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  setListMessages: (list) => set({ listMessages: list }),
}));

export default useChatStore;