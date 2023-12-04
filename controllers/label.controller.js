const Labelz = require("../models/label.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { pagination, paginate } = require("../utility/paginate.js");

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

// Get User list based on selected tags

exports.getTagBasedUsers = (req, res) => {

    const { adminId, tags, page, pageSize  } = req.body;

    // let page = req.query.page
    // let pageSize = req.query.page_size
    const { page_size, offset } = paginate({ page, pageSize })
    return Labelz.get_tag_based_users( adminId, page_size, offset, tags, (data) => {
        if (data) {
            console.log("get_tag_based_users | Model --- ", data);
            const per_page = page_size
            pagination({ total: data.total, page, per_page }, (pagination_data) => {
                const filteredResult = { data: data.data, total: data.total, pagination_data }
                res.status(200).json(filteredResult)
            })
        } else {
            res.status(500).json({ data })
        }
    })
}

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
    console.log("UserUpdate Received", req.body);
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
    const labelId_userId_array = data.map(({labelId}) => `(${labelId},${userId})`);
    const labelIdArray = data.map(item => item.labelId);
    console.log(labelId_userId_array, labelIdArray, userId, adminId);
    Labelz.editUserLabelUpdate(labelId_userId_array, labelIdArray, userId, adminId, (data)=>{
        if(data){
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
