import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import ProtectedRoute from "@/components/protected/ProtectedRoute";
import AdminProtectedRoute from "@/components/protected/AdminProtectedRoute";

// Auth Pages
import LoginSignup from "@/pages/auth/LoginSignup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import SetPassword from "@/pages/auth/SetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ResendOtp from "@/pages/auth/ResendOtp";

// Customer Pages
import CustomerHome from "@/pages/main/customer/CustomerHome";
import CustomerProfile from "@/pages/main/customer/CustomerProfile";
import CustomerActivity from "@/pages/main/customer/CustomerActivity";
import CustomerServiceList from "@/pages/main/customer/CustomerServiceList";
import CustomerBookNow from "@/pages/main/customer/CustomerBookNow";
import CustomerScheduled from "@/pages/main/customer/CustomerScheduled";

// Customer Detail Pages
import Babysitting from "@/pages/main/customer/details/Babysitting";
import Cooking from "@/pages/main/customer/details/Cooking";
import Market from "@/pages/main/customer/details/Market";
import CleaningHouse from "@/pages/main/customer/details/CleaningHouse";
import Laundry from "@/pages/main/customer/details/Laundry";
import TakeCareOfElder from "@/pages/main/customer/details/TakeCareOfElder";
import TakeCareOfSickPeople from "@/pages/main/customer/details/TakeCareOfSickPeople";
import CleaningAirConditioner from "@/pages/main/customer/details/CleaningAirConditioner";
import CleaningWashingMachine from "@/pages/main/customer/details/CleaningWashingMachine";

// Customer Payment Pages
import Payment from "@/pages/main/customer/payment/Payment";
import PaymentConfirmation from "@/pages/main/customer/payment/PaymentConfirmation";
import Voucher from "@/pages/main/customer/payment/Voucher";
import PaymentSuccess from "@/pages/main/customer/payment/PaymentSuccess";
import PaymentCancel from "@/pages/main/customer/payment/PaymentCancel";
import OrderingSuccess from "@/pages/main/customer/payment/OrderingSuccess";

// Tasker Pages
import TaskerHome from "@/pages/main/tasker/TaskerHome";
import TaskerProfile from "@/pages/main/tasker/TaskerProfile";
import TaskerOrderProgress from "@/pages/main/tasker/TaskerOrderProgress";
import TaskerPreorder from "@/pages/main/tasker/TaskerPreorder";
import TaskerActivity from "@/pages/main/tasker/TaskerActivity";
import TaskerChat from "@/pages/main/tasker/TaskerChat";

// Admin Pages
import AdminHome from "@/pages/main/admin/AdminHome";
import AdminManageCustomers from "@/pages/main/admin/AdminManageCustomers";
import AdminManageTaskers from "@/pages/main/admin/AdminManageTaskers";
import AdminManageServices from "@/pages/main/admin/AdminManageServices";
import AdminManageOrders from "@/pages/main/admin/AdminManageOrders";
import AdminManageVouchers from "@/pages/main/admin/AdminManageVouchers";
import AdminManageInvoices from "@/pages/main/admin/AdminManageInvoices";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      // Auth Routes (Public)
      {
        path: "auth",
        children: [
          {
            path: "login",
            element: <LoginSignup />,
          },
          {
            path: "signup",
            element: <LoginSignup />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "set-password",
            element: <SetPassword />,
          },
          {
            path: "verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "resend-otp",
            element: <ResendOtp />,
          },
        ],
      },
      // Customer Routes (Protected)
      {
        path: "customer",
        children: [
          {
            path: "home",
            element: (
              <ProtectedRoute>
                <CustomerHome />
              </ProtectedRoute>
            ),
          },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <CustomerProfile />
              </ProtectedRoute>
            ),
          },
          {
            path: "activity",
            element: (
              <ProtectedRoute>
                <CustomerActivity />
              </ProtectedRoute>
            ),
          },
          {
            path: "services",
            element: (
              <ProtectedRoute>
                <CustomerServiceList />
              </ProtectedRoute>
            ),
          },
          {
            path: "book-now",
            element: (
              <ProtectedRoute>
                <CustomerBookNow />
              </ProtectedRoute>
            ),
          },
          {
            path: "scheduled",
            element: (
              <ProtectedRoute>
                <CustomerScheduled />
              </ProtectedRoute>
            ),
          },
          // Service Detail Routes
          {
            path: "details/babysitting",
            element: (
              <ProtectedRoute>
                <Babysitting />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/cooking",
            element: (
              <ProtectedRoute>
                <Cooking />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/market",
            element: (
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/cleaning-house",
            element: (
              <ProtectedRoute>
                <CleaningHouse />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/laundry",
            element: (
              <ProtectedRoute>
                <Laundry />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/take-care-of-elder",
            element: (
              <ProtectedRoute>
                <TakeCareOfElder />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/take-care-of-sick-people",
            element: (
              <ProtectedRoute>
                <TakeCareOfSickPeople />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/cleaning-air-conditioner",
            element: (
              <ProtectedRoute>
                <CleaningAirConditioner />
              </ProtectedRoute>
            ),
          },
          {
            path: "details/cleaning-washing-machine",
            element: (
              <ProtectedRoute>
                <CleaningWashingMachine />
              </ProtectedRoute>
            ),
          },
          // Payment Routes
          {
            path: "payment",
            element: (
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment/confirmation",
            element: (
              <ProtectedRoute>
                <PaymentConfirmation />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment/voucher",
            element: (
              <ProtectedRoute>
                <Voucher />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment/success",
            element: (
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment/cancel",
            element: (
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            ),
          },
          {
            path: "ordering/success",
            element: (
              <ProtectedRoute>
                <OrderingSuccess />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Tasker Routes (Protected)
      {
        path: "tasker",
        children: [
          {
            path: "home",
            element: (
              <ProtectedRoute>
                <TaskerHome />
              </ProtectedRoute>
            ),
          },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <TaskerProfile />
              </ProtectedRoute>
            ),
          },
          {
            path: "activity",
            element: (
              <ProtectedRoute>
                <TaskerActivity />
              </ProtectedRoute>
            ),
          },
          {
            path: "chat",
            element: (
              <ProtectedRoute>
                <TaskerChat />
              </ProtectedRoute>
            ),
          },
          {
            path: "orders/scheduled",
            element: (
              <ProtectedRoute>
                <TaskerPreorder />
              </ProtectedRoute>
            ),
          },
          {
            path: "order/:orderId",
            element: (
              <ProtectedRoute>
                <TaskerOrderProgress />
              </ProtectedRoute>
            ),
          },
          {
            path: "order/progress/:orderId",
            element: (
              <ProtectedRoute>
                <TaskerOrderProgress />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Admin Routes (Protected)
      {
        path: "admin",
        children: [
          {
            path: "home",
            element: (
              <AdminProtectedRoute>
                <AdminHome />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "customers",
            element: (
              <AdminProtectedRoute>
                <AdminManageCustomers />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "taskers",
            element: (
              <AdminProtectedRoute>
                <AdminManageTaskers />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "services",
            element: (
              <AdminProtectedRoute>
                <AdminManageServices />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "orders",
            element: (
              <AdminProtectedRoute>
                <AdminManageOrders />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "vouchers",
            element: (
              <AdminProtectedRoute>
                <AdminManageVouchers />
              </AdminProtectedRoute>
            ),
          },
          {
            path: "invoices",
            element: (
              <AdminProtectedRoute>
                <AdminManageInvoices />
              </AdminProtectedRoute>
            ),
          },
        ],
      },
      // 404 Route
      {
        path: "*",
        element: <div>404 - Page Not Found</div>,
      },
    ],
  },
]);

export default router;
