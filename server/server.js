"use strict";
const json2xls = require("json2xls");
require("dotenv").config();
const Module = require("module");

const originalModuleLoad = Module._load;

Module._load = function patchedModuleLoad(request, parent, isMain) {
  const isLoopBackMySqlConnectorImport =
    request === "mysql" &&
    parent &&
    parent.filename &&
    parent.filename.indexOf("loopback-connector-mysql") !== -1;

  if (isLoopBackMySqlConnectorImport) {
    return originalModuleLoad.call(this, "mysql2", parent, isMain);
  }

  return originalModuleLoad.call(this, request, parent, isMain);
};

var loopback = require("loopback");
var boot = require("loopback-boot");


var app = (module.exports = loopback());

const facilitiesJob = require('./jobs/unregistered-facilities-mailer.job');

app.use(json2xls.middleware);


app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit("started");
    var baseUrl = app.get("url").replace(/\/$/, "");
    console.log("Web server listening at: %s", baseUrl);
    if (app.get("loopback-component-explorer")) {
      var explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
    require('./jobs')(app).init();
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }
});

module.exports = app;
