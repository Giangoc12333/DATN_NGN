"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const schema_1 = require("../schema");
const router = (0, express_1.Router)();
router.post("/signup", (0, middleware_1.validateRequestSchema)(schema_1.signupSchema), controllers_1.UserController.signUp);
router.post("/login", (0, middleware_1.validateRequestSchema)(schema_1.loginSchema), controllers_1.UserController.login);
router.put("/profile", middleware_1.authenticateToken, (0, middleware_1.validateRequestSchema)(schema_1.updateUserSchema), controllers_1.UserController.updateProfile);
router.put("/changePassword/:userId", middleware_1.authenticateToken, (0, middleware_1.validateRequestSchema)(schema_1.changePasswordSchema), controllers_1.UserController.changePassword);
// Thêm route PUT cho đặt lại mật khẩu
router.put("/reset-password", middleware_1.authenticateToken, (0, middleware_1.validateRequestSchema)(schema_1.ResetPasswordBodySchema), controllers_1.UserController.resetPassword);
// router.post("/changePassword", validateRequestSchema(changePasswordSchema), UserController.changePassword);
router.get("/profile", middleware_1.authenticateToken, controllers_1.UserController.getProfile);
router.get("/users", middleware_1.authenticateToken, controllers_1.UserController.getAllUsers);
router.delete('/users/:id', middleware_1.authenticateToken, controllers_1.UserController.deleteUser);
exports.default = router;
