import { Navigate } from "react-router-dom";
import { APP_PATHS } from "@/lib/contants";
import useUserStore from "@/lib/stores/userStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUserStore.getState();

  if (!isAuthenticated) {
    return <Navigate to={APP_PATHS.AUTH.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
