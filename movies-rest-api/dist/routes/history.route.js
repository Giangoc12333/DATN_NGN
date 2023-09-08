"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const schema_1 = require("../schema");
const router = (0, express_1.Router)();
// router.get(
//   "/history/:userId",
//   authenticateToken,
//   HistoryController.getHistoryByUserId
// )
// Create a history
router.post("/history/:movieId", middleware_1.authenticateToken, (0, middleware_1.validateRequestSchema)(schema_1.createHistorySchema), controllers_1.HistoryController.createHistory);
// Delete a favorite
// router.delete(
//   "/movies/:movieId/historys",
//   authenticateToken,
//   validateRequestSchema(deleteHistorySchema),
//   HistoryController.deleteHistory
// );
exports.default = router;
