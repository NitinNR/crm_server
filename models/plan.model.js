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

const getPlan = async (plan_id) => {
    console.log(plan_id,"<===");
    let statusInfo = {status:false,data:{}};
    const query = `SELECT * FROM plans where id=? limit 1`;

    return await new Promise((resolve,reject)=>{

        sql.query(query, [plan_id], (err, res) => {
            if (res) {
                if (res.length == 0) {
                    reject(statusInfo);
                } else {
                    statusInfo.status = true;
                    statusInfo.data = res;
                    resolve(statusInfo);
                }
            } else if (err) {
                console.log("ERROR", err);
                reject(err);
            }
        });

    })
    

}


const updatePlan = (adminId, plan_id, result) => {

    var statusInfo = { status: false, ack: "Data not found!", data: [] };
    const query = `Update admins set plan=? where adminId=?`;
    sql.query(query, [plan_id, adminId], (err, res) => {
        // console.log("res",res);
        if (res) {
            if (res.length == 0) {
                return result(statusInfo);
            } else {
                statusInfo.status = true;
                statusInfo.data = res;
                statusInfo.ack = "Data found!";
                return result(statusInfo);
            }
        } else if (err) {
            console.log("ERROR", err);
            return result(err);
        }
    });

}

const verifyPlan = (adminId, total_broadcasts, total_conatcts, result) => {
    let statusinfo = { status: false, msg: "you have exceed the plan limit" };
    const query = `SELECT plan FROM admins where adminId = ?`;
    sql.query(query, [adminId], (err, res) => {
        console.log("res", res);
        if (res && res.length > 0) {
            const admin_data = res[0];
            const plan_id = admin_data.plan;
            console.log("plan_id=>",plan_id);
            if (plan_id) {
                const query = `SELECT * FROM plans where id = ?`;
                sql.query(query, [plan_id], (err, data) => {
                    if(err) return result(statusinfo);

                    console.log(data);
                    console.log("total_broadcasts:",total_broadcasts);
                    console.log("total_conatcts:",total_conatcts);
                    const {broadcasts_limit, contacts_limit} = data[0];


                    if (broadcasts_limit <= total_broadcasts) {
                        statusinfo.msg = "You have reached your broadcast limit !"
                        return result(statusinfo);
                    } else {
                        statusinfo.status = true;
                        statusinfo.msg = "all set";
                    }
                    if (contacts_limit <= total_conatcts) {
                        statusinfo.msg = "You have reached your contacts limit !"
                        return result(statusinfo);
                    } else {
                        statusinfo.status = true;
                        statusinfo.msg = "all set";
                        return result(statusinfo);
                    }

                })
            }

        } else{
            console.log("ERROR", err);
            result(err);
        }
    });

}

const getPlanByadminId = (adminId,result)=>{
    const plan_data_query = "select plt.plan_id,pln.contacts_limit,pln.broadcasts_limit from plan_tracks as plt inner join plans as pln on plt.admin_id = ? where pln.id = plt.plan_id;"
    sql.query(plan_data_query, [adminId], (err, res) => {

        console.log(res);
        if(err) return result([]);
        if(res){
            result(res)
        }
    })


}

module.exports = {
    getPlans,
    updatePlan,
    getPlan,
    verifyPlan,
    getPlanByadminId
}