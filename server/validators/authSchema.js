import {email, z} from "zod/v4";



export const loginSchema = z.object({
    email : z.email('Please enter a valid email'),
    password: z.string()
})


export const registerSchema = loginSchema.extend({
    name: z.string().min(3, { message: "name must be at least 3 characters long" }).max(100 , { message: "name must be at most 100 characters long" }),
    otp: z.string().length(4).regex(/^\d{4}/ , { message: "OTP must be a 4 digit number" })
})


export const otpSchema = z.object({
    email : z.email('Please enter a valid email'),
    otp: z.string().length(4).regex(/^\d{4}/ , { message: "OTP must be a 4 digit number" })
})