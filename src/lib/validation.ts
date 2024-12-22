import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  name: z.string().min(1, { message: 'Name is required' }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const workerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  nationalId: z.string().min(1, { message: 'National ID is required' }),
  serialId: z.string().min(1, { message: 'Serial ID is required' }),
  jobTitle: z.string().min(1, { message: 'Job title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
});
