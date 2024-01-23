require('dotenv').config();


const STRIPE_PAY = {
    secret_api_key : process.env.STRIPE_SECRET_API_KEY,
    domain_url : process.env.DOMAIN_URL,
    api_url : process.env.STRIPE_DOMAIN_URL
}

module.exports = {STRIPE_PAY}
// exports = {STRIPE_PAY}