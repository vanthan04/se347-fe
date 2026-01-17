import { create } from "zustand";

export const useOrderStore = create((set) => ({
  availableOrders: [], // Tất cả các orders đang trong trạng thái pending
  myWorkOrders: [], // Việc Tasker đã nhận và đang làm
  myOrders: [], // Đơn khách hàng (Customer) đã đặt

  setOrders: (type, data) => set({ [type]: data }),

  // Hàm cập nhật trạng thái Order real-time
  updateOrder: (order) =>
    set((state) => {
      // 1. Cập nhật cho phía Customer (Đơn hàng của tôi)
      const newMyOrders = state.myOrders.map((o) =>
        o._id === order._id ? order : o,
      );

      // 2. Xử lý logic cho phía Tasker
      let newAvailable = [...state.availableOrders];
      let newWork = [...state.myWorkOrders];

      if (order.status === "pending") {
        // Nếu là đơn mới (chưa ai nhận), thêm vào chợ nếu chưa tồn tại
        if (!newAvailable.find((o) => o._id === order._id)) {
          newAvailable = [order, ...newAvailable];
        }
      } else {
        // Nếu trạng thái khác "pending" (đã có người nhận hoặc xong)
        // Lập tức xóa khỏi chợ để các Tasker khác không nhìn thấy nữa
        newAvailable = newAvailable.filter((o) => o._id !== order._id);

        // Cập nhật thông tin trong danh sách việc đang làm của Tasker
        const isExistInWork = newWork.find((o) => o._id === order._id);
        if (isExistInWork) {
          newWork = newWork.map((o) => (o._id === order._id ? order : o));
        } else if (order.status === "accepted") {
          // Nếu đơn vừa chuyển sang 'accepted' và chưa có trong list work thì thêm vào
          // (Lưu ý: Ở UI bạn nên lọc thêm điều kiện order.taskerId === userId)
          newWork = [order, ...newWork];
        }
      }

      return {
        myOrders: newMyOrders,
        availableOrders: newAvailable,
        myWorkOrders: newWork,
      };
    }),

  addAvailableOrder: (order) =>
    set((state) => ({
      availableOrders: [order, ...state.availableOrders],
    })),

  // Hàm xóa dữ liệu khi logout
  clearStore: () =>
    set({ availableOrders: [], myWorkOrders: [], myOrders: [] }),
}));
