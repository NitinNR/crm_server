const planModel = require('../models/plan.model');
const appModel = require('../models/app.model');

const verify_contacts = (req, res, next) => {
    // get admin id
    const { adminId } = req.body;
    console.log("TEST ===>", adminId);
    // get the plan id
    planModel.getPlanByadminId(adminId, (data) => {
        if (data.length) {
            // get plan details
            const { contacts_limit, broadcasts_limit } = data[0];

            // get users current contacts count
            let users_added_contacts_count = 0;
            appModel.getUserListCount(adminId, (count_data) => {
                if (count_data) {

                    console.log("Count data=>",count_data[0].user_count);
                    users_added_contacts_count = count_data[0].user_count;
                    // check the previously added contacts count
                    console.log("======>",users_added_contacts_count);
                    console.log(users_added_contacts_count < contacts_limit);
                    if (users_added_contacts_count < contacts_limit){
                        next();
                    } else if (users_added_contacts_count === contacts_limit) {
                        res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });
                    } else {
                        res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });
                    }
                }else{
                    res.status(417).json({ message: "Something is wrong! try after some time." });
                }
            })

        } else {
            res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });

        }
    })



}

const verify_broadcasts = (req, res, next) => {
    // get admin id
    const { account_id } = req.body;
    console.log("TEST ===>", account_id);
    // get the plan id
    planModel.getPlanByadminId(account_id, (data) => {
        if (data.length) {
            // get plan details
            const { broadcasts_limit } = data[0];

            // get users current contacts count
            let users_added_broadcasts_count = 0;
            appModel.getBroadcastCount(account_id, (count_data) => {
                if (count_data) {
                    console.log("Count data=>",count_data[0].broad_count);
                    users_added_broadcasts_count = count_data[0].broad_count || 0;
                    // check the previously added contacts count
                    console.log("======>",users_added_broadcasts_count);
                    console.log(users_added_broadcasts_count < broadcasts_limit);
                    if (users_added_broadcasts_count < broadcasts_limit){
                        next();
                    } else if (users_added_broadcasts_count === broadcasts_limit) {
                        res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });
                    } else {
                        res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });
                    }
                }else{
                    res.status(417).json({ message: "Something is wrong! try after some time." });
                }
            })

        } else {
            res.status(417).json({ message: "You have reached your limit, Please update your Current Plan" });

        }
    })



}

module.exports = {
    verify_contacts, verify_broadcasts
}