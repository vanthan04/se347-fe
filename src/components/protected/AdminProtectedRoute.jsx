import { Navigate } from "react-router-dom";
import { APP_PATHS } from "@/lib/contants";
import useUserStore from "@/lib/stores/userStore";

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useUserStore.getState();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.AUTH.LOGIN} replace />;
  }

  // Check if user has admin role
  const userRole = user?.role || localStorage.getItem("role");

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Truy cập bị từ chối
            </h1>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền truy cập vào khu vực quản trị.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Lý do:</span> Chỉ quản trị viên
                mới có quyền truy cập trang này.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-linear-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
