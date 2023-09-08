import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import _ from "lodash";
import { ResponseResult, User } from "../interfaces";
import { generateToken } from "../middleware";
import { UserModel } from "../models";
import {
  LoginBody,
  SignupBody,
  UpdateUserBody,
  ChangePasswordBody,
  ResetPasswordBody,
} from "../schema";
import { sendResponse } from "../utils";

const signUp: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  SignupBody,
  unknown
> = async (req, res, next) => {
  try {
    const { name, email, birthday, password } = req.body;

    const existingUser = await UserModel.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Email đã được đăng ký",
      });
    }

    const hashedPassword = await bcrypt.hash(password as string, 10);

    UserModel.sync({ alter: true }).then(() => {
      return UserModel.create({
        name: name,
        email: email,
        birthday: birthday,
        password: hashedPassword,
      });
    });

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Tạo tài khoản thành công.",
    });
  } catch (error) {
    next(error);
  }
};

const login: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  LoginBody,
  unknown
> = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ where: { email: email } });

    if (!user) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Email hoặc mật khẩu không đúng, vui lòng thử lại.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password as string,
      user.password as string
    );

    if (!isPasswordMatch) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Email hoặc mật khẩu không đúng, vui lòng thử lại.",
      });
    }

    const userObj = _.omit(user.toJSON() as User, ["password"]);

    const accessToken = generateToken(user);

    console.log(accessToken);

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Đăng nhập thành công.",
      data: userObj as User,
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  UpdateUserBody,
  unknown
> = async (req, res, next) => {
  try {
    const { name, birthday, photoURL } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({
        code: 400,
        status: "Error",
        message: "Vui lòng kiểm tra lại.",
      });
    }

    const user = await UserModel.findByPk(userId);

    if (!user) {
      return sendResponse(res, {
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

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Cập nhật thông tin thành công.",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await UserModel.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Người dùng không tồn tại.",
      });
    }
    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
const changePassword: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  ChangePasswordBody,
  unknown
> = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        status: "Error",
        message: "Vui lòng kiểm tra lại.",
      });
    }

    const user = await UserModel.findByPk(userId);

    if (!user) {
      return res.status(400).json({
        code: 400,
        status: "Error",
        message: "Người dùng không tồn tại.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword as string,
      user.password as string
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        code: 400,
        status: "Error",
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword as string, 10);

    user.password = hashedPassword; // Update the user's password
    await user.save(); // Save the updated user

    return res.status(200).json({
      code: 200,
      status: "Success",
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  ResetPasswordBody,
  unknown
> = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const user = await UserModel.findOne({ where: { email: email } });

    if (!user) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Email không tồn tại.",
      });
    }

    // Generate a new hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    // Save the updated user object
    await user.save();

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Mật khẩu đã được đặt lại thành công.",
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers: RequestHandler<
  unknown,
  ResponseResult<User[]>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Successfully retrieved all users.",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
const deleteUser: RequestHandler<
  unknown,
  ResponseResult<User | undefined>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const userId = (req.params as any).id;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        status: "Error",
        message: "Vui lòng kiểm tra lại.",
      });
    }

    const users = await UserModel.findByPk(userId);

    if (!users) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Người dùng không tồn tại.",
      });
    }

    await users.destroy();

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Xoá người dùng thành công.",
    });
  } catch (error) {
    next(error);
  }
};
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

export default UserController;
