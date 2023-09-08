import { Router } from "express";
import { UserController } from "../controllers";
import { authenticateToken, validateRequestSchema } from "../middleware";
import {  loginSchema, signupSchema, updateUserSchema, changePasswordSchema, ResetPasswordBodySchema } from "../schema";

const router = Router();

router.post(
  "/signup",
  validateRequestSchema(signupSchema),
  UserController.signUp
);

router.post("/login", validateRequestSchema(loginSchema), UserController.login);

router.put(
  "/profile",
  authenticateToken,
  validateRequestSchema(updateUserSchema),
  UserController.updateProfile
);

router.put(
  "/changePassword/:userId",
  authenticateToken,
  validateRequestSchema(changePasswordSchema),
  UserController.changePassword
);

// Thêm route PUT cho đặt lại mật khẩu
router.put(
  "/reset-password",
  authenticateToken,
  validateRequestSchema(ResetPasswordBodySchema),
  UserController.resetPassword
);
// router.post("/changePassword", validateRequestSchema(changePasswordSchema), UserController.changePassword);

router.get("/profile", authenticateToken, UserController.getProfile);
router.get("/users", authenticateToken, UserController.getAllUsers);
router.delete('/users/:id',authenticateToken, UserController.deleteUser);

export default router;
