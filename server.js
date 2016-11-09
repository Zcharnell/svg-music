var express = require("express"),
    app = express(),
    // bodyParser = require('body-parser'),
    // errorHandler = require('errorhandler'),
    // methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 8080;

app.get("/", function (req, res) {
  res.redirect("/index.html");
});

// var todos = [];

// app.get("/addtodo", function (req, res) {
//   var x = req.query.newtodo;
//   todos.push(x);
//   res.end('added');
// });

// app.get("/deletetodo", function (req, res) {
//   var x = req.query.index;
//   todos.splice(x,1);
//   res.end('deleted');
// });

// app.get("/listtodos", function (req, res) {
//   res.end(JSON.stringify(todos));
// });

// app.use(methodOverride());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(express.static(__dirname + '/dev'));
// app.use(errorHandler({
//   dumpExceptions: true,
//   showStack: true
// }));

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port, hostname);