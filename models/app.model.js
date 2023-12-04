const sql = require('./db.model');
const verifyLspace = require('./verifyLspace');

const {getClientWithCredentials} = require("../utility/mypgclient")

const App = function (app) {
    this.username = app.username
}

App.getClientWithCredentials = getClientWithCredentials

App.demoModel = (adminId, result) => {
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    let query = `INSERT INTO applications (AppName, adminId, configs) VALUES  (?,?,?);`;
    sql.query(query, [adminId], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res[0] ? res[0] : '';
                statusInfo.ack = `Data App Added Successfully!`;
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
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
    console.log("testtt");
    // var query = 'SELECT * FROM `mydql`'
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    let query = `UPDATE ${tablename} SET ${params} WHERE ${condition}`;
    console.log("query:",query);
    sql.query(query, [], (err, res) => {

        console.log("=====>>>>>>",res);
        console.log(err);

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
            console.log("ERROR=>", err.message);
            statusInfo.data = [];
            statusInfo.ack = "Please try after some time !"
            if(err.message.includes("Duplicate")){statusInfo.ack = "WhatsApp number already exist !"}
            result(statusInfo);
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
                // console.log("res", res);
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
    // console.log("selected tags :", selectedTags);
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
    // console.log("filterQuery:", filterQuery,query);
    if (selectedTags.length) {
        const tupleSelectedLabels = `(${selectedTags.join(",")})`;
        let multiquerystring = ""
        selectedTags.forEach(tag_id => {
            multiquerystring += `INNER JOIN taggings t${tag_id} ON user_list.user_id = t${tag_id}.taggable_id AND t${tag_id}.tag_id = ${tag_id} `
        });
        // query = `SELECT DISTINCT user_list.* FROM user_list INNER JOIN taggings ON user_list.user_id = taggings.taggable_id INNER JOIN labels ON labels.id = taggings.tag_id WHERE labels.id IN ${tupleSelectedLabels} AND user_list.adminId = ? ${filterQuery ? `AND ${filterQuery}` : ''} ORDER BY user_id DESC;`;
        query = `SELECT DISTINCT user_list.*
        FROM user_list
        ${multiquerystring}
        WHERE user_list.adminId = ${adminId}
        ${filterQuery ? `AND ${filterQuery}` : ''}
        GROUP BY user_list.user_id
        ORDER BY user_list.user_id DESC;`

    }
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

    (SELECT COUNT(*) FROM message_report WHERE adminId=${adminId} AND message_content!='' AND DateTime > now() - INTERVAL 30 day) as monthlyMsgreport`
    sql.query(query, (err, res) => {
        console.log('res.length', res.length)
        if (res) {
            if (res.length > 0) {
                statusInfo.status = true;
                statusInfo.data.cards.totalUsers = res[0]["users"]
                statusInfo.data.cards.totalMsgs = res[0]["message_report"]
                statusInfo.data.cards.SevenDayUser = res[0]["uinterval"]
                statusInfo.data.cards.totalCapData = res[0]["ainterval"]
                statusInfo.data.cards.monthlyMsgreport = res[0]["monthlyMsgreport"]
                statusInfo.data.cards.recentusers = []
                statusInfo.data.cards.userengagements = {}
                statusInfo.ack = "Data found!";
            }
        } else if (err) { result(err); }
        const recent_users_query = `SELECT * from user_list where adminId = ${adminId} ORDER BY user_id DESC LIMIT 6;`;
        sql.query(recent_users_query, (err2, res2) => {
            if (res2) {

                let recent_users = []
                res2.forEach(user => {
                    recent_users.push({ fullName: user.fullName, whatsapp_number: user.whatsapp_number })
                });
                statusInfo.data.cards.recentusers = recent_users
            }
            let userEngements_query = `SELECT YEAR(DateTime) as year, MONTH(DateTime) as month, COUNT(*) as user_count FROM user_list where adminId = ${adminId} GROUP BY YEAR(DateTime), MONTH(DateTime);`

            sql.query(userEngements_query, (err3, res3) => {
                if (res3) {

                    let userengagements = {}
                    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

                    res3.forEach(t => {
                        userengagements[t.year] = userengagements[t.year] === undefined ? {} : userengagements[t.year]
                        userengagements[t.year][t.month] = t.user_count;
                    })

                    const final = {}
                    for (let k in userengagements) {
                        final[k] = []
                        months.forEach(mn => {
                            if (userengagements[k][mn]) {
                                final[k].push(userengagements[k][mn])
                            } else {
                                final[k].push(0)
                            }
                        })
                    }
                    statusInfo.data.cards.userengagements = final

                } else { }
                result(statusInfo);

            })

        })
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

            App.GetApp(adminId, (ack, data) => {
                if (ack && data.length === 1) {
                    statusInfo.data.userInfo.space_id = parseInt(data[0].configs.AccountID, 10);
                    result(statusInfo);
                } else {
                    statusInfo.data.userInfo.space_id = 0;
                    result(statusInfo);
                }
            })

        } else if (err) {
            console.log("ERROR", err);
            result(err);
        } else if (res.length == 0) {
            result(statusInfo);
        }
    });

}

App.addContacts = (adminId, userData, result) => {
    try {
        // console.log("exeData", userData);
        var statusInfo = { status: false, ack: "Data not found!", data: { userInfo: {} } };

        // Check for duplicates
        const checkDuplicateQuery = 'SELECT email FROM user_list WHERE adminId = ? AND whatsapp_number IN (?)';
        const emailsToCheck = userData.map((data) => data.userID);
        console.log("emailsToCheck:", emailsToCheck);

        sql.query(checkDuplicateQuery, [adminId, emailsToCheck], (err, duplicateRows) => {
            if (err) {
                console.log("ERROR", err);
                statusInfo.ack = err;
                result(statusInfo);
                // result(err);
                return;
            }

            // Filter out duplicates
            const uniqueData = userData.filter((data) => {
                const userID = data.userID;
                return duplicateRows.some((row) => row.whatsapp_number === userID);
            });

            console.log("uniqueData", uniqueData, uniqueData.length);
            if (uniqueData.length === 0) {
                // All data is duplicate
                statusInfo.ack = "Duplicates contacts found | Try again";
                result(statusInfo);
                return;
            }

            // Data validation
            const invalidData = uniqueData.filter((data) => {
                // Add your validation checks here
                if (!data.Email || !data.FullName) {
                    return true; // Invalid data
                }

                // You can add more validation checks as needed

                return false; // Valid data
            });

            if (invalidData.length > 0) {
                // Some data is invalid
                statusInfo.ack = "Some data is invalid";
                result(statusInfo);
                return;
            }

            // Prepare data for insertion
            const query = 'INSERT INTO user_list (adminId, whatsapp_number, fullName, email, displayName, capturedData) VALUES ?';
            const values = uniqueData.map((data) => [
                adminId,
                data.userID,
                data.FullName,
                data.Email,
                data.FullName,
                '[]',
            ]);

            // Insert valid data into the database
            sql.query(query, [values], (err, res) => {
                if (err) {
                    console.log("ERROR", err);
                    statusInfo.ack = err;
                    result(statusInfo);
                } else {
                    statusInfo.ack = "Data imported successfully";
                    statusInfo.status = true;
                    result(statusInfo);
                }
            });
            // result(statusInfo);
        });
    } catch (error) {
        result(error);
    }
};



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

// ---------------------------- Application management --------------------------

App.AppDataInsert = (adminId, appName, configs, Name, result) => {
    // const {adminId, whatsappNumber, fullName, email, displayName, privateNote} = UserData
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }

    const { AccountID, ApiKey } = configs;

    new Promise((resolve, reject) => {
        App.DbConfigs(adminId, async (ack, data) => {
            if (ack) {
                console.log('>>>>>>USING CUSTOME DB<<<<<<<<<<');

                data = data[0].configs
                const dbconfigs = {
                    user: data.USER,
                    host: data.HOST,
                    database: data.DATABASE,
                    password: data.PASSWORD,
                    port: data.PORT
                }
                const client = await getClientWithCredentials(dbconfigs)
                resolve(client)
            } else {
                console.log('>>>>>>USING SPACE DB<<<<<<<<<');

                const client = await getClientWithCredentials({});
                resolve(client)
            }
        });
    }).then(dbconn => {
        verifyLspace(AccountID,ApiKey,dbconn,(ack,data)=>{
            // insert into the mysql crm db
            if (ack) {
                let query = `INSERT INTO applications (AppName, adminId, configs, Name) VALUES  (?,?,?,?);`;
                sql.query(query, [appName, adminId, JSON.stringify(configs), Name], (err, res) => {
                    if (res) {
                        if (res.length == 0) {
                            return result(statusInfo);
                        } else {
                            statusInfo.status = true;
                            statusInfo.data = res[0] ? res[0] : '';
                            statusInfo.ack = `${appName} App Added Successfully!`;
                            return result(statusInfo);
                        }
                    } else if (err) {
                        return result(err);
                    }
                });
    
            } else {
    
                statusInfo.ack = data;
                return result(statusInfo)
    
            }
        })
    })
}

App.AppDataList = (adminId, result) => {
    var statusInfo = { status: false, ack: "No Application integrations found", data: { adminId: 0 } }
    let query = `SELECT * FROM applications WHERE adminId= ?;`;
    sql.query(query, [adminId], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                statusInfo.data.adminId = adminId
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                statusInfo.ack = `Data fetched Successfully!`;
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
}

App.GetApp = (adminId, callback) => {

    sql.query("select * from applications where adminid = ? and AppName = 'lifeelspace'", [adminId], (err, res) => {
        if (err) return callback(false, [])
        return callback(true, res)
    })

}


// DB Configs

App.DbConfigs = (adminId, callback) => {

    sql.query("select configs from db_configs where admin_id = ? limit 1", [adminId], (err, res) => {
        if (err) return callback(false, [])
        else if (res.length === 0) return callback(false, [])
        return callback(true, res)
    })

}


// <=

// ------------------------------------------------------------------------------



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