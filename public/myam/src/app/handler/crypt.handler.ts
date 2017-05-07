import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable() export class CryptHandler {
  constructor() {};
  encrypt(str: string) {
    const _strArr = str.split("");
    let _tempStr = < string > Md5.hashStr("");
    for (var i = 0; i < _strArr.length; i++)
      _tempStr = < string > Md5.hashStr(_tempStr + Md5.hashStr(_strArr[i]));
    return Md5.hashStr(_tempStr);
  };
};
