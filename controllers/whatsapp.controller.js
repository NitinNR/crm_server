const { getAccountTemplates } = require('../utility/whatsappscript');
const { getChannelByID } = require("../models/channel.model");

exports.getWhatsAppAccountTemplate = async (req, res) => {
    const { adminID, channelID } = req.query
    let status = false;
    let temps = [];
    let code = 504;
    if (adminID && channelID) {
        const account_details = await getChannelByID(adminID, channelID)
        if (account_details.status) {
            status = true
            code = 200
            const creds = account_details.data.provider_config;
            const whatsapp_account_id = creds.businessAccID;
            const access_token = creds.ApiKey;
            temps = await getAccountTemplates(whatsapp_account_id, access_token);
            return res.status(code).json({ status, templates: temps });

        } else {
            code = 404
        }
    }
    return res.status(code).json({ status, data: temps })

}