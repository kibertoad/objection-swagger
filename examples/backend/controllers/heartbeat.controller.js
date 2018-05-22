const express = require("express");
const httpStatus = require("http-status");

const db = require("../services/db.service");

const router = express.Router();

/**
 * @swagger
 * /health-check:
 *   get:
 *     description: Check heartbeat
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: heartbeat report
 */
router.get("/health-check", async (req, res, next) => {
  //ToDo
});

module.exports = router;
