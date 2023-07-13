
const mysql = require('mysql2');
const sql = require('./db.model');
const connection = require('./db.model');

const label = function(app){
    this.username = app.username
}


label.getUserLabelList = (adminId, result) =>{
    var statusInfo = {status: false,ack:"Data not found!",data:[]}
    let query  = "SELECT * FROM `labels` WHERE `adminId` = ?"
    sql.query(query,[adminId],(err, res) =>{
        
        if (res){
            // console.log("RES",res);
            if (res.length==0){
                result(statusInfo);
            }else{
                statusInfo.status= true;
                // statusInfo.data = res;
                statusInfo.ack = "Data found!";

                statusInfo.data= res?.map(user => {
                    const labelId = user.id
                    const colorHex = user.color;
                    const color = user.colorData;
                    const title = user.title;
                    const description = user.description || '';
                    return {labelId, color, colorHex, title, description};
                })

                result(statusInfo);
            }
        }else if(err){
            console.log("ERROR",err);
            result(err);
        }
    });
};

// Get certain user labels by user_id
label.getUserLabel = (adminId, result) =>{
    var statusInfo = {status: false,ack:"Data not found!",data:[]}
    let query  = "SELECT l.id as labelId, l.title as label, l.color as value, l.colorData, taggings.taggable_id as userId FROM labels l LEFT JOIN taggings ON l.id = taggings.tag_id WHERE l.adminId = ? ;"
    sql.query(query,[adminId],(err, res) =>{
        
        if (res){
            // console.log("RES",res);
            if (res.length==0){
                result(statusInfo);
            }else{
                statusInfo.status= true;
                // statusInfo.data = res;
                statusInfo.ack = "Data found!";

                statusInfo.data= res;
                
                

                result(statusInfo);
            }
        }else if(err){
            console.log("ERROR",err);
            result(err);
        }
    });
};

label.UserLabelUpdate = (LabelDataRaw, result) => {

    var statusInfo = {status: false,ack:"Data not found!",data:{userId:0}}
    const { adminId, LabelData } = LabelDataRaw.labelData
    let sqlQuery = '';
    LabelData.forEach(data => {
        for (let key in data) {
            if (key == "UPDATE") {
                const colorQuery = data[key].color?.hex? `, color='${data[key].color.hex}'`:``
                sqlQuery = `UPDATE labels SET colorData='${(JSON.stringify(data[key].color.rgb || data[key].color))}'${colorQuery}, title='${data[key].title}', description='${data[key].description}' WHERE adminId=${adminId} AND id=${data[key].labelId}; `
                sql.query(sqlQuery,(err, res) =>{
                    // console.log("res",res);
                    if (res){
                        if (res.length==0){
                            // result(statusInfo);
                        }else{
                            statusInfo.data += res[0]? res[0]:' ';
                        }
                    }else if(err){
                        console.log("ERROR",err);
                        result(err);
                    }
                });
            } else if (key == "INSERT") {
                sqlQuery = `INSERT INTO labels (adminId, color, colorData, title, description) VALUES (${adminId}, '${(data[key]?.color.hex || '#ffffff')}', '${JSON.stringify(data[key].color.rgb) || '{"a": 1, "b": 85, "g": 14, "r": 20}'}', '${data[key].title}', '${data[key].description}'); `
                sql.query(sqlQuery,(err, res) =>{
                    // console.log("res",res);
                    if (res){
                        if (res.length==0){
                            // result(statusInfo);
                        }else{
                            statusInfo.data += res[0]? res[0]:' ';
                        }
                    }else if(err){
                        console.log("ERROR",err);
                        result(err);
                    }
                });
            } else if (key == "DELETE") {
                sqlQuery = `DELETE FROM labels WHERE id=? AND adminId = ?; `
                sql.query(sqlQuery,[data[key].labelId, adminId],(err, res) =>{
                    // console.log("res",res);
                    if (res){
                        if (res.length==0){
                            // result(statusInfo);
                        }else{
                            statusInfo.data += res[0]? res[0]:' ';
                        }
                    }else if(err){
                        console.log("ERROR",err);
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

    // console.log({labelId_userId_array, labelIdArray, userId})
    var statusInfo = {status: false,ack:"Data not found!",data:{userId:0}}

    sql.getConnection((err, connection) => {
        if (err) throw err;
    // Start a transaction
    connection.beginTransaction((error) => {
        if (error) throw error;
    
        // First query - REPLACE statement

        // const queryParams = labelData.map(({ labelId }) => labelId).concat([userId]).concat(labelData.map(({ labelId }) => labelId)).concat([userId]);
        // const replaceQuery =`INSERT INTO \`taggings\` (tag_id, taggable_id) VALUES ${labelId_userId_array} ON DUPLICATE KEY UPDATE tag_id = VALUES (${labelIdArray}) WHERE taggable_id=${userId};`;
        
    
        const values = labelIdArray.flatMap(() => [userId]);

        const replaceQuery = `INSERT IGNORE INTO taggings (tag_id, taggable_id) VALUES ${labelId_userId_array} `;
        const queryParams = [ userId];

        const deleteQuery = `DELETE FROM taggings WHERE taggable_id=?;`;

        connection.query(deleteQuery, [userId], (error, results) => {
            if (error) {
            // Rollback the transaction if an error occurs
            return connection.rollback(() => {
                throw error;
            });
            if(results) {console.log("Delete Success");}
            }
        
        connection.query(replaceQuery, (error, results) => {
        if (error) {
            // Rollback the transaction if an error occurs
            return connection.rollback(() => {
            throw error;
            });
        }
    
        // Second query - DELETE statement
        
    
            // Commit the transaction if both queries succeed
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
    });

    
    connection.release();
    // sql.end();    
    })

}

label.UserLabelInsert = (LabelData, result) => {
    const {adminId, labels} = LabelData
    // dummy data]
    // const labels =  {users : [{color: {hex: '#ffffff'}, title: 'test', description: 'this is test'}, {color: {hex: '#f6f6'}, title: 'test2', description: 'this is test 2'}, {color: {hex: '#f83aff'}, title: 'test 3', description: 'this is test 3'} ]}
    // const expclabels = [['#ffffff', 'test', 'this is test'], ['#f6f6','test2', 'this is test 2', '#f83aff', 'test 3', 'this is test 3' ]]
    const capturedData = LabelData?.capturedData || '[]'
    const avatarUrl = LabelData?.avatarUrl || '[]'
    var statusInfo = {status: false,ack:"Data not updated",data:{userId:0}} 
    const params = labels.users.map(user => {
        const color = "#F5A623" // user.color.hex;
        const colorData =   user.color.rgb;
        const title = user.title;
        const description = user.description || '';
        return [color, title, description, adminId];
    });
    let query  = `INSERT INTO user_list (color, colorData, title, description, aminId) VALUES  ${[params]};`;
    sql.query(query,(err, res) =>{
        // console.log("res",res);
        if (res){
            if (res.length==0){
                result(statusInfo);
            }else{
                statusInfo.status= true;
                statusInfo.data = res[0]? res[0]:'';
                statusInfo.ack = "Labels Added Successfully!";
                result(statusInfo);
            }
        }else if(err){
            console.log("ERROR",err);
            result(err);
        }
    });

}



module.exports = label;