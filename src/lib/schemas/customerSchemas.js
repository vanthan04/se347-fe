import { z } from "zod";

// Book Now Schema
export const bookNowSchema = z.object({
  note: z.string().optional(),
});

// Scheduled Schema
export const scheduledSchema = z.object({
  scheduled_at: z.string().min(1, "Vui lòng chọn thời gian"),
  note: z.string().optional(),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  cccd: z.string().optional(),
  bin: z.string().optional(),
  account_number: z.string().optional(),
});

// Address Schema
export const addressSchema = z.object({
  street: z.string().min(1, "Vui lòng nhập số nhà, tên đường"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  city: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  latitude: z.number(),
  longitude: z.number(),
});

// Payment confirmation schema
export const paymentConfirmationSchema = z.object({
  address_id: z.string().min(1, 'Vui lòng chọn địa chỉ làm việc'),
  payment_method: z.enum(['cash', 'bank_transfer', 'ewallet', 'credit_card'], {
    required_error: 'Vui lòng chọn phương thức thanh toán'
  })
});

// Voucher application schema
export const voucherSchema = z.object({
  voucher_code: z.string().optional()
});

// Order review schema
export const orderReviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
  comment: z.string().optional()
});
