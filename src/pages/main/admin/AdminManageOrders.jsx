import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { orderUpdateSchema } from "@/lib/schemas/adminSchemas";
import { orderManagementService } from "@/lib/services/adminService";

const AdminManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(orderUpdateSchema),
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await orderManagementService.getAllOrders();

      setOrders(response.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, data) => {
    try {
      await orderManagementService.updateOrder(orderId, data);

      toast.success("Cập nhật thành công!");
      loadOrders();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        text: "Chờ xác nhận",
        class: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      confirmed: {
        text: "Đã xác nhận",
        class: "bg-blue-100 text-blue-700 border-blue-200",
      },
      in_progress: {
        text: "Đang thực hiện",
        class: "bg-purple-100 text-purple-700 border-purple-200",
      },
      completed: {
        text: "Hoàn thành",
        class: "bg-green-100 text-green-700 border-green-200",
      },
      cancelled: {
        text: "Đã hủy",
        class: "bg-red-100 text-red-700 border-red-200",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const openDetailModal = (order) => {
    setCurrentOrder(order);
    reset({ status: order.status });
    setShowDetailModal(true);
  };

  const onSubmit = (data) => {
    if (currentOrder) {
      updateOrderStatus(currentOrder._id, data);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_id?.user_id?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">
                shopping_bag
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Đơn hàng
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn hàng hoặc khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {[
                { value: "all", label: "Tất cả" },
                { value: "pending", label: "Chờ xác nhận" },
                { value: "confirmed", label: "Đã xác nhận" },
                { value: "in_progress", label: "Đang thực hiện" },
                { value: "completed", label: "Hoàn thành" },
                { value: "cancelled", label: "Đã hủy" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterStatus === filter.value
                      ? "bg-slate-800 text-white"
                      : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Tasker
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-8 text-center text-slate-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const badge = getStatusBadge(order.status);

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-slate-800">
                            {order.order_code}
                          </td>
                          <td className="p-4 font-medium text-slate-700">
                            {order.customer_id?.user_id?.full_name || "N/A"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {order.tasker_id?.user_id?.full_name || "Chưa có"}
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="p-4 text-right font-bold text-slate-800">
                            {formatCurrency(order.total_amount || 0)}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.class}`}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openDetailModal(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined">
                                visibility
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  Chi tiết đơn hàng
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mã đơn hàng</p>
                  <p className="font-bold text-slate-800 font-mono">
                    {currentOrder.order_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                  <p className="font-medium text-slate-800">
                    {formatDate(currentOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-800">
                    {currentOrder.customer_id?.user_id?.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tasker</p>
                  <p className="font-medium text-slate-800">
                    {currentOrder.tasker_id?.user_id?.full_name || "Chưa có"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Tổng tiền</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(currentOrder.total_amount || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  {...register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="in_progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .modal-animate { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminManageOrders;
