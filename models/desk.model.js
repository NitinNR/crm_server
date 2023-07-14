const { getDbConfigs } = require("../configs/desk.config");


Desk = () => { }

Desk.get_user_list = (predata, callback) => {

    const page_size = predata.page_size
    const adminId = predata.admin_id

    const offset = predata.offset
    const account_id = predata.account_id
    ack = true
    const get_user_list = `SELECT *
        FROM contacts
        WHERE account_id=${account_id}
        ORDER BY id
        LIMIT ${page_size}
        OFFSET ${offset};`

    // dbconnection.connect()
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection?.query(get_user_list, async (err, res) => {

            if (err) {
                console.log(err);
                ack = false
                return callback(ack, [])
            } else {

                const get_alluser_count = `select count(*) as total from contacts where account_id = ${account_id}`
                const total = await getTotalCount(dbconnection, get_alluser_count)
                const result = { data: res.rows, total: parseInt(total) }
                return callback(true, result)


            }
            // dbconnection.end()
        })
    })

}

Desk.get_filter_list = (predata, callback) => {
    ack = false
    const { admin_id, account_id, page_size, offset, phone_number } = predata
    const adminId = admin_id;
    const get_filteruser_list = `SELECT * FROM "contacts" where account_id = ${account_id} and phone_number like '%${phone_number}%' LIMIT ${page_size} offset ${offset}`

    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(get_filteruser_list, async (err, res) => {
            if (err) return callback(ack, [])
            else {
                const get_filteruser_count = `select count(*) as total from "contacts" where account_id = ${account_id} and phone_number like '%${phone_number}%'`
                const total = await getTotalCount(dbconnection, get_filteruser_count)
                const result = { data: res.rows, total: parseInt(total) }
                return callback(true, result)
            }

        })
    })
}

Desk.get_labels = (adminId, account_id, callback) => {
    ack = false
    const get_labels = `SELECT labels.id as label_id,tags.id as id,labels.title as title,labels.color as color,labels.description as description  
    FROM "labels" join tags on(labels.title = tags.name) where account_id = ${account_id}`
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection?.query(get_labels, (err, res) => {
            if (err) return callback(ack, [])

            const labels = res.rows
            ack = true
            return callback(ack, labels)
        })


    })

}

Desk.get_tag_based_users = ({ adminId, account_id, page_size, offset, tags }, callback) => {

    // tags format should be (1,2,3) or (1)
    // console.log("-------------------",adminId);
    // console.log({ account_id, page_size, offset, tags });
    let tag_len = tags.length
    tags = `(${tags.join()})`
    const ut_query = `SELECT DISTINCT contacts.*
    FROM contacts 
    INNER JOIN taggings 
        ON (contacts.id = taggings.taggable_id AND taggings.tag_id IN ${tags})
    WHERE account_id = ${account_id}
    GROUP BY contacts.id
    HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}
    ORDER BY contacts.id
    LIMIT ${page_size}
    OFFSET ${offset};`
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(ut_query, async (err, res) => {
            console.log(res.length);
            if (err) return callback(false, [])
            const total_qury = `SELECT count( DISTINCT contacts.*) as total
        FROM contacts 
        INNER JOIN taggings 
            ON (contacts.id = taggings.taggable_id AND taggings.tag_id IN ${tags})
        WHERE account_id = ${account_id}
        GROUP BY contacts.id
        HAVING COUNT(DISTINCT taggings.tag_id) = ${tag_len}`
            const total = await getTotalCount(dbconnection, total_qury)
            console.log(total);

            const result = { data: res.rows, total: parseInt(total) }
            return callback(true, result)

        })
    })
}

Desk.get_dashboard_details = (adminId, desk_account_id, callback) => {

    let dbconnection = null;
    getDbConfigs(adminId).then(conn => {
        dbconnection = conn;
        var statusInfo = { status: false, ack: "Data not found!", data: { cards: {} } }

        // nitin change =>
        let query = `SELECT 
    (SELECT COUNT(*) FROM contacts WHERE account_id = ${desk_account_id}) as users,
    (SELECT COUNT(*) FROM messages WHERE account_id = ${desk_account_id}) AS message_report,
    (SELECT COUNT(*) FROM contacts WHERE account_id = ${desk_account_id} AND created_at > now() - INTERVAL '30 day') AS uinterval,
    (SELECT COUNT(*) FROM messages WHERE account_id = ${desk_account_id} AND created_at > now() - INTERVAL '24 hour') AS ainterval,
    (SELECT COUNT(*) FROM messages WHERE account_id = ${desk_account_id} AND content != '' AND created_at > now() - INTERVAL '30 day') AS monthlyMsgreport;`
        dbconnection?.query(query, (err, res) => {
            res = res.rows;
            if (res) {

                if (res.length > 0) {
                    statusInfo.status = true;
                    statusInfo.data.cards.totalUsers = parseInt(res[0]["users"])
                    statusInfo.data.cards.totalMsgs = parseInt(res[0]["message_report"])
                    statusInfo.data.cards.monthlyUsers = parseInt(res[0]["uinterval"])
                    statusInfo.data.cards.totalCapData = parseInt(res[0]["ainterval"])
                    statusInfo.data.cards.monthlyMsgreport = parseInt(res[0]["monthlymsgreport"])
                    statusInfo.data.cards.recentusers = []
                    statusInfo.data.cards.userengagements = {}
                    statusInfo.ack = "Data found!";
                }
                // console.log(statusInfo);
            } else if (err) { return callback(false, []); }

            const recent_users_query = `SELECT * from contacts where account_id = ${desk_account_id} and phone_number <> 'NULL' ORDER BY id DESC LIMIT 6;`;
            dbconnection?.query(recent_users_query, (err2, res2) => {
                res2 = res2.rows
                if (res2) {

                    let recent_users = []
                    res2.forEach(user => {
                        recent_users.push({ fullName: user.name, whatsapp_number: user.phone_number })
                    });
                    statusInfo.data.cards.recentusers = recent_users
                }
                let userEngements_query = `SELECT 
                EXTRACT(YEAR FROM created_at) AS year, 
                EXTRACT(MONTH FROM created_at) AS month, 
                COUNT(*) as user_count
                FROM contacts
                WHERE account_id = ${desk_account_id}
                GROUP BY year, month;`

                dbconnection?.query(userEngements_query, (err3, res3) => {
                    res3 = res3.rows
                    if (res3) {

                        let userengagements = {}
                        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

                        res3.forEach(t => {
                            userengagements[t.year] = userengagements[t.year] === undefined ? {} : userengagements[t.year]
                            userengagements[t.year][t.month] = t.user_count;
                        })

                        const final = {}
                        for (let k in userengagements) {
                            final[k] = []
                            months.forEach(mn => {
                                if (userengagements[k][mn]) {
                                    final[k].push(userengagements[k][mn])
                                } else {
                                    final[k].push(0)
                                }
                            })
                        }
                        statusInfo.data.cards.userengagements = final

                    } else { }
                    callback(true, statusInfo);

                })

            })
        });
    })

};


Desk.get_user_messages = (predata, callback) => {
    const adminId = predata.admin_id;
    const page_size = predata.page_size
    const filters = predata.filter_data
    const offset = predata.offset
    const account_id = predata.account_id
    const sort_field = predata.sort_field
    const sort_order = predata.sort_order
    ack = true
    let filter_query = ""
    Object.keys(filters).forEach((key) => {
        var val = filters[key]
        if (val) {
            if (key === "name") {
                filter_query += ` AND contacts.${key} ILIKE '%${val}%'`
            } else if (key === "phone_number") {
                filter_query += ` AND contacts.${key}::text like '%${val}%'`
            } else if (key === "email") {
                filter_query += ` and contacts.${key} ilike '%${val}%'`
            } else if (key === "content") {
                filter_query += ` and messages.${key} ilike '%${val}%'`
            }

        }
    });
    const get_user_messages = `SELECT messages.id,messages.content,messages.created_at,messages.sender_id,
    contacts.name,contacts.email,contacts.phone_number
    FROM messages
    left JOIN contacts ON messages.sender_id = contacts.id
    where messages.account_id = $1${filter_query} ORDER BY messages.id ${sort_order} LIMIT $2 OFFSET $3;`

    // dbconnection.connect()
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(get_user_messages, [account_id, page_size, offset], async (err, res) => {
            if (err) {
                console.log(err);
                return callback(false, [])
            } else {
                const get_allmessage_count = `SELECT count(*) as total
            FROM messages
            left JOIN contacts ON messages.sender_id = contacts.id
            where messages.account_id = ${account_id}${filter_query}`

                const total = await getTotalCount(dbconnection, get_allmessage_count)
                const result = { data: res.rows, total: parseInt(total) }
                return callback(true, result)
            }
            // dbconnection.end()
        })
    })
}

Desk.get_whatsapp_inboxes = (adminId, account_id, callback) => {

    console.log(adminId, account_id);

    const whatsapp_inboxes_query = "select id,channel_id,name from inboxes where account_id = $1 and channel_type = 'Channel::Whatsapp';"

    getDbConfigs(adminId).then(dbconnection => {

        // console.log(dbconnection);

        dbconnection.query(whatsapp_inboxes_query, [account_id], async (err, res) => {
            if (err) return callback(false, [])
            return callback(true, res.rows)
        })
    })
}

Desk.get_whatsapp_templates = (adminId, account_id, channel_id, callback) => {
    console.log(account_id, channel_id);
    const whatsapp_template_query = "select id,phone_number,provider,provider_config,message_templates from channel_whatsapp where id = $1 and account_id = $2;"
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(whatsapp_template_query, [channel_id, account_id], async (err, res) => {
            console.log(err, res);
            if (err) return callback(false, [])
            return callback(true, res.rows)
        })
    });
}

Desk.get_contacts_based_on_tags = (adminId, account_id, tags, callback) => {
    let query_portion = ""
    for (let index = 0; index < tags.length; index++) {
        const tag = tags[index];
        query_portion += `tags.name = '${tag}' OR `
    }
    const lastIndex = query_portion.lastIndexOf("OR");
    if (lastIndex !== -1) {
        query_portion = query_portion.slice(0, lastIndex);
    }
    const contacts_query = `SELECT DISTINCT contacts.id, contacts.phone_number FROM tags 
    JOIN taggings ON tags.id = taggings.tag_id
    JOIN contacts ON taggings.taggable_id = contacts.id 
    WHERE (${query_portion}) and contacts.account_id = $1;`


    getDbConfigs(adminId).then(dbconnection => {


        dbconnection.query(contacts_query, [account_id], async (err, res) => {
            if (err) return callback(false, [])
            return callback(true, res.rows)
        })
    })
}

Desk.get_all_contacts = async (adminId, account_id, offset, chunksize) => {

    return new Promise((resolve,reject) => {

        const all_query = `SELECT id,phone_number FROM contacts WHERE account_id = $1 ORDER BY "id" LIMIT ${chunksize} OFFSET ${offset}`;
        getDbConfigs(adminId).then(dbconnection => {

            dbconnection.query(all_query, [account_id], async (err, res) => {
                if (err) return reject({ data: [] })
                return resolve({ data: res.rows })
            })

        })

    })

    // const all_query = `SELECT id,phone_number FROM contacts WHERE account_id = $1 LIMIT ${chunksize} offset ${offset}`;
    // getDbConfigs(adminId).then(dbconnection => {

    //     dbconnection.query(all_query, [account_id], async (err, res) => {
    //         console.log("eeeerrr>", err);
    //         console.log("res>", res.rows.length);
    //         if (err) return { data: [] }
    //         return { data: res.rows }
    //     })

    // })

}

Desk.get_whatsapp_channel_details = (adminId, account_id, callback) => {
    const wa_query = "select * from channel_whatsapp where account_id = $1 and provider = 'whatsapp_cloud'";
    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(wa_query, [account_id], async (err, res) => {
            if (err) return callback(false, [])
            return callback(true, res.rows)
        })
    })
}

Desk.verifySpace = (adminId, space_id, user_token, callback) => {

    const verify_query = `select access_tokens.token 
    from accounts left join access_tokens on access_tokens.owner_type = 'User' and 
    access_tokens.owner_id = accounts.id
    where accounts.id = $1`;


    getDbConfigs(adminId).then(dbconnection => {

        dbconnection.query(verify_query, [space_id], async (err, res) => {

            if (err) return callback(false, [])

            if (res.rows.length === 0) return callback(false, "No such user exist")
            else {
                const { token } = res.rows[0]
                if (token === user_token) {
                    return callback(true, [])
                } else {
                    return callback(false, "Wrong credentials provided")
                }
            }
        })
    })

}

const getTotalCount = async (dbconnection, total_qury) => {
    const res = await dbconnection.query(total_qury)
    return res.rows[0]?.total ? res.rows[0].total : 0
}



module.exports = Desk