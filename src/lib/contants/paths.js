// Application route paths
export const APP_PATHS = {
  // Root
  ROOT: '/',

  // Auth paths
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    TASKER_SIGNUP: '/auth/tasker-signup',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    SET_PASSWORD: '/auth/set-password',
  },

  // Customer paths
  CUSTOMER: {
    HOME: '/customer/home',
    PROFILE: '/customer/profile',
    ACTIVITY: '/customer/activity',
    SERVICES: '/customer/services',
    BOOK_NOW: '/customer/book-now',
    SCHEDULED: '/customer/scheduled',
    ORDERS: '/customer/orders',
    
    // Service detail pages
    DETAILS: {
      BABYSITTING: '/customer/services/babysitting',
      COOKING: '/customer/services/cooking',
      MARKET: '/customer/services/market',
      CLEANING_HOUSE: '/customer/services/cleaning-house',
      LAUNDRY: '/customer/services/laundry',
      TAKE_CARE_OF_ELDER: '/customer/services/take-care-of-elder',
      TAKE_CARE_OF_SICK_PEOPLE: '/customer/services/take-care-of-sick-people',
      CLEANING_AIR_CONDITIONER: '/customer/services/cleaning-air-conditioner',
      CLEANING_WASHING_MACHINE: '/customer/services/cleaning-washing-machine',
    },

    // Payment pages
    PAYMENT: {
      ROOT: '/customer/payment',
      VOUCHER: '/customer/payment/voucher',
      CONFIRMATION: '/customer/payment/confirmation',
      SUCCESS: '/customer/payment/success',
      CANCEL: '/customer/payment/cancel',
      ORDERING_SUCCESS: '/customer/payment/ordering-success',
    },
  },

  // Tasker paths
  TASKER: {
    HOME: '/tasker/home',
    PROFILE: '/tasker/profile',
    ACTIVITY: '/tasker/activity',
    CHAT: '/tasker/chat',
    ORDERS: {
      INSTANT: '/tasker/orders/instant',
      SCHEDULED: '/tasker/orders/scheduled',
      PROGRESS: (orderId) => `/tasker/orders/${orderId}/progress`,
    },
  },

  // Admin paths
  ADMIN: {
    HOME: '/admin/home',
    CUSTOMERS: '/admin/customers',
    TASKERS: '/admin/taskers',
    SERVICES: '/admin/services',
    ORDERS: '/admin/orders',
    VOUCHERS: '/admin/vouchers',
    INVOICES: '/admin/invoices',
  },

  // Common paths
  CHAT: '/chat',
  NOTIFICATION: '/notification',
};

// Helper function to get redirect path based on role
export const getRedirectPathByRole = (role) => {
  switch (role) {
    case 'admin':
      return APP_PATHS.ADMIN.HOME;
    case 'tasker':
      return APP_PATHS.TASKER.HOME;
    case 'customer':
    default:
      return APP_PATHS.CUSTOMER.HOME;
  }
};
