const App = require("../models/plan.model.js");

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

exports.updatePlan = (req,res)=>{
    const { admin_id,plan_id } = req.body;
    console.log("--------->",admin_id,plan_id);
    App.updatePlan(admin_id,plan_id,(data) => {
        if (data) {
            res.status(200).json(data);
        } else if (data == 0) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred try again."
            })
        }
    });
}
