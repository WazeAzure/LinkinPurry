export const registerSchema = {
    tags: ["Auth"],
    summary: "Register a new user",
    body: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
            username: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            fullName: { type: "string" },
        },
    },
    response: {
        201: {
            type: "object",
            properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            body: {
                type: "object",
                properties: {
                    token: { type: "string" },
                }
            }
            },
        },
    },
};
  
export const loginSchema = {
    tags: ["Auth"],
    summary: "Login user",
    body: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
            identifier: { type: "string", format: "email" },
            password: { type: "string" },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            body: {
                type: "object",
                properties: {
                    token: { type: "string" },
                }
            }
            },
        },
    },
};
