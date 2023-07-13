const App = require("../models/app.model.js");

exports.AccountUpdate = (req, res) => {
    const {role, adminId, companyName, displayName, email, phoneNumber, website} = req.body.adminData;
    console.log("AccountUpdate Received Admin ID", adminId);

    App.update(`admins`,`name='${displayName}', email='${email}', chatbotNumber='${phoneNumber}', companyName='${companyName}', website='${website}'`,`adminId=${adminId}`, (data)=>{
        if(data){
            data.ack = "Account Details Updated!"
            console.log("Account update DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};

