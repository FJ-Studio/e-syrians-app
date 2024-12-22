'use server'

import { signIn } from "../../auth"
 
export async function login(formData: FormData) {
    signIn("credentials", formData);
}