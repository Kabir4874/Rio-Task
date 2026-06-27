import { z } from 'zod';

export const registerDriverSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginDriverSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const vehicleSchema = z.object({
  vehicleType: z.enum(
    ['CAR', 'MOTORCYCLE', 'RICKSHAW', 'CNG', 'DELIVERY', 'OTHER'],
    {
      message: 'Invalid vehicle type',
    },
  ),
  details: z
    .string()
    .trim()
    .min(1, 'Vehicle details are required')
    .max(240, 'Details must not exceed 240 characters'),
});
