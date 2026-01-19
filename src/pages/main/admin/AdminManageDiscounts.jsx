/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema } from "@/lib/schemas/adminSchemas";
import { discountService } from "@/lib/services/adminService";

const AdminManageDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    editingId: null,
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ show: false, message: "" });

  const form = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_discount: 0,
      start_date: "",
      end_date: "",
      status: "active",
    },
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 1600);
  };

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getAllDiscounts();
      if (data.success) {
        setDiscounts(data.discounts || []);
      }
    } catch (err) {
      console.error("Error loading discounts:", err);
      showToast("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (modal.mode === "add") {
        const result = await discountService.createDiscount(data);
        if (result.success) {
          showToast("Thêm khuyến mãi thành công!");
          await loadDiscounts();
          setModal({ open: false, mode: "add", editingId: null });
          form.reset();
        }
      } else {
        const result = await discountService.updateDiscount(modal.editingId, data);
        if (result.success) {
          showToast("Cập nhật khuyến mãi thành công!");
          await loadDiscounts();
          setModal({ open: false, mode: "add", editingId: null });
          form.reset();
        }
      }
    } catch (err) {
      console.error("Error saving discount:", err);
      showToast("Có lỗi xảy ra khi lưu khuyến mãi");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const data = await discountService.deleteDiscount(deleteModal.id);
      if (data.success) {
        showToast("Xóa khuyến mãi thành công!");
        await loadDiscounts();
      }
      setDeleteModal({ open: false, id: null });
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Có lỗi xảy ra khi xóa");
    }
  };

  const openModal = (mode, id = null) => {
    const discount =
      mode === "edit" ? discounts.find((d) => d._id === id) : null;

    form.reset({
      code: discount?.code || "",
      description: discount?.description || "",
      discount_type: discount?.discount_type || "percentage",
      discount_value: discount?.discount_value || 0,
      min_order_value: discount?.min_order_value || 0,
      max_discount: discount?.max_discount || 0,
      start_date: discount?.start_date?.split("T")[0] || "",
      end_date: discount?.end_date?.split("T")[0] || "",
      status: discount?.status || "active",
    });

    setModal({ open: true, mode, editingId: id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Danh sách khuyến mãi
        </h2>
        <button
          onClick={() => openModal("add")}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm khuyến mãi
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Mã
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Giá trị
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : discounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    discounts.map((discount) => (
                      <tr
                        key={discount._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {discount.code}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {discount.discount_type === "percentage"
                            ? "Phần trăm"
                            : "Cố định"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {discount.discount_type === "percentage"
                            ? `${discount.discount_value}%`
                            : `${Number(discount.discount_value).toLocaleString("vi-VN")}đ`}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {new Date(discount.start_date).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          -{" "}
                          {new Date(discount.end_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                              discount.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {discount.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openModal("edit", discount._id)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-xl">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({ open: true, id: discount._id })
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-xl">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Form Modal */}
      {modal.open && (
        <Modal
          title={modal.mode === "add" ? "Thêm khuyến mãi" : "Sửa khuyến mãi"}
          onClose={() => {
            setModal({ open: false, mode: "add", editingId: null });
            form.reset();
          }}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("code")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {form.formState.errors.code && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                {...form.register("description")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại
                </label>
                <select
                  {...form.register("discount_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentage">Phần trăm</option>
                  <option value="fixed">Cố định</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...form.register("discount_value")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {form.formState.errors.discount_value && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.discount_value.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn tối thiểu
                </label>
                <input
                  type="number"
                  {...form.register("min_order_value")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm tối đa
                </label>
                <input
                  type="number"
                  {...form.register("max_discount")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  {...form.register("start_date")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  {...form.register("end_date")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                {...form.register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setModal({ open: false, mode: "add", editingId: null });
                  form.reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Lưu
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <Modal
          title="Xác nhận xóa"
          onClose={() => setDeleteModal({ open: false, id: null })}
        >
          <p className="text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa khuyến mãi này?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteModal({ open: false, id: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        </Modal>
      )}

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default AdminManageDiscounts;
