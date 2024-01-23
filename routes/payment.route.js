const { StripePay,StripeEvents } = require("../controllers/payment.controller");

var router = require('express').Router();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Origin",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    // router.post("/account/update", AccountController.AccountUpdate);    
    router.post('/stripe_pay',StripePay);
    router.post('/stripe_pay/subscription_status',StripeEvents);
    // GLOBAL CONFIG    
    app.use("/api/pay", router);

};
