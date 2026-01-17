import { z } from "zod";

// Category Schema
export const categorySchema = z.object({
  category_name: z.string().min(1, "Vui lòng nhập tên loại dịch vụ"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  avatar_url: z.string().optional(),
});

// Service/Task Schema
export const serviceSchema = z.object({
  task_name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
  service_id: z.string().min(1, "Vui lòng chọn loại dịch vụ"),
  unit: z.enum(["hour", "job", "time"]),
  pricing: z.coerce.number().min(0, "Giá phải lớn hơn 0"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  avatar_url: z.string().optional(),
});

// Tasker Update Schema
export const taskerUpdateSchema = z.object({
  account_status: z.enum(["active", "inactive", "banned"]),
  tasker_status: z.enum(["pending", "available", "busy", "inactive"]),
  hourly_rate: z.coerce.number().min(0).optional(),
});

// Discount Schema
export const discountSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã khuyến mãi"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(0, "Giá trị phải lớn hơn 0"),
  min_order_value: z.coerce.number().min(0).optional(),
  max_discount: z.coerce.number().min(0).optional(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(["active", "inactive"]),
});

// Voucher Schema
export const voucherSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã voucher"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(0, "Giá trị phải lớn hơn 0"),
  min_order_value: z.coerce.number().min(0).optional(),
  max_discount: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(["active", "inactive"]),
});

// Invoice Update Schema
export const invoiceUpdateSchema = z.object({
  status: z.enum(["success", "pending", "refunded", "failed"]),
  transaction_id: z.string().optional(),
});

// Order Update Schema
export const orderUpdateSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ]),
});
