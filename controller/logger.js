var colors = require('colors');

exports.log = function(){
	if(arguments.length===1)
		console.log("[LOG]\t"+arguments[0]);
	else
		console.log("[LOG]\t"+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.info = function(){
	if(arguments.length===1)
		console.log("[INFO]\t".grey+arguments[0]);
	else
		console.log("[INFO]\t".grey+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.warn = function(){
	if(arguments.length===1)
		console.log("[WARN]\t".cyan+arguments[0]);
	else
		console.log("[WARN]\t".cyan+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.error = function(){
	if(arguments.length===1)
		console.log("[ERROR]\t".red+arguments[0]);
	else
		console.log("[ERROR]\t".red+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.debug = function(){
	if(arguments.length===1)
		console.log("[DEBUG]\t".magenta+arguments[0]);
	else
		console.log("[DEBUG]\t".magenta+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.dbLog = function(){
	if(arguments.length===1)
		console.log("[DB]\t".yellow+arguments[0]);
	else
		console.log("[DB]\t".yellow+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.request = function(){
	if(arguments.length===1)
		console.log("[req]\t".green+arguments[0]);
	else
		console.log("[req]\t".green+("["+arguments[0]+"] ").grey+arguments[1]);
}

exports.response = function(){
	if(arguments.length===1)
		console.log("[res]\t".green+arguments[0]);
	else
		console.log("[res]\t".green+("["+arguments[0]+"] ").grey+arguments[1]);
}