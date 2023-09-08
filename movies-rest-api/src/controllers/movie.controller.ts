import { Request, RequestHandler, Response } from "express";
import { INTEGER, Op } from "sequelize";
import unidecode from "unidecode";
import { countryData, genreData } from "../data";
import { Movie, ResponseResult } from "../interfaces";
import {
  CommentModel,
  CountModel,
  FavoriteModel,
  HistoryModel,
  MovieModel,
  RatingModel,
} from "../models";
import { CreateMovieBody, UpdateMovieBody } from "../schema";
import { sendResponse } from "../utils";

const createMovie: RequestHandler<
  unknown,
  ResponseResult<Movie | undefined>,
  CreateMovieBody,
  unknown
> = (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      director,
      releaseYear,
      duration,
      posterHorizontal,
      posterVertical,
      country,
      actors,
      videoURL,
      trailerURL,
    } = req.body;

    const newGenre = typeof genre == "object" ? genre : [genre];
    const newVideoUrl = typeof videoURL == "object" ? videoURL : [videoURL];

    MovieModel.sync({ alter: true }).then(() =>
      MovieModel.create({
        title,
        description,
        genre: newGenre as any,
        director,
        releaseYear,
        duration,
        posterHorizontal,
        posterVertical,
        country,
        actors,
        videoURL: newVideoUrl as any,
        trailerURL,
        viewCount: 0,
      })
    );

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Thêm phim thành công.",
    });
  } catch (error) {
    next(error);
  }
};

const updateMovie: RequestHandler<any, unknown, any, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      description,
      genre,
      director,
      releaseYear,
      duration,
      posterHorizontal,
      posterVertical,
      country,
      actors,
      videoURL,
      trailerURL,
    } = req.body;

    const newVideoUrl = typeof videoURL == "object" ? videoURL : [videoURL];
    const newGenre = typeof genre == "object" ? genre : [genre];
    const { id } = req.params;
    const movie = await MovieModel.findByPk(id);

    if (!movie) {
      return sendResponse(res, {
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
      videoURL: newVideoUrl as any,
      country,
    };

    movie.update({ ...updateMovie });

    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: movie,
    });
  } catch (error) {}
};

const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await MovieModel.findByPk(id);

    if (!movie) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Không tìm thấy phim.",
      });
    }
    movie.destroy();

    return sendResponse(res, {
      code: 200,
      status: "Success",
      message: "Xoá phim thành công.",
    });
  } catch (error) {}
};

const getAllMovies: RequestHandler<
  unknown,
  ResponseResult<Movie[]>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const movies = await MovieModel.findAll();
    return sendResponse(res, {
      code: 200,
      status: 'Success',
      message: 'Successfully retrieved all movies.',
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};


const getMovieById = async (
  req: Request,
  res: Response<ResponseResult<Movie | null>>,
  next: any
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const movie = await MovieModel.findByPk(id);

    if (!movie) {
      return sendResponse(res, {
        code: 400,
        status: "Error",
        message: "Không tìm thấy phim.",
      });
    }

    const favorite = await FavoriteModel.findOne({
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

    const ratings = await RatingModel.findAll({
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

    const numRating =
      numberOfReviews !== 0 ? Math.round(sumRatings / numberOfReviews) : 0;

    // const numRating = sumRatings / numberOfReviews;

    const newGenre = movie.genre
      .split(", ")
      .map((id) => genreData.find((genre) => genre.code === id))
      .filter(Boolean)
      .map((genre) => genre?.name)
      .join(", ");

    const newCountry = countryData.find((e) => e.code === movie?.country)?.name;

    const newMovie: Movie = {
      ...(movie.toJSON() as any),
      genre: newGenre,
      country: newCountry,
      numberOfReviews: numberOfReviews,
      rating: numRating ? numRating : 0,
      hasFavorite: !!favorite,
      // viewCounts: views.length ? views.length : 0,
    };
    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: newMovie,
    });
  } catch (error) {}
};
const searchMovie = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;

    const normalizedSearchQuery = unidecode(query);

    const movies = await MovieModel.findAll({
      where: {
        title: {
          [Op.like]: `%${normalizedSearchQuery.trim()}%`,
        },
      },
      attributes: { exclude: ["genre"] },
    });

    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    console.log(error);
  }
};

function calculateSimilarity(movieList: Movie[]) {
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

const recommendationsByMovieId = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    // Tìm kiếm thông tin phim dựa trên movieId
    const movie = await MovieModel.findByPk(movieId);

    // Lấy genre của phim
    const genre = movie?.genre;

    // Chuyển đổi genre thành một mảng
    const genreArray: string[] = genre ? genre.split(",") : [];

    // Lấy tất cả phim từ cơ sở dữ liệu
    const movies = await MovieModel.findAll();

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
    const currentViewCountVector = currentMovie?.viewCountVector;
    const currentRatingVector = currentMovie?.ratingVector;

    // Đề xuất các phim dựa trên vector tương đồng
    const similarMovies = movieVectors.filter((m) => {
      const viewCountSimilarity = calculateSimilarity(
        currentViewCountVector as any
      );
      const ratingSimilarity = calculateSimilarity(currentRatingVector as any);
      // Áp dụng một ngưỡng tương đồng để lọc kết quả
      const similarityThreshold = 0.7;
      return (
        viewCountSimilarity.totalViews > similarityThreshold ||
        ratingSimilarity.averageRating > similarityThreshold
      );
    });

    // Lấy danh sách các phim đề xuất
    const recommendedMovieIds = similarMovies.map((m) => m.id);
    const recommendeMovies = movies.filter((m) =>
      recommendedMovieIds.includes(m.id)
    );

    // Gửi phản hồi với danh sách phim đề xuất
    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: recommendedMovies,
      data1: recommendeMovies,
    });
  } catch (error) {
    console.log(error);
    // Gửi phản hồi lỗi nếu có lỗi xảy ra
    return sendResponse(res, {
      code: 500,
      status: "Error",
      message: "Internal server error",
    });
  }
};
const getLatestMovies: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const movies = await MovieModel.findAll({
      order: [["releaseYear", "DESC"]],
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

const getMoviesByGenre: RequestHandler<any, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { genreId } = req.params;

    const movies = await MovieModel.findAll({
      where: {
        genre: {
          [Op.like]: `%${genreId}%`,
        },
      },
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

const getMoviesByCountry: RequestHandler<
  any,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { countryId } = req.params;

    const movies = await MovieModel.findAll({
      where: {
        country: countryId,
      },
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

const getFavoriteMovies: RequestHandler<any, any, any, any> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const movies = await MovieModel.findAll({
      include: [
        {
          model: FavoriteModel,
          where: { userId },
        },
      ],
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};
const getHistoryMovies: RequestHandler<any, any, any, any> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const movies = await MovieModel.findAll({
      include: [
        {
          model: HistoryModel,
          where: { userId },
        },
      ],
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};
const getCommentedMovies: RequestHandler<any, any, any, any> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const movies = await MovieModel.findAll({
      include: [
        {
          model: CommentModel,
          where: { userId },
        },
      ],
    });

    sendResponse(res, {
      code: 200,
      status: "Success",
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};
const getRatedMovies: RequestHandler<any, any, any, any> = async (
  req,
  res,
  next
) => {
  try {
    const userId = +req.params.userId;
    const ratedMovies = await MovieModel.findAll({
      include: [
        {
          model: RatingModel,
          where: { userId },
        },
      ],
    });

    if (ratedMovies.length === 0) {
      // Nếu không có phim đã đánh giá, trả về phản hồi tương ứng
      sendResponse(res, {
        code: 200,
        status: "Success",
        message: "No rated movies found for the user",
        data: [],
      });
    } else {
      // Nếu có phim đã đánh giá, trả về danh sách phim
      sendResponse(res, {
        code: 200,
        status: "Success",
        data: ratedMovies,
      });
    }
  } catch (error) {
    next(error);
  }
};

const increaseCountMovie: RequestHandler<any, unknown, any, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const movie = await MovieModel.findByPk(id);

    if (!movie) {
      return sendResponse(res, {
        code: 404,
        status: "Error",
        message: "Không tìm thấy phim.",
      });
    }

    console.log(movie.dataValues);
    const viewCount = movie.viewCount + 1;

    console.log(viewCount);
    movie.update({ viewCount });

    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: movie,
    });
  } catch (error) {}
};
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

export default MovieController;
