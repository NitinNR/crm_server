const sql = require('./db.model');
const StripeApi = require("../utility/stripe_api");

const getUserPlanTrack = async (admin_id, plan_id = 0, status = 1) => {
    let statusInfo = { status: false, data: {} };

    let query = `SELECT * FROM plan_tracks where admin_id = ? and status = ?`;
    if (plan_id !== 0) query = `SELECT * FROM plan_tracks where admin_id = ? and plan_id = ? and status = ?`;

    console.log(query);

    return await new Promise((resolve, reject) => {

        let params = [admin_id, status]
        if (plan_id !== 0) params = [admin_id, plan_id, status]
        console.log(params);

        sql.query(query, params, (err, res) => {
            if (res) {
                if (res.length > 0) {
                    statusInfo.status = true;
                    statusInfo.data = res;
                    resolve(statusInfo);
                } else {
                    resolve(statusInfo);
                }
            } else if (err) {
                console.log("ERROR", err);
                reject(err);
            }
        });

    })


}

const addPlanTrack = async (admin_id, plan_id, payment_mode, payment_id, status = 1) => {

    var statusInfo = { status: false, ack: "Data didn't added!", data: [] };
    const query = `insert into plan_tracks(admin_id,plan_id,payment_mode,payment_id,status) values(?,?,?,?,?)`;

    return await new Promise((resolve, reject) => {

        sql.query(query, [admin_id, plan_id, payment_mode, payment_id, status], (err, res) => {
            if (res) {
                if (res.length == 0) {
                    return resolve(statusInfo);
                } else {
                    statusInfo.status = true;
                    statusInfo.data = res;
                    statusInfo.ack = "Data added!";
                    return resolve(statusInfo);
                }
            } else if (err) {
                return reject(err)
            }
        });

    })

}

const UpgradePlanBeforeExpiry = async (plan_track_id, admin_id, plan_id, payment_mode, payment_id) => {

    var statusInfo = { status: false, ack: "didn't update", data: [] };
    const query = `update plan_tracks set plan_id = ?, payment_mode = ?, payment_id = ? where admin_id = ? and status = 1 and id = ?`;

    return await new Promise((resolve, reject) => {

        sql.query(query, [plan_id, payment_mode, payment_id, admin_id, plan_track_id], (err, res) => {
            if (res) {
                console.log("UpgradePlanBeforeExpiry:", res);
                if (res.length == 0) {
                    return resolve(statusInfo);
                } else {
                    statusInfo.status = true;
                    statusInfo.data = res;
                    statusInfo.ack = "updated!";
                    return resolve(statusInfo);
                }
            } else if (err) {
                return reject(err);
            }
        });
    })


}

const PlanManager = async (admin_id, plan_id, status, payment_mode = null, payment_id = null) => {

    const user_plan_data = await getUserPlanTrack(admin_id);
    console.log("Plan Track data:", user_plan_data);
    const status_info = { status: false, ack: "something went wrong" }
    if (user_plan_data.status) {

        if (user_plan_data.data.length > 1) {
            status_info.ack = "plan upgrade failed ! cause, user has more than one active plan !"
            return status_info;

        };
        await UpgradePlanBeforeExpiry(user_plan_data.data[0].id, admin_id, plan_id, payment_mode, payment_id)

        // cancel previous subscription base on its id
        console.log("Canceling the Previous subscription...");
        await CancelSubscriptionWhenUpgradingIt(user_plan_data.data[0]);

        status_info.status = true
        status_info.ack = "plan upgraded"
        return status_info;
    } else {
        await addPlanTrack(admin_id, plan_id, payment_mode, payment_id, 1)
        status_info.status = true
        status_info.ack = "plan added"
        return status_info;
    }
}

const ExpiredPlan = async (admin_id, plan_id) => {

    var statusInfo = { status: false, ack: "didn't update", data: [] };
    const query = `update plan_tracks set status = 0 where admin_id = ? and plan_id = ? and status = 1`;

    return await new Promise((resolve, reject) => {

        sql.query(query, [admin_id, plan_id], (err, res) => {
            if (res) {
                console.log(res);
                if (res.length == 0) {
                    return resolve(statusInfo);
                } else {
                    statusInfo.status = true;
                    statusInfo.data = res;
                    statusInfo.ack = "plan has expired updated!";
                    return resolve(statusInfo);
                }
            } else if (err) {
                return reject(err);
            }
        });
    })
}


const CancelSubscriptionWhenUpgradingIt = async (user_plan_data) => {

    if (user_plan_data.payment_mode === "subscription") {
        const sub_id = user_plan_data.payment_id;
        const cancel_status = await StripeApi.cancel_subscription(sub_id);
        return cancel_status;
    }
    return { status: false, ack: "payment mode was not subscription !" }

}

const UserCancelSubscription = async (admin_id, plan_id) => {

    const user_current_active_plan = await getUserPlanTrack(admin_id, plan_id);

    if (!user_current_active_plan.status) return { status: false, ack: "Couldn't find active plan" };

    if (user_current_active_plan.data[0].payment_mode !== "subscription") {

        return {status: false, ack: "payment mode was not subscription !"}
    }

    if (user_current_active_plan.status) {
        const pay_id = user_current_active_plan.data[0].payment_id;

        const cancel_status = await StripeApi.cancel_subscription(pay_id);

        if (cancel_status.status) {
            await ExpiredPlan(admin_id, plan_id);
            return cancel_status
        }
        return cancel_status;

    }

}



module.exports = {
    addPlanTrack,
    UpgradePlanBeforeExpiry,
    PlanManager,
    ExpiredPlan,
    UserCancelSubscription,
    getUserPlanTrack
}