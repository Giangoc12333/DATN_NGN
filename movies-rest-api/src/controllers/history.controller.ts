import { RequestHandler } from "express";
import { History, ResponseResult } from "../interfaces";
import { HistoryModel, MovieModel } from "../models";
import { CreateHistoryParams } from "../schema/history.schema";
import { ErrorCode, sendResponse } from "../utils";
const getHistoryByUserId: RequestHandler<
  unknown,
  ResponseResult<Array<History> | undefined>,
  unknown,
  unknown
> = async (req, res, next) => {

  try {
    const historys = await HistoryModel.findAll({
      where: {
        userId: req.user.id,
      },
      include: [MovieModel],
    });
    return sendResponse(res, {
      code: 200,
      status: "Success",
      data: historys,
    });
  } catch (error) {
    next(error);
  }

};

const createHistory: RequestHandler<
  CreateHistoryParams,
  ResponseResult<History | undefined>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    console.log(movieId,userId);
    console.log(typeof movieId,typeof userId);
    
    const movie = await MovieModel.findByPk(movieId);
    if (!movie) {
      return sendResponse(res, ErrorCode["movie-not-found"]);
    }

    console.log("user:", req.user);

    const checkhistory = await HistoryModel.findOne({
      where: {
        userId: req.user.id,
        movieId: movieId,
      },
    });

    if (checkhistory) {
      console.log(movieId, checkhistory.movieId )
      if(movieId == checkhistory.movieId) {
        checkhistory.update({
          movieId: checkhistory.movieId,
          userId: checkhistory.userId
        })

        return sendResponse(res, {
          code: 200,
          status: "Success",
          message: "Cập nhật thành công.",
        });
      } 
    }   
    
    const history = await HistoryModel.create({
      movieId:  parseInt(movieId.toString()),
      userId: userId,
    }) 
    sendResponse(res, {
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

  } catch (error) {
    next(error);
  }
};

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

export default HistoryController;
