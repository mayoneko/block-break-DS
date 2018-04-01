var fs = require('fs');
var http = require('http');
var path=require('path');

var mimeTypes={
    '.html' : 'text/html',
    '.css' : 'text/css',
    '.js' : 'text/javascript'
};
var server = http.createServer(function (req,res) {
    var lookup = decodeURI(req.url);
    var targetFile = __dirname + lookup;
    fs.exists(targetFile, function (exists) {
        if (exists) {
            fs.readFile(targetFile,'utf8', function (err, data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error !');
                    return;
                }
                var headers = {'Content-Type': mimeTypes[path.extname(targetFile)]};
                res.writeHead(200, headers);
                res.end(data);
                console.log(targetFile + 'が開かれた' + 'mimeType:' + mimeTypes[path.extname(targetFile)]);
                console.log(path.extname(targetFile));
            });
            return;
        }
        res.writeHead(404);
        res.end('ページが見つかりません');
    });
});
var io = require('socket.io').listen(server);
server.listen(process.env.PORT || 8000);

io.on('connection', function(socket) {
    socket.on("ballCreate",
        function (data) {
            socket.broadcast.emit("ballCreate",data);
        }
    );
    socket.on("ballDelete",
        function (data) {
            socket.broadcast.emit("ballDelete",data);
        }
    );
    socket.on("ballDebug",
        function (data) {
            socket.broadcast.emit("ballDebug",data);
        }
    );
});