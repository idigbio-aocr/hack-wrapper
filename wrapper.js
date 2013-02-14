var restify=require('restify');
var exec = require('child_process').exec;
var sys = require('sys');
var sprintf = require('sprintf').sprintf;
var filed = require('filed');
var mime = require('mime');


var config = module.require('./'+process.argv[2]);

function runCommand(req,res,next){
  var args = {
    name: req.params.name,
    infile: req.files['file'].path,
    outfile: sprintf(config.outfile,req.params.name)
  }
  var cmd = sprintf(config.command,args);
  exec(cmd, function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      res.send(500);
      next();
    }
    res.contentType = mime.lookup(args.outfile);
    var f = filed(args.outfile);
    f.pipe(res);
    f.on('end', function () {
        return next(false);
    });
  });
}

function ret404(req,res,next){
  res.send(404);
  next();
}

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.get('/favicon.ico', ret404);
server.post('/:name', runCommand);
server.get('/:name', runCommand);

server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
