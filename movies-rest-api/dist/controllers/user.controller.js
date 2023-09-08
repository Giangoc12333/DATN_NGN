"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const lodash_1 = __importDefault(require("lodash"));
const middleware_1 = require("../middleware");
const models_1 = require("../models");
const utils_1 = require("../utils");
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, birthday, password } = req.body;
        const existingUser = yield models_1.UserModel.findOne({
            where: { email: email },
        });
        if (existingUser) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Email đã được đăng ký",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        models_1.UserModel.sync({ alter: true }).then(() => {
            return models_1.UserModel.create({
                name: name,
                email: email,
                birthday: birthday,
                password: hashedPassword,
            });
        });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Tạo tài khoản thành công.",
        });
    }
    catch (error) {
        next(error);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield models_1.UserModel.findOne({ where: { email: email } });
        if (!user) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Email hoặc mật khẩu không đúng, vui lòng thử lại.",
            });
        }
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Email hoặc mật khẩu không đúng, vui lòng thử lại.",
            });
        }
        const userObj = lodash_1.default.omit(user.toJSON(), ["password"]);
        const accessToken = (0, middleware_1.generateToken)(user);
        console.log(accessToken);
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Đăng nhập thành công.",
            data: userObj,
            accessToken: accessToken,
        });
    }
    catch (error) {
        next(error);
    }
});
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, birthday, photoURL } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(200).json({
                code: 400,
                status: "Error",
                message: "Vui lòng kiểm tra lại.",
            });
        }
        const user = yield models_1.UserModel.findByPk(userId);
        if (!user) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Người dùng không tồn tại.",
            });
        }
        user.update({
            name,
            birthday,
            photoURL,
        });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Cập nhật thông tin thành công.",
        });
    }
    catch (error) {
        next(error);
    }
});
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const user = yield models_1.UserModel.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });
        if (!user) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Người dùng không tồn tại.",
            });
        }
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        if (!userId) {
            return res.status(400).json({
                code: 400,
                status: "Error",
                message: "Vui lòng kiểm tra lại.",
            });
        }
        const user = yield models_1.UserModel.findByPk(userId);
        if (!user) {
            return res.status(400).json({
                code: 400,
                status: "Error",
                message: "Người dùng không tồn tại.",
            });
        }
        const isPasswordMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                code: 400,
                status: "Error",
                message: "Mật khẩu hiện tại không đúng.",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword; // Update the user's password
        yield user.save(); // Save the updated user
        return res.status(200).json({
            code: 200,
            status: "Success",
            message: "Đổi mật khẩu thành công.",
        });
    }
    catch (error) {
        next(error);
    }
});
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword } = req.body;
        const user = yield models_1.UserModel.findOne({ where: { email: email } });
        if (!user) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Email không tồn tại.",
            });
        }
        // Generate a new hashed password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // Update the user's password in the database
        user.password = hashedPassword;
        // Save the updated user object
        yield user.save();
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Mật khẩu đã được đặt lại thành công.",
        });
    }
    catch (error) {
        next(error);
    }
});
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.UserModel.findAll();
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Successfully retrieved all users.",
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
});
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({
                code: 400,
                status: "Error",
                message: "Vui lòng kiểm tra lại.",
            });
        }
        const users = yield models_1.UserModel.findByPk(userId);
        if (!users) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Người dùng không tồn tại.",
            });
        }
        yield users.destroy();
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Xoá người dùng thành công.",
        });
    }
    catch (error) {
        next(error);
    }
});
const UserController = {
    signUp,
    login,
    updateProfile,
    getProfile,
    deleteUser,
    changePassword,
    resetPassword,
    getAllUsers,
};
exports.default = UserController;