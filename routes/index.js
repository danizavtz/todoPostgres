var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/todo';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.post('/api/v1/todos/', function(req,res){
	var results = [];

	//grab data from http request
	var data = {text: req.body.text, complete: false};
	pg.connect(connectionString, function(err, client, done){
		//handle connection errors
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data:err});
		}

		//sql query > Insert Data
		client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text, data.complete]);

		//sql query > select data
		var query = client.query("SELECT * FROM items");

		//stream results back one row at a time
		query.on('row', function(row){
			results.push(row);
		});

		//after all data is returned, close connection and return results
		query.on('end', function(){
			done();
			return res.json(results);
		});

	})
});

router.get('/api/v1/todos', function(req, res){
	var results = [];
	pg.connect(connectionString, function(err, client, done){
		//handle connection error
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		//SQL QUERY > select data
		var query = client.query("SELECT * FROM items");

		//stream results back one at a time
		query.on('row', function(row) {
			results.push(row);
		});

		//after all data is  returned , close connection and return results
		query.on('end', function(){
			done();
			return res.json(results);
		});
	});
});

router.put('/api/v1/todos/:todo_id', function(req, res){
	var results = [];
	//grab data from URL parameters
	//poderia ter sido feito um teste de sanidade
	var id = req.params.todo_id;
	//grab data from HTTP request
	var data = {text: req.body.text, complete: req.body.complete};

	//get a postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done){
		//handle connection error
		if(err){
			done();
			console.log(err);
			return res.status(500).send(json({success: false, data: err}));
		}
		//sql query > update data
		client.query('UPDATE items set text=($1), complete = ($2) where id=($3)', [data.text, data.complete, id]);

		var query = client.query("SELECT * from items");

		//stream results back one line at a time
		query.on('row', function(row){
			results.push(row);
		});
		query.on('end', function(){
			done();
			return res.json(results);
		});
	});
});

router.delete('/api/v1/todos/:todo_id', function(req, res){
	var results = [];
	//grab data from url parameters
	var id = req.params.todo_id;

	//get a postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done){
		//handle errors connection
		if(err){
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}
		//sql query > delete data
		client.query("DELETE FROM items WHERE id=($1)", [id]);

		//sql query > select data
		var query = client.query('SELECT * FROM items');

		//stream results back one line at a time
		query.on('row', function(row){
			results.push(row);
		});

		//after all data is returned, close connection and return results
		query.on('end', function(){
			done();
			return res.json(results);
		});
	});
});
module.exports = router;
