import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { Application } from "express";
import authDocs from "./auth.docs";

export const setupSwagger = (app: Application) => {
    const swaggerDocument = {
        openapi: "3.0.0",
        info: {
            title: "Bake Server",
            version: "1.0.0",
            description: "Description",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            responses: {
                Unauthorized: {
                    description: "Authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "Unauthorized" },
                                },
                            },
                        },
                    },
                },
                InternalError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "Internal server error" },
                                },
                            },
                        },
                    },
                },
            },
        },
        paths: {
           ...authDocs
        },
    };

    const swaggerOptions: SwaggerUiOptions = {
        customSiteTitle:"Bake Server",
    };

    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, swaggerOptions)
    );
};