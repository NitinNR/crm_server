const authJwt = require("../middlewares/authJwt");
const UserController = require("../controllers/user.controller");
var router = require('express').Router();

module.exports = function(app){
    app.use(function (req,res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // list
    router.post("/message-list", UserController.MessageReport);

    // create
    router.post("/message-create", UserController.MessageReportCreate);

    // app.use("/api/report",[authJwt.verifyToken],router);
    app.use("/api/report",router);
};
