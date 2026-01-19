// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP_CUSTOMER: "/auth/signup/customer",
    SIGNUP_TASKER: "/auth/signup/tasker",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_OTP: "/auth/resend-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_OTP: "/auth/verify-reset-otp",
    SET_PASSWORD: "/auth/set-password",
  },

  // Customer-specific endpoints
  CUSTOMER: {
    PROFILE: {
      ROOT: "/customer/profile",
      AVATAR: "/customer/avatar",
      ADDRESSES: {
        ROOT: "/customer/addresses",
        DETAIL: (id) => `/customer/addresses/${id}`,
      },
    },
    ORDERS: {
      UPCOMING: "/customer/orders/upcoming",
      HISTORY: "/customer/orders/history",
      CANCEL: (id) => `/customer/orders/${id}/cancel`,
      RATE: (id) => `/customer/orders/${id}/rate`,
    },
    FAVORITES: {
      TASKERS: "/user/favorites/taskers",
      TASKS: "/customer/favorite-tasks",
    },
  },

  // Task endpoints
  TASK: {
    ALL: "/task/all",
    DETAIL: (id) => `/task/${id}`,
    CREATE: "/task/create",
    UPDATE: (id) => `/task/update/${id}`,
    DELETE: (id) => `/task/delete/${id}`,
    FAVORITE_BY_USER: "/task/favorite/by-user",
    TOP_POPULAR_BY_ORDERS: "/task/top-popular/by-orders",
  },

  // Service/Category endpoints
  SERVICE: {
    ALL: "/task/service/all",
    CREATE: "/task/service/create",
    UPDATE: (id) => `/task/service/update/${id}`,
    DELETE: (id) => `/task/service/delete/${id}`,
  },

  // User/Address endpoints
  USER: {
    ADDRESSES: {
      MY: "/user/addresses/my",
      CREATE: "/user/addresses",
      UPDATE: (id) => `/user/addresses/${id}`,
      DELETE: (id) => `/user/addresses/${id}`,
    },
  },

  // General stats and reputation
  STATS: {
    ORDER_COMPLETED_CANCELLED: "/order/statistics/completed-cancelled",
    REPUTATION_SCORE: "/user/reputation-score",
  },

  // Order endpoints
  ORDER: {
    CREATE: "/order/create",
    DETAIL: (id) => `/order/${id}`,
    MY_ORDERS: "/order/my-orders",
    CANCEL: (id) => `/order/cancel/${id}`,
    RECEIPT: {
      ADD: "/order/receipt/add",
      ALL: "/orders/receipt/all",
      UPDATE: (id) => `/orders/receipt/update/${id}`,
      REFUND: (id) => `/orders/receipt/refund/${id}`,
    },
  },

  // Voucher/Discount endpoints
  DISCOUNT: {
    VOUCHER: {
      ALL: "/discount/voucher/all",
      DETAIL: (id) => `/discount/voucher/${id}`,
      CREATE: "/discount/voucher/create",
      UPDATE: (id) => `/discount/voucher/update/${id}`,
      DELETE: (id) => `/discount/voucher/delete/${id}`,
      ELIGIBLE_LIST: "/discount/voucher/eligible-list",
      APPLY: "/discount/voucher/apply",
    },
  },

  // Transaction/Payment endpoints
  TRANSACTION: {
    PAYMENT_LINK: (customerId) => `/transaction/paymentLink/${customerId}`,
    PAYMENT_STATUS: (orderCode) => `/transaction/payment-status/${orderCode}`,
  },

  // Admin endpoints
  ADMIN: {
    TASKERS: {
      ALL: "/admin/taskers/all",
      APPROVE: (id) => `/admin/taskers/approve/${id}`,
      REJECT: (id) => `/admin/taskers/reject/${id}`,
      UPDATE: (id) => `/admin/taskers/update/${id}`,
    },
    CUSTOMERS: {
      ALL: "/admin/customers/all",
      UPDATE: (id) => `/admin/customers/update/${id}`,
    },
    ORDERS: {
      ALL: "/admin/orders/all",
      UPDATE: (id) => `/admin/orders/update/${id}`,
    },
    STATS: {
      CUSTOMER_COUNT: "/admin/stats/customer-count",
      TASKER_COUNT: "/admin/stats/tasker-count",
      ORDER_STATS: "/admin/stats/order-stats",
    },
  },

  // Tasker endpoints
  TASKER: {
    PROFILE: (id) => `/tasker/${id}`,
    AVAILABLE: (taskId) => `/tasker/available/${taskId}`,
    ORDERS: {
      ASSIGNED: "/tasker/orders/assigned",
      HISTORY: "/tasker/orders/history",
      DETAIL: (id) => `/tasker/orders/${id}`,
      ACCEPT: (id) => `/tasker/orders/${id}/accept`,
      DEPART: (id) => `/tasker/orders/${id}/depart`,
      ARRIVE: (id) => `/tasker/orders/${id}/arrive`,
      START: (id) => `/tasker/orders/${id}/start`,
      COMPLETE: (id) => `/tasker/orders/${id}/complete`,
      CANCEL: (id) => `/tasker/orders/${id}/cancel`,
    },
    REVIEWS: {
      CHECK: (customerId) => `/tasker/reviews/check/${customerId}`,
      CREATE: (customerId) => `/tasker/reviews/${customerId}`,
      BY_TASKER: (taskerId) => `/tasker/${taskerId}/reviews`,
    },
  },
};
