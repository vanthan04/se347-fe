import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { disconnectSocket, initSocket } from "@/lib/utils/socket";
import useUserStore from "@/lib/stores/userStore";
import useSocketStore from "@/lib/stores/socketStore";
import OrderListener from "@/components/socket/OrderListener";
import ChatListener from "@/components/socket/ChatListener";
import CustomOrderModal from "@/components/socket/CustomOrderModal";

function App() {
  const userId = useUserStore((state) => state.userId);
  const token = useUserStore((state) => state.token);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const setSocket = useSocketStore((state) => state.setSocket);
  const setConnected = useSocketStore((state) => state.setConnected);

  useEffect(() => {
    if (isAuthenticated && userId && token) {
      console.log("🔌 Initializing socket...");
      const socket = initSocket(userId, token);

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        setSocket(socket);
        setConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        setConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setConnected(false);
      });
    } else {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    }

    return () => {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, userId, token, setSocket, setConnected]);

  return (
    <>
      <OrderListener />
      <ChatListener />
      <CustomOrderModal />
      <Outlet />

      <ToastContainer position="top-center" autoClose={2000} theme="light" />
    </>
  );
}

export default App;
