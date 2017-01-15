var http = require('http');
var fs = require('fs');
var url = require('url');


var intervals = [
    {"start" : "00:10", "end" : "00:15"},
    {"start" : "01:10", "end" : "13:15"}
];

// Create a server
http.createServer( function (request, response) {  

    var pathname = url.parse(request.url).pathname;
    var method = request.method;

    if (method == 'GET' && pathname == "/index.html") {
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
        if (method == 'GET') {
            console.log("Request for intervals received.");
            response.writeHead(200, {'Content-Type': 'application/json'});
            var response_body = {"intervals" : intervals};
            response.write(JSON.stringify(response_body));
            response.end();
        }

        if (method == 'POST') {
            var body = '';
            request.on('data', function(chunk) {
                body += chunk;
            }).on('end', function() {
                var intervals_update = JSON.parse(body.toString());
                intervals = intervals_update.intervals;
                console.log("Intervals updated to: " + JSON.stringify(intervals));

                response.writeHead(200, {'Content-Type': 'application/json'});
                var response_body = {"intervals" : intervals};
                response.write(JSON.stringify(response_body));
                response.end();
            }); 
        }
    }

}).listen(8081);

function stringToDate(stringTime) {
    var rtn = new Date();

    rtn.setHours(stringTime.split(':')[0]);
    rtn.setMinutes(stringTime.split(':')[1]);

    return rtn;
}

function getHeaterState() {
    var state = false;

    var now = new Date();

    intervals.forEach(function(interval) {
        var start = stringToDate(interval.start);
        var end = stringToDate(interval.end);

        if (now > start && now < end) {
            state = true;
        }
    });

    return state;
}

var interval = setInterval(function() {
    console.log("Updating Heater state.");

    if (getHeaterState()) {
        fs.writeFile("/tmp/heaterTest", "1", function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("ON");
        });
    } else {
        fs.writeFile("/tmp/heaterTest", "0", function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("ON");
        });
    }

}, 5000);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');