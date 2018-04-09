// app/routes.js
	
	var dbconfig = require('../config/database');
	var mysql = require('mysql');
	var connection = mysql.createConnection(dbconfig.connection);
	var cookieParser = require('cookie-parser');
	const fileUpload = require('express-fileupload');
	var math = require('mathjs');
	var bcrypt = require('bcrypt-nodejs');

	connection.query('USE ' + dbconfig.database);


	module.exports = function(app, passport) {


	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home', // redirect to the secure home section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		
		successRedirect : '/fillprofile', // redirect to the secure home section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages

	}));

	
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {

		connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "",
						level : req.user.level
					});

        });

		
	});

	// =====================================
	// Fill Profile ========================
	// =====================================

	app.get('/fillprofile', isLoggedIn, function(req, res) {

		connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('fillprofile.ejs', {
						user : rows[0], //  pass to template
						message: "",
						message2: "Please fill Your details and login to the system! (Admin approvel require for login)"
					});

        });

		
	});

	// =====================================
	// VIEW Profile ========================

	app.post('/viewprofile', function(req, res) {

		var newview = new Object();
		newview.mail = req.body.searchmail;

		connection.query("SELECT * FROM employee WHERE employee.username = ?",[newview.mail], function(err, view) {
                    if (err){
                         console.log(err);
                         
                         
                     }else{

	                    connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err1, rows) {
	                    if (err1)
	                         console.log(err1);

	                     	if(view.length!=0){
	                     		res.render('profileview.ejs', {
								user : rows[0], //  pass to template
								view : view[0],
								level : req.user.level
								});
	                     	}else{
	                     		res.render('profile.ejs', {
								user : rows[0], //  pass to template
								message: "err",
								level : req.user.level
								});
	                     	}
	                     	
	                     	


                    });
	                }
                    
        });

		
	});

	// =====================================
	// =====================================
	// EDIT USER

	app.post('/updating', function(req, res, next) {

		
			connection.query('UPDATE employee SET fname = ?, lname = ?, gender=?, EPF = ?, nic = ?, birthday = ?, address= ?, contact = ?, designation = ?, description = ?  WHERE login_idlogin = ?',[req.body.fname2, req.body.lname2, req.body.gen, req.body.epf2, req.body.nic2, req.body.birthday2, req.body.address2, req.body.contact2, req.body.designation2, req.body.description2, req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "upfail",
						level : req.user.level
					});

        			});
					
				} else {
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "Updated",
						level : req.user.level
					});

        			});
					
				}
			})
		

	});

	// =====================================
	// =====================================
	// Change Password

	app.post('/changepass', function(req, res, next) {
		if(req.body.password == req.body.password2){
		
			connection.query('UPDATE login SET password = ?  WHERE idlogin = ?',[bcrypt.hashSync(req.body.password, null, null), req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "upfail",
						level : req.user.level
					});

        			});
					
				} else {
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "Updated",
						level : req.user.level
					});

        			});
					
				}
			})

		}else{
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "upfail",
						level : req.user.level
					});

        			});

		}

	});


	// =====================================
	// =====================================
	// USER First Update

	app.post('/firstupdating', function(req, res, next) {

		
			connection.query('UPDATE employee SET fname = ?, lname = ?, gender=?, EPF = ?, nic = ?, birthday = ?, address= ?, contact = ?, designation = ?, description = ?  WHERE login_idlogin = ?',[req.body.fname2, req.body.lname2, req.body.gen, req.body.epf2, req.body.nic2, req.body.birthday2, req.body.address2, req.body.contact2, req.body.designation2, req.body.description2, req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('fillprofile.ejs', {
						user : rows[0], //  pass to template
						message: "upfail",
						message2: "Please fill Your details and login to the system! (Admin approvel require for login)",
						level : req.user.level
					});

        			});
					
				} else {
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('fillprofile.ejs', {
						user : rows[0], //  pass to template
						message: "Updated",
						message2: "Please fill Your details and login to the system! (Admin approvel require for login)",
						level : req.user.level
					});

        			});
					
				}
			})
		

	});


	// =====================================
	// =====================================
	// UPLOAD PROFILE PIC

	app.use(fileUpload());

	app.post('/profilepic', function(req, res) {

		  if (!req.files)
		    res.redirect('/profile'); 
		 
		  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		  let sampleFile = req.files.sampleFile;
		 
		  // Use the mv() method to place the file somewhere on your server
		  sampleFile.mv('propics/'+req.user.idlogin+'propic.jpg', function(err) {
		    if (err){
		      return res.status(500).send(err);
		    }else{
		    	connection.query('UPDATE employee SET image = ? WHERE login_idlogin = ?',['pics/'+req.user.idlogin+'propic.jpg', req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "notuploaded",
						level : req.user.level
					});

        			});
					
				}else{

					console.log('pic uploaded!');
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0], //  pass to template
						message: "Uploaded",
						level : req.user.level
					});

        			});
					

				}


				});


		    }
		 
		    
		  });

		});


	// =====================================
	// =====================================
	// First UPLOAD PROFILE PIC  

	app.post('/firstprofilepic', function(req, res) {

		  if (!req.files)
		    res.redirect('/fillprofile'); 
		 
		  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		  let sampleFile = req.files.sampleFile;
		 
		  // Use the mv() method to place the file somewhere on your server
		  sampleFile.mv('propics/'+req.user.idlogin+'propic.jpg', function(err) {
		    if (err){
		      return res.status(500).send(err);
		    }else{
		    	connection.query('UPDATE employee SET image = ? WHERE login_idlogin = ?',['pics/'+req.user.idlogin+'propic.jpg', req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('fillprofile.ejs', {
						user : rows[0], //  pass to template
						message: "notuploaded",
						message2: "Please fill Your details and login to the system! (Admin approvel require for login)",
						level : req.user.level
					});

        			});
					
				}else{

					console.log('pic uploaded!');
					connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('fillprofile.ejs', {
						user : rows[0], //  pass to template
						message: "Uploaded",
						message2: "Please fill Your details and login to the system! (Admin approvel require for login)",
						level : req.user.level
					});

        			});
					

				}


				});


		    }
		 
		    
		  });

		});


	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});




    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    failureFlash : true,
					successRedirect : '/home',
                    failureRedirect : '/signup'
					
            }));


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Arhive
	/*			    
					'use strict';

					const process = require('process'); // Required to mock environment variables

					// [START app]
					const format = require('util').format;
					const express = require('express');
					const Multer = require('multer');
					const bodyParser = require('body-parser');
					const Storage = require('@google-cloud/storage');
					const storage = Storage();


					// [START config]
					// Multer is required to process file uploads and make them available via
					// req.files.
					const multer = Multer({
					  storage: Multer.memoryStorage(),
					  limits: {
					    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
					  }
					});

					// A bucket is a container for objects (files).
					const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
					// [END config]



				    // Employee File Archive
					app.get('/archive', function(req, res) {
						res.render('archive.ejs'); // load the index.ejs file
					});

					// [START process]
					// Process the file upload and upload to Google Cloud Storage.
					app.post('/archive', multer.single('file'), (req, res, next) => {
					  if (!req.file) {
					    res.status(400).send('No file uploaded.');
					    return;
					  }

					  // Create a new blob in the bucket and upload the file data.
					  const blob = bucket.file(req.file.originalname);
					  const blobStream = blob.createWriteStream();

					  blobStream.on('error', (err) => {
					    next(err);
					  });

					  blobStream.on('finish', () => {
					    // The public URL can be used to directly access the file via HTTP.
					    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
					    res.status(200).send(publicUrl);
					  });

					  blobStream.end(req.file.buffer);
					});
					// [END process]

*/
	
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
