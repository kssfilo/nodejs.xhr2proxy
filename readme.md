##Description

 HTTP/HTTPS proxy plugin of connect/express for XHR(XMLHTTPRequest)
 with referer restriction and appending Access-Control-Allow-Origin for cross domain XHR2
 Based on cdproxy by macchadogj(thanks)

##Installation

	$ npm install xhr2proxy

##Usage

###basic

	var xhr2proxy = require('xhr2proxy');
	
	connect()
		.use(xhr2proxy({prefix:'myprefix'})) //proxy by default.
		.use(function ( req, res ) {
		res.end("Hello from Connect!");
	}).listen(8000);
	
	//var xhr=new XMLHttpRequest();
	//xhr.open('get','http://localhost:8000/myprefix/http://myremote.server',false);
	//xhr.send();

##basic(express)

	var xhr2proxy = require('xhr2proxy');
	var app=require('express').createServer();
	app.use(xhr2proxy());
	app.listen(8000);
	
	//var xhr=new XMLHttpRequest();
	//xhr.open('get','http://localhost:8000/prefix/http://myremote.server',false);
	//xhr.send();


###Appending Access-Control-Allow-Origin to response headers

It allows XMLHttpRequest level2 to connect with non supported servers from outside of the domains which runs this script.

	var xhr2proxy = require('xhr2proxy');
	
	connect()
		.use(xhr2proxy({prefix:'myprefix',acao:'*'}) //Append [Access-Control-Allow-Origin: *]
		.use(function ( req, res ) {
		res.end("Hello from Connect!");
	}).listen(8000);
	
	//var xhr=new XMLHttpRequest();
	//xhr.open('get','http://anywhrere:8000/myprefix/http://myremote.server',false);
	//xhr.send();

###referer restriction

prevent out-site using by referer restriction.__CAUTION:It cannot recognize fake headers.__

	var xhr2proxy = require('xhr2proxy');
	
	connect()
		.use(xhr2proxy({prefix:'myprefix',referer:/^http:\/\/localhost/})) //deny if referer isnot http://localhost...
		.use(function ( req, res ) {
		res.end("Hello from Connect!");
	}).listen(8000);
	
	//var xhr=new XMLHttpRequest();
	//xhr.open(''get',http://localhost:8000/myprefix/http://myremote.server',false);
	//xhr.send();
	//with referer http://localhost:8000/anywhere.html

###other options

#### suppressHostNameOnRequest(bool)

	default or false:
		GET http://localhost/path HTTP/1.0
					.
					.

	true:
		GET /path HTTP/1.0
					.
					.

##Running unit tests

	$npm test

##History

0.1.0: Adds option suppressHostNameOnRequest.
