const authJwt = require("../middlewares/authJwt");
const ChanelController = require("../controllers/integration.controller");

var router = require('express').Router();

module.exports = function(app){
    app.use(function (req,res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    router.get("/lspace/:adminid", ChanelController.adminSetup);

    // app.use("/api/user",[authJwt.verifyToken], router);
    app.use("/api/chanel", router);
};
