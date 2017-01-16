var http = require('http');
var fs = require('fs');
var url = require('url');
var exec = require('child_process').exec;

var intervals = [
    {"start" : "07:30", "end" : "09:30"},
    {"start" : "17:30", "end" : "23:30"}
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

}).listen(80);

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

function exec_command_and_log_error(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`);
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            return;
        }
    });
}

// Setup PINS as output
exec_command_and_log_error('gpio mode 0 out');
exec_command_and_log_error('gpio mode 1 out');

var interval = setInterval(function() {
    console.log("Updating Heater state.");

    if (getHeaterState()) {
        console.log("ON");
        // Turn on LED
        exec_command_and_log_error('gpio write 1 1');
        // Turn on HEAT
        exec_command_and_log_error('gpio write 0 0');
    } else {
        console.log("OFF");
        // Turn off LED
        exec_command_and_log_error('gpio write 1 0');
        // Turn off HEAT
        exec_command_and_log_error('gpio write 0 1');
    }

}, 5000);

// Console will print the message
console.log('Server running at http://*:80/');