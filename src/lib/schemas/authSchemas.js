import { z } from 'zod';

// Vietnamese phone number regex
const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// CCCD regex: exactly 12 digits
const cccdRegex = /^\d{12}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
});

export const signupSchema = z.object({
  phone_number: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  full_name: z
    .string()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  identification: z
    .string()
    .min(1, 'Vui lòng nhập CCCD')
    .regex(cccdRegex, 'CCCD phải gồm 12 số'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .regex(
      passwordRegex,
      'Mật khẩu phải có tối thiểu 8 ký tự, ít nhất một chữ hoa, một chữ thường, một ký tự đặc biệt và một số'
    )
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ')
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'Vui lòng nhập mã OTP')
    .length(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^\d{6}$/, 'Mã OTP chỉ được chứa số')
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .regex(
      passwordRegex,
      'Mật khẩu phải có tối thiểu 8 ký tự, ít nhất một chữ hoa, một chữ thường, một ký tự đặc biệt và một số'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Vui lòng xác nhận mật khẩu')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
});

export const resendOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ')
});
