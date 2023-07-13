const sql = require('./db.model');

const App = function (app) {
    this.username = app.username
}

App.findOne = (tablename, condition, result) => {

    var statusInfo = { status: false, ack: "No data Found", data: { userId: 0 } }
    let query = `SELECT * FROM ${tablename} WHERE ${condition}`;
    sql.query(query, [], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                statusInfo.ack = "Data found!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
}


App.update = (tablename, params, condition, result) => {
    // var query = 'SELECT * FROM `mydql`'
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    let query = `UPDATE ${tablename} SET ${params} WHERE ${condition}`;
    sql.query(query, [], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                statusInfo.ack = "Data updated Successfully!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });

}

App.delete = (tablename, condition, result) => {

    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    let query = `DELETE FROM ${tablename} WHERE ${condition}`;
    sql.query(query, [], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                statusInfo.ack = "Data Deleted Successfully!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });

}

App.UserInsert = (UserData, result) => {
    const { adminId, whatsappNumber, fullName, email, displayName, privateNote } = UserData
    const capturedData = UserData?.capturedData || '[]'
    const avatarUrl = UserData?.avatarUrl || '[]'
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    let query = `INSERT INTO user_list (adminId, whatsapp_number, fullName, email, displayName, capturedData, privateNote, avatarUrl) VALUES  (?,?,?,?,?,?,?,?);`;
    sql.query(query, [adminId, whatsappNumber, fullName, email, displayName, capturedData, privateNote, avatarUrl], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res[0] ? res[0] : '';
                statusInfo.ack = "User Added Successfully!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });

}


App.Register = (name, email, password, companyName, chatbotNumber, website, result) => {
    // ${name}','${email}','${password}', '${companyName}', '${chatbotNumber}', '${website}'
    var statusInfo = { status: false, ack: "Registration failed!", data: { userId: 0 } }
    let query = "INSERT INTO admins (name, email, password, companyName, chatbotNumber, website) VALUES (?,?,?,?,?,?) ;";
    sql.query(query, [name, email, password, companyName, chatbotNumber, website], (err, res) => {

        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res[0] ? res[0] : '';
                statusInfo.ack = "Registration Successfull!";
                console.log("res", res);
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(statusInfo);
        }
    });
};

// fetch all user/contacts records of admin

App.getUserList = (adminId, startIndex, endIndex, filterData, selectedTags, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: [], rowCount: 0 }
    const { filterValue, columnField, operatorValue, linkOperator, quickFilterValues } = filterData
    // console.log("filterData", filterData, selectedTags);
    // filterValue // value from filter
    //  columnField  // column name of table
    //  operatorValue operator of the filter
    //  linkOperator  operator between filtervalue and quickFilter value
    //  quickFilterValues quickFilter
    // let filterQuery = columnField || quickFilterValues? columnField ?`${columnField}=${filterValue}`:'' : '';
    let filterQuery = ''

    if (columnField && filterValue) {
        filterQuery = `\`${columnField}\` LIKE '%${filterValue}%'`;
    }

    if (quickFilterValues) {
        filterQuery += (filterQuery.length ? ` ${linkOperator} ` : '') + `\`whatsapp_number\` LIKE '%${quickFilterValues}%'`;
    }

    let query = `SELECT * FROM \`user_list\` WHERE \`adminId\` = ? ${filterQuery ? `AND ${filterQuery}` : ''} ORDER BY user_id DESC;`;

    if (selectedTags.length) {
        const tupleSelectedLabels = `(${selectedTags.join(" AND ")})`;
        query = `SELECT * FROM user_list INNER JOIN taggings ON user_list.user_id = taggings.taggable_id INNER JOIN labels ON labels.id = taggings.tag_id WHERE labels.id IN ${tupleSelectedLabels} AND user_list.adminId = ? ${filterQuery ? `AND ${filterQuery}` : ''} ORDER BY user_id DESC;`;
    }
    // console.log("query", query);
    sql.query(query, [adminId], (err, res) => {

        if (res) {
            // console.log("RES",res);
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                const paginatedData = Object.values(res).slice(startIndex, endIndex)
                    ;
                statusInfo.data = paginatedData;
                statusInfo.rowCount = res.length;
                statusInfo.ack = "Data found!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

// ---------------------------- DASHBOARD -------------------------------------

// Get Dashboard details
// Total No. Users

App.getDashboardDetails = (adminId, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: { cards: {} } }
    // nitin change =>
    let query = `select
    (SELECT COUNT(*) FROM user_list WHERE adminId = ${adminId}) as users,
    (SELECT COUNT(*) FROM message_report WHERE adminId = ${adminId}) as message_report , 
    (SELECT COUNT(*) FROM user_list WHERE adminId=${adminId} AND DateTime > now() - INTERVAL 7 day) as uinterval , 
    (SELECT COUNT(*) FROM message_report WHERE adminId=${adminId} AND DateTime > now() - INTERVAL 24 hour) as ainterval , 
    (SELECT COUNT(*) FROM user_list WHERE adminId=${adminId} AND capturedData!='') as capdata,
    (SELECT COUNT(*) FROM message_report WHERE adminId=${adminId} AND message_content!='' AND DateTime > now() - INTERVAL 30 day ) as monthlyMsgreport;`
    // sql.query(query, [adminId], (err, res) => {
    sql.query(query, (err, res) => {
        console.log('res.length', res.length)
        if (res) {
            console.log("RES", res);
            if (!res.length) {
                result(statusInfo);
            } else {
                console.log("else...............");
                query = `SELECT COUNT(user_id) AS idcount, MONTHNAME(DateTime) AS month_name, WEEK(DateTime) 
                        AS weeks,DATE(DateTime) AS DateTime FROM user_list WHERE adminId=${adminId} GROUP BY WEEK(DateTime);`
                sql.query(query, [adminId], (err, res1) => {
                    console.log("statusInfo res1", res1);
                    const obj = {}
                    let usersArr = []
                    if (res1) {
                        res1.forEach((record) => {
                            console.log("record", record)
                            usersArr.push(record)

                        })
                    }
                    statusInfo.data.cards.usersArr = usersArr
                    // console.log("statusInfo data.cards", statusInfo.data.cards);
                    result(statusInfo);
                })
                statusInfo.status = true;
                // statusInfo.data = res;

                // nitin change =>
                statusInfo.data.cards.totalUsers = res[0]["users"]
                statusInfo.data.cards.totalMsgs = res[0]["message_report"]
                statusInfo.data.cards.SevenDayUser = res[0]["uinterval"]
                statusInfo.data.cards.totalCapData = res[0]["ainterval"]
                statusInfo.data.cards.monthlyMsgreport = res[0]["monthlyMsgreport"]
                // <=
                // statusInfo.data.cards.SevenDayMsg = res[3]["COUNT(*)"]
                statusInfo.ack = "Data found!";

            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

App.getUserDetails = (adminId, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: { userInfo: {} } }
    let query = `SELECT * FROM admins WHERE adminId = ${adminId}`
    sql.query(query, [adminId], (err, res) => {
        if (res) {
            // console.log("res", res,res[0].email)
            statusInfo.ack = "Data found!";
            statusInfo.status = true;
            // statusInfo.accessToken = res[0].access
            statusInfo.data.userInfo.ack = "redirecting"
            statusInfo.data.userInfo.id = res[0].adminId
            statusInfo.data.userInfo.fullName = res[0].name
            statusInfo.data.userInfo.email = res[0].email
            statusInfo.data.userInfo.companyName = res[0].companyName
            statusInfo.data.userInfo.chatbotNumber = res[0].chatbotNumber
            statusInfo.data.userInfo.website = res[0].website
            statusInfo.data.userInfo.role = res[0].role
            result(statusInfo);

        } else if (err) {
            console.log("ERROR", err);
            result(err);
        } else if (res.length == 0) {
            result(statusInfo);
        }
    });

}


// ---------------------------- REPORTS -------------------------------------

App.getMessageReport = (adminId, page, pageSize, filters, sortField, sortOrder, result) => {

    var statusInfo = { status: false, ack: "Data not found!", data: { userId: 0 } }
    let query = "SELECT * FROM `message_report` WHERE `adminId` = ?"

    const offset = (page - 1) * pageSize;

    // FILTERS
    if (filters) {
        Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value) {
                query += ` AND ${key} LIKE '%${value}%'`
            }
        })
    }

    // SORTING
    if (sortField && sortOrder) {
        query += ` ORDER BY ${sortField} ${sortOrder === 'ascend' ? 'ASC' : 'DESC'}`;
    }

    // add limit and offset
    query += ` LIMIT ${pageSize} OFFSET ${offset}`


    // console.log("Report query", query);
    sql.query(query, [adminId], (err, res) => {

        if (res) {
            // console.log("RES",res[1]);
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                sql.query(`SELECT COUNT(*) FROM message_report WHERE adminId = ${adminId}`, (err, resp) => {
                    // console.log("total", resp[0]['COUNT(*)']);
                    statusInfo.total = resp[0]['COUNT(*)']
                    statusInfo.ack = "Data found!";
                    result(statusInfo);
                })

                // statusInfo.total = total;
                // statusInfo.data.key = res.userId;
                // statusInfo.ack = "Data found!";
                // result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

App.AddMessageReport = (adminId, whatsapp_number, fullName, message_content, message_type, message_delivery, result) => {

    var statusInfo = { status: false, ack: "Message Report Creation failed!", data: { userId: 0 } }
    let query = "INSERT INTO message_report(adminId, whatsapp_number, fullName, message_content, message_type, message_delivery) VALUES (?, ?, ?, ?, ?, ?)"
    sql.query(query, [adminId, whatsapp_number, fullName, message_content, message_type, message_delivery], (err, res) => {

        if (res) {
            // console.log("RES",res);
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                // statusInfo.data.key = res.userId;
                statusInfo.ack = "Message Report Created Successfully!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

// ---------------------------- END REPORTS -------------------------------------





// ------ OLD CODE ---------------------------------------------
App.AdminAuth = (username, password, result) => {
    var statusInfo = { status: false, ack: "Login Failed, please verify your login credentials", data: { userId: 0 } }
    let query = "SELECT * FROM `admins` WHERE `username` = ? AND `password` = ?"
    sql.query(query, [username, password], (err, res) => {

        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res[0];
                statusInfo.ack = "Login Successful!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });

}

// ------ END OLD CODE ---------------------------------------------

module.exports = App;