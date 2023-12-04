
const mysql = require('mysql2');
const sql = require('./db.model');
const connection = require('./db.model');

const label = function (app) {
    this.username = app.username
}


label.getUserLabelList = (adminId, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: [] }
    let query = "SELECT * FROM `labels` WHERE `adminId` = ?"
    sql.query(query, [adminId], (err, res) => {

        if (res) {
            // console.log("RES",res);
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                // statusInfo.data = res;
                statusInfo.ack = "Data found!";

                statusInfo.data = res?.map(user => {
                    const labelId = user.id
                    const colorHex = user.color;
                    const color = user.colorData;
                    const title = user.title;
                    const description = user.description || '';
                    return { labelId, color, colorHex, title, description };
                })

                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

label.findLabels = async (adminId, tags, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: [] }
    tags = `(${tags.map(tag => { return `'${tag}'` })})`;
    console.log(tags);
    let query = `SELECT id FROM labels WHERE adminId = ? and title IN ${tags}`
    sql.query(query, [adminId], (err, res) => {

        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.ack = "Data found!";
                statusInfo.data = res;
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};


label.get_tag_based_users2 = (adminId, page_size, offset, tags, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: {} }
    // tags format should be (1,2,3) or (1)
    // console.log("-------------------",adminId);
    console.log({ adminId, page_size, offset, tags });
    let tag_len = tags.length
    tags = `(${tags.join()})`
    const ut_query = `SELECT DISTINCT user_list.*
    FROM user_list 
    INNER JOIN taggings 
        ON (user_list.user_id = taggings.taggable_id AND taggings.tag_id IN ${tags})
    WHERE adminId = ${adminId}
    GROUP BY user_list.user_id
    HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}
    ORDER BY user_list.user_id
    LIMIT ${page_size}
    OFFSET ${offset};`

    sql.query(ut_query, [], (err, res) => {
        console.log("RES 1 ---", res);
        if (res) {
            // console.log("RES",res);
            if (res.length == 0) {
                result(statusInfo);
            } else {

                const total_qury = `SELECT count( DISTINCT user_list.*) as total
                                    FROM user_list 
                                    INNER JOIN taggings 
                                        ON (user_list.user_id = taggings.taggable_id AND taggings.tag_id IN ${tags})
                                    WHERE adminId = ${adminId}
                                    GROUP BY user_list.id
                                    HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}`

                sql.query(total_qury, [], (err, res) => {
                    console.log("RES 2 ---", res);
                    if (res) {
                        if (res.length == 0) {
                            result(statusInfo);
                        } else {
                            statusInfo.data = { data: res.rows, total: parseInt(total) }
                            statusInfo.status = true
                            result(statusInfo);
                        }
                    }
                })

            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }

    })

    // --- Desk Code

    // getDbConfigs(adminId).then(dbconnection => {

    //     dbconnection.query(ut_query, async (err, res) => {
    //         console.log(res.length);
    //         if (err) {
    //             await dbconnection.end()
    //             return callback(false, [])
    //         }
    //         const total_qury = `SELECT count( DISTINCT contacts.*) as total
    //     FROM contacts 
    //     INNER JOIN taggings 
    //         ON (contacts.id = taggings.taggable_id AND taggings.tag_id IN ${tags})
    //     WHERE account_id = ${account_id}
    //     GROUP BY contacts.id
    //     HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}`
    //         const total = await getTotalCount(dbconnection, total_qury)
    //         console.log(total);

    //         const result = { data: res.rows, total: parseInt(total) }
    //         return callback(true, result)

    //     })
    // })

    //  END ----
}



// get user by tags with page and offset
label.get_tag_based_users = (adminId, page_size, offset, tags, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: {} };
    console.log({ adminId, page_size, offset, tags });

    // Check if tags array is empty, if so, return empty result
    if (tags.length === 0) {
        result(statusInfo);
        return;
    }

    let tag_len = tags.length;
    tags = `(${tags.join()})`;
    const ut_query = `SELECT DISTINCT user_list.*
    FROM user_list 
    INNER JOIN taggings 
        ON (user_list.user_id = taggings.taggable_id AND taggings.tag_id IN ${tags})
    WHERE adminId = ${adminId}
    GROUP BY user_list.user_id
    HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}
    ORDER BY user_list.user_id
    LIMIT ${page_size}
    OFFSET ${offset};`;

    sql.query(ut_query, [], (err, res) => {
        console.log("RES 1 ---", res);
        if (err) {
            console.log("ERROR", err);
            result(err);
            return;
        }

        if (res.length) {

            statusInfo.status = true;
        }

        const total_query = `SELECT COUNT(DISTINCT user_list.user_id) as total
                            FROM user_list 
                            INNER JOIN taggings 
                                ON (user_list.user_id = taggings.taggable_id AND taggings.tag_id IN ${tags})
                            WHERE adminId = ${adminId}
                            GROUP BY user_list.user_id
                            HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}`;

        sql.query(total_query, [], (err, totalRes) => {
            console.log("RES 2 ---", totalRes);
            if (err) {
                console.log("ERROR", err);
                result(err);
                return;
            }

            // if (totalRes.length === 0) {
            //     result(statusInfo);
            //     return;
            // }

            statusInfo.data.total = parseInt(totalRes[0] ? totalRes[0].total : 0);
            statusInfo.data.users = res;
            statusInfo.status = true;
            result(statusInfo);
        });
    });
};

// get user by tags
label.get_tag_based_users_only = (adminId, tags, result) => {
    console.log("------", tags.length);
    var statusInfo = { status: false, ack: "Data not found!", data: {} };
    // Check if tags array is empty, if so, return empty result
    if (tags.length === 0) {
        result(statusInfo);
        return;
    }
    let tag_len = tags.split(",").length;
    const ut_query = `SELECT DISTINCT user_list.*
    FROM user_list 
    INNER JOIN taggings 
        ON (user_list.user_id = taggings.taggable_id AND taggings.tag_id IN ${tags})
    WHERE adminId = ${adminId}
    GROUP BY user_list.user_id
    HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}
    ORDER BY user_list.user_id`;

    console.log(ut_query);

    sql.query(ut_query, [], (err, res) => {
        if (err) {
            console.log("ERROR", err);
            result(err);
            return;
        }
        else if (res.length) {
            console.log(res);
            statusInfo.status = true;
            statusInfo.ack = "Data found!";
            statusInfo.data.users = res;
            result(statusInfo);
        }
    });
};


// Get certain user labels by user_id
label.getUserLabel = (adminId, result) => {
    var statusInfo = { status: false, ack: "Data not found!", data: [] }
    let query = "SELECT l.id as labelId, l.title as label, l.color as value, l.colorData, taggings.taggable_id as userId FROM labels l LEFT JOIN taggings ON l.id = taggings.tag_id WHERE l.adminId = ? ;"
    sql.query(query, [adminId], (err, res) => {

        if (res) {
            // console.log("RES",res);
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                // statusInfo.data = res;
                statusInfo.ack = "Data found!";

                statusInfo.data = res;



                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });
};

label.UserLabelUpdate = (LabelDataRaw, result) => {

    var statusInfo = { status: false, ack: "Data not found!", data: { userId: 0 } }
    const { adminId, LabelData } = LabelDataRaw.labelData
    let sqlQuery = '';
    LabelData.forEach(data => {
        for (let key in data) {
            if (key == "UPDATE") {
                const colorQuery = data[key].color?.hex ? `, color='${data[key].color.hex}'` : ``
                sqlQuery = `UPDATE labels SET colorData='${(JSON.stringify(data[key].color.rgb || data[key].color))}'${colorQuery}, title='${data[key].title}', description='${data[key].description}' WHERE adminId=${adminId} AND id=${data[key].labelId}; `
                sql.query(sqlQuery, (err, res) => {
                    // console.log("res",res);
                    if (res) {
                        if (res.length == 0) {
                            // result(statusInfo);
                        } else {
                            statusInfo.data += res[0] ? res[0] : ' ';
                        }
                    } else if (err) {
                        console.log("ERROR", err);
                        result(err);
                    }
                });
            } else if (key == "INSERT") {
                sqlQuery = `INSERT INTO labels (adminId, color, colorData, title, description) VALUES (${adminId}, '${(data[key]?.color.hex || '#ffffff')}', '${JSON.stringify(data[key].color.rgb) || '{"a": 1, "b": 85, "g": 14, "r": 20}'}', '${data[key].title}', '${data[key].description}'); `
                sql.query(sqlQuery, (err, res) => {
                    // console.log("res",res);
                    if (res) {
                        if (res.length == 0) {
                            // result(statusInfo);
                        } else {
                            statusInfo.data += res[0] ? res[0] : ' ';
                        }
                    } else if (err) {
                        console.log("ERROR", err);
                        result(err);
                    }
                });
            } else if (key == "DELETE") {
                sqlQuery = `DELETE FROM labels WHERE id=? AND adminId = ?; `
                sql.query(sqlQuery, [data[key].labelId, adminId], (err, res) => {
                    // console.log("res",res);
                    if (res) {
                        if (res.length == 0) {
                            // result(statusInfo);
                        } else {
                            statusInfo.data += res[0] ? res[0] : ' ';
                        }
                    } else if (err) {
                        console.log("ERROR", err);
                        result(err);
                    }
                });
            }
        }
    });

    statusInfo.status = true;
    statusInfo.ack = "Labels Added Successfully!";
    result(statusInfo);

    // sql.end();    


}

label.editUserLabelUpdate = (labelId_userId_array, labelIdArray, userId, adminId, result) => {

    console.log({ labelId_userId_array, labelIdArray, userId });
    
    labelId_userId_array = [...new Set(labelId_userId_array)];
    labelIdArray = [...new Set(labelIdArray)];
    var statusInfo = { status: false, ack: "Data not found!", data: { userId: 0 } }

    sql.getConnection((err, connection) => {
        if (err) throw err;
        // Start a transaction
        connection.beginTransaction((error) => {
            if (error) throw error;

            // First query - REPLACE statement

            // const queryParams = labelData.map(({ labelId }) => labelId).concat([userId]).concat(labelData.map(({ labelId }) => labelId)).concat([userId]);
            // const replaceQuery =`INSERT INTO \`taggings\` (tag_id, taggable_id) VALUES ${labelId_userId_array} ON DUPLICATE KEY UPDATE tag_id = VALUES (${labelIdArray}) WHERE taggable_id=${userId};`;


            const values = labelIdArray.flatMap(() => [userId]);


            // const mulit_purpose_command = "UPDATE taggings set tag_id = ? where taggable_id = ?";

            const replaceQuery = `INSERT IGNORE INTO taggings (tag_id, taggable_id) VALUES ${labelId_userId_array} `;
            const queryParams = [userId];

            const deleteQuery = `DELETE FROM taggings WHERE taggable_id=?;`;

            if (labelId_userId_array.length) {
                connection.query(deleteQuery, [userId], (error, results) => {
                    if (error) {
                        // Rollback the transaction if an error occurs
                        return connection.rollback(() => {
                            throw error;
                        });
                    }

                    if (results) { console.log("Delete Success"); }


                    connection.query(replaceQuery, (error, results) => {
                        if (error) {
                            // Rollback the transaction if an error occurs
                            return connection.rollback(() => {
                                throw error;
                            });
                        }
                        // Second query - DELETE statement
                        connection.commit((error) => {
                            if (error) {
                                // Rollback the transaction if commit fails
                                return connection.rollback(() => {
                                    throw error;
                                });
                            }
                            console.log('Success');
                            statusInfo.status = true;
                            statusInfo.ack = "Labels Added Successfully!";
                            result(statusInfo);
                        });
                    });
                });

            } else {

                connection.commit((error) => {
                    if (error) {
                        return connection.rollback(() => {
                            throw error;
                        });
                    }
                    statusInfo.status = true;
                    statusInfo.ack = "Labels remain un-changed ! ";
                    result(statusInfo);
                });
            }


        });
        connection.release();
        // sql.end();   
    })

}

label.UserLabelInsert = (LabelData, result) => {
    const { adminId, labels } = LabelData
    // dummy data]
    // const labels =  {users : [{color: {hex: '#ffffff'}, title: 'test', description: 'this is test'}, {color: {hex: '#f6f6'}, title: 'test2', description: 'this is test 2'}, {color: {hex: '#f83aff'}, title: 'test 3', description: 'this is test 3'} ]}
    // const expclabels = [['#ffffff', 'test', 'this is test'], ['#f6f6','test2', 'this is test 2', '#f83aff', 'test 3', 'this is test 3' ]]
    const capturedData = LabelData?.capturedData || '[]'
    const avatarUrl = LabelData?.avatarUrl || '[]'
    var statusInfo = { status: false, ack: "Data not updated", data: { userId: 0 } }
    const params = labels.users.map(user => {
        const color = "#F5A623" // user.color.hex;
        const colorData = user.color.rgb;
        const title = user.title;
        const description = user.description || '';
        return [color, title, description, adminId];
    });
    let query = `INSERT INTO user_list (color, colorData, title, description, aminId) VALUES  ${[params]};`;
    sql.query(query, (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res[0] ? res[0] : '';
                statusInfo.ack = "Labels Added Successfully!";
                result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            result(err);
        }
    });

}



module.exports = label;