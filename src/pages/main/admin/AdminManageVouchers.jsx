/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voucherSchema } from "@/lib/schemas/adminSchemas";
import { voucherManagementService } from "@/lib/services/adminService";

const AdminManageVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit' | 'view'
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      begin_date: "",
      end_date: "",
      discountType: "PERCENT",
      discountValue: 0,
      maxDiscount: 0,
      total_quantity: 1,
      per_user_limit: 1,
      rule_type: "all",
      min_order_value: 0,
    },
  });

  const discountType = watch("discountType");

  useEffect(() => {
    loadServices();
    loadVouchers();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const loadServices = async () => {
    try {
      const res = await voucherManagementService.getActiveServices();
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const loadVouchers = async () => {
    try {
      const res = await voucherManagementService.getAllVouchers();
      setVouchers(res.data || []);
    } catch (err) {
      console.error("Error loading vouchers:", err);
      showToast("Không thể tải danh sách voucher");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      upcoming: "bg-yellow-100 text-yellow-700 border-yellow-200",
      ongoing: "bg-green-100 text-green-700 border-green-200",
      finished: "bg-gray-100 text-gray-700 border-gray-200",
    };
    const statusText = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang hoạt động",
      finished: "Đã kết thúc",
    };
    return {
      class: statusMap[status] || statusMap.finished,
      text: statusText[status] || "Đã kết thúc",
    };
  };

  const getDiscountDisplay = (discount) => {
    if (!discount) return "—";
    if (discount.type === "PERCENT") {
      return `${discount.value}%${discount.max_discount ? ` (tối đa ${discount.max_discount.toLocaleString("vi-VN")}đ)` : ""}`;
    }
    return `${discount.value.toLocaleString("vi-VN")}đ`;
  };

  const openVoucherModal = async (mode, voucher = null) => {
    setModalMode(mode);
    setEditingId(voucher?._id || null);

    if (mode === "edit" || mode === "view") {
      // Load voucher details
      try {
        const res = await voucherManagementService.getVoucherById(voucher._id);
        const data = res.data;

        reset({
          code: data.code || "",
          name: data.name || "",
          description: data.description || "",
          begin_date: formatDateForInput(data.begin_date),
          end_date: formatDateForInput(data.end_date),
          discountType: data.discount?.type || "PERCENT",
          discountValue: data.discount?.value || 0,
          maxDiscount: data.discount?.max_discount || 0,
          total_quantity: data.total_quantity || 1,
          per_user_limit: data.per_user_limit || 1,
          rule_type: data.conditions?.rule_type || "all",
          min_order_value: data.conditions?.min_order_value || 0,
        });

        setSelectedModels(data.applicable_model || []);
      } catch (err) {
        console.error("Error loading voucher:", err);
      }
    } else {
      reset({
        code: "",
        name: "",
        description: "",
        begin_date: "",
        end_date: "",
        discountType: "PERCENT",
        discountValue: 0,
        maxDiscount: 0,
        total_quantity: 1,
        per_user_limit: 1,
        rule_type: "all",
        min_order_value: 0,
      });
      setSelectedModels([]);
    }

    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const discount = {
        type: data.discountType,
        value: data.discountValue,
      };
      if (data.discountType === "PERCENT" && data.maxDiscount) {
        discount.max_discount = data.maxDiscount;
      }

      const conditions = {
        rule_type: data.rule_type,
        min_order_value: data.min_order_value,
      };

      const payload = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        begin_date: data.begin_date,
        end_date: data.end_date,
        discount,
        total_quantity: data.total_quantity,
        per_user_limit: data.per_user_limit,
        conditions,
        applicable_model:
          selectedModels.length > 0 ? selectedModels : undefined,
      };

      if (modalMode === "add") {
        await voucherManagementService.createVoucher(payload);
        showToast("Thêm voucher thành công");
      } else {
        await voucherManagementService.updateVoucher(editingId, payload);
        showToast("Cập nhật voucher thành công");
      }

      setShowModal(false);
      loadVouchers();
    } catch (err) {
      console.error("Error saving voucher:", err);
      showToast(err.response?.data?.message || "Có lỗi xảy ra khi lưu voucher");
    }
  };

  const askDeleteVoucher = (id, code) => {
    setDeleteId({ id, code });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await voucherManagementService.deleteVoucher(deleteId.id);
      showToast("Xóa voucher thành công");
      setShowDeleteModal(false);
      loadVouchers();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      showToast("Có lỗi xảy ra khi xóa voucher");
    }
  };

  const toggleModel = (modelId) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const toggleService = (serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;

    const taskIds = service.tasks
      .filter((t) => t.status === "active")
      .map((t) => t._id);
    const allSelected = taskIds.every((id) => selectedModels.includes(id));

    if (allSelected) {
      // Deselect all tasks and service
      setSelectedModels((prev) =>
        prev.filter((id) => id !== serviceId && !taskIds.includes(id)),
      );
    } else {
      // Select service and all tasks
      setSelectedModels((prev) => {
        const newModels = [...prev];
        if (!newModels.includes(serviceId)) newModels.push(serviceId);
        taskIds.forEach((id) => {
          if (!newModels.includes(id)) newModels.push(id);
        });
        return newModels;
      });
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
                local_activity
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Voucher
              </h1>
            </div>
            <button
              onClick={() => openVoucherModal("add")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Thêm voucher
            </button>
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Mã
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Tên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Giảm giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                    Số lượng
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
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Không có voucher nào
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => {
                    const badge = getStatusBadge(voucher.status);
                    return (
                      <tr
                        key={voucher._id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-mono font-bold text-slate-800">
                          {voucher.code}
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                          {voucher.name}
                        </td>
                        <td className="p-4 text-slate-600">
                          {getDiscountDisplay(voucher.discount)}
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          <div>{formatDate(voucher.begin_date)}</div>
                          <div>→ {formatDate(voucher.end_date)}</div>
                        </td>
                        <td className="p-4 text-center text-slate-600">
                          {voucher.used_quantity || 0} /{" "}
                          {voucher.total_quantity}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.class}`}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openVoucherModal("view", voucher)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                visibility
                              </span>
                            </button>
                            <button
                              onClick={() => openVoucherModal("edit", voucher)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                askDeleteVoucher(voucher._id, voucher.code)
                              }
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-animate">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {modalMode === "add"
                    ? "Thêm voucher"
                    : modalMode === "view"
                      ? "Chi tiết voucher"
                      : "Sửa voucher"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mã voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  disabled={modalMode === "view"}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("begin_date")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.begin_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.begin_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("end_date")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Loại giảm giá
                  </label>
                  <select
                    {...register("discountType")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá trị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("discountValue", { valueAsNumber: true })}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.discountValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.discountValue.message}
                    </p>
                  )}
                </div>

                {discountType === "PERCENT" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Giảm tối đa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("maxDiscount", { valueAsNumber: true })}
                      disabled={modalMode === "view"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.maxDiscount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.maxDiscount.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tổng số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("total_quantity", { valueAsNumber: true })}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.total_quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.total_quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giới hạn/người <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("per_user_limit", { valueAsNumber: true })}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.per_user_limit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.per_user_limit.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Điều kiện
                  </label>
                  <select
                    {...register("rule_type")}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả đơn hàng</option>
                    <option value="min_order">Giá trị đơn tối thiểu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá trị đơn tối thiểu
                  </label>
                  <input
                    type="number"
                    {...register("min_order_value", { valueAsNumber: true })}
                    disabled={modalMode === "view"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Applicable Services */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Áp dụng cho dịch vụ
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Không có dịch vụ nào
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service) => {
                        const activeTasks = service.tasks.filter(
                          (task) => task.status === "active",
                        );
                        if (activeTasks.length === 0) return null;

                        const serviceSelected = selectedModels.includes(
                          service._id,
                        );
                        const allTasksSelected = activeTasks.every((task) =>
                          selectedModels.includes(task._id),
                        );

                        return (
                          <div
                            key={service._id}
                            className="border border-gray-200 rounded-lg p-3 bg-white"
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={serviceSelected || allTasksSelected}
                                onChange={() => toggleService(service._id)}
                                disabled={modalMode === "view"}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-semibold text-sm text-gray-800">
                                {service.category_name}
                              </span>
                            </label>
                            <div className="ml-6 mt-2 space-y-1">
                              {activeTasks.map((task) => (
                                <label
                                  key={task._id}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedModels.includes(task._id)}
                                    onChange={() => toggleModel(task._id)}
                                    disabled={modalMode === "view"}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {task.task_name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {modalMode !== "view" && (
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-slate-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {modalMode === "add" ? "Thêm" : "Cập nhật"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full modal-animate">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-red-600">
                  delete
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Xóa voucher "{deleteId.code}"?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-200 text-slate-700 font-semibold hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 modal-animate">
          {toast.message}
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

export default AdminManageVouchers;
