// app/routes.js
	
	var dbconfig = require('../config/database');
	var mysql = require('mysql');
	var connection = mysql.createConnection(dbconfig.connection);
	var cookieParser = require('cookie-parser');
	const fileUpload = require('express-fileupload');
	
		
	connection.query('USE ' + dbconfig.database);

	var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
   		 	process.env.USERPROFILE) + '/.credentials/';
	var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
	
	module.exports = function(app, passport) {

		// ====================================
		// DMS Home ===========================
		// ====================================

		app.get('/dmshome', function(req, res) {
		

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);

				        			var query = connection.query('SELECT * FROM login',function(err4,usrlist){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM department',function(err4,deplist){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM store',function(err5,storelist){
				        			if(err5)
				        				console.log(err5);

				        			var query = connection.query('SELECT * FROM dmslevel WHERE login_idlogin = ? ',[req.user.idlogin],function(err6,dmslevel){
				        			if(err6)
				        				console.log(err6);

				        				if(dmslevel[0].status == 'B'){
				        					res.render('dms_home.ejs', {
											employeelist : rowlist,
											user : rows[0],		//  pass to template
											allusrs : usrlist,
											department : deplist,
											store : storelist,
											level : req.user.level,
											dmslevel : dmslevel[0]
											});
				        				}else{
				        					res.redirect('/home');
				        				}

				        		});

				        	});
				        				
				        });

			        });
				        			
			    });
                   
        	});


		});


		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------
		// --------------------------------------------------------------------------------

		'use strict';

		// [START main_body]
		const google = require('googleapis');
		const express = require('express');
		const opn = require('opn');
		const path = require('path');
		const fs = require('fs');
		const os = require('os');

		const scopes = ['https://www.googleapis.com/auth/drive'];

		// Create an oAuth2 client to authorize the API call
		const client = new google.auth.OAuth2(
		  '230517522799-27ng1ovvthmq1hnfhrtqsjoqpt0pdk32.apps.googleusercontent.com',
		  'c7YPB0E9JwwAY35POsSN72BT',
		  'http://localhost:8080/dmscode'
		);

		const client1 = new google.auth.OAuth2(
		  '230517522799-27ng1ovvthmq1hnfhrtqsjoqpt0pdk32.apps.googleusercontent.com',
		  'c7YPB0E9JwwAY35POsSN72BT',
		  'http://localhost:8080/newtoken'
		);

		
		
		app.get('/dms', (req, res) => {

			// Generate the url that will be used for authorization
			this.authorizeUrl = client.generateAuthUrl({
			  access_type: 'offline',
			  scope: scopes
			});
		
			opn(this.authorizeUrl, { wait: false });

			res.redirect('/home');
		
		});

		//Create new token -- Super admin Function

		app.post('/dmsnew', (req, res) => {

			if(req.body.pass == "cp@colombo"){

				// Generate the url that will be used for authorization
				this.authorizeUrl = client1.generateAuthUrl({
				  access_type: 'offline',
				  scope: scopes
				});
			
				opn(this.authorizeUrl, { wait: false });

				res.redirect('/home');

			}else{
				console.log("wrong Password");
				res.redirect('/home');
			}

			
		
		});

		//Token Refresh Code

		app.get('/refresh', (req, res) => {

			// Generate the url that will be used for authorization
			this.authorizeUrl = client.generateAuthUrl({
			  grant_type: 'refresh_token',
			  refresh_token: 'YOUR_REFRESH_TOKEN',
			  scope: scopes
			});
		
			opn(this.authorizeUrl, { wait: false });
		
		});

		// /oauth2callback?code=<code>
		// Open an http server to accept the oauth callback. In this
		// simple example, the only request to our webserver is to

		app.get('/dmscode', (req, res) => {

			// Check if we have previously stored a token.
				fs.readFile(TOKEN_PATH, function(err, token) {
				if (err) {

				res.redirect('/home');

				} else {
				      client.credentials = JSON.parse(token);
				      //callback(client);
				       console.log("----------------token found---------------------");
				      console.log(client.credentials);
				      res.redirect('/dmshome');
				}
			});

			
		});

		// ==================================
		// Create Token =====================
		// ==================================
		app.get('/newtoken', (req, res) => {

			//getNewToken(client, callback);
				const code = req.query.code;
		  		console.log("code----------"+code);

		  		client1.getToken(code, (err, tokens) => {
				if (err) {
			  	console.error('Error getting oAuth tokens:');
			  	throw err;
				}else{

				storeToken(tokens);
				console.log("Saved-------------- "+tokens);
				res.redirect('/home');

				}
		  	
		  	});

			
		});

		// Save the token
		function storeToken(token) {
				try {
				    fs.mkdirSync(TOKEN_DIR);
				  } catch (err) {
				    if (err.code != 'EEXIST') {
				      throw err;
				    }
				  }
				  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
				  console.log('Token stored to ' + TOKEN_PATH);
		}

		// ====================================
		// DMS List Files =====================
		// ====================================
		
		app.get('/listfiles', function(req, res1){

			fs.readFile(TOKEN_PATH, function(err, tokens) {

			console.log("tokens----------"+tokens);
		  	
			//client.credentials = tokens;
			//res.send('Authentication successful! Please return to the console.');
			
			
			const service = google.drive('v3');
			service.files.list({
			auth: client,
			fields: 'nextPageToken, files(id, name, webContentLink, webViewLink, mimeType, parents)'
		  	}, (err, res) => {
			if (err) {
			  console.error('The API returned an error.');
			  throw err;
			}
			const files = res.data.files;
			if (files.length === 0) {
			  console.log('No files found.');
			} else {
				
			  console.log('Files Found!');
			  for (const file of files) {
				console.log(`${file.name} (${file.id})`);

			  }  

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

				        				var query = connection.query('SELECT * FROM dmslevel WHERE login_idlogin = ? ',[req.user.idlogin],function(err6,dmslevel){
					        			if(err6)
					        				console.log(err6);

				        				res1.render('dms_list.ejs', {
										employeelist : rowlist,
										user : rows[0],		//  pass to template
										allusrs : usrlist,
										department : deplist,
										store : storelist,
										level : req.user.level,
										dmslevel : dmslevel[0],
										dmsfiles : files
										});

									});

				        		});
				        				
				        	});

			        	});
				        			
			    	});
                   
        		});  

			}

		  });

		  });
			
		});

	// =====================================
	// Dashboard for DMS====================
	// =====================================

	app.get('/dmsdash', function(req, res1) {

		const service = google.drive('v3');
			service.files.list({
			auth: client,
			parents: "root",
			fields: 'nextPageToken, files(id, name, webContentLink, webViewLink, mimeType, parents)'
		  	}, (err, res) => {
			if (err) {
			  console.error('The API returned an error.');
			  throw err;
			}
			const files = res.data.files;
			if (files.length === 0) {
			  console.log('No files found.');
			} else { 
		

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

				        			var query = connection.query('SELECT * FROM dmslevel',function(err5,dmslevellist){
				        			if(err5)
				        				console.log(err5);

				        			if(req.user.level=="admin"){
				        				res1.render('dms_dashboard.ejs', {
										employeelist : rowlist,
										user : rows[0],		//  pass to template
										allusrs : usrlist,
										department : deplist,
										store : storelist,
										level : req.user.level,
										dmslevel : dmslevellist,
										dmsfiles : files
										});
				        			}else{
				        				res1.redirect('/dmshome');
				        			}

				        			});

				        			});
				        				
				        			});

			        			  	});
				        			
			        			});
                   
        		});

			}	
		});
	});

		// ===================================
		// View Projects =====================
		// ===================================
		
		app.get('/viewproject', function(req, res1){
			
			const service = google.drive('v3');
			service.files.list({
			auth: client,
			fields: 'nextPageToken, files(id, name, webContentLink, webViewLink, mimeType, parents)'
		  	}, (err, res) => {
			if (err) {
			  console.error('The API returned an error.');
			  throw err;
			}
			const files = res.data.files;
			if (files.length === 0) {
			  console.log('No files found.');
			} else {
				
			  console.log('Files Found!');
			  for (const file of files) {
				console.log(`${file.name} (${file.id})`);

			  }  

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

				        				var query = connection.query('SELECT * FROM dmslevel WHERE login_idlogin = ? ',[req.user.idlogin],function(err6,dmslevel){
					        			if(err6)
					        				console.log(err6);

				        				res1.render('dms_listprojects.ejs', {
										employeelist : rowlist,
										user : rows[0],		//  pass to template
										allusrs : usrlist,
										department : deplist,
										store : storelist,
										level : req.user.level,
										dmslevel : dmslevel[0],
										dmsfiles : files
										});

									});

				        		});
				        				
				        	});

			        	});
				        			
			    	});
                   
        		});  

			  }

		  	});
			
		});


		// ====================================
		// DMS Download Files =====================
		// ====================================
		
		app.post('/down', function(req, res){

			const fileId = req.body.fileid;
		  	const dest = fs.createWriteStream(`/Users/public/`+req.body.filename);

		  	const drive = google.drive({
			 version: 'v3',
			  auth: client
			});

		  	drive.files.get(
		    {fileId, alt: 'media'},
		    {responseType: 'stream'},
		    (err, res) => {
		      if (err) {
		        console.error(err);
		        throw err;
		      }
		      res.data.on('end', () => {
		        console.log('Done downloading file.');
		        //callback();
		      })
		        .on('error', err => {
		          console.error('Error downloading file.');
		          throw err;
		        })
		        .pipe(dest);
		    });

		});

		// ====================================
		// DMS View Files =====================
		// ====================================
		
		app.post('/view', function(req, res){

			const fileId = req.body.fileid;

		  	const drive = google.drive({
			 version: 'v3',
			  auth: client
			});
		  	console.log(fileId);

		  	drive.files.get(
		    {fileId, alt: 'media'},
		    {fields:"webContentLink"},
		    (err, res) => {
		      if (err) {
		        console.error(err);
		        throw err;
		      }else{
		      	console.log(webContentLink);
		      }
		     
		    });

		});

		// ====================================
		// DMS Uploader ===========================
		// ====================================

		app.get('/dmsup', function(req, res) {
		

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);

				        			var query = connection.query('SELECT * FROM login',function(err4,usrlist){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM department',function(err4,deplist){
				        			if(err4)
				        				console.log(err4);

				        			var query = connection.query('SELECT * FROM store',function(err5,storelist){
				        			if(err5)
				        				console.log(err5);

				        			var query = connection.query('SELECT * FROM dmslevel WHERE login_idlogin = ? ',[req.user.idlogin],function(err6,dmslevel){
				        			if(err6)
				        				console.log(err6);

				        					res.render('dms_uploader.ejs', {
											employeelist : rowlist,
											user : rows[0],		//  pass to template
											allusrs : usrlist,
											department : deplist,
											store : storelist,
											level : req.user.level,
											dmslevel : dmslevel[0]
											});

				        		});

				        	});
				        				
				        });

			        });
				        			
			    });
                   
        	});


		});

		// ====================================
		// Upload Files =====================
		// ====================================
		

		//var FileReader = require('filereader');
		//var reader = new FileReader();

		app.post('/up', function(req, res){

			if (!req.files)
		    	res.redirect('/dmsup');


		    var fileMetadata = {
			  'name': 'photo.jpg'
			};
			var media = {
			  mimeType: 'image/jpeg',
			  body: fs.readFile(res.files.value)
			};
			const drive = google.drive({
			 version: 'v3',
			  auth: client
			});

			drive.files.create({
			  resource: fileMetadata,
			  media: media,
			  fields: 'id'
			}, function (err, file) {
			  if (err) {
			    // Handle error
			    console.error(err);
			  } else {
			    console.log('File Id: ', file.uploadid);
			  }
			});
		

		});

		// ==================================
		// Create Department Folder =========
		// ==================================

		app.post('/depfolder', function(req, res){

		var fileMetadata = {
		'name': req.body.foldername,
		'mimeType': 'application/vnd.google-apps.folder'
		
		};

		const drive = google.drive({
			 version: 'v3',
			  auth: client
			});

		drive.files.create({
		  resource: fileMetadata,
		  fields: 'id'
		}, function (err, file) {
		  if (err) {
		    // Handle error
		    console.error(err);
		  } else {
		    console.log('Folder Id: ', file.data.id);
		    res.redirect('/dmsdash');
		  }
		});
		

		});


		// ===============================
		// New Project ===================
		// ===============================

		app.post('/newproject', function(req, res){

		var folderId = req.body.depfolder;
		var fileMetadata = {
		'name': req.body.projectname,
		parents: [folderId],
		'mimeType': 'application/vnd.google-apps.folder'
		
		};

		const drive = google.drive({
			 version: 'v3',
			  auth: client
			});

		drive.files.create({
		  resource: fileMetadata,
		  fields: 'id'
		}, function (err, file) {
		  if (err) {
		    // Handle error
		    console.error(err);
		  } else {
		    console.log('Folder Id: ', file.data.id);
		    res.redirect('/viewproject');
		    
		  }
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


