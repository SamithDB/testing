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
	// Home SECTION =========================
	// =====================================

	app.get('/home', function(req, res) {


					connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);
                     		if(req.user.level == "admin"){
                     				var searchquery= "SELECT * FROM posts ORDER BY idposts DESC";
                     			}else{
                     				var searchquery= "SELECT * FROM posts WHERE posts.department_iddepartment = ? ORDER BY idposts DESC";
                     			}
                     		 connection.query(searchquery,[rows[0].department_iddepartment],function(err2,post){
			        		if(err2)
			        			console.log(err2);

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);

				        			var query = connection.query('SELECT * FROM announcements ORDER BY idannouncements DESC',function(err4,anns){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM department',function(err5,deplist){
				        			if(err5)
				        				console.log(err5);

				        			if(req.user.status=="B"){
										res.render('home.ejs', {
										employeelist : rowlist,
										user : rows[0],	//  pass to template
										data : post,
										ann : anns,
										message: "",
										deps: deplist,
										level: req.user.level
										});

				        			}else if(req.user.status=="C"){

				        				res.render('login.ejs', { message:"Login with Google to verify your Email" });

				        			}else{

				        				res.render('login.ejs', { message:"Not approved your account yet! Please contact your admin. " });

				        			}

				        			});
				        						
			        				});
			        			});
			        		});
                   
        			});
			});
	

	// =====================================
	// Posting news =========================
	// =====================================

	app.post('/posting', function(req, res) {

										connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
						                if (err)
						                    console.log(err);
						                    // if there is no user with that username
						                    // create the user
						                        var newPost = new Object();
						                        newPost.when = req.body.datetime;
						                        newPost.post = req.body.postnews;
						                        newPost.type = req.body.msgtype;
						                        newPost.employee_idemployee = rows[0].idemployee;
						                        newPost.department_iddepartment = req.body.depid;
						                        newPost.url = req.body.url;
						                        
						                        console.log("Connected!");
						                        var insertQuery = "INSERT INTO posts (posts.post, posts.when, posts.type, posts.employee_idemployee,posts.department_iddepartment,posts.url) values (?,?,?,?,?,?)";
							                        connection.query(insertQuery,[ newPost.post, newPost.when,newPost.type,newPost.employee_idemployee,newPost.department_iddepartment,newPost.url],function(err, rows) {
							                        if (err){
							                        		console.log(err);

							                        		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
										                    if (err1)
										                         console.log(err1);;

										                     		var query = connection.query('SELECT * FROM posts ORDER BY idposts DESC',function(err2,post){
													        		if(err2)
													        			console.log(err2);;

													        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
														        		if(err3)
														        			console.log(err3);; 

														        			var query = connection.query('SELECT * FROM announcements',function(err4,anns){
														        			if(err4)
														        				console.log(err4);;

														        				var query = connection.query('SELECT * FROM department',function(err5,deplist){
															        			if(err5)
															        				console.log(err5);

														        				res.render('home.ejs', {
																				employeelist : rowlist,
																				user : rows[0],							//  pass to template
																				data : post,
																				ann : anns,
																				message: "posterr",
																				deps: deplist,
																				level: req.user.level
																				});

														        				});
													        				});
													        			});
													        		});
										                   
										        			});
								        
							                        }else{
							                        	connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
									                    if (err1)
									                         console.log(err1);;

									                     		var query = connection.query('SELECT * FROM posts ORDER BY idposts DESC',function(err2,post){
												        		if(err2)
												        			console.log(err2);;

												        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
													        		if(err3)
													        			console.log(err3);; 

													        			var query = connection.query('SELECT * FROM announcements',function(err4,anns){
													        			if(err4)
													        				console.log(err4);

													        				var query = connection.query('SELECT * FROM department',function(err5,deplist){
															        		if(err5)
															        			console.log(err5);

													        				res.render('home.ejs', {
																			employeelist : rowlist,
																			user : rows[0],							//  pass to template
																			data : post,
																			ann : anns,
																			message: "posted",
																			deps: deplist,
																			level: req.user.level
																			});

																			});

												        				});
												        			});
												        		});
									                   
									        			});

							                        }

							                        
						                    });

							           //res.redirect('/home'); 

						            });


			});

	// =====================================
	// =====================================
	// UPLOAD A IMAGE TO FEEDER

	app.post('/imgfeeder', function(req, res) {


		connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
			if (err)
				console.log(err);
						                    
			var newPost = new Object();
			newPost.when = req.body.datetime;
			newPost.post = req.body.postnews;
			newPost.type = req.body.msgtype;
			newPost.employee_idemployee = rows[0].idemployee;
			newPost.department_iddepartment = req.body.depid;
			newPost.url = req.body.url;
						                        
			console.log("Connected!");
			var insertQuery = "INSERT INTO posts (posts.post, posts.when, posts.type, posts.employee_idemployee,posts.department_iddepartment,posts.url) values (?,?,?,?,?,?)";
			connection.query(insertQuery,[ newPost.post, newPost.when,newPost.type,newPost.employee_idemployee,newPost.department_iddepartment,newPost.url],function(err, postrows) {
			if (err){
				console.log(err);
			}else{

			newPost.idposts = postrows.insertId;

			if (!req.files)
		    	res.redirect('/home'); 
		 
		  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		  let sampleFile = req.files.sampleFile;
		 
		  // Use the mv() method to place the file somewhere on your server
		  sampleFile.mv('promos/'+newPost.idposts+'promo.jpg', function(err) {
		    if (err){
		      return res.status(500).send(err);
		    }else{
		    	//connection.query('UPDATE inventory SET imagelink1 = ? WHERE idinventory = ?',['promos/'+req.body.proid+'promo.jpg', req.body.proid], function(err, result) {
				//if (err) 
					//console.log(err);

               res.redirect('/home');

				//});


		    }
		 
		    
		  });

			}
		});
		  
	});
	  
	});

	// =====================================
	// G Drive SECTION =====================
	// =====================================
	app.get('/gdrive', function(req, res) {

					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('gdrive.ejs', {
						user : rows[0], //  pass to template
						level : req.user.level
					});

        			});

        });



	// =====================================
	// del post news =========================
	// =====================================

	app.post('/delpost', function(req, res) {
				console.log(req.body.delid);
				connection.query("DELETE FROM posts WHERE idposts = ?",[req.body.delid], function(err, rows) {
				if (err)
					console.log(err);

				console.log("Post deleted");
				res.redirect('/home'); 
						                    
						                        
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
