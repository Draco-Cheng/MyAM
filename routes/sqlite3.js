var express = require('express');
var router = express.Router();
var services  = {};
	services.dbController = require('../services/initial.js');

/*file = "./db/test.db"
var exists = fs.existsSync(file);
var db = new sqlite3.Database(file);



router.route('/sqlite3').get(function(req, res) {
	db.serialize(function() {
	  
		db.run("CREATE TABLE IF NOT EXISTS test (value1 TEXT, value2 TEXT)");

		var _data = [];
		db.each(
			"SELECT rowid AS id, value1, value2 FROM test", 
	  		function(err, row) {
		    	console.log(row.id + ": " + row.value1 + ":"+ row.value2);
		    	_data.push(row);
	  		},
	  		function(){
		  		console.log('Read Data finish!!');
			    res.render('sqlite3', {
			    	 title: 'Node.js CH6' ,
			    	 css : 'sqlite3.css',
			    	 data : _data
			    });
			}
		);

	});
});


router.route('/sqlite3/:type').post(function(req, res) {

	db.serialize(function() {
	  
		db.run("CREATE TABLE IF NOT EXISTS test (value1 TEXT, value2 TEXT)");


		if(req.params.type == "delete"){
			db.run("DELETE FROM test WHERE rowid = ?", 
			[ req.body.id ],
			function(err) {
				if (err) console.log("Error!!");
				console.log("DELETE!!",req.body.id);
				res.end();
			});
		}else{
			if(req.body.id){
				 db.run("UPDATE test SET value1 = ?, value2 = ? WHERE rowid = ?",
				 [ req.body.value1,req.body.value2, req.body.id ],
				 function(err) {
					 if (err) console.log("Error!!")
				 });
				 res.end();
			}else{
				var stmt = db.prepare("INSERT INTO test VALUES (?,?)");
				stmt.run(req.body.value1,req.body.value2);
				stmt.finalize();
				res.end();
			}				
		}
		

	});


	res.end();
});

module.exports = router;*/