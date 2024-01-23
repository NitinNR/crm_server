const App = require("../models/plan.model.js");
const PlanTrack = require("../models/plan_tracks.model.js");

exports.getPlans = (req, res) => {

    App.getPlans((data) => {
        if (data) {
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    });

};

exports.getUserActivePlan = async (req, res) => {

    const {admin_id} = req.query;
    const user_plan_data = await PlanTrack.getUserPlanTrack(admin_id);
    return res.status(200).json(user_plan_data);

};

exports.updatePlan = (req, res) => {
    const { admin_id, plan_id } = req.body;
    console.log("--------->", admin_id, plan_id);
    App.updatePlan(admin_id, plan_id, (data) => {
        if (data) {
            return res.status(200).json(data);
        } else if (data == 0) {
            return res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    });
}

exports.updatePlanV2 = async (req, res) => {
    const { admin_id, plan_id } = req.body;
    console.log("--------->", admin_id, plan_id);
    const plan_update_status = await PlanTrack.PlanManager(admin_id,plan_id);
    console.log("plan_update_status:",plan_update_status);
    return res.status(200).json(plan_update_status);
}

exports.adminPlan = (req, res) => {
    const { admin_id } = req.query;
    App.getPlanByadminId(admin_id, (data) => {
        if (data.length) {
            return res.status(200).json(data);
        } else if (data.length == 0) {
            return res.status(302).send({
                message: "Some error occurred try after some time."
            })
        }
    });
}

exports.cancelPlan = async (req, res) => {

    const { admin_id, plan_id } = req.body;
    console.log({ admin_id, plan_id });
    const cancel_status = await PlanTrack.UserCancelSubscription(admin_id, plan_id);
    const status = cancel_status.status;
    const ack = cancel_status.ack || "couldn't cancel subscription";
    return res.status(200).json({ ack, status });

}


