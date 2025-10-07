import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET:process.env.JWT_SECRET ||  "034209wurfj093u2hrnu324u23u4r23u4r",
  JWT_EXPIRES_IN:"7d"
};
