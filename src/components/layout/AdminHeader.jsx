import { useLocation } from "react-router-dom";

const AdminHeader = ({ onOpenSidebar }) => {
  const location = useLocation();

  // Xác định tiêu đề và icon dựa vào path
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes("/admin/home"))
      return { title: "Trang chủ", icon: "home" };
    if (path.includes("/admin/customers"))
      return { title: "Quản lý Customer", icon: "person" };
    if (path.includes("/admin/taskers"))
      return { title: "Quản lý Tasker", icon: "badge" };
    if (path.includes("/admin/services"))
      return { title: "Quản lý Dịch vụ", icon: "design_services" };
    if (path.includes("/admin/orders"))
      return { title: "Quản lý Đơn hàng", icon: "shopping_bag" };
    if (path.includes("/admin/vouchers"))
      return { title: "Quản lý Voucher", icon: "local_activity" };
    if (path.includes("/admin/invoices"))
      return { title: "Quản lý Hóa đơn", icon: "receipt_long" };
    return { title: "Dashboard", icon: "dashboard" };
  };

  const { title, icon } = getPageInfo();

  return (
    <header className="h-14 bg-gray-700 text-white flex items-center justify-between px-4 shrink-0 shadow-md z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition text-sm lg:hidden"
          type="button"
          onClick={onOpenSidebar}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined">{icon}</span>
          <div className="font-semibold truncate">{title}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Button */}
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition text-sm">
          <span className="material-symbols-outlined">notifications</span>
          <span className="hidden sm:inline">Thông báo</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
