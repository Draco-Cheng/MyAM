var colors = require('colors');

function TextAbstract(text, length) {
  if (text == null) {
    return "";
  }
  if (text.length <= length) {
    return text;
  }
  text = text.substring(0, length);
  last = text.lastIndexOf(" ");
  text = text.substring(0, last);
  return text + "...";
}

var logger = function(str) {
  console.log(TextAbstract(str, 500));
};

exports.log = function() {
  if (arguments.length === 1)
    logger("[LOG]\t" + arguments[0]);
  else
    logger("[LOG]\t" + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.info = function() {
  if (arguments.length === 1)
    logger("[INFO]\t".grey + arguments[0]);
  else
    logger("[INFO]\t".grey + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.warn = function() {
  if (arguments.length === 1)
    logger("[WARN]\t".cyan + arguments[0]);
  else
    logger("[WARN]\t".cyan + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.error = function() {
  if (arguments.length === 1)
    logger("[ERROR]\t".red + arguments[0]);
  else
    logger("[ERROR]\t".red + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.debug = function() {
  if (arguments.length === 1)
    logger("[DEBUG]\t".magenta + arguments[0]);
  else
    logger("[DEBUG]\t".magenta + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.dbLog = function() {
  if (arguments.length === 1)
    logger("[DB]\t".yellow + arguments[0]);
  else
    logger("[DB]\t".yellow + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.request = function() {
  if (arguments.length === 1)
    logger("[req]\t".green + arguments[0]);
  else
    logger("[req]\t".green + ("[" + arguments[0] + "] ").grey + arguments[1]);
};

exports.response = function() {
  if (arguments.length === 1)
    logger("[res]\t".green + arguments[0]);
  else
    logger("[res]\t".green + ("[" + arguments[0] + "] ").grey + arguments[1]);
};
