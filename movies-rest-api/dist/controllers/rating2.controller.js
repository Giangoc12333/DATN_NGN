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
exports.ErrorCode = exports.sendResponse = void 0;
const models_1 = require("../models");
const sendResponse = (res, data) => {
    res.status(data.code).json(data);
};
exports.sendResponse = sendResponse;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["rating-not-found"] = "RATING_NOT_FOUND";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
const getRatingByMovie2 = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ratingId } = req.params;
        const rating = yield models_1.RatingModel2.findByPk(ratingId);
        if (!rating) {
            return (0, exports.sendResponse)(res, ErrorCode["rating-not-found"]);
        }
        return (0, exports.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: rating,
        });
    }
    catch (error) {
        next(error);
    }
});
const RatingController = {
    getRatingByMovie2,
};
exports.default = RatingController;
