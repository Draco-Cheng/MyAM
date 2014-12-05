var colors = require('colors');

exports.log = function(log){
	console.log("[LOG] "+log);
}

exports.info = function(log){
	console.log("[INFO] ".grey+log);
}

exports.error = function(error){
	console.log("[ERROR] ".red+error);
}

exports.debug = function(error){
	console.log("[DEBUG] ".magenta+error);
}

exports.dbLog = function(sql){
	console.log("[DB] ".yellow+sql);
}

exports.request = function(str){
	console.log("[request] ".green+str);
}

exports.response = function(str){
	console.log("[response] ".green+str);
}