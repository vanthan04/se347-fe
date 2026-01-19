import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import CustomerHeader from "./CustomerHeader";
import CustomerFooter from "./CustomerFooter";
import useUserStore from "@/lib/stores/userStore";

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isActive = (path) => {
    if (path === "/customer/home")
      return location.pathname === "/customer/home";
    return location.pathname.includes(path);
  };

  const navItems = [
    { path: "/customer/home", label: "Trang chủ", icon: "home" },
    { path: "/customer/services", label: "Dịch vụ", icon: "design_services" },
    { path: "/customer/activity", label: "Hoạt động", icon: "news" },
    { path: "/chat", label: "Tin nhắn", icon: "chat" },
    { path: "/notification", label: "Thông báo", icon: "notifications" },
  ];

  return (
    <div className="bg-primary-100 min-h-screen font-montserrat flex flex-col">
      <CustomerHeader />

      <main className="grow p-4 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center px-2 py-1 ${
                isActive(path)
                  ? "text-primary-500"
                  : "text-gray-400 hover:text-primary-500"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{icon}</span>
              <span className="text-[10px] font-medium mt-0.5">{label}</span>
            </Link>
          ))}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center px-2 py-1 text-red-400 hover:text-red-500"
          >
            <span className="material-symbols-outlined text-2xl">logout</span>
            <span className="text-[10px] font-medium mt-0.5">Đăng xuất</span>
          </button>
        </div>
      </nav>

      {/* Footer - hidden on mobile */}
      <div className="hidden md:block">
        <CustomerFooter />
      </div>
    </div>
  );
};

export default CustomerLayout;
