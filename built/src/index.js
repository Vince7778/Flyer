"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var app = express();
var PORT = 8000;
var staticFolder = path.join(__dirname, "../static");
var pageFolder = path.join(__dirname, "page/");
var indexFile = path.join(staticFolder, "index.html");
app.use("/", express.static(pageFolder));
app.use("/", express.static(staticFolder));
app.get("/", function (req, res) {
    res.sendFile(indexFile);
});
app.listen(PORT, function () {
    console.log("Listening on port", PORT);
});
