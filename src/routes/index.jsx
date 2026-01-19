import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import ProtectedRoute from "@/components/protected/ProtectedRoute";
import AdminProtectedRoute from "@/components/protected/AdminProtectedRoute";

// Layouts
import CustomerLayout from "@/components/layout/CustomerLayout";
import TaskerLayout from "@/components/layout/TaskerLayout";
import AdminLayout from "@/components/layout/AdminLayout";

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
      // Customer Routes (Protected) - với CustomerLayout
      {
        path: "customer",
        element: (
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "home",
            element: <CustomerHome />,
          },
          {
            path: "profile",
            element: <CustomerProfile />,
          },
          {
            path: "activity",
            element: <CustomerActivity />,
          },
          {
            path: "services",
            children: [
              {
                index: true,
                element: <CustomerServiceList />,
              },
              // Service Detail Routes
              {
                path: "babysitting/:id",
                element: <Babysitting />,
              },
              {
                path: "cooking/:id",
                element: <Cooking />,
              },
              {
                path: "market/:id",
                element: <Market />,
              },
              {
                path: "cleaning-house/:id",
                element: <CleaningHouse />,
              },
              {
                path: "laundry/:id",
                element: <Laundry />,
              },
              {
                path: "take-care-of-elder/:id",
                element: <TakeCareOfElder />,
              },
              {
                path: "take-care-of-sick-people/:id",
                element: <TakeCareOfSickPeople />,
              },
              {
                path: "cleaning-air-conditioner/:id",
                element: <CleaningAirConditioner />,
              },
              {
                path: "cleaning-washing-machine/:id",
                element: <CleaningWashingMachine />,
              },
            ],
          },
          {
            path: "book-now",
            element: <CustomerBookNow />,
          },
          {
            path: "scheduled",
            element: <CustomerScheduled />,
          },
          // Payment Routes
          {
            path: "payment",
            element: <Payment />,
          },
          {
            path: "payment/confirmation",
            element: <PaymentConfirmation />,
          },
          {
            path: "payment/voucher",
            element: <Voucher />,
          },
          {
            path: "payment/success",
            element: <PaymentSuccess />,
          },
          {
            path: "payment/cancel",
            element: <PaymentCancel />,
          },
          {
            path: "ordering/success",
            element: <OrderingSuccess />,
          },
        ],
      },
      // Tasker Routes (Protected) - với TaskerLayout
      {
        path: "tasker",
        element: (
          <ProtectedRoute>
            <TaskerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "home",
            element: <TaskerHome />,
          },
          {
            path: "profile",
            element: <TaskerProfile />,
          },
          {
            path: "activity",
            element: <TaskerActivity />,
          },
          {
            path: "orders/scheduled",
            element: <TaskerPreorder />,
          },
        ],
      },
      // Tasker Routes without Layout (full-screen pages)
      {
        path: "tasker/chat",
        element: (
          <ProtectedRoute>
            <TaskerChat />
          </ProtectedRoute>
        ),
      },
      {
        path: "tasker/order/:orderId",
        element: (
          <ProtectedRoute>
            <TaskerOrderProgress />
          </ProtectedRoute>
        ),
      },
      {
        path: "tasker/order/progress/:orderId",
        element: (
          <ProtectedRoute>
            <TaskerOrderProgress />
          </ProtectedRoute>
        ),
      },
      // Admin Routes (Protected) - với AdminLayout
      {
        path: "admin",
        element: (
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        ),
        children: [
          {
            path: "home",
            element: <AdminHome />,
          },
          {
            path: "customers",
            element: <AdminManageCustomers />,
          },
          {
            path: "taskers",
            element: <AdminManageTaskers />,
          },
          {
            path: "services",
            element: <AdminManageServices />,
          },
          {
            path: "orders",
            element: <AdminManageOrders />,
          },
          {
            path: "vouchers",
            element: <AdminManageVouchers />,
          },
          {
            path: "invoices",
            element: <AdminManageInvoices />,
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
