var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config.js');
var app = express();
if (config.uploadTempDir &&
  config.uploadTempDir.indexOf(" ") !== 0 &&
  config.uploadTempDir.indexOf("..") == -1 &&
  config.uploadTempDir.indexOf("/") !== 0 &&
  config.uploadTempDir.indexOf("\\") !== 0) {
  require("rimraf").sync(config.uploadTempDir);
  setTimeout(function() {
    require('fs').mkdirSync(config.uploadTempDir);
  })
}

global.ROOT_PATH = __dirname;

if (!require('fs').existsSync(config.dbFolder))
  require('fs').mkdirSync(config.dbFolder);
if (!require('fs').existsSync(config.backupFolder))
  require('fs').mkdirSync(config.backupFolder);

app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", require("./controller/resquestHandler"));
app.use("/", express.static(require('myam-ui').getUiDirectory()));
app.use("/", require("./routes/index"));


app.listen(config.port);

console.log('Express app started on port %d', config.port);
