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
const sequelize_1 = require("sequelize");
const unidecode_1 = __importDefault(require("unidecode"));
const data_1 = require("../data");
const models_1 = require("../models");
const utils_1 = require("../utils");
const createMovie = (req, res, next) => {
    try {
        const { title, description, genre, director, releaseYear, duration, posterHorizontal, posterVertical, country, actors, videoURL, trailerURL, } = req.body;
        const newGenre = typeof genre == "object" ? genre : [genre];
        const newVideoUrl = typeof videoURL == "object" ? videoURL : [videoURL];
        models_1.MovieModel.sync({ alter: true }).then(() => models_1.MovieModel.create({
            title,
            description,
            genre: newGenre,
            director,
            releaseYear,
            duration,
            posterHorizontal,
            posterVertical,
            country,
            actors,
            videoURL: newVideoUrl,
            trailerURL,
            viewCount: 0,
        }));
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Thêm phim thành công.",
        });
    }
    catch (error) {
        next(error);
    }
};
const updateMovie = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, genre, director, releaseYear, duration, posterHorizontal, posterVertical, country, actors, videoURL, trailerURL, } = req.body;
        const newVideoUrl = typeof videoURL == "object" ? videoURL : [videoURL];
        const newGenre = typeof genre == "object" ? genre : [genre];
        const { id } = req.params;
        const movie = yield models_1.MovieModel.findByPk(id);
        if (!movie) {
            return (0, utils_1.sendResponse)(res, {
                code: 404,
                status: "Error",
                message: "Không tìm thấy phim.",
            });
        }
        const updateMovie = {
            title,
            description,
            director,
            releaseYear,
            duration,
            posterHorizontal,
            posterVertical,
            actors,
            trailerURL,
            genre: newGenre,
            videoURL: newVideoUrl,
            country,
        };
        movie.update(Object.assign({}, updateMovie));
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movie,
        });
    }
    catch (error) { }
});
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield models_1.MovieModel.findByPk(id);
        if (!movie) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Không tìm thấy phim.",
            });
        }
        movie.destroy();
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            message: "Xoá phim thành công.",
        });
    }
    catch (error) { }
});
const getAllMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield models_1.MovieModel.findAll();
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: 'Success',
            message: 'Successfully retrieved all movies.',
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getMovieById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const movie = yield models_1.MovieModel.findByPk(id);
        if (!movie) {
            return (0, utils_1.sendResponse)(res, {
                code: 400,
                status: "Error",
                message: "Không tìm thấy phim.",
            });
        }
        const favorite = yield models_1.FavoriteModel.findOne({
            where: {
                userId: userId,
                movieId: id,
            },
        });
        // const views = await CountModel.findAll({
        //   where: {
        //     movieId: id,
        //     userId,
        //   },
        // });
        const ratings = yield models_1.RatingModel.findAll({
            where: {
                movieId: id,
            },
        });
        const sumRatings = ratings
            ? ratings.reduce((total, e) => total + e.rating, 0)
            : 0;
        // const numberOfReviews = movie.rating? +1: 0;
        const numberOfReviews = ratings ? ratings.length : 0;
        console.log(sumRatings);
        console.log(numberOfReviews);
        const numRating = numberOfReviews !== 0 ? Math.round(sumRatings / numberOfReviews) : 0;
        // const numRating = sumRatings / numberOfReviews;
        const newGenre = movie.genre
            .split(", ")
            .map((id) => data_1.genreData.find((genre) => genre.code === id))
            .filter(Boolean)
            .map((genre) => genre === null || genre === void 0 ? void 0 : genre.name)
            .join(", ");
        const newCountry = (_a = data_1.countryData.find((e) => e.code === (movie === null || movie === void 0 ? void 0 : movie.country))) === null || _a === void 0 ? void 0 : _a.name;
        const newMovie = Object.assign(Object.assign({}, movie.toJSON()), { genre: newGenre, country: newCountry, numberOfReviews: numberOfReviews, rating: numRating ? numRating : 0, hasFavorite: !!favorite });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: newMovie,
        });
    }
    catch (error) { }
});
const searchMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.params;
        const normalizedSearchQuery = (0, unidecode_1.default)(query);
        const movies = yield models_1.MovieModel.findAll({
            where: {
                title: {
                    [sequelize_1.Op.like]: `%${normalizedSearchQuery.trim()}%`,
                },
            },
            attributes: { exclude: ["genre"] },
        });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        console.log(error);
    }
});
function calculateSimilarity(movieList) {
    let totalViews = 0;
    let totalRating = 0;
    let averageRating = 0;
    console.log(movieList);
    for (const movie of movieList) {
        // Tính tổng số lượt xem
        totalViews += movie.viewCount || 0;
        // Tính tổng rating
        totalRating += movie.rating || 0;
    }
    if (movieList.length > 0) {
        averageRating = totalRating / movieList.length;
    }
    return {
        totalViews,
        averageRating,
    };
}
const recommendationsByMovieId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        // Tìm kiếm thông tin phim dựa trên movieId
        const movie = yield models_1.MovieModel.findByPk(movieId);
        // Lấy genre của phim
        const genre = movie === null || movie === void 0 ? void 0 : movie.genre;
        // Chuyển đổi genre thành một mảng
        const genreArray = genre ? genre.split(",") : [];
        // Lấy tất cả phim từ cơ sở dữ liệu
        const movies = yield models_1.MovieModel.findAll();
        // Lọc các phim đề xuất dựa trên genre
        const recommendedMovies = movies.filter((m) => {
            if (m.id.toString() !== movieId) {
                const movieGenres = m.genre.split(",");
                for (let i = 0; i < genreArray.length; i++) {
                    if (movieGenres.includes(genreArray[i])) {
                        return true;
                    }
                }
            }
            return false;
        });
        // Tạo các vector cho phim dựa trên viewCount và rating
        const movieVectors = movies.map((m) => {
            const viewCountVector = [m.viewCount || 0];
            const ratingVector = [m.rating || 0];
            return {
                id: m.id,
                viewCountVector,
                ratingVector,
            };
        });
        // Tính toán vector cho phim hiện tại
        const currentMovie = movieVectors.find((m) => m.id.toString() === movieId);
        const currentViewCountVector = currentMovie === null || currentMovie === void 0 ? void 0 : currentMovie.viewCountVector;
        const currentRatingVector = currentMovie === null || currentMovie === void 0 ? void 0 : currentMovie.ratingVector;
        // Đề xuất các phim dựa trên vector tương đồng
        const similarMovies = movieVectors.filter((m) => {
            const viewCountSimilarity = calculateSimilarity(currentViewCountVector);
            const ratingSimilarity = calculateSimilarity(currentRatingVector);
            // Áp dụng một ngưỡng tương đồng để lọc kết quả
            const similarityThreshold = 0.7;
            return (viewCountSimilarity.totalViews > similarityThreshold ||
                ratingSimilarity.averageRating > similarityThreshold);
        });
        // Lấy danh sách các phim đề xuất
        const recommendedMovieIds = similarMovies.map((m) => m.id);
        const recommendeMovies = movies.filter((m) => recommendedMovieIds.includes(m.id));
        // Gửi phản hồi với danh sách phim đề xuất
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: recommendedMovies,
            data1: recommendeMovies,
        });
    }
    catch (error) {
        console.log(error);
        // Gửi phản hồi lỗi nếu có lỗi xảy ra
        return (0, utils_1.sendResponse)(res, {
            code: 500,
            status: "Error",
            message: "Internal server error",
        });
    }
});
const getLatestMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield models_1.MovieModel.findAll({
            order: [["releaseYear", "DESC"]],
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getMoviesByGenre = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { genreId } = req.params;
        const movies = yield models_1.MovieModel.findAll({
            where: {
                genre: {
                    [sequelize_1.Op.like]: `%${genreId}%`,
                },
            },
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getMoviesByCountry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryId } = req.params;
        const movies = yield models_1.MovieModel.findAll({
            where: {
                country: countryId,
            },
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getFavoriteMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const movies = yield models_1.MovieModel.findAll({
            include: [
                {
                    model: models_1.FavoriteModel,
                    where: { userId },
                },
            ],
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getHistoryMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const movies = yield models_1.MovieModel.findAll({
            include: [
                {
                    model: models_1.HistoryModel,
                    where: { userId },
                },
            ],
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getCommentedMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const movies = yield models_1.MovieModel.findAll({
            include: [
                {
                    model: models_1.CommentModel,
                    where: { userId },
                },
            ],
        });
        (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movies,
        });
    }
    catch (error) {
        next(error);
    }
});
const getRatedMovies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = +req.params.userId;
        const ratedMovies = yield models_1.MovieModel.findAll({
            include: [
                {
                    model: models_1.RatingModel,
                    where: { userId },
                },
            ],
        });
        if (ratedMovies.length === 0) {
            // Nếu không có phim đã đánh giá, trả về phản hồi tương ứng
            (0, utils_1.sendResponse)(res, {
                code: 200,
                status: "Success",
                message: "No rated movies found for the user",
                data: [],
            });
        }
        else {
            // Nếu có phim đã đánh giá, trả về danh sách phim
            (0, utils_1.sendResponse)(res, {
                code: 200,
                status: "Success",
                data: ratedMovies,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
const increaseCountMovie = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield models_1.MovieModel.findByPk(id);
        if (!movie) {
            return (0, utils_1.sendResponse)(res, {
                code: 404,
                status: "Error",
                message: "Không tìm thấy phim.",
            });
        }
        console.log(movie.dataValues);
        const viewCount = movie.viewCount + 1;
        console.log(viewCount);
        movie.update({ viewCount });
        return (0, utils_1.sendResponse)(res, {
            code: 200,
            status: "Success",
            data: movie,
        });
    }
    catch (error) { }
});
const MovieController = {
    createMovie,
    updateMovie,
    deleteMovie,
    getAllMovies,
    getMovieById,
    searchMovie,
    recommendationsByMovieId,
    getLatestMovies,
    getMoviesByGenre,
    getMoviesByCountry,
    getFavoriteMovies,
    getCommentedMovies,
    getRatedMovies,
    increaseCountMovie,
    getHistoryMovies,
};
exports.default = MovieController;
