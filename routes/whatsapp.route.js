const {getWhatsAppAccountTemplate} = require("../controllers/whatsapp.controller");

var router = require('express').Router();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.get("/gettemplates", getWhatsAppAccountTemplate);
    app.use("/api/whatsapp", router);

};