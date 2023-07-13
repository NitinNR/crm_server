const App = require("../models/app.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };

// Get User List in user-tab ----------------

exports.UserList = (req, res) => {
    const adminId = req.body.adminId;
    const page = req.body.page || 1; // current page
    const rowsPerPage = req.body.filterData.rowsPerPage || 25; // pageSize
    const { filterData, selectedTags } = req.body
    // const filterValue = req.body.filterData.filterValue; // value from filter
    // const columnField = req.body.filterData.columnField; // column name of table
    // const operatorValue = req.body.filterData.operatorValue; // operator of the filter
    // const linkOperator = req.body.filterData.linkOperator; // operator between filtervalue and quickFilter value
    // const quickFilterValues = req.body.filterData.quickFilterValues; // quickFilter
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    App.getUserList(adminId, startIndex, endIndex, filterData, selectedTags, (data)=>{
        if(data){
            // console.log("User List DATA",paginatedData)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};


exports.UserUpdate = (req, res) => {
    const {userId, adminId, fullName, displayName, email, whatsappNumber, privateNote, capturedData, avatarUrl} = req.body;
    // console.log("UserUpdate Received Admin ID", adminId);
    // console.log("req BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.update(`user_list`,`fullName='${fullName}', email='${email}', whatsapp_number='${whatsappNumber}', displayName='${displayName}', privateNote='${privateNote}', capturedData='${capturedData}', avatarUrl='${avatarUrl}'`,`adminId=${adminId} AND user_id=${userId}`, (data)=>{        if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};

exports.UserDelete = (req, res) => {
    const { userId, adminId } = req.body;
    // console.log("UserDelete Received Admin ID", userId);
    // console.log("req BODY", req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.delete(`user_list`, `user_id=${userId} AND adminId=${adminId}`, (data) => {
        if (data) {
            // console.log("User update DATA",data)
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    })
};

exports.UserCreate = (req, res) => {
    const UserData = req.body;
    // console.log("UserCreate req  BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.UserInsert(UserData, (data)=>{
        if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }
    })
};


exports.AdminDetails = (req, res) => {
    const {adminId} = req.body;
    // console.log("AdminDetails Received Admin ID", adminId);
    // console.log("req BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.findOne(`admins`,`adminId=${adminId}`, (data)=>{if(data){
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }else if (data == 0){
            res.status(500).send({
                message:
                err.message || "Some error occurred try again."
            })
        }
    })
};

// Get User Details

exports.UserDetails = (req, res) => {
    // Get User  Details from DB based on Admin ID
    const adminId = req.body.adminId
    // console.log("UserDetails adminId--",adminId)
    App.getUserDetails(adminId,(data)=>{
      if(data){
        // console.log("DATA",data)
        res.status(200).json(data);
    }
    })
  };

// ------------------------- REPORT's ---------------------------

// Get User Message Reports

exports.MessageReport = (req, res) => {
    // Get Reports from DB based on userId, Admin ID
    const { adminId, page, pageSize, filters, sortField, sortOrder } = req.body;

    // console.log("MessageReport adminId--",req.body)
    App.getMessageReport(adminId, page, pageSize, filters, sortField, sortOrder, (data) => {
        if (data) {
            // console.log("DATA",data)
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    })
};

exports.MessageReportCreate = (req, res) => {
    // Get Reports from DB based on userId, Admin ID
    const { adminId } = req.body;

    // console.log("MessageReportCreate adminId--",adminId)
    App.AddMessageReport(adminId, whatsapp_number, fullName, message_content, message_type, message_delivery, (data) => {
        if (data) {
            // console.log("DATA",data)
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    })
};

