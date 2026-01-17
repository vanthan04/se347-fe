import { useState, useEffect } from "react";
import { adminStatsService } from "@/lib/services/adminService";

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTaskers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeTaskers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics - adjust endpoints based on your API
      const [customersRes, taskersRes, ordersRes] = await Promise.all([
        adminStatsService.getCustomerCount().catch(() => ({ count: 0 })),
        adminStatsService.getTaskerCount().catch(() => ({ count: 0 })),
        adminStatsService
          .getOrderStats()
          .catch(() => ({ total: 0, revenue: 0, pending: 0 })),
      ]);

      setStats({
        totalCustomers: customersRes.count || 0,
        totalTaskers: taskersRes.count || 0,
        totalOrders: ordersRes.total || 0,
        totalRevenue: ordersRes.revenue || 0,
        pendingOrders: ordersRes.pending || 0,
        activeTaskers: taskersRes.active || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statCards = [
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers,
      icon: "person",
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Tổng Tasker",
      value: stats.totalTaskers,
      icon: "badge",
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders,
      icon: "shopping_bag",
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: "payments",
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      title: "Đơn hàng chờ",
      value: stats.pendingOrders,
      icon: "pending",
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      title: "Tasker hoạt động",
      value: stats.activeTaskers,
      icon: "verified",
      color: "teal",
      bgColor: "bg-teal-100",
      textColor: "text-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">
                home
              </span>
              <h1 className="text-xl font-bold text-slate-800">
                Dashboard Admin
              </h1>
            </div>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}
                    >
                      <span
                        className={`material-symbols-outlined text-2xl ${card.textColor}`}
                      >
                        {card.icon}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/admin/customers"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-blue-600">
                    person_add
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                    Quản lý Customers
                  </span>
                </a>
                <a
                  href="/admin/taskers"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-green-600">
                    badge
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-green-600">
                    Quản lý Taskers
                  </span>
                </a>
                <a
                  href="/admin/orders"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-purple-600">
                    shopping_bag
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-purple-600">
                    Quản lý Đơn hàng
                  </span>
                </a>
                <a
                  href="/admin/services"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-orange-600">
                    design_services
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600">
                    Quản lý Dịch vụ
                  </span>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Hoạt động gần đây
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">
                      person
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Khách hàng mới đăng ký
                    </p>
                    <p className="text-xs text-slate-500">Hôm nay</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">
                      shopping_bag
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Đơn hàng mới được tạo
                    </p>
                    <p className="text-xs text-slate-500">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600">
                      badge
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Tasker mới đăng ký
                    </p>
                    <p className="text-xs text-slate-500">3 giờ trước</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
