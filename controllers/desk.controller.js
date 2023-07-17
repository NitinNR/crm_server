const DeskModel = require("../models/desk.model.js");
const { pagination, paginate } = require("../utility/paginate.js");


const getUserList = (req, res) => {

    const { admin_id, account_id } = req.query
    let page = req.query.page
    let pageSize = req.query.page_size
    const { page_size, offset } = paginate({ page, pageSize })

    return DeskModel.get_user_list({ admin_id, account_id, page_size, offset }, (ack, data) => {
        if (ack) {
            const per_page = page_size
            pagination({ total: data.total, page, per_page }, (pagination_data) => {
                const pagination_result = { data: data.data, total: data.total, pagination_data }
                res.status(200).json(pagination_result)
            })

        } else {
            res.status(500).json({ ack })
        }
    });
}

const getUserFilterList = (req, res) => {

    const { admin_id, account_id, phone_number } = req.query
    let page = req.query.page
    let pageSize = req.query.page_size
    const { page_size, offset } = paginate({ page, pageSize })

    return DeskModel.get_filter_list({ admin_id, account_id, page_size, offset, phone_number }, (ack, data) => {
        if (ack) {
            const per_page = page_size
            pagination({ total: data.total, page, per_page }, (pagination_data) => {
                const filteredResult = { data: data.data, total: data.total, pagination_data }
                res.status(200).json(filteredResult)
            })
        } else {
            res.status(500).json({ ack })
        }
    });
}

const getLables = (req, res) => {
    const { admin_id, account_id } = req.query;
    return DeskModel.get_labels(admin_id, account_id, (ack, data) => {
        if (ack) {
            res.status(200).json(data)
        } else {
            res.status(500).json({ ack })
        }
    })
}

const getTagBasedUsers = (req, res) => {

    const { admin_id, account_id, tags } = req.query;
    const adminId = admin_id;
    let page = req.query.page
    let pageSize = req.query.page_size
    const { page_size, offset } = paginate({ page, pageSize })
    return DeskModel.get_tag_based_users({ adminId, account_id, page_size, offset, tags }, (ack, data) => {
        if (ack) {
            const per_page = page_size
            pagination({ total: data.total, page, per_page }, (pagination_data) => {
                const filteredResult = { data: data.data, total: data.total, pagination_data }
                res.status(200).json(filteredResult)
            })
        } else {
            res.status(500).json({ ack })
        }
    })
}

const getDashBoardDetails = (req, res) => {
    const { admin_id, account_id } = req.query;
    return DeskModel.get_dashboard_details(admin_id, account_id, (ack, data) => {
        if (ack) {
            res.status(200).json(data)
        } else {
            res.status(500).json({ ack })
        }
    })
}

const getMessages = (req, res) => {
    console.log("==>",req.query);
    const {admin_id, account_id } = req.query;
    const message_info = JSON.parse(req.query.message_info)
    const filter_data = message_info.filters;
    let page = parseInt(message_info.page) - 1
    let pageSize = message_info.pageSize
    const { page_size, offset } = paginate({ page, pageSize })

    const sort_field = message_info.sortField ? message_info.sortField : "id"
    let sort_order = message_info.sortOrder ? message_info.sortOrder : ""
    if (sort_order === "descend") {
        sort_order = "DESC"
    } else if (sort_order === "ascend") {
        sort_order = "ASC"
    } else {
        sort_order = "ASC"
    }
    return DeskModel.get_user_messages({admin_id, account_id, page_size, offset, sort_field, sort_order, filter_data }, (ack, data) => {
        if (ack) {
            const per_page = page_size
            pagination({ total: data.total, page, per_page }, (pagination_data) => {
                const pagination_result = { data: data.data, total: data.total, pagination_data }
                res.status(200).json(pagination_result)
            })

        } else {
            res.status(500).json({ ack })
        }
    });
}

const getWhatsappInboxes = (req, res) => {

    const {admin_id, account_id } = req.query;
    return Desk.get_whatsapp_inboxes(admin_id, account_id, (ack, data) => {
        if (ack) return res.status(200).json(data);
        return res.status(400).json([])
    })
}

const getTemplates = (req, res) => {
    const { admin_id, account_id, channel_id } = req.query;
    console.log({ account_id, channel_id });
    return Desk.get_whatsapp_templates(admin_id, account_id, channel_id, (ack, data) => {
        if (ack) return res.status(200).json(data);
        return res.status(400).json([])
    })
}

const verifySpaceUser = (req, res) => {
    const { admin_id, space_id, token } = req.body;

    return Desk.verifySpace(admin_id, space_id, token, (ack, message) => {
        if (ack) return res.status(200).json(message);
        return res.status(400).json(message)
    })
}



module.exports = {
    getUserList, getUserFilterList, getLables, getTagBasedUsers, getDashBoardDetails, getMessages, getWhatsappInboxes, getTemplates, verifySpaceUser
}