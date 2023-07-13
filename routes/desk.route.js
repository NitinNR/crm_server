const authJwt = require("../middlewares/authJwt");
const { getUserList, getUserFilterList, getLables, getTagBasedUsers, getDashBoardDetails, getMessages,
    getWhatsappInboxes,getTemplates,verifySpaceUser } = require("../controllers/desk.controller");

var router = require('express').Router();

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    //users endpoints
    router.get("/user/list", getUserList);
    router.get("/user/filter_list", getUserFilterList);
    router.get("/user/lables", getLables);
    router.get("/user/tag_based_list", getTagBasedUsers);
    router.get("/user/dashboard_details", getDashBoardDetails);
    router.get("/user/messages", getMessages);

    //whatsapp inobxes enpoints
    router.get("/whatsapp/inboxes/list", getWhatsappInboxes);
    router.get("/whatsapp/template/list", getTemplates);

    //verify
    router.post("/space/verify", verifySpaceUser);



    app.use("/api/desk", router);
};
