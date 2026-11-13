import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import { addProduct, listProducts } from "../controllers/productController";

const route = Router();

//puplic route
route.get("/", listProducts);

//admin only route
route.post("/", authenticateToken, authorizeRole("ADMIN"), addProduct);

export default route;
