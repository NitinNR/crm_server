
const express = require("express");
const cors = require("cors");
var multer = require("multer");
const cookieParser = require("cookie-parser");

const {scheduleJob,scheduleWhatsAppBroadCast} = require("./utility/broadcaster")

var upload = multer();
const app = express();

app.use(cors({
    "origin": "*"
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array()); 
app.use(express.static('public'));
app.use(cookieParser());

app.get("/", (req, res) => {
    console.log("root one");
    res.json({ message: "Multi User Server is LIVE!" });
});

// require("./routes/app.route.js")(app);
require('./routes/auth.route')(app);
require("./routes/user.route")(app);
require("./routes/desk.route")(app);
require("./routes/report.route")(app);
require("./routes/integration.route")(app);
require("./routes/broadcast.route")(app);

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}.`);
});