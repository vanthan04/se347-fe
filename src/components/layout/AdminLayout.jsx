import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const openSidebar = () => setIsMobileSidebarOpen(true);
  const closeSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="font-montserrat min-h-screen bg-gray-200 text-gray-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeSidebar}
        />

        {/* Main Area */}
        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <AdminHeader onOpenSidebar={openSidebar} />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
