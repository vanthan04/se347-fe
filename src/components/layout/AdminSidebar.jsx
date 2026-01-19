import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/lib/stores/userStore";

const AdminSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const menuItems = [
    { path: "/admin/home", label: "Trang chủ", icon: "home" },
    { path: "/admin/customers", label: "Quản lý Customer", icon: "person" },
    { path: "/admin/taskers", label: "Quản lý Tasker", icon: "badge" },
    {
      path: "/admin/services",
      label: "Quản lý Dịch vụ",
      icon: "design_services",
    },
    { path: "/admin/orders", label: "Quản lý Đơn hàng", icon: "shopping_bag" },
    {
      path: "/admin/vouchers",
      label: "Quản lý Voucher",
      icon: "local_activity",
    },
    { path: "/admin/invoices", label: "Quản lý Hóa đơn", icon: "receipt_long" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="h-14 px-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <img
            src="/images/taskgo-logo.png"
            alt="TaskGo logo"
            className="w-9 h-9 object-contain"
          />
        </div>
        <div className="font-semibold text-sm tracking-wide">TaskGo Admin</div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        {menuItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            onClick={onCloseMobile}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
              isActive(path)
                ? "bg-white/15 text-white"
                : "text-white/85 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/85 hover:text-red-400 hover:bg-white/10 transition"
        >
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-gray-800 text-white hidden lg:flex flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-800 text-white transition-transform duration-200 lg:hidden flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;
