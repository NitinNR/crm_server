const authJwt = require("../middlewares/authJwt");

const AccountController = require("../controllers/account.controller");
const UserController = require("../controllers/user.controller");
const AppController = require("../controllers/app.controller");
const LabelController = require("../controllers/label.controller");
const AppIntController = require("../controllers/appInt.controller");

var router = require('express').Router();

module.exports = function(app){
    app.use(function (req,res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

// ACCOUNT Management
    
    router.post("/account/update", AccountController.AccountUpdate);


// USER Management
    
    router.post("/list", UserController.UserList);

    router.post("/update", UserController.UserUpdate);

    router.post("/create", UserController.UserCreate);

    // User Delete
    router.post("/delete", UserController.UserDelete);

    // User Details
    router.post("/UserDetails", UserController.UserDetails);


// DASHBOARD Management

    // DashboardDetails
    // router.post("/DashboardDetails", AppController.DashboardDetails);
    router.get("/dashboard_data", AppController.DashboardDetails);

// LABEL Management

    // User Label List
    router.post("/label-list", LabelController.UserLabelList); 

    // certain User Label List
    router.post("/labels", LabelController.UserLabel); 

    // User Label ADD/UPDATE/DELETE
    router.post("/label-update", LabelController.UserLabelsUpdate);

    // Edit/Create User Label ADD/UPDATE/DELETE
    router.post("/userLabel-update", LabelController.editUserLabelsUpdate);

// Applications Management

    // Add App
    router.post("/add-app", AppIntController.AddApp); 
    // List App Added
    router.post("/app-list", AppIntController.AppList); 

    router.get("/test",(req,res)=>{
        return res.json({"test":"ok"})
    }); 


// GLOBAL CONFIG    
    app.use("/api/user", router);
    // app.use("/api/user",[authJwt.verifyToken], router);
    // app.use("/api/user", router);
};
