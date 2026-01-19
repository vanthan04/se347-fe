/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { chatService } from "@/lib/services/taskerService";
import { toast } from "react-toastify";
import useSocketStore from "@/lib/stores/socketStore";

const TaskerChat = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get socket from global store
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  const [currentOrderId, setCurrentOrderId] = useState(
    paramOrderId || searchParams.get("orderId"),
  );
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [showCallOverlay, setShowCallOverlay] = useState(false);

  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Setup socket listeners for chat events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join chat room when orderId changes
    if (currentOrderId) {
      joinChatRoom(currentOrderId);
    }

    // Listen for incoming messages
    const handleReceiveMessage = (payload) => {
      if (payload.chat_id === currentChatId) {
        setMessages((prev) => [...prev, payload]);
        scrollToBottom();
        socket.emit("mark-read", {
          target_order_id: currentOrderId,
        });
      }
      // Update sidebar
      loadConversations();
    };

    const handleStartTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("start-typing", handleStartTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("start-typing", handleStartTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket, isConnected, currentOrderId, currentChatId]);

  // Load conversations sidebar
  useEffect(() => {
    loadConversations();
  }, []);

  // Load chat history when orderId changes
  useEffect(() => {
    if (currentOrderId) {
      loadChatHistory(null);
    }
  }, [currentOrderId]);

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      if (response.ok && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const joinChatRoom = (orderId) => {
    if (!socket) return;

    socket.emit("join-room", { order_id: orderId }, (response) => {
      if (response.ok) {
        setCurrentChatId(response.chatId);
        console.log("Joined room:", response.chatId);
      } else {
        console.error("Join room failed:", response.error);
        toast.error("Không thể kết nối chat");
      }
    });
  };

  const loadChatHistory = async (cursor = null) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (cursor) setLoadingHistory(true);
    else setLoading(true);

    try {
      const response = await chatService.getMessages(currentOrderId, cursor);

      if (response.ok) {
        const newMessages = response.data || [];
        setNextCursor(response.nextCursor);

        if (!cursor) {
          // Initial load
          setMessages(newMessages);

          if (response.conversation?.partner) {
            setPartnerInfo(response.conversation.partner);
          }

          if (response.order) {
            setOrderInfo(response.order);
          }

          setTimeout(() => scrollToBottom(), 100);
        } else {
          // Pagination load (prepend)
          const previousScrollHeight =
            messageContainerRef.current?.scrollHeight || 0;

          setMessages((prev) => [...newMessages, ...prev]);

          setTimeout(() => {
            if (messageContainerRef.current) {
              const newScrollHeight = messageContainerRef.current.scrollHeight;
              messageContainerRef.current.scrollTop =
                newScrollHeight - previousScrollHeight;
            }
          }, 0);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Không thể tải lịch sử chat");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = () => {
    const content = messageInput.trim();
    if (!content || !socket) return;

    socket.emit(
      "send-message",
      {
        target_order_id: currentOrderId,
        content: content,
      },
      (ack) => {
        if (!ack.ok) {
          toast.error("Gửi tin nhắn thất bại");
        }
      },
    );

    setMessageInput("");
    handleStopTyping();
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!currentOrderId || !socket) return;

    socket.emit("start-typing", { target_order_id: currentOrderId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (socket && currentOrderId) {
      socket.emit("stop-typing", {
        target_order_id: currentOrderId,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    if (
      messageContainerRef.current?.scrollTop === 0 &&
      nextCursor &&
      !isLoadingRef.current
    ) {
      loadChatHistory(nextCursor);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  const switchConversation = (chat) => {
    if (currentOrderId !== chat.order_id) {
      setCurrentOrderId(chat.order_id);
      setNextCursor(null);
      setMessages([]);
      setSearchParams({ orderId: chat.order_id });
      joinChatRoom(chat.order_id);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const userId = localStorage.getItem("user_id");

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#F0FDF4]">
      {/* Header */}
      <nav className="sticky top-0 z-100 bg-white shadow-sm">
        <header className="bg-primary-200 flex items-center justify-between px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/tasker/order/${currentOrderId}`)}
              className="shrink-0 w-9 h-9 bg-white rounded-full p-1 flex items-center justify-center shadow-sm hover:bg-gray-50 transition text-primary-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <h1 className="text-dark-900 font-bold text-lg uppercase tracking-wide">
              Tin nhắn
            </h1>
          </div>
        </header>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-360 mx-auto md:p-4">
        <div className="flex-1 bg-white md:rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden w-full h-full relative">
          {/* Sidebar - Conversations List */}
          <aside className="w-20 md:w-[320px] flex-none border-r border-gray-100 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-100 h-17.5 flex items-center shrink-0">
              <h2 className="hidden md:block font-bold text-xl text-gray-900">
                Tin nhắn
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-4 hidden md:block">
                  Chưa có tin nhắn nào
                </p>
              ) : (
                conversations.map((chat) => {
                  const isActive = chat.order_id === currentOrderId;
                  const previewText = chat.last_message
                    ? (chat.last_message.is_sender ? "Bạn: " : "") +
                      chat.last_message.content
                    : "Chưa có tin nhắn";

                  return (
                    <div
                      key={chat._id}
                      onClick={() => switchConversation(chat)}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition ${
                        isActive
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0 w-12 h-12">
                        <img
                          src={
                            chat.partner?.avatar_url ||
                            "https://i.pravatar.cc/150"
                          }
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover border border-gray-200"
                        />
                      </div>
                      <div className="hidden md:flex flex-1 min-w-0 flex-col justify-center">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {chat.partner?.full_name}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {formatTime(chat.updated_at)}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            chat.is_seen
                              ? "text-gray-500"
                              : "text-green-600 font-semibold"
                          }`}
                        >
                          {previewText}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat Section */}
          <section className="flex-1 flex flex-col bg-white min-w-0 relative">
            {/* Call Overlay */}
            {showCallOverlay && (
              <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
                <div className="relative mb-8">
                  <div className="w-36 h-36 rounded-full p-1 border-4 border-white/20 animate-pulse">
                    <img
                      src={
                        partnerInfo?.avatar_url || "https://i.pravatar.cc/150"
                      }
                      className="w-full h-full rounded-full object-cover shadow-2xl"
                      alt="Calling"
                    />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {partnerInfo?.full_name || "Khách hàng"}
                </h3>
                <p className="text-green-400 font-medium mb-16 flex items-center gap-2 text-lg">
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    sync
                  </span>
                  Đang kết nối...
                </p>

                <div className="flex items-center gap-10">
                  <button className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[28px]">
                        mic_off
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Tắt mic</span>
                  </button>

                  <button
                    onClick={() => setShowCallOverlay(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition transform hover:scale-110 active:scale-95 border-4 border-gray-900">
                      <span className="material-symbols-outlined text-[40px]">
                        call_end
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Kết thúc</span>
                  </button>

                  <button className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[28px]">
                        volume_up
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Loa ngoài</span>
                  </button>
                </div>
              </div>
            )}

            {/* Chat Header */}
            <div className="px-4 md:px-6 h-17.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative shrink-0 w-10 h-10">
                  <img
                    src={partnerInfo?.avatar_url || "https://i.pravatar.cc/150"}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border border-gray-200"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {partnerInfo ? (
                      <>
                        {partnerInfo.full_name}
                        {orderInfo && (
                          <span className="font-normal text-gray-500 text-xs ml-1">
                            • {orderInfo.task_name}
                          </span>
                        )}
                      </>
                    ) : (
                      "Chọn một hội thoại"
                    )}
                  </h3>
                  {partnerInfo?.reputation_score !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[9px] font-bold flex items-center">
                        {partnerInfo.reputation_score.toFixed(1)}
                        <span className="material-symbols-outlined text-[10px] ml-0.5">
                          star
                        </span>
                      </span>
                    </div>
                  )}
                  {isTyping && (
                    <div className="text-xs text-green-500 font-medium animate-pulse">
                      Đang nhập...
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowCallOverlay(true)}
                className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">
                  call
                </span>
              </button>
            </div>

            {/* Messages Container */}
            <div
              ref={messageContainerRef}
              onScroll={handleScroll}
              className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col bg-[#FAFAFA]"
            >
              {loadingHistory && (
                <div className="w-full flex justify-center py-2 mb-2">
                  <span className="material-symbols-outlined animate-spin text-green-500">
                    progress_activity
                  </span>
                </div>
              )}

              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <p>Chọn đơn hàng để bắt đầu chat</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = String(msg.sender_id) === String(userId);
                  const time = formatTime(msg.createdAt || msg.updatedAt);

                  if (isMe) {
                    return (
                      <div
                        key={msg._id || index}
                        className="flex flex-col items-end mb-4 ml-auto max-w-[85%]"
                      >
                        <div className="bg-green-500 text-white px-4 py-2.5 rounded-2xl rounded-br-none text-sm shadow-md wrap-break-word">
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 mr-1">
                          {time}
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={msg._id || index}
                        className="flex items-end gap-2 mb-4 max-w-[85%]"
                      >
                        <img
                          src={
                            partnerInfo?.avatar_url ||
                            "https://i.pravatar.cc/150"
                          }
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col">
                          <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-none text-sm text-gray-900 shadow-sm wrap-break-word">
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 ml-1">
                            {time}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 md:gap-3 bg-gray-50 px-2 py-2 rounded-full border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-200 transition-all">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={!currentChatId}
                  className="flex-1 bg-transparent border-none px-3 py-1 text-sm text-gray-900 focus:outline-none placeholder-gray-400"
                  autoComplete="off"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentChatId}
                  className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600 transition active:scale-95 shrink-0 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px] ml-0.5">
                    send
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default TaskerChat;
