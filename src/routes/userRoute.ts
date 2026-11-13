import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import {
  register,
  login,
  getProfile,
  getAdminDashboard,
} from "../controllers/userController";
import rateLimit from "express-rate-limit";

const route = Router();

//rate limter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: "Too many Login attempts, try again in 15 mintes" },
  standardHeaders: true,
  legacyHeaders: false,
});

//puplic routes no token needed
route.post("/register", register);
route.post("/login", loginLimiter, login);

//protected routes
route.get("/profile", authenticateToken, getProfile);
route.get(
  "/admindashboard",
  authenticateToken,
  authorizeRole("ADMIN"),
  getAdminDashboard,
);

export default route;
