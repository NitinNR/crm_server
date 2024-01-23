const config = require("../configs/pay_creds")
const stripe = require('stripe')(config.STRIPE_PAY.secret_api_key);
const MY_DOMAIN = config.STRIPE_PAY.domain_url;
// var stripe_v = Stripe('pk_test_51OSGJJSIUi6MuxALgyUwFVGJl6GIzS4X4fO1di91g2e3ASNPN0A8NI82LCvofcRRwCnbS3crcYO8oeSQg7a6ZqjZ00hktKw1kI');

const PlanModel = require("../models/plan.model");
const PlanTracksModel = require("../models/plan_tracks.model");

exports.StripePay = async (req, res, next) => {
    const { admin_id, plan_id } = req.body;
    const plan_data = await PlanModel.getPlan(plan_id);
    if (!plan_data.status) return;
    const period_type = plan_data.data[0].period;

    const mode = period_type === 1 || period_type === 2 ? "subscription" : "payment";
    const line_items = plan_data.data.map((pd) => ({
        price_data: {
            currency: 'usd',
            unit_amount: pd.price * 100,
            product_data: {
                name: pd.name,
                metadata: { b_limit: pd.broadcast_limit, c_limit: pd.contacts_limit },
            },
        },
        quantity: 1,

    }))

    if (mode === "subscription") {
        line_items[0].price_data.recurring = {};
        if (period_type === 1) {
            line_items[0].price_data.recurring.interval = "month";

        } else if (period_type === 2) {
            line_items[0].price_data.recurring.interval = "year";

        }
    }

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode,
        metadata: { uid: admin_id, pid: plan_id },
        success_url: `${MY_DOMAIN}/success?id=${plan_id}`,
        cancel_url: `${MY_DOMAIN}/cancel`,
    });
    return res.status(200).json({ id: session.id });

}

exports.StripeEvents = async (req, res, next) => {
    console.log("Stripe Events Data\n||=========>");
    const event_data = req.body;
    const event_name = event_data.type;
    console.log("event :", event_name);
    // console.log(JSON.stringify(event_data));
    console.log("<===========||");

    let action = "not defined";
    let action_status = "not defined";
    if (event_name === "checkout.session.completed") {
        const { uid, pid } = event_data.data.object.metadata;
        const ispaid = event_data.data.object.payment_status;
        const session_status = event_data.data.object.status;
        const payment_mode = event_data.data.object.mode;
        let payment_id = 0;
        if (payment_mode === "payment") payment_id = event_data.data.object.payment_intent;
        else payment_id = event_data.data.object.subscription;

        action = "user plan update action";
        action_status = update_user_plan(uid, pid, ispaid, session_status, payment_mode, payment_id) || false;

    }

    return res.status(200).json({ msg: "successfull webhook", action_status })
}


// To update or downgrade plan for user.
const update_user_plan = async (admin_id, plan_id, ispaid, session_status, payment_mode, payment_id) => {
    if (ispaid !== "paid" && session_status !== "complete") return {status:false,ack:"Payment failed!"};
    const status_info = await PlanTracksModel.PlanManager(admin_id, plan_id, ispaid, payment_mode, payment_id);
    console.log(status_info);
    return status_info
}