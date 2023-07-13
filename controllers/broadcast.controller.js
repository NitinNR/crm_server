const Broadcast = require("../models/broadcast.model.js");
const setBroadcast = require("../utility/broadcaster.js")
const { pagination, paginate } = require("../utility/paginate.js");
const CronParser = require('cron-parser');


const getBroadcastList = (req, res) => {
    const { admin_id, page, pageSize, filterName, space_id } = req.query;
    const { page_size, offset } = paginate({ page, pageSize })
    Broadcast.list_broadcast(admin_id, space_id, page_size, offset, filterName, (ack, data) => {
        if (ack) {
            return res.status(200).json(data)
        } else {
            return res.status(500).json([])
        }
    })
}

const createBroadcast = (req, res) => {
    const { account_id, broadcast_details, mytz } = req.body;
    Broadcast.create_broadcast(account_id, broadcast_details, mytz, (ack, data) => {
        if (ack) {
            const bid = data.insertId;
            const cron_string = getCronString(broadcast_details.scheduleDate)
            setBroadcast.scheduleWhatsAppBroadCast(cron_string, account_id, bid)
            return res.status(200).json(data)
            // schedule the broadcast from here ...
        } else {
            return res.status(200).json(data)
        }
    })
}

const getBroadcast = (req, res) => {
    const { admin_id, bid } = req.query;

    Broadcast.get_broadcast(admin_id, bid, (ack, data) => {
        if (ack) {
            return res.status(200).json(data)
            // schedule the broadcast from here ...

        } else {
            return res.status(200).json(data)
        }
    })
}

const updateBroadcast = (req, res) => {
    const { account_id, broadcast_id, broadcast_details } = req.body;
    console.log(broadcast_details);
    Broadcast.update_broadcast(account_id, broadcast_id, broadcast_details, (ack, data) => {
        if (ack) {
            const bid = broadcast_id;
            // // console.log(`minutes:${minutes} hours:${hours} dayOfMonth:${dayOfMonth} monthi:${month}`);
            const cron_string = getCronString(broadcast_details.scheduleDate)

            setBroadcast.scheduleWhatsAppBroadCast(cron_string, account_id, bid)

            return res.status(200).json(data)
            // schedule the broadcast from here ...

        } else {
            return res.status(200).json(data)
        }
    })
}

const deleteBroadcast = (req, res) => {
    const { account_id, broadcast_id } = req.body;
    Broadcast.delete_broadcast(account_id, broadcast_id, (ack, data) => {
        if (ack) {
            return res.status(200).json(data)
            // schedule the broadcast from here ...

        } else {
            return res.status(200).json(data)
        }
    })
}

const getCronString = (scheduleDate) => {
    const milliseconds = new Date(scheduleDate).getTime();
    const utcdate = new Date(milliseconds)
    const minutes = utcdate.getMinutes();
    const hours = utcdate.getHours();
    const dayOfMonth = utcdate.getDate();
    const month = utcdate.getMonth() + 1;
    return `${minutes} ${hours} ${dayOfMonth} ${month} *`

}

module.exports = { getBroadcastList, createBroadcast, getBroadcast, updateBroadcast, deleteBroadcast }