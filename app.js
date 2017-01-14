var http = require('http');
var fs = require('fs');
var url = require('url');


var intervals = [
    {"start" : "00:10", "end" : "00:15"},
    {"start" : "01:10", "end" : "01:15"}
];

// Create a server
http.createServer( function (request, response) {  

    var pathname = url.parse(request.url).pathname;

    if (pathname == "/index.html") {
        console.log("Request for " + pathname + " received.");
   
        // Read the requested file content from file system
        fs.readFile(pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                response.writeHead(404, {'Content-Type': 'text/html'});
            } else {    
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write(data.toString());        
            }
            // Send the response body 
            response.end();
        });
    }

    if (pathname == "/intervals") {
        console.log("Request for intervals received.");
        response.writeHead(200, {'Content-Type': 'application/json'});
        var response_body = {"intervals" : intervals};
        response.write(JSON.stringify(response_body));
        response.end();
    }

}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');