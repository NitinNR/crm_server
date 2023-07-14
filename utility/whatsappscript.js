const axios = require("axios");

const mainUrl = "https://graph.facebook.com/v16.0/{{id}}/messages";

const sendMessage = async (phone_number_id, api_key, template_name, code, phone_number) => {

    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": code
            }
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v16.0/${phone_number_id}/messages`,
        headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    // sending text message to whatsapp
    axios.request(config)
        .then((response) => {
            // console.log("JSON.stringify(response.data)");
            // console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log("error");
            console.log(error);
        });
}

const sendTemplate = async (data) => {

    // sending text message to whatsapp


}


module.exports = { sendMessage }