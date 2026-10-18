import express, { Router } from "express";
import { sslCancel, sslFail, sslIpn, sslSuccess } from "../controllers/paymentsController";

const router = Router();

// SSLCommerz posts application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: false }));

router.all("/sslcommerz/success", sslSuccess);
router.all("/sslcommerz/fail", sslFail);
router.all("/sslcommerz/cancel", sslCancel);
router.post("/sslcommerz/ipn", sslIpn);

export default router;
