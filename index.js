var express = require('express');
var bodyParser = require('body-parser');
var app = express();



app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use("/", require("./controller/resquestHandler"));
app.use("/", express.static(__dirname + '/public'));
app.use("/", require("./routes/index") );


app.listen(8000);
//app.set('port', 8000);

console.log('Express app started on port %d', 8000);
