"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordBodySchema = exports.changePasswordSchema = exports.updateUserSchema = exports.signupSchema = exports.loginSchema = void 0;
const yup = __importStar(require("yup"));
// Login
exports.loginSchema = yup.object({
    body: yup.object({
        email: yup.string().email().required(),
        password: yup.string().min(3).max(20).required(),
    }),
});
// Signup
exports.signupSchema = yup.object({
    body: yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().min(3).max(20).required(),
        birthday: yup.string().required(),
    }),
});
// Update Profile
exports.updateUserSchema = yup.object({
    body: yup.object({
        name: yup.string(),
        photoURL: yup.string(),
        birthday: yup.string().required(),
    }),
});
exports.changePasswordSchema = yup.object().shape({
    body: yup.object().shape({
        currentPassword: yup.string().required(),
        newPassword: yup.string().required(),
    }),
});
exports.ResetPasswordBodySchema = yup.object().shape({
    body: yup.object().shape({
        email: yup.string().required(),
        newPassword: yup.string().required(),
    }),
});
