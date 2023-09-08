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
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
const getHistoryByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const historys = yield models_1.HistoryModel.findAll({
            where: {
                userId: req.user.id,
            },
            include: [models_1.MovieModel],
        });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: historys,
        });
    }
    catch (error) {
        next(error);
    }
});
const createHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;
        console.log(movieId, userId);
        console.log(typeof movieId, typeof userId);
        const movie = yield models_1.MovieModel.findByPk(movieId);
        if (!movie) {
            return (0, utils_1.sendResponse)(res, utils_1.ErrorCode["movie-not-found"]);
        }
        console.log("user:", req.user);
        const checkhistory = yield models_1.HistoryModel.findOne({
            where: {
                userId: req.user.id,
                movieId: movieId,
            },
        });
        if (checkhistory) {
            console.log(movieId, checkhistory.movieId);
            if (movieId == checkhistory.movieId) {
                checkhistory.update({
                    movieId: checkhistory.movieId,
                    userId: checkhistory.userId
                });
                return (0, utils_1.sendResponse)(res, {
                    code: 200,
                    status: "Success",
                    message: "Cập nhật thành công.",
                });
            }
        }
        const history = yield models_1.HistoryModel.create({
            movieId: parseInt(movieId.toString()),
            userId: userId,
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
        });
        // const history = await HistoryModel.sync({alter: true}).then(() => {
        //   return HistoryModel.create({
        //     movieId: movieId,
        //     userId: userId,
        //   });
        // });
        // console.log(history);
        // sendResponse(res, {
        //   code: 200,
        //   status: "Success",
        //   data: history,
        // });
    }
    catch (error) {
        next(error);
    }
});
// const deleteHistory: RequestHandler<
// DeleteHistoryParams,
//   ResponseResult<undefined>,
//   unknown,
//   unknown
// > = async (req, res, next) => {
//   try {
//     const { movieId } = req.params;
//     const history = await HistoryModel.findOne({
//       where: {
//         userId: req.user.id,
//         movieId,
//       },
//     });
//     if (!history) {
//       return sendResponse(res, ErrorCode["favorite-not-found"]);
//     }
//     history.destroy();
//     return sendResponse(res, {
//       code: 200,
//       status: "Success",
//       message: "Xoá yêu thích thành công.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };
const HistoryController = {
    getHistoryByUserId,
    createHistory,
    // deleteHistory,
};
exports.default = HistoryController;
