const axios = require('axios');
const ChannelModel = require('../models/channel.model');
const { verifyCreds } = require("../utility/whatsappscript")


exports.addChannel = async (req, res) => {
    try {
        // console.log(" req.body |",  req.body);
        const { adminId, channelName, details } = req.body;
        const detailsObj = (typeof(details) === 'string') ? JSON.parse(details) : details;
        // console.log("___---BODY  ", req.body, typeof(details));
        if(channelName === "whatsapp" && detailsObj.API_Provider === "WhatsApp Cloud"){
            
            const { API_Provider, phoneNumber, phoneNumberID, businessAccID, ApiKey, name } = detailsObj
            // console.log(adminId, API_Provider, phoneNumber, phoneNumberID, businessAccID, ApiKey);
            const provider_config = { ApiKey, phoneNumberID, businessAccID };

            // Verify credentials and get message_templates
            const response = await verifyCreds(adminId, detailsObj);
            const message_templates = response?.data?.data;

            if (response.status) {
                // Check if the WhatsApp channel with the given phone number already exists
                const checkNum = await ChannelModel.getChannel(adminId, phoneNumber);
                // const matchingNumber = (checkNum.data != {}) ? checkNum.data.phone_number===phoneNumber : false
                console.log("checkNum", checkNum.status, checkNum.data);
                if (!checkNum.status) {
                    // Create a new WhatsApp channel if it doesn't exist
                    const resp = await ChannelModel.createWPChannel(adminId, phoneNumber, API_Provider, provider_config, message_templates);
        
                    if (resp.status) {
                        // Create the channel with additional information if the first creation is successful
                        // console.log("CONTROLL-----", resp.data.channelId, adminId, name, channelName);
                        const resp2 = await ChannelModel.createChannel(resp.data.channelWpId, adminId, name, channelName);
        
                        if (resp2.status) {
                            return res.status(200).json({ status: true, ack: "WhatsApp Cloud API Configured" });
                        }
                    }
                } else {
                    return res.status(200).json({ status: false, ack: "WhatsApp Channel already exists" });
                }
            }

            } else if(channelName === "sms")
            {
                const { API_Provider, phoneNumber, phoneNumberID, businessAccID, ApiKey } = details;
                console.log(adminId, API_Provider, phoneNumber, phoneNumberID, businessAccID, ApiKey);
                const provider_config = { ApiKey, phoneNumberID, businessAccID };
            }

            // Handle the case where credentials verification failed
            return res.status(200).json({ status: false, ack: "Something went wrong | Check Credentials" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(200).json({ status: false, error: error.message, ack: "Something went wrong | Check Credentials" });
    }
};

exports.getChannels = async (req, res) => {
    try {
        const { adminId } = req.body;
        const response = await ChannelModel.fetchChannels(adminId);
        if (response.status) {
            return res.status(200).json({ status: true, ack: "WhatsApp Channels", data: response.data });
        } 
        return res.status(200).json({ status: true, ack: "Something went wrong | Try Again Later" });
    } catch (error) {
        console.log("Error", error);
        res.status(200).json({ status: false, error: error.message, ack: "Something went wrong | Try Again Later" });
    }
};

exports.delChannel = async (req, res) => {
    try {
        const { adminId, channelId, channelType } = req.body;
        const response = await ChannelModel.deleteChannel(adminId, channelId, channelType);
        if (response.status) {
            return res.status(200).json({ status: true, ack: "Channel Removed Successfully!" });
        } 
        return res.status(200).json({ status: true, ack: "Something went wrong | Try Again Later" });
    } catch (error) {
        console.log("Error", error);
        res.status(200).json({ status: false, error: error.message, ack: "Something went wrong | Try Again Later" });
    }
};
