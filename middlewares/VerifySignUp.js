const User = require("../models/app.model.js");
// const ROLES = db.ROLES;

checkDuplicateChatbotOrEmail = async(req, res, next) => {
  // Username
  var statusInfo = {status: false,ack:"Something went wrong | Try after sometime",data:{}}
  await User.findOne(`admins`,`chatbotNumber='${req.body.chatbotNumber}'`,(data) => {
    if (data.status) {
      statusInfo.status = true
      statusInfo.ack = "Failed! WhatsApp Number is already in use!"
      res.status(400).send(statusInfo);
      return;
    }
    // Email
    User.findOne(`admins`,`email='${req.body.email}'`,(data) => {
      if (data.status) {
        statusInfo.status = true
        statusInfo.ack = "Failed! Email is already in use!"
        res.status(400).send(statusInfo);
        return;
      }
      next();
    });
  });
};
// checkRolesExisted = (req, res, next) => {
//   if (req.body.roles) {
//     for (let i = 0; i < req.body.roles.length; i++) {
//       if (!ROLES.includes(req.body.roles[i])) {
//         res.status(400).send({
//           message: "Failed! Role does not exist = " + req.body.roles[i]
//         });
//         return;
//       }
//     }
//   }
  
//   next();
// };
//   if (req.body.roles) {
//     for (let i = 0; i < req.body.roles.length; i++) {
//       if (!ROLES.includes(req.body.roles[i])) {
//         res.status(400).send({
//           message: "Failed! Role does not exist = " + req.body.roles[i]
//         });
//         return;
//       }
//     }
//   }
  
//   next();
// };
const verifySignUp = {
  checkDuplicateChatbotOrEmail:checkDuplicateChatbotOrEmail,
  // checkRolesExisted: checkRolesExisted
};
module.exports = verifySignUp;
