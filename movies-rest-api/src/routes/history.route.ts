import { Router } from "express";
import { HistoryController } from "../controllers";
import { authenticateToken, validateRequestSchema } from "../middleware";
import { createHistorySchema } from "../schema";

const router = Router();



// router.get(
//   "/history/:userId",
//   authenticateToken,
//   HistoryController.getHistoryByUserId
// )

// Create a history
router.post(
  "/history/:movieId",
  authenticateToken,
  validateRequestSchema(createHistorySchema),
  HistoryController.createHistory
);

// Delete a favorite
// router.delete(
//   "/movies/:movieId/historys",
//   authenticateToken,
//   validateRequestSchema(deleteHistorySchema),
//   HistoryController.deleteHistory
// );

export default router;
