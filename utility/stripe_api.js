const { STRIPE_PAY } = require('../configs/pay_creds');


const cancel_subscription = async (sub_id) => {
    const cancel_status_info = { status: false, ack: "cancellation failed" }

    const stripe = require('stripe')(STRIPE_PAY.secret_api_key);

    try {
        const cancel_subscription_status = await stripe.subscriptions.cancel(sub_id);
        if (cancel_subscription_status.cancellation_details.reason === "cancellation_requested") {
            cancel_status_info.status = true
            cancel_status_info.ack = "subscription canceled";

        }
    } catch (error) {
        cancel_status_info.ack = "subscription cancellation request failed !";
    }
    return cancel_status_info
}

module.exports = {
    cancel_subscription
}