import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminStats,
  getImageKitAuth,
  listAdminOrders,
  listAdminProducts,
  listAdminUsers,
  requireAdmin,
  updateAdminProduct,
  updateUserRole,
} from "../controllers/adminController";

const router = Router();

router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/imagekit/auth", getImageKitAuth);
router.get("/products", listAdminProducts);
router.post("/products", createAdminProduct);
router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.get("/orders", listAdminOrders);
router.get("/users", listAdminUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
