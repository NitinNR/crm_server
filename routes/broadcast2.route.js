const authJwt = require("../middlewares/authJwt");
const {getBroadcastList,createBroadcast,getBroadcast,updateBroadcast,deleteBroadcast} = require("../controllers/broadcast2.controller");

var router = require('express').Router();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // ACCOUNT Management

    router.get("/list", getBroadcastList);
    router.get("/get", getBroadcast);
    router.post("/create", createBroadcast);
    router.put("/update", updateBroadcast);
    router.delete("/delete", deleteBroadcast);
    app.use("/api/broadcast2", router);

}
