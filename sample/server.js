// modules
var express = require('express'), http = require('http'), morgan = require('morgan'), path = require('path');
var faceCheck = require('./lib/modules/faceCheck');
var recognition = require('./lib/modules/recognition');
const cnf = require('./config.json');
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
var server = http.createServer(app);
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