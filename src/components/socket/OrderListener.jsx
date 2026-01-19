import { useEffect } from "react";
import useSocketStore from "@/lib/stores/socketStore";
import { useOrderStore } from "@/lib/stores/orderStore";
import useUserStore from "@/lib/stores/userStore";
import { toast } from "react-toastify";

/**
 * OrderListener - Lắng nghe các sự kiện liên quan đến Order/Task
 * - task_created: Khi có đơn mới được tạo (cho Tasker)
 * - task_updated: Khi trạng thái đơn thay đổi
 * - task_accepted: Khi Tasker nhận đơn
 * - task_completed: Khi đơn hoàn thành
 * - task_cancelled: Khi đơn bị hủy
 */
const OrderListener = () => {
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const userId = useUserStore((state) => state.userId);

  const { updateOrder, addAvailableOrder } = useOrderStore();

  useEffect(() => {
    if (!socket || !user) return;

    // Handler: Khi có đơn mới được tạo (chỉ Tasker quan tâm)
    const handleTaskCreated = (newOrder) => {
      if (user.role === "tasker") {
        // Thêm vào danh sách đơn có sẵn
        addAvailableOrder(newOrder);

        // Bắn sự kiện mở Modal
        const event = new CustomEvent("OPEN_TASK_MODAL", { detail: newOrder });
        window.dispatchEvent(event);

        // Thông báo
        toast.info("🔔 Có đơn hàng mới!");
      }
    };

    // Handler: Khi trạng thái đơn thay đổi
    const handleTaskUpdated = (updatedOrder) => {
      // Cập nhật store
      updateOrder(updatedOrder);

      // Dispatch event for customer components
      if (updatedOrder.status === "accepted") {
        const event = new CustomEvent("ORDER_ACCEPTED", {
          detail: updatedOrder,
        });
        window.dispatchEvent(event);
      }

      // Thông báo cho Customer
      if (user.role === "customer" && updatedOrder.customerId === userId) {
        if (updatedOrder.status === "accepted") {
          toast.success("✅ Đã tìm thấy Tasker cho bạn!");
        } else if (updatedOrder.status === "in_progress") {
          toast.info("🚀 Tasker đang thực hiện công việc!");
        } else if (updatedOrder.status === "completed") {
          toast.success("🏁 Công việc đã hoàn thành!");
        } else if (updatedOrder.status === "cancelled") {
          toast.error("❌ Đơn hàng đã bị hủy");
        }
      }

      // Thông báo cho Tasker
      if (user.role === "tasker" && updatedOrder.taskerId === userId) {
        if (updatedOrder.status === "cancelled") {
          toast.error("❌ Khách hàng đã hủy đơn này");
        } else if (updatedOrder.status === "completed") {
          toast.success("🏁 Bạn đã hoàn thành công việc!");
        }
      }
    };

    // Handler: BE suggest tasker cho order
    const handleSuggestTasker = (data) => {
      console.log("Suggest tasker:", data);
      if (user.role === "tasker") {
        const event = new CustomEvent("OPEN_TASK_MODAL", {
          detail: {
            _id: data.order_id,
            ...data.suggestion,
          },
        });
        window.dispatchEvent(event);
        toast.info("🔔 Có đơn hàng mới dành cho bạn!");
      }
    };

    // Handler: Tasker đã accept order
    const handleOrderAccepted = (data) => {
      console.log("Order accepted:", data);

      const event = new CustomEvent("ORDER_ACCEPTED", { detail: data });
      window.dispatchEvent(event);

      if (user.role === "customer" && data.tasker_id) {
        toast.success("✅ Đã tìm thấy Tasker cho bạn!");
      }
    };

    // Handler: Tasker được assign
    const handleTaskerAssigned = (data) => {
      console.log("Tasker assigned:", data);
      const event = new CustomEvent("TASKER_ASSIGNED", { detail: data });
      window.dispatchEvent(event);
    };

    // Handler: Order đã được accept bởi người khác
    const handleOrderAlreadyAccepted = () => {
      if (user.role === "tasker") {
        toast.error("Tiếc quá, có người nhanh tay hơn rồi!");
      }
    };

    // Đăng ký listeners
    socket.on("task_created", handleTaskCreated);
    socket.on("suggest-tasker", handleSuggestTasker);
    socket.on("order-accepted", handleOrderAccepted);
    socket.on("tasker-assigned", handleTaskerAssigned);
    socket.on("order-already-accepted", handleOrderAlreadyAccepted);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_accepted", handleTaskUpdated);
    socket.on("task_completed", handleTaskUpdated);
    socket.on("task_cancelled", handleTaskUpdated);

    // Cleanup
    return () => {
      socket.off("task_created", handleTaskCreated);
      socket.off("suggest-tasker", handleSuggestTasker);
      socket.off("order-accepted", handleOrderAccepted);
      socket.off("tasker-assigned", handleTaskerAssigned);
      socket.off("order-already-accepted", handleOrderAlreadyAccepted);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_accepted", handleTaskUpdated);
      socket.off("task_completed", handleTaskUpdated);
      socket.off("task_cancelled", handleTaskUpdated);
    };
  }, [socket, user, userId, updateOrder, addAvailableOrder]);

  return null;
};

export default OrderListener;
