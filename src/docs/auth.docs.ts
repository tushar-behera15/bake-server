// auth.docs.ts
import { OpenAPIV3 } from "openapi-types";

const basePath = "/api/auth";
const tags = ["Auth"];

// 👇 now typed as OpenAPI PathsObject
const authDocs: OpenAPIV3.PathsObject = {
    [`${basePath}/register`]: {
        post: {
            tags,
            summary: "Register a new user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                email: { type: "string", example: "john@example.com" },
                                phone: { type: "string", example: "Doe" },
                                password: { type: "string", example: "Pass@123" },
                            },
                            required: ["name", "phone", "email", "password"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                201: { description: "User registered successfully" },
            },
        },
    },
    [`${basePath}/login`]: {
        post: {
            tags,
            summary: "Login user",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: { type: "string", example: "john@example.com" },
                                password: { type: "string", example: "Pass2@123" },
                            },
                            required: ["email", "password"],
                        } as OpenAPIV3.SchemaObject,
                    },
                },
            },
            responses: {
                200: { description: "Login successful" },
            },
        },
    },
};

export default authDocs;