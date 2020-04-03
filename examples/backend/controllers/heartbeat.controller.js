const express = require('express');

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
router.get('/health-check', async (req, res, next) => {
  res.status(200).send({ status: 'ok' });
  next();
});

module.exports = router;
