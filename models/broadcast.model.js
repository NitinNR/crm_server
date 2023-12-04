const dbconn = require("../models/db.model")
const desk = require("../models/desk.model")

Broadcast = () => { }

Broadcast.list_broadcast = (adminId, space_id, page_size, offset, filterName, callback) => {

    let broadcast_list = `select * from broadcasts where admin_id = ? LIMIT ${page_size} OFFSET ${offset}`;
    if (filterName) broadcast_list = `select * from broadcasts where admin_id = ? and title like CONCAT('%', ?, '%') LIMIT ${page_size} OFFSET ${offset}`;
    dbconn.query(broadcast_list, [adminId, filterName], async (err, res) => {
        if (err) return callback(false, { message: "error occured" })

        desk.get_whatsapp_inboxes(adminId, space_id, (ack, data) => {
            if (ack) {

                const updateInboxNames = (res, data) => {
                    return new Promise((resolve, reject) => {
                        res.map((item, idex) => {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].id === item.inbox_id && item.source !== "Channel") {
                                    res[idex].inbox_name = data[i].name;
                                    break;
                                } else {
                                    res[idex].inbox_name = item.inbox_id;
                                }

                            }
                        });
                        // console.log(res);
                        resolve(res);
                    });
                };
                updateInboxNames(res, data).then(res => {
                    let total_broadcast_query = "select count(*) as total from broadcasts where admin_id = ?";
                    if (filterName) total_broadcast_query = `select count(*) as total from broadcasts where admin_id = ? and title like CONCAT('%', ?, '%')`;
                    getTotalCount(total_broadcast_query, adminId, filterName, (total) => {
                        const data = { data: res, total }
                        return callback(true, data)

                    });

                })

            }
        })
        //

        // console.log("data ====>:", res);

        // <=



    })


}

Broadcast.create_broadcast = (adminId, broadcast_details, mytz, callback) => {
    console.log(mytz, ":mytz");

    try {
        let { title, inbox,channel, template, scheduleDate, audienceType, audience, var_image, var_video} = broadcast_details;
        const source = inbox?"Application":"Channel"
        //
        const extractedData = {};
        for (const key in broadcast_details) {
            if (broadcast_details.hasOwnProperty(key)) {
                if (/^var_\d+$/.test(key)) {
                    extractedData[key] = broadcast_details[key];
                }
            }
        }
        const template_vars =JSON.stringify(Object.assign({},extractedData, {var_image,var_video}))
        //

        if (typeof (audience) === 'object') audience = audience.join(",")
        else audience = audience.replace("\n", ",")
        
        var milisecs = new Date(scheduleDate).getTime();
        let create_broadcast_query = `insert into broadcasts (admin_id,title,${inbox?'inbox_id':'channel_id'},template_id,template_attrs,schedule_at,tz,audience_type,audience,source) values(?,?,?,?,?,?,?,?,?,?)`;
        dbconn.query(create_broadcast_query, [adminId, title, inbox?inbox:channel, template,template_vars, milisecs, mytz, audienceType, audience,source], (err, res) => {
            if (err) {
                console.log(err,"errr");
                return callback(false, { status: 400 })
            }
            return callback(true, res,source)
        })
    } catch (e) {
        console.log("e",e);
        return callback(false, { status: 400 })
    }
}

Broadcast.get_broadcast = (adminId, bid, callback) => {

    const get_broadcast_query = "select * from broadcasts where admin_id = ? and id = ? limit 1"

    dbconn.query(get_broadcast_query, [adminId, bid], (err, res) => {
        if (err) {
            return callback(false, { status: 400 })
        }
        return callback(true, res)
    })

}

Broadcast.update_broadcast = (adminId, broadcast_id, broadcast_details, callback) => {
    try {
        let { title, inbox, template, scheduleDate, audienceType, audience,var_image,var_video } = broadcast_details;

        //
        const extractedData = {};
        for (const key in broadcast_details) {
            if (broadcast_details.hasOwnProperty(key)) {
                if (/^var_\d+$/.test(key)) {
                    extractedData[key] = broadcast_details[key];
                }
            }
        }
        const template_vars =JSON.stringify(Object.assign({},extractedData, {var_image,var_video}))
        const template_attrs = template_vars ? template_vars : NULL 
        //


        if (typeof (audience) === 'object') audience = audience.join(",")
        else audience = audience.replace("\n", ",")
        var milisecs = new Date(scheduleDate).getTime();

        let create_broadcast_query = `update broadcasts set title=?,inbox_id=?,template_id=?,template_attrs=?,schedule_at=?,audience_type=?,audience=? where admin_id=? and id=?`;
        dbconn.query(create_broadcast_query, [title, inbox, template,template_attrs, milisecs, audienceType, audience, adminId, broadcast_id], (err, res) => {
            if (err) {
                return callback(false, { status: 400 })
            }
            return callback(true, res)
        })
    } catch (e) {
        return callback(false, { status: 400 })
    }
}

Broadcast.delete_broadcast = (adminId, broadcast_id, callback) => {
    console.log(adminId, broadcast_id);
    try {
        let delete_broadcast_query = `delete from broadcasts where admin_id=? and id=?`;
        dbconn.query(delete_broadcast_query, [adminId, broadcast_id], (err, res) => {
            if (err) {
                return callback(false, { status: 400 })
            }
            return callback(true, res)
        })
    } catch (e) {
        console.log(e);
        return callback(false, { status: 500 })
    }
}

const getTotalCount = async (total_qury, adminId, filterName, callback) => {
    dbconn.query(total_qury, [adminId, filterName], (err, res) => {
        return callback(res[0]?.total ? res[0].total : 0)
    })
}

module.exports = Broadcast;