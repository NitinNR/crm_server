var router = require('express').Router();

const verifySignUp = require("../middlewares/VerifySignUp");
const authJwt = require("../middlewares/authJwt");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next){
        res.header(
            "Access-Controll-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.post("/signup", [verifySignUp.checkDuplicateChatbotOrEmail], controller.SignUp);

    router.post("/signin", controller.SignIn);

    router.post("/refreshToken", controller.refreshToken);

    router.post("/ApiKey", controller.ApiKey);

    router.post("/change-password", [authJwt.verifyToken], controller.changePassword);

    app.use("/api/auth",router);

};

