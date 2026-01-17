import { useEffect } from "react";
import useSocketStore from "@/lib/stores/socketStore";
import useChatStore from "@/lib/stores/chatStore";
import useUserStore from "@/lib/stores/userStore";
import { toast } from "react-toastify";

/**
 * ChatListener - Lắng nghe các sự kiện liên quan đến Chat
 * - receive-message: Khi nhận tin nhắn mới
 * - start-typing: Khi đối phương bắt đầu gõ
 * - stop-typing: Khi đối phương ngừng gõ
 * - online-users: Cập nhật danh sách người online
 */
const ChatListener = () => {
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);

  const { addMessage, setOnlineUsers } = useChatStore();

  useEffect(() => {
    if (!socket || !user) return;

    // Handler: Nhận tin nhắn mới
    const handleReceiveMessage = (message) => {
      addMessage(message);

      // Thông báo nếu không đang ở trang chat
      if (!window.location.pathname.includes("/chat")) {
        toast.info(
          `💬 Tin nhắn mới từ ${message.sender?.name || "người dùng"}`,
        );
      }
    };

    // Handler: Cập nhật danh sách online
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    // Đăng ký listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("online-users", handleOnlineUsers);

    // Cleanup
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [socket, user, addMessage, setOnlineUsers]);

  return null;
};

export default ChatListener;
