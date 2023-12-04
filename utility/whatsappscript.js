const axios = require("axios");
const FormData = require('form-data');

const mainUrl = "https://graph.facebook.com/v16.0/{{id}}/messages";

// Send a WhatsApp template message
const sendTemplate = async (phone_number_id, api_key, template_name, code, phone_number) => {
    const data = {
        messaging_product: "whatsapp",
        to: phone_number,
        type: "template",
        template: {
            name: template_name,
            language: { code: code }
        }
    };

    return sendMessage(phone_number_id, api_key, data);
}

// Send a WhatsApp template message with data
const sendTemplateWithData = async (phone_number_id, api_key, template_name, template_attrs, code, phone_number) => {
    let data = {
        messaging_product: "whatsapp",
        to: phone_number,
        type: "template",
        template: {
            name: template_name,
            language: { code: code }
        }
    };

    const template_attrs_obj = JSON.parse(template_attrs);

    const body_vars = {};
    for (const key in template_attrs_obj) {
        if (/^var_\d+$/.test(key)) {
            body_vars[key] = template_attrs_obj[key];
        }
    }

    const sortedKeys = Object.keys(body_vars)
        .filter(key => /^var_\d+$/.test(key))
        .sort();

    let params = sortedKeys.map(element => ({ type: "text", text: body_vars[element] }));

    if (params.length) {
        data.template.components = [{ type: "body", parameters: params }];
    }

    const header_compo = getHeaderComponent(template_attrs_obj);
    if (header_compo) {
        data.template.components.push(header_compo);
    }

    return sendMessage(phone_number_id, api_key, data);
}

// Send a message with specified data
const sendMessage = async (phone_number_id, api_key, data) => {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v16.0/${phone_number_id}/messages`,
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        };

        const response = await axios.request(config);
        return response.status === 200 ? { status: true, data: response.data } : { status: false };
    } catch (error) {
        return { status: false, error: error.message };
    }
}

// Create a header component if image or video is present
const getHeaderComponent = (template_attrs_obj) => {
    if ('var_image' in template_attrs_obj) {
        return {
            type: "header",
            parameters: [{
                type: "image",
                image: { link: template_attrs_obj.var_image }
            }]
        };
    } else if ('var_video' in template_attrs_obj) {
        return {
            type: "header",
            parameters: [{
                type: "video",
                video: { link: template_attrs_obj.var_video }
            }]
        };
    }
    return null;
}

// Upload media file
const uploadMedia = async (phone_number_id, api_key, mediafile) => {
    const data = new FormData();
    data.append('file', mediafile);
    data.append('messaging_product', 'whatsapp');

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v16.0/${phone_number_id}/media`,
        headers: {
            'Authorization': `Bearer ${api_key}`,
            ...data.getHeaders()
        },
        data: data
    };

    return axios.request(config);
}

// Get media by media_id
const getMedia = async (phone_number_id, api_key, media_id) => {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v16.0/${media_id}?phone_number_id=${phone_number_id}`,
        headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
        }
    };

    return axios.request(config);
}

const getBusinessProfile = async (phone_number_id, access_token) => {
    try {
        const fields = "about,address,description,email,profile_picture_url,websites,vertical";
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v16.0/${phone_number_id}/whatsapp_business_profile?fields=${fields}`,
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(config);
        // console.log("response", response);

        if (response.status) {
            return { status: true, data: response.data };
        } else {
            return { status: false };
        }
    } catch (error) {
        return { status: false, error: error.message };
    }
}

const verifyCreds = async (adminId, details) => {
    try {
        const { businessAccID, ApiKey, phoneNumberID } = details;
        // console.log("businessAccID, ApiKey, phoneNumberID | ", businessAccID, ApiKey, phoneNumberID);
        const config = {
            method: 'get',
            url: `https://graph.facebook.com/v16.0/${businessAccID}/message_templates?fields=status,name,category,id&limit=1`, // Fixed "limit" typo
            headers: {
                'Authorization': `Bearer ${ApiKey}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(config);
        const templ = await getBusinessProfile(phoneNumberID, ApiKey);
        // console.log("Response:", response.status, templ.status);
        if (response.status === 200 && templ.status) {
            // console.log("Business Profile:", templ);
            return { status: true, data: response.data };
        } else {
            return { status: false };
        }

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const getAccountTemplateByID = async (template_id, access_token) => {
    try {
        const config = {
            method: 'get',
            url: `https://graph.facebook.com/v18.0/${template_id}`,
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        };
        const response = await axios.request(config);

        console.log("--------> res : ", response.data);

        return response.data;
    } catch (error) {
        console.log(error.message);
    }

}

const getAccountTemplates = async (whatsapp_account_id, access_token) => {
    try {
        const config = {
            method: 'get',
            url: `https://graph.facebook.com/v18.0/${whatsapp_account_id}/message_templates`,
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        };
        const response = await axios.request(config);

        return response.data.data;
    } catch (error) {
        console.log(error.message);
    }

}

// Send a message with specified data for channel broadcast
const sendMessage2 = async (phone_number_id, api_key, data) => {
    // const whatsapp_no = 
    console.log("Sending message to", data.to);
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/v16.0/${phone_number_id}/messages`,
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        };
        const response = await axios.request(config);
        return response.status === 200 ? { status: true, data: response.data } : { status: false };
    } catch (error) {
        return { status: false, error: error.message };
    }
}




module.exports = { sendMessage, verifyCreds, getAccountTemplates, sendMessage2, getAccountTemplateByID };
