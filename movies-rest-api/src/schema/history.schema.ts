import * as yup from "yup";

// Create a hisotry
export const createHistorySchema = yup.object({
  params: yup.object({
    movieId: yup.number().required(),
  }),
});

export type CreateHistoryParams = yup.InferType<
  typeof createHistorySchema
>["params"];

// Delete a history
// export const deleteHistorySchema = yup.object({
//   params: yup.object({
//     movieId: yup.number().required(),
//   }),
// });

// export type DeleteHistoryParams  = yup.InferType<
//   typeof deleteHistorySchema
// >["params"];
