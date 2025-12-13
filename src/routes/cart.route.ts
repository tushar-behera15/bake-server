import { Router } from "express";
import * as cart from "../controllers/cart.controller";

const cartrouter = Router();

// Get cart of a specific user
cartrouter.get("/", cart.getCart);

// Add item to cart
cartrouter.post("/", cart.addToCart);

// Update quantity by cart item id
cartrouter.put("/:id", cart.updateCart);

// Delete a single cart item
cartrouter.delete("/:id", cart.deleteCartItem);

// Clear full cart of a user
cartrouter.delete("/clear/:userId", cart.clearCart);

export default cartrouter;
