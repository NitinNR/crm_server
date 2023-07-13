const App = require("../models/app.model.js");

exports.AddApp = (req, res) => {

    const { adminId, AppName, configs, Name } = req.body;
    console.log("AddApp Received Admin ID", req.body);

    App.AppDataInsert(adminId, AppName, configs, Name, (data)=>{
        if(data){
            console.log("Application update DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })

    // return res.status(200).send({ack: "TESTING Mode"})
};

exports.AppList = (req, res) => {

    const { adminId } = req.body;
    console.log("AppList Received Admin ID", adminId);

    App.AppDataList(adminId, (data)=>{
        if(data){
            console.log("Application update DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })

    // return res.status(200).send({ack: "TESTING Mode"})
};
