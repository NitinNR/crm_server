const App = require("../models/app.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const csv = require('csv-parser');
const excelToJson = require('convert-excel-to-json');
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

const { convertExcelToJson } = require('../utility/Excel2Json.js');


const upload = require('../middlewares/fileUpload');


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

    App.getUserList(adminId, startIndex, endIndex, filterData, selectedTags, (data) => {
        if (data) {
            // console.log("User List DATA",paginatedData)
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    })
};


exports.UserUpdate = (req, res) => {
    const { userId, adminId, fullName, displayName, email, whatsappNumber, privateNote, capturedData, avatarUrl } = req.body;
    // console.log("UserUpdate Received Admin ID", adminId);
    // console.log("req BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.update(`user_list`, `fullName='${fullName}', email='${email}', whatsapp_number='${whatsappNumber}', displayName='${displayName}', privateNote='${privateNote}', capturedData='${capturedData}', avatarUrl='${avatarUrl}'`, `adminId=${adminId} AND user_id=${userId}`, (data) => {
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

    App.UserInsert(UserData, (data) => {
        if (data) {
            // console.log("User update DATA",data)
            res.status(200).json(data);
        }
    })
};


exports.AdminDetails = (req, res) => {
    const { adminId } = req.body;
    // console.log("AdminDetails Received Admin ID", adminId);
    // console.log("req BODY",req.body);
    // console.log("req BODY capturedData",req.body.capturedData);s

    App.findOne(`admins`, `adminId=${adminId}`, (data) => {
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

// Get User Details

exports.UserDetails = (req, res) => {
    // Get User  Details from DB based on Admin ID
    const adminId = req.body.adminId
    // console.log("UserDetails adminId--",adminId)
    App.getUserDetails(adminId, (data) => {
        if (data) {
            // console.log("DATA",data)
            res.status(200).json(data);
        }
    })
};

exports.ImportContacts = async (req, res) => {
    // Get User  Details from DB based on Admin ID
    var statusInfo = { status: false, ack: "Test found!", data: {} }
    const { adminId, fileType } = req.body
    const file = req.file;
    // console.log("formData--", file)
    // res.status(200).json(statusInfo);

    if (!req.file || Object.keys(req.file).length === 0) {
        statusInfo.ack = "file not found"
        return res.status(200).json(statusInfo);
        // return;
    } else if (req.file) {
        try {
            const exeDATA = await excelToJson({
                sourceFile: req.file.path,
                header: {
                    rows: 1
                },
                columnToKey: {
                    "*": "{{columnHeader}}"
                }
            });

            statusInfo.data = exeDATA
            App.addContacts(adminId, exeDATA['Sheet 1'], (data) => {
                // console.log("exeDaTA", exeDATA['Sheet 1']);
                if (data) {
                    console.log("DATA", data)
                    return res.status(200).json(data);
                }
            })
            // return res.status(200).json(statusInfo);
        } catch (e) {
            statusInfo.ack = "Corupted excel file"
            return res.status(200).json(statusInfo)
        }
    }

    // res.status(200).json(statusInfo)

};

exports.ImportContacts3 = (req, res) => {

    const excelFileTypes = ["xls", "xlsx", "excel"]
    // Get User  Details from DB based on Admin ID
    console.log("UserDetails adminId--", req.body)
    const { adminId, data, fileType } = req.body
    const file = req.file;
    console.log("fileType--", file)

    var exceltojson;
    let excel2json;
    const filename = file.originalname;
    const filepath = file.path;

    // convertExcelToJson(filepath, `/public/test2.json`, 'Sheet1');


    if (!req.file || Object.keys(req.file).length === 0) {
        // res.status(400).send('No files were uploaded.');
        // return;
    }

    if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
        excel2json = xlsxtojson;
    } else {
        excel2json = xlstojson;
    }

    //  code to convert excel data to json  format
    excel2json({
        input: req.file.path,
        output: false, // "output/"+Date.now()+".json", // output json 
        // lowerCaseHeaders:true
    }, function (err, result) {
        if (err) {
            statusInfo.data = err
            res.status(200).json(statusInfo)
        } else {
            console.log("Excesss here----");
            App.addContacts(adminId, result['Sheet 1'], (data) => {
                console.log("exeDaTA", result['Sheet 1']);
                if (data) {
                    // console.log("DATA",data)
                    res.status(200).json(data);
                }
            })

            // statusInfo.data = result
            // res.status(200).json(statusInfo)
        }
    });



    // if (excelFileTypes.includes(fileType) ) {
    //     // console.log("inside excel block");
    //     // Handle Excel file upload and processing
    //     const workbook = xlsx.readFile(file.path);
    //     const sheetName = workbook.SheetNames[0];
    //     console.log("sheetName----", sheetName);
    //     const sheet = workbook.Sheets[sheetName];
    //     const excelData = xlsx.utils.sheet_to_json(sheet);
    //     console.log("excelData", excelData);
    //     // App.addContacts(adminId, excelData, (data) => {
    //     //     if (data) {
    //     //         // console.log("DATA",data)
    //     //         res.status(200).json(data);
    //     //     }
    //     // })
    // } else if (fileType === 'csv') {
    //     // Handle CSV file upload and processing
    //     const results = [];

    //     fs.createReadStream(file.path)
    //         .pipe(csv())
    //         .on('data', (data) => {
    //             results.push(data);
    //         })
    //         .on('end', () => {
    //             console.log("csvData", results);
    //             // App.addContacts(adminId, uploadedFile, (data) => {
    //             //     if (data) {
    //             //         // console.log("DATA",data)
    //             //         res.status(200).json(data);
    //             //     }
    //             // })
    //         })
    // }
    // res.status(200).json(statusInfo)
};

exports.ImportContacts2 = (req, res) => {
    const { adminId, fileType } = req.body;
    const uploadedFile = req.files.file;
    console.log("adminId, fileType", adminId, fileType, uploadedFile);
    // Check if the fileType is 'csv' or 'xlsx' and handle accordingly
    if (fileType === 'csv') {
        // Handle CSV file upload and processing
        const results = [];

        fs.createReadStream(uploadedFile.tempFilePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', () => {
                // Insert the data into the MySQL database
                App.addContacts(adminId, results, (data) => {
                    if (data) {
                        // console.log("DATA",data)
                        // Delete the uploaded file
                        fs.unlinkSync(uploadedFile.tempFilePath);
                        res.status(200).send(data);
                    }
                })
            });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
        // Handle Excel file upload and processing
        const workbook = xlsx.readFile(uploadedFile.tempFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(sheet);

        // Insert the data into the MySQL database

        // App.addContacts(adminId, excelData, (data) => {
        //     if (data) {
        //         // console.log("DATA",data)
        //         // Delete the uploaded file
        //         fs.unlinkSync(uploadedFile.tempFilePath);
        //         res.status(200).json(data);
        //     }
        // })

        res.status(200).send({ status: true, ack: "Test Done" });
    };
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

function convertToJSON(array) {
    console.log("array", array);
    var first = array[0].join()
    var headers = first.split(',');

    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++) {

        var myRow = array[i].join();
        var row = myRow.split(',');

        var data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);

    }
    return jsonData;
};