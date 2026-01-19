import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/lib/stores/userStore";

const TaskerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName, logout } = useUserStore();

  // Xác định tiêu đề trang dựa vào path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/tasker/home")) return "Trang chủ";
    if (path.includes("/tasker/profile")) return "Profile";
    if (path.includes("/tasker/activity")) return "Hoạt động";
    if (path.includes("/tasker/chat")) return "Tin nhắn";
    if (path.includes("/tasker/orders/scheduled")) return "Đơn hẹn";
    if (path.includes("/tasker/order")) return "Chi tiết đơn";
    return "Trang chủ";
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleNotification = () => {
    navigate("/notification");
  };

  const menuLinks = [
    { path: "/tasker/profile", label: "Profile cá nhân", icon: "person" },
    { path: "/tasker/activity", label: "Lịch sử nhận việc", icon: "history" },
    { path: "/tasker/home", label: "Thu nhập", icon: "payments" },
  ];

  return (
    <nav className="sticky top-0 z-100 bg-white shadow-sm">
      {/* Header chính */}
      <header className="bg-primaryTasker-200 flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="shrink-0 w-9 h-9 bg-white rounded-full p-1 flex items-center justify-center shadow-sm">
            <Link to="/tasker/home">
              <img
                src="/images/taskgo-logo.png"
                alt="TaskGo icon"
                className="object-contain"
              />
            </Link>
          </div>
          {/* Tiêu đề trang */}
          <h1 className="text-dark-900 font-bold text-lg uppercase tracking-wide">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút thông báo */}
          <button
            onClick={handleNotification}
            className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition relative"
          >
            <span className="material-symbols-outlined text-dark-900">
              notifications
            </span>
            {/* Badge thông báo */}
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-600 rounded-full border border-primary-200"></span>
          </button>

          {/* Nút menu hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 focus:outline-none flex items-center bg-white/20 rounded-lg hover:bg-white/40 transition text-dark-900"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* Menu Dropdown */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 z-40 border-t border-gray-100 ${
          isMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-[150%] opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col p-6 space-y-6 text-dark-900 font-bold max-w-7xl mx-auto">
          {/* Thông tin user */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-primaryTasker-100 text-primaryTasker-500 flex items-center justify-center border border-primaryTasker-200">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <p className="text-lg">{fullName || "Tasker"}</p>
              <p className="text-xs font-medium text-gray-500">Tasker</p>
            </div>
          </div>

          {/* Menu links */}
          {menuLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className="py-2 text-gray-600 hover:text-primary-700 flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          ))}

          {/* Nút đăng xuất */}
          <button
            onClick={handleLogout}
            className="py-3 cursor-pointer text-red-600 flex items-center gap-3 hover:bg-red-50 rounded-lg px-2 -ml-2 transition"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </nav>
      </div>
    </nav>
  );
};

export default TaskerHeader;
