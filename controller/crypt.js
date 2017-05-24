'use strict';
var md5 = require('md5');

exports.encrypt = function(str) {
  const _strArr = str.split('');
  let _tempStr = md5('');
  for (var i = 0; i < _strArr.length; i++)
    _tempStr = md5(_tempStr + md5(_strArr[i]));
  return md5(_tempStr);
};
