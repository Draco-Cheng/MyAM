import { Injectable } from '@angular/core';

var i18nPool = {};
var language = 'en-us';
i18nPool['en-us'] = require('./en-us.json');

export function i18n(type, query){
  try{
    return i18nPool[language][type][query] || console.error('[i18n] query not found', language, type, query);
  } catch (e) {
    console.error('[i18n] query error', language, type, query);
    console.error(e);
    return '';
  }  
};
