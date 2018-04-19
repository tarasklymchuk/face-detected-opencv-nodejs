// modules
var express = require('express'), http = require('https'), morgan = require('morgan'), path = require('path');
const fs = require('fs');
var faceCheck = require('./lib/modules/faceCheck');
var recognition = require('./lib/modules/recognition');
var key = fs.readFileSync('./cer/private.key');
var cert = fs.readFileSync( './cer/server.crt' );
var ca = fs.readFileSync( './cer/server2.crt' );
const cnf = require('./config.json');
var options = {
    key: key,
    cert: cert,
    ca: ca
};
// configuration files
var configServer = {
    httpPort: cnf.port,
    staticFolder: path.join(__dirname + '/lib/client')
};

// app parameters
var app = express();
app.set('port', configServer.httpPort);
app.use(express.static(configServer.staticFolder));
app.use(morgan('dev'));

// // serve index
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: staticFolder});
});

// HTTP server
var server = http.createServer(options, app);
server.listen(app.get('port'), function () {
    console.log('HTTP server listening on port ' + app.get('port'));
});

// // WebSocket server
var io = require('socket.io')(server);

io.on('connection', function (socket) {
    faceCheck(socket);
    recognition(socket);
});


module.exports.app = app;