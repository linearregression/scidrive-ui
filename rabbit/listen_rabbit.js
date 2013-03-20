var http = require('http');
var url = require('url');

var rabbitHub = require('rabbitmq-nodejs-client');

var ghub = null;

var subHub = rabbitHub.create( { task: 'sub', channel: 'jhu.pha.vospace.nodechanged', host: 'zinc27.pha.jhu.edu'  } );
subHub.on('connection', function(hub) {

    ghub = hub;

});
subHub.connect();



http.createServer(function (req, res) {

	var queryData = url.parse(req.url, true).query;

	res.writeHead(200, {'Content-Type': 'text/event-stream',
			    'Cache-Control': 'no-cache',
			    'Connection': 'Keep-Alive'});
    
	var watchPath = queryData.path;
	if(watchPath == "/")
	    watchPath = "";

	watchPath = "^"+watchPath+"$";

	var procMsg = function(msg) {
		var msg_json = JSON.parse(msg);
		var path = msg_json.container;
		var user = msg_json.owner;

		if(user == queryData.user && path.match(watchPath)) {
		    console.log("Yes!"+watchPath+" "+path);
		    res.write ('id: '+(new Date()).getTime()+'\n');
		    res.write ('data: '+msg+'\n\n');
		}
	};

	ghub.on('message', procMsg);
	
	
	ghub.on('error', function(error) {
	    console.log(error);
	});
	
	res.on('close', function() {
		console.log("disconnected "+ghub.listeners('message').length);
		ghub.removeListener("message", procMsg);
	});

	res.on('error', function(err) {
		console.log("Err writing to response");
		console.log(err);
	});

	setInterval(function() {
		res.write (' ');
	}, 1000*50);

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');