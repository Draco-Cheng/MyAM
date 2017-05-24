var colors = require('colors');

var logger = require('../controller/logger.js');
var i18n = require('../i18n/i18n.js');

module.exports = function() {
  var _code, _response, _req, _res;

  if (arguments.length < 3) {
    logger.error('responseHandler error. ' + JSON.stringify(arguments));
    return;
  }

  if (typeof arguments[0] == 'object' && arguments[0]['code'] != undefined) {
    _code = arguments[0]['code'];
    _response = { message: arguments[0]['message'] || i18n.status[_code] };
    _req = arguments[1];
    _res = arguments[2];
  } else if (arguments.length === 3) {
    _code = arguments[0];
    _response = { message: i18n.status[_code] };
    _req = arguments[1];
    _res = arguments[2];
  } else {
    _code = arguments[0];
    _response = arguments[1];
    _req = arguments[2];
    _res = arguments[3];
  }

  /*var _requestLog = ('['+_req.method+']').bgGreen+' '+_req.url;
  //_requestLog += ' '+'query:'.bgGreen+JSON.stringify(_req.query);
  if(_req.query) _requestLog += ' '+'body:'.bgGreen+JSON.stringify(_req.body);
  logger.request(_requestLog);*/


  if (_code === 200)
    var _responseLog = ('[' + _req.method + ']').bgGreen + ' ' + _code.toString().bgGreen;
  else
    var _responseLog = ('[' + _req.method + ']').bgRed + ' ' + _code.toString().bgRed;


  _responseLog += ' ' + _req.originalUrl + '\n\t\t\t' + '[Response] '.grey + JSON.stringify(_response);
  logger.response(_req.reqId, _responseLog);

  _res.status(_code);
  _res.json(_response);

}
