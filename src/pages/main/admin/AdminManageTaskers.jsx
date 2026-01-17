import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { taskerManagementService } from "@/lib/services/adminService";

const AdminManageTaskers = () => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentTasker, setCurrentTasker] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approve' | 'reject'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  useEffect(() => {
    loadTaskers();
  }, []);

  const loadTaskers = async () => {
    try {
      setLoading(true);

      const response = await taskerManagementService.getAllTaskers();

      setTaskers(response.data || []);
    } catch (error) {
      console.error("Error loading taskers:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  const approveTasker = async (taskerId) => {
    try {
      await taskerManagementService.approveTasker(taskerId, {});

      toast.success("Duyệt thành công!");
      loadTaskers();
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error approving tasker:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const rejectTasker = async (taskerId) => {
    try {
      await taskerManagementService.rejectTasker(taskerId, {});

      toast.success("Đã từ chối Tasker!");
      loadTaskers();
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error rejecting tasker:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const updateTaskerStatus = async (taskerId, accountStatus, taskerStatus) => {
    try {
      await taskerManagementService.updateTasker(taskerId, {
        account_status: accountStatus,
        tasker_status: taskerStatus,
      });

      toast.success("Cập nhật thành công!");
      loadTaskers();
    } catch (error) {
      console.error("Error updating tasker:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleStatusChange = (taskerId, type, value) => {
    setTaskers((prev) =>
      prev.map((tasker) => {
        if (tasker._id === taskerId) {
          return {
            ...tasker,
            tempStatuses: {
              ...tasker.tempStatuses,
              [type]: value,
            },
          };
        }
        return tasker;
      }),
    );
  };

  const handleSaveChanges = (taskerId) => {
    const tasker = taskers.find((t) => t._id === taskerId);
    if (!tasker) return;

    const accountStatus =
      tasker.tempStatuses?.accountStatus ||
      tasker.user_id?.account_id?.status ||
      "inactive";
    const taskerStatus =
      tasker.tempStatuses?.taskerStatus || tasker.working_status || "pending";

    if (!confirm("Lưu các thay đổi trạng thái?")) return;

    updateTaskerStatus(taskerId, accountStatus, taskerStatus);
  };

  const openApprovalModal = (tasker, action) => {
    setCurrentTasker(tasker);
    setActionType(action);
    setShowApprovalModal(true);
  };

  const executeApprovalAction = () => {
    if (!currentTasker) return;

    if (actionType === "approve") {
      approveTasker(currentTasker._id);
    } else if (actionType === "reject") {
      rejectTasker(currentTasker._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">
                badge
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Tasker
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Kinh nghiệm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Giá/giờ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trạng thái tài khoản
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Trạng thái làm việc
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {taskers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    taskers.map((tasker) => {
                      const user = tasker.user_id || {};
                      const account = user.account_id || {};
                      const name =
                        user.full_name || account.email || "Không xác định";
                      const experience = `${tasker.working_year || 0} năm`;
                      const rate =
                        formatCurrency(tasker.hourly_rate || 0) + "/h";
                      const accStatus =
                        tasker.tempStatuses?.accountStatus ||
                        account.status ||
                        "inactive";
                      const workStatus =
                        tasker.tempStatuses?.taskerStatus ||
                        tasker.working_status ||
                        "pending";
                      const mainStatus = tasker.status || "pending";

                      return (
                        <tr
                          key={tasker._id}
                          className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 font-medium text-slate-800">
                            {name}
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {experience}
                          </td>
                          <td className="p-4 font-medium text-slate-800">
                            {rate}
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            <select
                              value={accStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  tasker._id,
                                  "accountStatus",
                                  e.target.value,
                                )
                              }
                              className="text-xs font-bold w-full px-3 py-1.5 rounded-lg border-none bg-slate-50 focus:ring-2 focus:ring-gray-200 cursor-pointer transition-all"
                            >
                              <option value="active">ACTIVE</option>
                              <option value="inactive">INACTIVE</option>
                              <option value="banned">BANNED</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            <select
                              value={workStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  tasker._id,
                                  "taskerStatus",
                                  e.target.value,
                                )
                              }
                              className="text-xs font-bold w-full px-3 py-1.5 min-w-42.5 rounded-lg border-none bg-slate-50 focus:ring-2 focus:ring-gray-200 cursor-pointer transition-all"
                            >
                              <option value="pending">ĐANG CHỜ</option>
                              <option value="available">ĐANG RẢNH</option>
                              <option value="busy">ĐANG BẬN</option>
                              <option value="inactive">KHÔNG HOẠT ĐỘNG</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                title="Xem chi tiết"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined">
                                  visibility
                                </span>
                              </button>

                              {mainStatus === "pending" ? (
                                <>
                                  <button
                                    onClick={() =>
                                      openApprovalModal(tasker, "approve")
                                    }
                                    title="Chấp nhận"
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  >
                                    <span className="material-symbols-outlined">
                                      verified
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      openApprovalModal(tasker, "reject")
                                    }
                                    title="Từ chối"
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <span className="material-symbols-outlined">
                                      cancel
                                    </span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleSaveChanges(tasker._id)}
                                  title="Lưu thay đổi"
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined">
                                    save
                                  </span>
                                </button>
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
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && currentTasker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full modal-animate">
            <div className="p-6 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  actionType === "approve" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    actionType === "approve" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {actionType === "approve" ? "verified" : "cancel"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {actionType === "approve"
                  ? "Xác nhận duyệt Tasker?"
                  : "Xác nhận từ chối?"}
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                <strong>
                  {currentTasker.user_id?.full_name ||
                    currentTasker.user_id?.account_id?.email}
                </strong>
              </p>
              <p className="text-slate-500 text-xs mb-6">
                {actionType === "approve"
                  ? "Tasker sẽ được phê duyệt và có thể bắt đầu làm việc."
                  : "Tasker sẽ bị từ chối và không thể hoạt động trên hệ thống."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-200 text-slate-700 font-semibold hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={executeApprovalAction}
                  className={`flex-1 py-2.5 rounded-lg text-white font-semibold shadow-lg transition ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionType === "approve" ? "Duyệt ngay" : "Từ chối"}
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
      `}</style>
    </div>
  );
};

export default AdminManageTaskers;
