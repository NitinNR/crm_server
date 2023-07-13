
const App = require("../models/app.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
  };


exports.DashboardDetails = (req, res) => {
  // Get Dashboard Details from DB based on Admin ID
  // const adminId = req.body.adminId
  console.log(req.body);
  let adminId = req.body.adminId
  adminId = adminId === undefined ? req.query.adminId : adminId
  console.log("adminId--",adminId)
  App.getDashboardDetails(adminId,(data)=>{
    if(data){
      // console.log("DATA",data)
      res.status(200).json(data);
  }
  })
};

// export.

// exports.RegisterAuth = async (req, res) => {

//     const {name, email, password, confPassword, companyName, chatbotNumber, website, createdAt} = req.body;
//     if (password!=confPassword) return res.status(400).json({message: "Password and Confirm Password do not match"});
//     const salt = await bcrypt.genSalt();
//     const hashPassword = await bcrypt.hash(password, salt);
//     try {
        
//     } catch (error) {
//         console.log(error);
//     }
// }

// exports.loginAuth = (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     App.AdminAuth(username, password, (data)=>{
//         console.log(data);
//         if(data){
//             res.status(200).json(data);
//         }else if (data == 0){
//             res.status(500).send({
//                 message:
//                 err.message || "Some error occurred try again."
//             })
//         }
//     })
// };
