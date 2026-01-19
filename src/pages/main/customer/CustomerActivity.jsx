/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customerOrderService } from "@/lib/services/customerService";

const CustomerActivity = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data =
        activeTab === "upcoming"
          ? await customerOrderService.getUpcomingOrders()
          : await customerOrderService.getOrderHistory();

      if (data.success) {
        if (activeTab === "upcoming") {
          setUpcomingOrders(data.orders || []);
        } else {
          setHistoryOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      const data = await customerOrderService.cancelOrder(orderId);
      if (data.success) {
        toast.success("Hủy đơn hàng thành công!");
        loadOrders();
        setSelectedOrder(null);
      } else {
        toast.error(data.message || "Không thể hủy đơn hàng");
      }
    } catch (err) {
      console.error("Error canceling order:", err);
      toast.error("Đã xảy ra lỗi khi hủy đơn hàng");
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
  };

  const filteredOrders =
    activeTab === "upcoming"
      ? upcomingOrders.filter(
          (order) =>
            order.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : historyOrders.filter(
          (order) =>
            order.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white shadow-md px-4 py-3 rounded-full border focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 px-4 rounded-full font-semibold transition ${
            activeTab === "upcoming"
              ? "bg-primary-500 text-white shadow-md"
              : "bg-white text-gray-600"
          }`}
        >
          Sắp tới
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 rounded-full font-semibold transition ${
            activeTab === "history"
              ? "bg-primary-500 text-white shadow-md"
              : "bg-white text-gray-600"
          }`}
        >
          Lịch sử
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-primary-500 animate-spin">
            progress_activity
          </span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">
            receipt_long
          </span>
          <p className="text-gray-500">
            {activeTab === "upcoming"
              ? "Chưa có đơn hàng sắp tới"
              : "Chưa có lịch sử đơn hàng"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={handleCancelOrder}
          navigate={navigate}
        />
      )}
    </div>
  );
};

// Components
const OrderCard = ({ order, onViewDetail }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      confirmed: "text-blue-600 bg-blue-50",
      in_progress: "text-purple-600 bg-purple-50",
      completed: "text-green-600 bg-green-50",
      cancelled: "text-red-600 bg-red-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-dark-900">{order.task_name}</p>
          <p className="text-sm text-gray-500">Mã: {order.order_code}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            order.status,
          )}`}
        >
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
        <span className="material-symbols-outlined text-base">schedule</span>
        <span>
          {order.scheduled_at
            ? new Date(order.scheduled_at).toLocaleString("vi-VN")
            : "Ngay lập tức"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-bold text-primary-500">
          {Number(order.total_price || 0).toLocaleString()} VND
        </p>
        <button
          onClick={() => onViewDetail(order)}
          className="text-primary-500 font-semibold text-sm"
        >
          Chi tiết →
        </button>
      </div>
    </div>
  );
};

const OrderDetailModal = ({ order, onClose, onCancel, navigate }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600",
      confirmed: "text-blue-600",
      in_progress: "text-purple-600",
      completed: "text-green-600",
      cancelled: "text-red-600",
    };
    return colors[status] || "text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark-900">Chi tiết đơn hàng</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="text-center py-4">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(
                order.status,
              )}`}
            >
              <span className="material-symbols-outlined">
                radio_button_checked
              </span>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Order Info */}
          <div className="bg-primary-50 rounded-xl p-4">
            <h4 className="font-semibold text-dark-900 mb-2">
              Thông tin đơn hàng
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold">{order.order_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dịch vụ:</span>
                <span className="font-semibold">{order.task_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-semibold">
                  {order.scheduled_at
                    ? new Date(order.scheduled_at).toLocaleString("vi-VN")
                    : "Ngay lập tức"}
                </span>
              </div>
              {order.note && (
                <div>
                  <span className="text-gray-600">Ghi chú:</span>
                  <p className="text-gray-900 mt-1">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasker Info */}
          {order.tasker && (
            <div className="bg-primary-50 rounded-xl p-4">
              <h4 className="font-semibold text-dark-900 mb-2">
                Thông tin Tasker
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={order.tasker.avatar_url || "/images/default-avatar.png"}
                  alt={order.tasker.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{order.tasker.full_name}</p>
                  <p className="text-sm text-gray-600">{order.tasker.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {order.customer_address && (
            <div className="bg-primary-50 rounded-xl p-4">
              <h4 className="font-semibold text-dark-900 mb-2">Địa chỉ</h4>
              <p className="text-sm text-gray-700">
                {order.customer_address.full_address}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="bg-primary-50 rounded-xl p-4">
            <h4 className="font-semibold text-dark-900 mb-2">Chi tiết giá</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Giá dịch vụ:</span>
                <span>
                  {Number(order.task_price || 0).toLocaleString()} VND
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>
                    -{Number(order.discount_amount).toLocaleString()} VND
                  </span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Tổng cộng:</span>
                <span className="text-primary-500">
                  {Number(order.total_price || 0).toLocaleString()} VND
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {canCancel && (
              <button
                onClick={() => onCancel(order._id)}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
              >
                Hủy đơn
              </button>
            )}
            {order.status === "in_progress" && (
              <button
                onClick={() => navigate(`/customer/order/${order._id}/track`)}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
              >
                Theo dõi
              </button>
            )}
            {order.status === "completed" && !order.reviewed && (
              <button
                onClick={() => navigate(`/customer/order/${order._id}/review`)}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition"
              >
                Đánh giá
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerActivity;
