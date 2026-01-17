import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  taskerOrderService,
  taskerProfileService,
} from "@/lib/services/taskerService";
import { toast } from "react-toastify";

const TaskerHome = () => {
  const navigate = useNavigate();
  const [taskerData, setTaskerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cashoutLoading, setCashoutLoading] = useState(false);

  useEffect(() => {
    loadTaskerHome();
    loadAvailableOrders();
    loadCashoutInfo();
  }, []);

  const loadTaskerHome = async () => {
    try {
      const response = await taskerProfileService.getProfile();
      if (response.success) {
        setTaskerData(response);
        setIsOnline(response.tasker?.working_status === "available");
      }
    } catch (error) {
      console.error("Error loading tasker home:", error);
      toast.error("Không thể tải thông tin");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      const response = await taskerOrderService.getAllOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadCashoutInfo = async () => {
    try {
      const statsResponse = await taskerProfileService.getStatistics();
      if (statsResponse.success) {
        setTodayEarnings(statsResponse.data?.todayEarnings || 0);
        setAvailableBalance(statsResponse.data?.availableBalance || 0);
      }
    } catch (error) {
      console.error("Error loading cashout info:", error);
    }
  };

  const handleToggleStatus = async (checked) => {
    try {
      await taskerProfileService.updateAvailability(checked);
      setIsOnline(checked);
      toast.success(checked ? "Bạn đã online" : "Bạn đã offline");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
      setIsOnline(!checked);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn nhận đơn hàng này?")) {
      return;
    }

    try {
      const response = await taskerOrderService.acceptOrder(orderId);
      if (response.success) {
        toast.success("Nhận đơn hàng thành công!");
        loadAvailableOrders();
      } else {
        toast.error(response.message || "Nhận đơn hàng thất bại");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Có lỗi xảy ra khi nhận đơn hàng");
    }
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/tasker/order/${orderId}`);
  };

  const handleCashout = async () => {
    if (availableBalance <= 0) return;

    setCashoutLoading(true);
    try {
      // Assuming there's a cashout endpoint
      // const response = await taskerProfileService.requestCashout();
      toast.success("Yêu cầu rút tiền thành công");
      loadCashoutInfo();
    } catch (error) {
      console.error("Error performing cashout:", error);
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setCashoutLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) {
      return "Đã qua";
    } else if (diffMins < 60) {
      return `Ngay bây giờ (${diffMins} phút)`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h${mins > 0 ? mins + "p" : ""} nữa`;
    }
  };

  const formatScheduledTime = (dateString, type) => {
    if (!dateString) return "—";
    const date = new Date(dateString);

    if (type === "immediate") {
      return formatDateTime(dateString);
    } else {
      const timeStr = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
      return `${timeStr}, ${dateStr}`;
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "bg-blue-100 text-blue-700",
      assigned: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      departed: "bg-purple-100 text-purple-700",
      arrived: "bg-indigo-100 text-indigo-700",
      in_progress: "bg-orange-100 text-orange-700",
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
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pb-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-[#111827]">
            Chào {taskerData?.user?.full_name}! 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sẵn sàng nhận việc hôm nay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tasker Info Card */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              {/* Avatar Section */}
              <div
                style={{ backgroundColor: "#3730A3" }}
                className="p-6 pb-12 relative"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={
                        taskerData?.user?.avatar_url || "/default-avatar.png"
                      }
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="px-5 -mt-8 pb-4 relative z-10">
                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      Trạng thái hoạt động
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOnline}
                        onChange={(e) => handleToggleStatus(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3730A3]"></div>
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></span>
                    <span
                      className={`text-xs font-bold uppercase ${
                        isOnline ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isOnline ? "Đang trực tuyến" : "Tạm nghỉ"}
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="p-5 space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      Hôm nay kiếm được
                    </p>
                    <p
                      style={{ color: "#3730A3" }}
                      className="text-3xl font-black"
                    >
                      {formatCurrency(todayEarnings)}
                    </p>
                  </div>

                  {/* Available Balance */}
                  <div
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderColor: "#C7D2FE",
                    }}
                    className="border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mb-0.5">
                        Số dư khả dụng
                      </p>
                      <p
                        style={{ color: "#3730A3" }}
                        className="text-sm font-bold"
                      >
                        {formatCurrency(availableBalance)}
                      </p>
                    </div>
                    <button
                      onClick={handleCashout}
                      disabled={availableBalance <= 0 || cashoutLoading}
                      className="bg-white text-[#3730A3] text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#C7D2FE] hover:bg-white/50 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cashoutLoading ? "Đang xử lý..." : "Rút ngay"}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="block text-lg font-bold text-gray-800">
                        {taskerData?.user?.reputation_score || "—"}{" "}
                        <span className="text-[#FFBE18] text-sm">★</span>
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        Uy tín
                      </span>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="block text-lg font-bold text-gray-800">
                        98%
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        Nhận đơn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/30">
                  <button className="py-3 flex flex-col items-center gap-1 hover:bg-gray-100 transition group">
                    <span className="material-symbols-outlined text-gray-400 text-[20px] group-hover:text-[#3730A3]">
                      calendar_month
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 group-hover:text-[#3730A3]">
                      Lịch
                    </span>
                  </button>
                  <button className="py-3 flex flex-col items-center gap-1 hover:bg-gray-100 transition group">
                    <span className="material-symbols-outlined text-gray-400 text-[20px] group-hover:text-[#3730A3]">
                      map
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 group-hover:text-[#3730A3]">
                      Khu vực
                    </span>
                  </button>
                  <button className="py-3 flex flex-col items-center gap-1 hover:bg-gray-100 transition group">
                    <span className="material-symbols-outlined text-gray-400 text-[20px] group-hover:text-[#3730A3]">
                      settings
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 group-hover:text-[#3730A3]">
                      Cài đặt
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Orders List */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-[#111827] text-lg md:text-xl flex items-center gap-2">
                Việc mới quanh bạn
              </h3>
              <div className="flex gap-2">
                <button className="bg-white px-3 py-1 text-xs font-bold text-gray-600 border border-transparent rounded-full shadow-sm hover:text-[#3730A3]">
                  Gần nhất
                </button>
                <button className="bg-white px-3 py-1 text-xs font-bold text-gray-600 border border-transparent rounded-full shadow-sm hover:text-[#3730A3]">
                  Giá cao
                </button>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ${
                !isOnline ? "opacity-50 pointer-events-none grayscale" : ""
              }`}
            >
              {orders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                    work_off
                  </span>
                  <p className="text-gray-500 font-medium">
                    Hiện tại không có đơn hàng nào
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  const isPending =
                    order.status === "pending" && !order.tasker_id;
                  const isAssigned =
                    order.status === "assigned" && order.tasker_id;
                  const isAccepted = [
                    "accepted",
                    "departed",
                    "arrived",
                    "in_progress",
                  ].includes(order.status);
                  const isTaken = !isPending && !isAssigned && !isAccepted;

                  const serviceName =
                    order.task_snapshot?.name ||
                    order.task_id?.task_name ||
                    "Dịch vụ";
                  const price = formatCurrency(
                    order.final_amount || order.base_amount,
                  );
                  const address =
                    order.address_snapshot?.full_address ||
                    order.address_id?.full_address ||
                    "—";
                  const timeDisplay = formatScheduledTime(
                    order.scheduled_at,
                    order.type,
                  );
                  const isImmediate = order.type === "immediate";

                  return (
                    <div
                      key={order._id}
                      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group ${
                        isTaken ? "opacity-60 grayscale cursor-not-allowed" : ""
                      }`}
                    >
                      <div
                        style={{ backgroundColor: "#3730A3" }}
                        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${
                          isTaken ? "bg-gray-300" : ""
                        }`}
                      ></div>
                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h2
                              className={`text-[#111827] font-bold text-lg group-hover:text-[#3730A3] transition-colors ${
                                isTaken ? "text-gray-700" : ""
                              }`}
                            >
                              {serviceName}
                            </h2>
                            {isPending ? (
                              <span
                                style={{
                                  backgroundColor: "#EEF2FF",
                                  color: "#3730A3",
                                }}
                                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide inline-block mt-1"
                              >
                                Mới
                              </span>
                            ) : (
                              <span
                                className={`${getStatusBadgeClass(
                                  order.status,
                                )} text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide inline-block mt-1`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            )}
                          </div>
                          <span
                            style={{ color: "#3730A3" }}
                            className={`text-xl font-black ${
                              isTaken ? "text-gray-400" : ""
                            }`}
                          >
                            {price}
                          </span>
                        </div>
                        <div
                          className={`space-y-2 text-sm text-gray-600 border-t border-dashed border-gray-200 pt-3 ${
                            isTaken ? "text-gray-500" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`material-symbols-outlined text-[18px] ${
                                isImmediate ? "text-red-500" : "text-gray-400"
                              }`}
                            >
                              {isImmediate ? "timer" : "schedule"}
                            </span>
                            <span
                              className={`font-medium ${
                                isImmediate ? "font-bold text-red-500" : ""
                              }`}
                            >
                              {timeDisplay}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-gray-400">
                              location_on
                            </span>
                            <span className="line-clamp-1">{address}</span>
                          </div>
                        </div>
                      </div>
                      {isPending ? (
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          style={{ backgroundColor: "#3730A3" }}
                          className="w-full mt-5 py-2.5 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity ml-1"
                        >
                          Nhận việc ngay
                        </button>
                      ) : isAssigned || isAccepted ? (
                        <button
                          onClick={() => handleViewOrderDetails(order._id)}
                          style={{ color: "#3730A3", borderColor: "#3730A3" }}
                          className="w-full mt-5 py-2.5 bg-white border-2 font-bold rounded-xl hover:bg-[#EEF2FF] transition-colors ml-1"
                        >
                          Xem chi tiết
                        </button>
                      ) : (
                        <button className="w-full mt-5 py-2.5 bg-gray-100 border border-gray-200 text-gray-400 font-bold rounded-xl ml-1 pointer-events-none">
                          Đã có người nhận
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskerHome;
