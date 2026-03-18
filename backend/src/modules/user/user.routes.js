import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "User fetched successfully",
    user: req.user,
  });
});

export default router;