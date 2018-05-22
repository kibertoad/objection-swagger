const app = require("./app");
const logger = require("./services/logging.service");
const PORT = require("config").http.port;

app.getApp().then(appInstance => {
  appInstance.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`);
  });
});
