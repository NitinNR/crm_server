const axios = require("axios");
const FormData = require('form-data');

const mainUrl = "https://graph.facebook.com/v16.0/{{id}}/messages";

const sendMessage = async (phone_number_id, api_key, template_name, template_attrs, code, phone_number) => {

    if (template_attrs) {
        sendTemplateWithData(phone_number_id, api_key, template_name, template_attrs, code, phone_number)
    } else {
        sendTemplate(phone_number_id, api_key, template_name, code, phone_number)
    }
}

const sendTemplate = async (phone_number_id, api_key, template_name, code, phone_number) => {

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

const sendTemplateWithData = async (phone_number_id, api_key, template_name, template_attrs, code, phone_number) => {


    let data = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": code
            }
        }
    };

    const template_attrs_obj = JSON.parse(template_attrs)

    //
    const body_vars = {};
    for (const key in template_attrs_obj) {
        if (template_attrs_obj.hasOwnProperty(key)) {
            if (/^var_\d+$/.test(key)) {
                body_vars[key] = template_attrs_obj[key];
            }
        }
    }
    const sortedKeys = Object.keys(body_vars)
        .filter(key => /^var_\d+$/.test(key))
        .sort();
    let params = []
    sortedKeys.forEach(element => {
        params.push(
            {
                "type": "text",
                "text": body_vars[element]
            })
    });
    if (params.length) {
        data["template"]['components'] = [
            {
                "type": "body",
                "parameters": params
            }
        ]
    }
    //

    let header_compo = {}

    if ('var_image' in template_attrs_obj) {
        header_compo = {
            "type": "header",
            "parameters": [
                {
                    "type": "image",
                    "image": {
                        "link": template_attrs_obj.var_image
                    }
                }
            ]
        }

        if (data['template']['components']) {

            data["template"]['components'].push(header_compo)

        } else {
            data["template"]['components'] = [header_compo]
        }

    }
    else if ('var_video' in template_attrs_obj) {

        header_compo = {
            "type": "header",
            "parameters": [
                {
                    "type": "video",
                    "video": {
                        "link": template_attrs_obj.var_video
                    }
                }
            ]
        }
        if (data['template']['components']) {

            data["template"]['components'].push(header_compo)

        } else {
            data["template"]['components'] = [header_compo]

        }

    }

    data = JSON.stringify(data)
    console.log(data)

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
            console.log("JSON.stringify(response.data)");
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log("error");
            console.log(error);
        });


}

const uploadMedia = async (mediafile) => {

    let data = new FormData();
    data.append('file', mediafile);
    data.append('messaging_product', 'whatsapp');

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v16.0/${phone_number_id}/media`,
        headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
            ...data.getHeaders()
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });

}

const getMedia = (media_id) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v16.0/media_id?phone_number_id=${phone_number_id}`,
        headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    // sending text message to whatsapp
    axios.request(config)
        .then((response) => {
            console.log("JSON.stringify(response.data)");
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log("error");
            console.log(error);
        });

}


module.exports = { sendMessage }