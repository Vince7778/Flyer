import express = require("express");
import path = require("path");

const app = express();
const PORT = 8000;

const staticFolder = path.join(__dirname, "../static");
const pageFolder = path.join(__dirname, "page/");
const indexFile = path.join(staticFolder, "index.html");

app.use("/", express.static(pageFolder));
app.use("/", express.static(staticFolder));

app.get("/", (req, res) => {
    res.sendFile(indexFile);
});

app.listen(PORT, () => {
    console.log("Listening on port", PORT);
})