/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/lib/stores/userStore";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const TaskerPreorder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScheduledOrders();
  }, []);

  const fetchScheduledOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:3000/api/tasker/orders/scheduled",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching scheduled orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đơn hàng đã lên lịch
          </h1>
          <p className="text-gray-600">Các đơn hàng được đặt trước</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              event
            </span>
            <p className="text-gray-600">Chưa có đơn hàng đã lên lịch</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/tasker/order/${order._id}`)}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {order.task_snapshot?.name || "Dịch vụ"}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    ĐÃ LÊN LỊCH
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      schedule
                    </span>
                    <span className="font-medium text-blue-600">
                      {formatDateTime(order.scheduled_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      person
                    </span>
                    <span>{order.customer_id?.full_name || "Khách hàng"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      location_on
                    </span>
                    <span className="line-clamp-1">
                      {order.address_snapshot?.full_address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      attach_money
                    </span>
                    <span className="font-semibold text-primary-600 text-base">
                      {formatCurrency(order.final_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default TaskerPreorder;
