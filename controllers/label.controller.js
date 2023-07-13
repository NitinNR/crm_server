const Labelz = require("../models/label.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.UserLabelList = (req, res) => {
    const adminId = req.body.adminId;
    console.log("UserLabelList Received Admin ID", adminId);
    Labelz.getUserLabelList(adminId, (data)=>{
        if(data){
            // console.log("User List DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};

// Get labels of a certain user
exports.UserLabel = (req, res) => {
    const { adminId } = req.body;
    console.log("UserLabels Received Admin ID", adminId);
    Labelz.getUserLabel(adminId, (data)=>{
        if(data){
            // console.log("User List DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};

exports.UserLabelsUpdate = (req, res) => {
    const {LabelData} = req.body;
    console.log("UserUpdate Received ", req.body);
    // console.log("req BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    Labelz.UserLabelUpdate(req.body, (data)=>{
        if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }
    })
};

// Edit/ Create User Label Edit
exports.editUserLabelsUpdate = (req, res) => {
    const {labelData} = req.body;
    const {data, userId, adminId} = labelData;
    console.log("edit User Labels Update Received ", req.body);
    console.log("LabelData", labelData.data);

    const labelId_userId_array = JSON.parse(data).map(({labelId}) => `(${labelId},${userId})`);
    const labelIdArray = JSON.parse(data).map(item => item.labelId);

    console.log("ARR", labelId_userId_array, labelIdArray);

    Labelz.editUserLabelUpdate(labelId_userId_array, labelIdArray, userId, adminId, (data)=>{
        if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }
    })
};


exports.UserLabelCreate = (req, res) => {
    const UserData = req.body;
    console.log("UserCreate req  BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    Labelz.UserLabelInsert(UserData, (data)=>{
        if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }
    })
};
