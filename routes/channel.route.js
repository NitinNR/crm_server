const {addChannel, getChannels, delChannel} = require("../controllers/channel.controller");

var router = require('express').Router();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Channel Management

    router.post("/addChannel", addChannel);

    // Get All channels of User
    router.post("/getChannels", getChannels);

    // Delete channel of User
    router.post("/delChannel", delChannel);

    app.use("/api/channel", router);

};