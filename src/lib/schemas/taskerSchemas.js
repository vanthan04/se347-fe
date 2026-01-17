import * as z from 'zod';

// Review Schema
export const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao đánh giá").max(5),
  comment: z.string().optional(),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone_number: z.string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ chứa số"),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  introduction: z.string().max(500, "Giới thiệu không quá 500 ký tự").optional(),
  identity_number: z.string().optional(),
  address: z.object({
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    street_address: z.string().optional(),
    full_address: z.string().optional(),
  }).optional(),
});

// Chat Message Schema
export const chatMessageSchema = z.object({
  content: z.string().min(1, "Tin nhắn không được để trống"),
  target_order_id: z.string().min(1, "Order ID is required"),
});

// Order Status Update Schema
export const orderStatusSchema = z.object({
  status: z.enum([
    'assigned',
    'accepted',
    'departed',
    'arrived',
    'in_progress',
    'completed',
    'cancelled'
  ]),
  reason: z.string().optional(),
});

// Tasker Settings Schema
export const taskerSettingsSchema = z.object({
  is_available: z.boolean(),
  max_distance: z.number().min(1).max(50).optional(),
  preferred_services: z.array(z.string()).optional(),
});

export default {
  reviewSchema,
  profileUpdateSchema,
  chatMessageSchema,
  orderStatusSchema,
  taskerSettingsSchema,
};
