const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const upload = require('./middlewares/fileUpload'); // Import the file upload middleware
const dbconn = require("./models/db.model");

const { scheduleJob, scheduleWhatsAppBroadCast } = require("./utility/broadcaster");

const app = express();

app.use(cors({
  "origin": "*"
}));
app.use(express.json());
app.use(bodyParser.json()); // Combine body parsers for JSON and url-encoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(upload.single('file')); // File upload middleware
app.use(express.static('public'));
// app.use(cookieParser());

app.get("/", (req, res) => {
  console.log("root one");
  res.json({ message: "Multi User Server is LIVE!" });
});

require('./routes/auth.route')(app);
require("./routes/user.route")(app);
require("./routes/desk.route")(app);
require("./routes/report.route")(app);
require("./routes/integration.route")(app);
require("./routes/broadcast.route")(app);
require("./routes/broadcast2.route")(app);
require("./routes/channel.route")(app);
require("./routes/whatsapp.route")(app);
require("./routes/plan.route")(app);

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  dbconn.getConnection((err,conn)=>{
    if(err) console.log(err)
    console.log("Connectd to DB2");
    console.log(`Server is running on http://localhost:${PORT}.`);
    conn.release();
  })
  
});
