exports.log = function(log){
	console.log("[LOG] "+log);
}

exports.info = function(log){
	console.log("[INFO] "+log);
}

exports.error = function(error){
	console.log("[ERROR] "+error);
}

exports.debug = function(error){
	console.log("[DEBUG] "+error);
}

exports.dbLog = function(sql){
	console.log("[DB] "+sql);
}