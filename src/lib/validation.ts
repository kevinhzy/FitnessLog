export type ValidationError = {
    field: string;
    message: string;
};

export function validateEmail(email: string): string | null {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return null;
}

export function validateName(name: string): string | null {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return null;
}