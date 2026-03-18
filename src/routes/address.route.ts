import { Router } from "express";
import * as addressController from "../controllers/address.controller";
import { createAddressSchema, updateAddressSchema } from "../validation/address.validation";
import { validateRequest } from "../middleware/validate.middleware";

const addressRouter = Router();

addressRouter.post("/", validateRequest(createAddressSchema), addressController.createAddress);
addressRouter.get("/user/:userId", addressController.getAddressesByUserId);
addressRouter.patch("/:id", validateRequest(updateAddressSchema), addressController.updateAddress);
addressRouter.delete("/:id", addressController.deleteAddress);

export default addressRouter;
