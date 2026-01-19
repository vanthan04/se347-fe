import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/lib/stores/userStore";

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserStore();

  // Xác định tiêu đề trang dựa vào path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/customer/home")) return "Trang chủ";
    if (path.includes("/customer/profile")) return "Profile";
    if (path.includes("/customer/activity")) return "Hoạt động";
    if (path.includes("/customer/services")) return "Dịch vụ";
    if (path.includes("/customer/book-now")) return "Đặt ngay";
    if (path.includes("/customer/scheduled")) return "Lịch hẹn";
    if (path.includes("/customer/details")) return "Chi tiết dịch vụ";
    if (path.includes("/customer/payment")) return "Thanh toán";
    return "Trang chủ";
  };

  // Xác định active nav item
  const isActive = (key) => {
    const path = location.pathname;
    switch (key) {
      case "home":
        return path === "/customer/home";
      case "activity":
        return path.includes("/customer/activity");
      case "chat":
        return path.includes("/chat");
      case "notification":
        return path.includes("/notification");
      default:
        return false;
    }
  };

  const navLinks = [
    { path: "/customer/home", label: "Trang chủ", key: "home", icon: "house" },
    { path: "/customer/services", label: "Dịch vụ", icon: "design_services" },
    {
      path: "/customer/activity",
      label: "Hoạt động",
      key: "activity",
      icon: "news",
    },

    { path: "/chat", label: "Tin nhắn", key: "chat", icon: "chat" },
    {
      path: "/notification",
      label: "Thông báo",
      key: "notification",
      icon: "lightbulb",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isHomePage = location.pathname === "/customer/home";

  return (
    <>
      <header className="bg-primary-200 py-4 sticky top-0 z-50 shadow-md">
        <div className="w-full flex flex-row gap-4 items-center justify-start px-4">
          {/* Logo or Back Button */}
          {isHomePage ? (
            <div
              className="cursor-pointer
             text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-70 shrink-0"
            >
              <Link to="/customer/home">
                <img src="/images/taskgo-logo.png" alt="TaskGo Logo" />
              </Link>
            </div>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer text-primary-500 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-primary-50 transition shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </button>
          )}

          {/* Mobile Title - centered */}
          <h1 className="md:hidden flex-1 font-bold text-xl text-dark-900 whitespace-nowrap">
            {getPageTitle()}
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 flex-1 justify-center">
            {navLinks.map(({ path, label, key }) => (
              <Link
                key={key}
                to={path}
                className={
                  isActive(key)
                    ? "text-dark-900 font-bold border-b-2 border-primary-500"
                    : "text-primary-500 hover:text-dark-900 font-medium transition-colors"
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white shadow-xl z-40 border-b border-primary-300 md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            {navLinks.map(({ path, label, key, icon }) => (
              <Link
                key={key}
                to={path}
                className="flex items-center space-x-3 text-primary-500 font-medium hover:text-dark-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}

            {/* Profile link */}
            <Link
              to="/customer/profile"
              className="flex items-center space-x-3 text-primary-500 font-medium hover:text-dark-900"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center space-x-3 text-red-500 font-medium hover:text-red-600"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Đăng xuất</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default CustomerHeader;
