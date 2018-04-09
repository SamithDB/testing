// app/routes.js
	
	var dbconfig = require('../config/database');
	var mysql = require('mysql');
	var connection = mysql.createConnection(dbconfig.connection);
	var cookieParser = require('cookie-parser');
	const fileUpload = require('express-fileupload');
	var math = require('mathjs');
		
	connection.query('USE ' + dbconfig.database);


module.exports = function(app, passport) {

// =====================================
	// Dashboard ===========================
	// =====================================
	app.get('/dash', function(req, res) {
		

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);

				        			var query = connection.query('SELECT * FROM login',function(err4,usrlist){
				        			if(err3)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM department',function(err4,deplist){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM store',function(err5,storelist){
				        			if(err5)
				        				console.log(err5);

				        			if(req.user.level=="admin"){
				        				res.render('dashboard.ejs', {
										employeelist : rowlist,
										user : rows[0],		//  pass to template
										allusrs : usrlist,
										department : deplist,
										store : storelist,
										level : req.user.level
										});
				        			}else{
				        				res.render('profile.ejs', {
										user : rows[0], //  pass to template
										message: "notadmin",
										level : req.user.level
										});
				        			}

				        			});
				        				
				        			});

			        			  	});
				        			
			        			});
                   
        	});


	});


	// =====================================
	// =====================================
	// Set Announcements

	app.post('/ann', function(req, res, next) {

		
			var newann = new Object();
			newann.post = req.body.postann;
			newann.when = req.body.datetime;
			newann.employee_idemployee = req.body.usr;

			var insertQuery = "INSERT INTO announcements (announcements.post, announcements.when, announcements.employee_idemployee)values (?,?,?)";
			connection.query(insertQuery,[ newann.post, newann.when,newann.employee_idemployee],function(err, rows) {
				 if (err) {
					console.log(err);
				
					
					
				} else {
					console.log('Data updated successfully!');
					res.redirect('/home'); 
					
				}
			})
		

	});

	// =====================================
	// =====================================
	// Del Announcements

	app.post('/delann', function(req, res, next) {
				console.log(req.body.annid);
				connection.query("DELETE FROM announcements WHERE idannouncements = ?",[req.body.annid], function(err, rows) {
				if (err)
					console.log(err);

				res.redirect('/home'); 
						                    
						                        
				});
	});

	// =====================================
	// =====================================
	// Apprv Usr

	app.post('/apprv', function(req, res, next) {

		
			var newusr = new Object();
			newusr.empid = req.body.empid;
			newusr.usrid = req.body.usrid;
			newusr.level = req.body.level;
			newusr.status = "C";


			var insertQuery = "UPDATE login SET login.level = ?, login.status = ? WHERE login.idlogin = ?";
			connection.query(insertQuery,[ newusr.level, newusr.status,newusr.usrid ],function(err, rows) {
				 if (err) {
					console.log(err);
				
				} else {
					connection.query("UPDATE employee SET department_iddepartment = ? WHERE login_idlogin = ?",[req.body.dep, newusr.usrid], function(err, rows) {
                    if (err)
                         console.log(err);;
                     });
					console.log('Permition Granted');
					res.redirect('/dash'); 
					
				}
			})
		

	});

	// =====================================
	// =====================================
	// Rvk Usr

	app.post('/revk', function(req, res, next) {

			var newusr = new Object();
			newusr.usrid = req.body.usrid;
			newusr.status = "A";


			var insertQuery = "UPDATE login SET login.status = ? WHERE login.idlogin = ?";
			connection.query(insertQuery,[ newusr.status, newusr.usrid ],function(err, rows) {
				 if (err) 
					console.log(err);

				res.redirect('/home');
				
			})
		

	});

	// =====================================
	// Groups ==============================
	// =====================================

	app.post('/addgp', function(req, res) {

			var newgroup = new Object();
			newgroup.name = req.body.name;
			newgroup.description = req.body.desc;
			newgroup.store = req.body.store;

			var insertQuery = "INSERT INTO department (department.name, department.description, department.store_idstore) values (?,?,?)";
			connection.query(insertQuery,[newgroup.name, newgroup.description, newgroup.store],function(err, rows) {
			 if (err)
				 console.log(err);

			console.log("Done!");
			res.redirect('/dash'); 

			});

		});

		app.post('/editgp', function(req, res) {

			var newgroup = new Object();
			newgroup.id = req.body.gpid;
			newgroup.name = req.body.gpname;
			newgroup.description = req.body.gpdes;


			var insertQuery = "UPDATE department SET department.name = ?, department.description = ? WHERE department.iddepartment = ?";
			connection.query(insertQuery,[ newgroup.name, newgroup.description,newgroup.id ],function(err, rows) {
				 if (err) {
					console.log(err);
				
				} else {
					
					console.log('edited');
					res.redirect('/dash'); 
					
				}
			})

		});

	// =======================
	// Users =================
	// =======================

	app.get('/usrlist', function(req, res) {

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
            if (err1)
              	console.log(err1);

            connection.query("SELECT * FROM employee", function(err1, emplist) {
            if (err1)
              	console.log(err1);

			var query = connection.query("SELECT * FROM login",function(err2,usrlist){
				if(err2)
					console.log(err2);

					if(usrlist.length){

						res.render('users.ejs', {
						user : rows[0],		//  pass to template
						usrlist : usrlist,
						emp : emplist,
						level : req.user.level
						});

					}else{
						res.redirect('/home');
					}


				});
			})
		});

	});

	// ========================
	// Admins =================
	// ========================

	app.get('/adminlist', function(req, res) {

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
            if (err1)
              	console.log(err1);

            connection.query("SELECT * FROM employee", function(err1, emplist) {
            if (err1)
              	console.log(err1);

			var query = connection.query("SELECT * FROM login",function(err2,usrlist){
				if(err2)
					console.log(err2);

				var query = connection.query("SELECT * FROM department",function(err2,deplist){
				if(err2)
					console.log(err2);

					if(usrlist.length){

						res.render('admins.ejs', {
						user : rows[0],		//  pass to template
						usrlist : usrlist,
						emp : emplist,
						level : req.user.level,
						department : deplist 
						});

					}else{
						res.redirect('/home');
					}


					});

				});
			});
		});

	});
	
}


// route middleware to make sure
function isLoggedIn(req, res, next) {


		// if user is authenticated in the session, carry on
		if (req.isAuthenticated()){
			return next();
		}

		// if they aren't redirect them to the home page
		res.redirect('/');
}
