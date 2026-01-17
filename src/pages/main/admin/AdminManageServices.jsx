/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  serviceSchema,
} from "@/lib/schemas/adminSchemas";
import {
  categoryService,
  taskService,
} from "@/lib/services/adminService";

const AdminManageServices = () => {
  const [tab, setTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [deleteContext, setDeleteContext] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [, setCategoryAvatarPreview] = useState(null);
  const [, setServiceAvatarPreview] = useState(null);

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_name: "",
      description: "",
      status: "active",
      avatar_url: "",
    },
  });

  const serviceForm = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      task_name: "",
      service_id: "",
      unit: "hour",
      pricing: 0,
      description: "",
      status: "active",
      avatar_url: "",
    },
  });

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      showToast("Không thể tải danh sách loại dịch vụ");
    }
  };

  const loadServices = async () => {
    try {
      const res = await taskService.getAllTasks();
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      console.error("Error loading services:", err);
      showToast("Không thể tải danh sách dịch vụ");
    }
  };

  const openCategoryModal = (mode, category = null) => {
    setModalMode(mode);
    setEditingId(category?._id || category?.id || null);

    if (category) {
      categoryForm.reset({
        category_name: category.category_name || "",
        description: category.description || "",
        status: category.status || "active",
        avatar_url: category.avatar_url || "",
      });
      setCategoryAvatarPreview(category.avatar_url || null);
    } else {
      categoryForm.reset({
        category_name: "",
        description: "",
        status: "active",
        avatar_url: "",
      });
      setCategoryAvatarPreview(null);
    }

    setShowCategoryModal(true);
  };

  const openServiceModal = (mode, service = null) => {
    setModalMode(mode);
    setEditingId(service?._id || service?.id || null);

    if (service) {
      serviceForm.reset({
        task_name: service.task_name || "",
        service_id: service.service_id?._id || service.service_id || "",
        unit: service.unit || "hour",
        pricing: service.pricing || service.price || 0,
        description: service.description || "",
        status: service.status || "active",
        avatar_url: service.avatar_url || "",
      });
      setServiceAvatarPreview(service.avatar_url || null);
    } else {
      serviceForm.reset({
        task_name: "",
        service_id: categories[0]?._id || categories[0]?.id || "",
        unit: "hour",
        pricing: 0,
        description: "",
        status: "active",
        avatar_url: "",
      });
      setServiceAvatarPreview(null);
    }

    setShowServiceModal(true);
  };

  // const handleCategoryAvatarChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 3 * 1024 * 1024) {
  //       showToast("File quá lớn. Vui lòng chọn file nhỏ hơn 3MB");
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       setCategoryAvatarPreview(event.target.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleServiceAvatarChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 3 * 1024 * 1024) {
  //       showToast("File quá lớn. Vui lòng chọn file nhỏ hơn 3MB");
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       setServiceAvatarPreview(event.target.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const onSubmitCategory = async (data) => {
    try {
      const payload = { ...data };

      if (modalMode === "add") {
        await categoryService.createCategory(payload);
        showToast("Thêm loại dịch vụ thành công");
      } else {
        await categoryService.updateCategory(editingId, payload);
        showToast("Cập nhật loại dịch vụ thành công");
      }

      setShowCategoryModal(false);
      loadCategories();
      loadServices();
    } catch (err) {
      console.error("Error saving category:", err);
      showToast("Có lỗi xảy ra khi lưu loại dịch vụ");
    }
  };

  const onSubmitService = async (data) => {
    try {
      const payload = { ...data };

      if (modalMode === "add") {
        await taskService.createTask(payload);
        showToast("Thêm dịch vụ thành công");
      } else {
        await taskService.updateTask(editingId, payload);
        showToast("Cập nhật dịch vụ thành công");
      }

      setShowServiceModal(false);
      loadServices();
    } catch (err) {
      console.error("Error saving service:", err);
      showToast("Có lỗi xảy ra khi lưu dịch vụ");
    }
  };

  const askDelete = (type, id) => {
    setDeleteContext({ type, id });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteContext) return;
    const { type, id } = deleteContext;

    try {
      if (type === "category") {
        await categoryService.deleteCategory(id);
        showToast("Xóa loại dịch vụ thành công");
        loadCategories();
        loadServices();
      } else {
        await taskService.deleteTask(id);
        showToast("Xóa dịch vụ thành công");
        loadServices();
      }
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Có lỗi xảy ra khi xóa");
    }
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  const unitLabel = (unit) => {
    if (unit === "hour") return "Giờ";
    if (unit === "job") return "Gói";
    return "Lần";
  };

  const getCategoryName = (id) => {
    if (!id) return "Không xác định";
    const cat = categories.find(
      (c) =>
        (c._id || c.id) === (id._id || id) ||
        String(c._id || c.id) === String(id),
    );
    return cat ? cat.category_name : "Không xác định";
  };

  // Filter logic
  const filteredCategories = categories.filter((cat) => {
    const matchSearch = cat.category_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredServices = services.filter((srv) => {
    const matchSearch = srv.task_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" ||
      (srv.service_id?._id || srv.service_id) === filterCategory;
    const matchStatus = filterStatus === "all" || srv.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const stats = {
    categories: categories.length,
    services: services.length,
    active: services.filter((s) => s.status === "active").length,
    inactive: services.filter((s) => s.status === "inactive").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">
                design_services
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Dịch vụ
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Loại dịch vụ</p>
            <p className="text-2xl font-bold text-slate-800">
              {stats.categories}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Tổng dịch vụ</p>
            <p className="text-2xl font-bold text-slate-800">
              {stats.services}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-500">Không hoạt động</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab("categories")}
              className={`px-6 py-3 font-medium transition ${
                tab === "categories"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Loại dịch vụ
            </button>
            <button
              onClick={() => setTab("services")}
              className={`px-6 py-3 font-medium transition ${
                tab === "services"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Dịch vụ
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {tab === "services" && (
                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả loại</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <button
                onClick={() =>
                  tab === "categories"
                    ? openCategoryModal("add")
                    : openServiceModal("add")
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                {tab === "categories" ? "Thêm loại dịch vụ" : "Thêm dịch vụ"}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        {tab === "categories" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Tên loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Mô tả
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
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-8 text-center text-slate-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr
                        key={cat._id || cat.id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-medium text-slate-800">
                          {cat.category_name}
                        </td>
                        <td className="p-4 text-slate-600">
                          {cat.description || "—"}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              cat.status === "active"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {cat.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openCategoryModal("edit", cat)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                askDelete("category", cat._id || cat.id)
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Table */}
        {tab === "services" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Tên dịch vụ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Đơn vị
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Giá
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
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((srv) => (
                      <tr
                        key={srv._id || srv.id}
                        className="border-b border-gray-50 hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-medium text-slate-800">
                          {srv.task_name}
                        </td>
                        <td className="p-4 text-slate-600">
                          {getCategoryName(srv.service_id)}
                        </td>
                        <td className="p-4 text-slate-600">
                          {unitLabel(srv.unit)}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800">
                          {formatMoney(srv.pricing || srv.price)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              srv.status === "active"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {srv.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openServiceModal("edit", srv)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Sửa"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                askDelete("service", srv._id || srv.id)
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {modalMode === "add"
                    ? "Thêm loại dịch vụ"
                    : "Sửa loại dịch vụ"}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên loại dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...categoryForm.register("category_name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {categoryForm.formState.errors.category_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {categoryForm.formState.errors.category_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  {...categoryForm.register("description")}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  {...categoryForm.register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="text"
                  {...categoryForm.register("avatar_url")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
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
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {modalMode === "add" ? "Thêm dịch vụ" : "Sửa dịch vụ"}
                </h3>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={serviceForm.handleSubmit(onSubmitService)}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...serviceForm.register("task_name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {serviceForm.formState.errors.task_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {serviceForm.formState.errors.task_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loại dịch vụ <span className="text-red-500">*</span>
                </label>
                <select
                  {...serviceForm.register("service_id")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {serviceForm.formState.errors.service_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {serviceForm.formState.errors.service_id.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Đơn vị
                  </label>
                  <select
                    {...serviceForm.register("unit")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hour">Giờ</option>
                    <option value="job">Gói</option>
                    <option value="time">Lần</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...serviceForm.register("pricing", {
                      valueAsNumber: true,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {serviceForm.formState.errors.pricing && (
                    <p className="text-red-500 text-sm mt-1">
                      {serviceForm.formState.errors.pricing.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  {...serviceForm.register("description")}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  {...serviceForm.register("status")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="text"
                  {...serviceForm.register("avatar_url")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full modal-animate">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-red-600">
                  delete
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Bạn có chắc chắn muốn xóa{" "}
                {deleteContext.type === "category" ? "loại dịch vụ" : "dịch vụ"}{" "}
                này không?
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

      {/* Toast Notification */}
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

export default AdminManageServices;
