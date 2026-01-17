import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { customerManagementService } from "@/lib/services/adminService";

const AdminManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await customerManagementService.getAllCustomers();

      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId, status) => {
    try {
      await customerManagementService.updateCustomer(customerId, { status });

      toast.success("Cập nhật thành công!");
      loadCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      customer.user_id?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.user_id?.account_id?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      customer.user_id?.account_id?.status === filterStatus;
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
                person
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Quản lý Khách hàng
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
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
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
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Số điện thoại
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
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const user = customer.user_id || {};
                      const account = user.account_id || {};

                      return (
                        <tr
                          key={customer._id}
                          className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 font-medium text-slate-800">
                            {user.full_name || "N/A"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {account.email || "N/A"}
                          </td>
                          <td className="p-4 text-slate-600">
                            {user.phone || "N/A"}
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={account.status || "inactive"}
                              onChange={(e) =>
                                updateCustomerStatus(
                                  customer._id,
                                  e.target.value,
                                )
                              }
                              className="text-xs font-bold px-3 py-1.5 rounded-lg border-none bg-slate-50 focus:ring-2 focus:ring-gray-200 cursor-pointer"
                            >
                              <option value="active">ACTIVE</option>
                              <option value="inactive">INACTIVE</option>
                              <option value="banned">BANNED</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
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
    </div>
  );
};

export default AdminManageCustomers;
