/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { invoiceService } from "@/lib/services/adminService";

const AdminManageInvoices = () => {
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const itemsPerPage = 8;

  const getToken = () => localStorage.getItem("token");

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

  const mapStatus = (backendStatus) => {
    switch (backendStatus) {
      case "success":
        return "paid";
      case "pending":
        return "unpaid";
      default:
        return backendStatus;
    }
  };

  const mapMethodName = (method) => {
    const map = {
      cash: "Tiền mặt",
      credit_card: "Thẻ tín dụng",
      bank_transfer: "Chuyển khoản",
      ewallet: "Ví điện tử",
    };
    return map[method] || method;
  };

  const getStatusBadge = (status) => {
    const map = {
      paid: { text: "Đã thanh toán", class: "badge-paid" },
      unpaid: { text: "Chờ thanh toán", class: "badge-unpaid" },
      refunded: { text: "Đã hoàn tiền", class: "badge-refunded" },
      failed: { text: "Thất bại/Hủy", class: "badge-failed" },
    };
    return map[status] || { text: status, class: "bg-gray-100" };
  };

  const getMethodIcon = (method) => {
    if (method.includes("Tiền mặt")) return "attach_money";
    if (
      method.includes("Ví") ||
      method.includes("Momo") ||
      method.includes("Zalo")
    )
      return "smartphone";
    if (method.includes("Thẻ") || method.includes("Chuyển khoản"))
      return "credit_card";
    return "payments";
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [currentFilter, searchTerm, allInvoices]);

  const fetchInvoices = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        window.location.href = "/login";
        return;
      }

      const response = await invoiceService.getAllInvoices();

      const rawData = response.data.data;
      const invoices = rawData.map((item) => {
        const order = item.order_id || {};
        return {
          id: item._id,
          code: item.receipt_code || "N/A",
          orderRef: order.order_code || "N/A",
          customer:
            order.customer_id?.user_id?.full_name ||
            order.customer_id?.user_id?.account_id?.email ||
            "Không rõ",
          date: formatDate(item.createdAt),
          method: mapMethodName(item.payment_method),
          amount: item.total_amount || 0,
          status: mapStatus(item.status),
        };
      });

      setAllInvoices(invoices);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
    }
  };

  const applyFilter = () => {
    const term = searchTerm.toLowerCase();

    const filtered = allInvoices.filter((inv) => {
      let matchStatus = true;
      if (currentFilter !== "all") {
        matchStatus = inv.status === currentFilter;
      }

      const matchSearch =
        inv.code.toLowerCase().includes(term) ||
        inv.customer.toLowerCase().includes(term) ||
        inv.orderRef.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  };

  const updateInvoiceStatus = async (id, newStatus) => {
    try {
      await invoiceService.updateInvoice(id, { status: newStatus });

      toast.success("Cập nhật trạng thái thành công!");
      await fetchInvoices();
      setShowConfirmModal(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật.",
      );
    }
  };

  const markInvoiceAsPaid = async (id) => {
    try {
      await invoiceService.refundInvoice(id);

      toast.success("Xác nhận thanh toán thành công!");
      await fetchInvoices();
      setShowConfirmModal(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xác nhận thanh toán.",
      );
    }
  };

  const openDetailModal = (id) => {
    const invoice = allInvoices.find((i) => i.id === id);
    if (invoice) {
      setCurrentInvoice(invoice);
      setShowDetailModal(true);
    }
  };

  const openConfirmModal = (id, action) => {
    const invoice = allInvoices.find((i) => i.id === id);
    if (invoice) {
      setCurrentInvoice(invoice);
      setActionType(action);
      setShowConfirmModal(true);
    }
  };

  const executeAction = async () => {
    if (!currentInvoice) return;

    if (actionType === "paid") {
      await markInvoiceAsPaid(currentInvoice.id);
      return;
    }

    let backendStatus = "";
    if (actionType === "refund") backendStatus = "refunded";
    if (actionType === "failed") backendStatus = "failed";

    if (backendStatus) {
      await updateInvoiceStatus(currentInvoice.id, backendStatus);
    }
  };

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">
                payments
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Hóa đơn
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Filter and Search */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm mã hóa đơn, đơn hàng hoặc khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Tất cả" },
                { value: "unpaid", label: "Chờ thanh toán" },
                { value: "paid", label: "Đã thanh toán" },
                { value: "refunded", label: "Đã hoàn tiền" },
                { value: "failed", label: "Thất bại" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCurrentFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    currentFilter === filter.value
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Mã hóa đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">
                      Không tìm thấy hóa đơn nào.
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => {
                    const badge = getStatusBadge(item.status);
                    const methodIcon = getMethodIcon(item.method);

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-slate-400 font-medium">
                          {startIndex + index + 1}
                        </td>
                        <td className="p-4">
                          <div
                            className="font-bold text-slate-700 hover:text-indigo-600 cursor-pointer font-mono"
                            onClick={() => openDetailModal(item.id)}
                          >
                            {item.code}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.orderRef}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                          {item.customer}
                        </td>
                        <td className="p-4 text-slate-500 text-xs">
                          {item.date}
                        </td>
                        <td className="p-4 text-slate-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            {methodIcon}
                          </span>
                          {item.method}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${badge.class}`}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openDetailModal(item.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                visibility
                              </span>
                            </button>

                            {item.status === "paid" && (
                              <button
                                onClick={() =>
                                  openConfirmModal(item.id, "refund")
                                }
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                title="Hoàn tiền"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  undo
                                </span>
                              </button>
                            )}

                            {item.status === "unpaid" && (
                              <>
                                <button
                                  onClick={() =>
                                    openConfirmModal(item.id, "paid")
                                  }
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Xác nhận thanh toán"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    check_circle
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    openConfirmModal(item.id, "failed")
                                  }
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                                  title="Hủy bỏ"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    block
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Hiển thị {currentPageData.length} / {filteredInvoices.length}{" "}
                hóa đơn
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        page === currentPage
                          ? "bg-slate-800 text-white"
                          : "bg-white border border-gray-200 text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && currentInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  Chi tiết hóa đơn
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mã hóa đơn</p>
                  <p className="font-bold text-slate-800 font-mono">
                    {currentInvoice.code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mã đơn hàng</p>
                  <p className="font-bold text-slate-800 font-mono">
                    {currentInvoice.orderRef}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-800">
                    {currentInvoice.customer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                  <p className="font-medium text-slate-800">
                    {currentInvoice.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Phương thức thanh toán
                  </p>
                  <p className="font-medium text-slate-800">
                    {currentInvoice.method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(currentInvoice.status).class}`}
                  >
                    {getStatusBadge(currentInvoice.status).text}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(currentInvoice.amount)}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              {currentInvoice.status === "paid" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openConfirmModal(currentInvoice.id, "refund");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Hoàn tiền
                </button>
              )}
              {currentInvoice.status === "unpaid" && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openConfirmModal(currentInvoice.id, "paid");
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Xác nhận thanh toán
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openConfirmModal(currentInvoice.id, "failed");
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                  >
                    Hủy bỏ
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full modal-animate">
            <div className="p-6 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  actionType === "refund"
                    ? "bg-purple-100"
                    : actionType === "failed"
                      ? "bg-red-100"
                      : "bg-green-100"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {actionType === "refund"
                    ? "undo"
                    : actionType === "failed"
                      ? "block"
                      : "check_circle"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {actionType === "refund"
                  ? "Xác nhận hoàn tiền?"
                  : actionType === "failed"
                    ? "Xác nhận hủy bỏ?"
                    : "Xác nhận thanh toán?"}
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                {actionType === "refund"
                  ? "Trạng thái hóa đơn sẽ chuyển thành 'Đã hoàn tiền'."
                  : actionType === "failed"
                    ? "Trạng thái hóa đơn sẽ chuyển thành 'Thất bại/Hủy'."
                    : "Trạng thái hóa đơn sẽ chuyển thành 'Đã thanh toán'."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-200 text-slate-700 font-semibold hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 py-2.5 rounded-lg text-white font-semibold shadow-lg transition ${
                    actionType === "refund"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : actionType === "failed"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionType === "refund"
                    ? "Hoàn tiền ngay"
                    : actionType === "failed"
                      ? "Hủy bỏ"
                      : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .modal-animate { animation: fadeIn 0.2s ease-out forwards; }
        .badge-paid { background-color: #DCFCE7; color: #166534; }
        .badge-unpaid { background-color: #FEF9C3; color: #854D0E; }
        .badge-refunded { background-color: #F3E8FF; color: #6B21A8; }
        .badge-failed { background-color: #FEE2E2; color: #991B1B; }
      `}</style>
    </div>
  );
};

export default AdminManageInvoices;
