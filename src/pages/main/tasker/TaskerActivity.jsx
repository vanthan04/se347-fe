/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activityService } from "@/lib/services/taskerService";
import { toast } from "react-toastify";

const TaskerActivity = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      if (activeTab === "upcoming") {
        const response = await activityService.getUpcomingOrders();
        if (response.success) {
          setUpcomingOrders(response.orders || []);
        }
      } else {
        const response = await activityService.getOrderHistory();
        if (response.success) {
          setHistoryOrders(response.orders || []);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "bg-blue-100 text-blue-700",
      assigned: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      departed: "bg-purple-100 text-purple-700",
      arrived: "bg-indigo-100 text-indigo-700",
      in_progress: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ nhận",
      assigned: "Đã được gán",
      accepted: "Đã nhận đơn",
      departed: "Đang di chuyển",
      arrived: "Đã đến nơi",
      in_progress: "Đang làm việc",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const currentOrders =
    activeTab === "upcoming" ? upcomingOrders : historyOrders;
  const filteredOrders = currentOrders.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.task_snapshot?.name?.toLowerCase().includes(searchLower) ||
      order.address_snapshot?.full_address
        ?.toLowerCase()
        .includes(searchLower) ||
      order._id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-[#111827] mb-2">
            Hoạt động của tôi
          </h2>
          <p className="text-sm text-gray-500">Quản lý các công việc của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition ${
                activeTab === "upcoming"
                  ? "bg-[#3730A3] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined align-middle text-[18px] mr-1">
                event
              </span>
              Sắp tới
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition ${
                activeTab === "history"
                  ? "bg-[#3730A3] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined align-middle text-[18px] mr-1">
                history
              </span>
              Lịch sử
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3730A3] focus:ring-2 focus:ring-[#3730A3]/10 transition"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              {activeTab === "upcoming" ? "event_busy" : "history"}
            </span>
            <p className="text-gray-500 font-medium">
              {searchTerm ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/tasker/order/${order._id}`)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {order.task_snapshot?.name ||
                        order.task_id?.task_name ||
                        "Dịch vụ"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2.5 py-1 ${getStatusBadgeClass(order.status)} text-[10px] font-bold rounded-full uppercase tracking-wide`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-lg font-bold text-[#3730A3]">
                      {formatCurrency(order.final_amount || order.base_amount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 border-t border-dashed border-gray-200 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                      schedule
                    </span>
                    <span>
                      {formatDateTime(order.scheduled_at || order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                      location_on
                    </span>
                    <span className="line-clamp-1">
                      {order.address_snapshot?.full_address ||
                        order.address_id?.full_address ||
                        "—"}
                    </span>
                  </div>
                  {order.customer && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">
                        person
                      </span>
                      <span>{order.customer.full_name || "Khách hàng"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskerActivity;
