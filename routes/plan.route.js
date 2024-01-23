const {getPlans, updatePlan,adminPlan,cancelPlan,getUserActivePlan, updatePlanV2 } = require("../controllers/plan.controller");

var router = require('express').Router();

module.exports = function(app){
    app.use(function (req,res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // router.post("/account/update", AccountController.AccountUpdate);    
    router.get("/list",getPlans);

    // router.put("/update",updatePlan);
    router.put("/update",updatePlanV2);
    
    // router.get("/id",adminPlan);
    router.get("/id",getUserActivePlan);
    router.delete("/cancel",cancelPlan);

    // GLOBAL CONFIG    
    app.use("/api/plan", router);
    // app.use("/api/user",[authJwt.verifyToken], router);
    // app.use("/api/user", router);
};
