const sql = require('./db.model');


const getPlans = (result) => {

    let statusInfo = {};
    const query = `SELECT * FROM plans`;
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

const getPlan = (adminId, plan_id) => {

}


const updatePlan = (adminId, plan_id, result) => {

    var statusInfo = { status: false, ack: "Data not found!", data: [] };
    const query = `Update admins set plan=? where adminId=?`;
    sql.query(query, [plan_id,adminId], (err, res) => {
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

module.exports = {
    getPlans,
    updatePlan
}