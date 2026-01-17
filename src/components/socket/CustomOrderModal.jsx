import { useEffect, useState, useRef } from "react";
import { useOrderStore } from "@/lib/stores/orderStore";
import api from "@/lib/api/api";
import { toast } from "react-toastify";

const CustomTaskModal = () => {
  const [order, setOrder] = useState(null);
  const { updateOrder } = useOrderStore();
  const timerRef = useRef(null);

  useEffect(() => {
    const openModal = (e) => {
      setOrder(e.detail);

      // Tự động đóng sau 15 giây nếu Tasker không thao tác
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setOrder(null);
      }, 15000); // 15 giây
    };

    window.addEventListener("OPEN_TASK_MODAL", openModal);

    return () => {
      window.removeEventListener("OPEN_TASK_MODAL", openModal);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!order) return null;

  const handleAccept = async () => {
    try {
      const res = await api.acceptTask(order._id);
      if (res.success) {
        // Cập nhật Store để nhảy sang mục "myWorkOrders"
        updateOrder(res.data);
        toast.success("🚀 Bạn đã nhận đơn thành công!");
      }
    } catch (err) {
      // Trường hợp người khác đã nhận hoặc lỗi server
      toast.error("Tiếc quá, có người nhanh tay hơn rồi!");
      console.error("Lỗi khi nhận đơn:", err);
    } finally {
      setOrder(null); // Đóng modal
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border-2 border-green-500">
        {/* Header đặc trưng */}
        <div className="bg-green-500 p-4 text-white text-center relative">
          <h2 className="text-xl font-bold">🔔 Đơn hàng mới!</h2>
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/50 animate-progress-shrink"
            style={{ animationDuration: "15000ms" }}
          ></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-800 leading-tight">
              {order.title || "Dịch vụ mới"}
            </h3>
            <span className="text-green-600 font-extrabold text-xl whitespace-nowrap ml-2">
              {Number(order.price).toLocaleString()}đ
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-gray-600">
              <span className="text-gray-400">📍</span>
              <p className="text-sm">{order.location || "Xem trên bản đồ"}</p>
            </div>
            {order.note && (
              <div className="flex items-start gap-2 text-gray-600">
                <span className="text-gray-400">📝</span>
                <p className="text-sm italic">"{order.note}"</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setOrder(null)}
              className="flex-1 py-3 rounded-xl border border-gray-300 font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Bỏ qua
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg shadow-green-200 active:scale-95 transition-all"
            >
              Nhận ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTaskModal;
