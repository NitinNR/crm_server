const config = require("../configs/auth.config");
const { v4: uuidv4 } = require("uuid");
// const mysql = require('mysql');
const sql = require('./db.model');

const statusInfo = { status: false, data: {} }

// --------------------- WhatsApp -------------------------- 

// Create
async function createWPChannel1(adminId, phone_number, provider, provider_config, message_templates) {
    const statusInfo = { status: false, data: {} }
    try {
        const sqlQuery = 'INSERT INTO channel_whatsapp (adminId, phone_number, provider, provider_config, message_templates) VALUES (?, ?, ?, ?, ?) SELECT LAST_INSERT_ID();';
        const result = await sql.execute(sqlQuery, [adminId, phone_number, provider, provider_config, message_templates])

        // const insertId = await getWPChannelByAdminId(adminId)
        // // Create a status object and return it
        statusInfo.status = true;
        return statusInfo;

    } catch (error) {
        console.error('Error:', error.message);
        statusInfo.error = error.message
        return statusInfo;
    }
}

async function createChannel(channelId, adminId, name, channelName) {

    return new Promise((resolve, reject) => {
        const statusInfo = { status: false, data: {} };

        try {
            // const channel_type = `Channel::${channelType}`
            console.log("Model-------", channelId, adminId, name, channelName);
            const sqlQuery = 'INSERT INTO channels (channel_id, adminId, name, channel_type) VALUES (?, ?, ?, ?)';
            sql.execute(sqlQuery, [channelId, adminId, name, `Channel::${channelName}`], (err, result) => {
                if (err) {
                    console.error('Error----:', err.message);
                    statusInfo.error = err.message;
                    reject(statusInfo);
                } else {
                    // Check if the insertId is present in the result object
                    if (result.insertId) {
                        console.log("insertId", result.insertId);
                        statusInfo.status = true;
                        statusInfo.data = {
                            channelId: result.insertId
                        };
                        resolve(statusInfo);
                    } else {
                        statusInfo.error = "Insert failed";
                        reject(statusInfo);
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            statusInfo.error = error.message;
            reject(statusInfo);
        }
    });
}

async function createWPChannel(adminId, phone_number, provider, provider_config, message_templates) {
    return new Promise((resolve, reject) => {
        const statusInfo = { status: false, data: {} };

        try {
            console.log("-------", adminId, phone_number, provider, provider_config, message_templates);
            const sqlQuery = 'INSERT INTO channel_whatsapp (adminId, phone_number, provider, provider_config, message_templates) VALUES (?, ?, ?, ?, ?)';
            sql.execute(sqlQuery, [adminId, phone_number, provider, provider_config, message_templates], (err, result) => {
                if (err) {
                    console.error('Error----:', err.message);
                    statusInfo.error = err.message;
                    reject(statusInfo);
                } else {
                    // Check if the insertId is present in the result object
                    if (result.insertId) {
                        console.log("insertId", result.insertId);
                        statusInfo.status = true;
                        statusInfo.data = {
                            channelWpId: result.insertId
                        };
                        resolve(statusInfo);
                    } else {
                        statusInfo.error = "Insert failed";
                        reject(statusInfo);
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            statusInfo.error = error.message;
            reject(statusInfo);
        }
    });
}


// Fetch

// Fetch Channels based on adminId
async function fetchChannels(adminId) {

    return new Promise((resolve, reject) => {
        const statusInfo = { status: false, data: {} };

        try {
            const sqlQuery = 'SELECT id AS channelId, name, REPLACE(channel_type, "Channel::", "") AS channelType FROM channels WHERE adminId = ?';
            sql.execute(sqlQuery, [adminId], (err, result) => {
                if (err) {
                    statusInfo.error = err.message;
                    reject(statusInfo);
                } else {
                    if (result?.length) {
                        statusInfo.status = true;
                        statusInfo.data = {
                            channels: result
                        };
                        resolve(statusInfo);
                    } else {
                        statusInfo.status = true;
                        statusInfo.ack = "No record Found";
                        resolve(statusInfo);
                    }
                }
            });
        } catch (error) {
            statusInfo.error = error.message;
            reject(statusInfo);
        }
    });
}

// Read (Get a Dynamic channel details by adminId)
function getChannel(adminId, phoneNumber) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.*, 
                    CASE 
                        WHEN c.channel_type = 'Channel::whatsapp' THEN cw.phone_number
                        WHEN c.channel_type = 'Channel::sms' THEN cs.phone_number
                        ELSE NULL 
                    END AS phone_number,
                    CASE 
                        WHEN c.channel_type = 'Channel::whatsapp' THEN cw.provider
                        WHEN c.channel_type = 'Channel::sms' THEN cs.provider
                        ELSE NULL 
                    END AS provider,
                    CASE 
                        WHEN c.channel_type = 'Channel::whatsapp' THEN cw.provider_config
                        WHEN c.channel_type = 'Channel::sms' THEN cs.provider_config
                        ELSE NULL 
                    END AS provider_config,
                    CASE 
                        WHEN c.channel_type = 'Channel::whatsapp' THEN cw.message_templates
                        ELSE NULL 
                    END AS message_templates
            FROM channels c
            LEFT JOIN channel_whatsapp cw ON c.channel_type = 'Channel::whatsapp' AND cw.adminId = c.adminId
            LEFT JOIN channel_sms cs ON c.channel_type = 'Channel::sms' AND cs.account_id = c.adminId
            WHERE c.adminId = ? ;
            `;
        sql.query(query, [adminId], (err, rows) => {
            if (err) {
                const statusInfo = {
                    status: false,
                    error: err.message
                };
                reject(statusInfo);
            } else {
                if (rows.length > 0) {
                    const statusInfo = {
                        status: true,
                        data: {
                            channel: rows[0]
                        },
                        ack: 'Data Fetched Successfully!'
                    };
                    resolve(statusInfo);
                } else {
                    const statusInfo = {
                        status: false,
                        data: {},
                        ack: 'No Data Found'
                    };
                    resolve(statusInfo);
                }
            }
        });
    });
}

// Read (Get a channel by phone_number)
function getWPChannelByPhoneNumber(phone_number) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM channel_whatsapp WHERE phone_number = ?';

        sql.query(query, [phone_number], (err, rows) => {
            if (err) {
                const statusInfo = {
                    status: false,
                    error: err.message
                };
                reject(statusInfo);
            } else {
                if (rows.length > 0) {
                    const statusInfo = {
                        status: true,
                        data: {
                            channel: rows[0]
                        },
                        ack: 'Data Fetched Successfully!'
                    };
                    resolve(statusInfo);
                } else {
                    const statusInfo = {
                        status: false,
                        data: {},
                        ack: 'No Data Found'
                    };
                    resolve(statusInfo);
                }
            }
        });
    });
}

// Read (Get a channel by adminID)
function getWPChannelByAdminId(adminId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM channel_whatsapp WHERE adminId = ?';

        sql.query(query, [adminId], (err, rows) => {
            if (err) {
                console.error('Error:', err.message);
                const statusInfo = {
                    status: false,
                    error: err.message
                };
                reject(statusInfo);
            } else {
                if (rows.length > 0) {
                    const statusInfo = {
                        status: true,
                        data: {
                            channel: rows
                        },
                        ack: 'Data Fetched Successfully!'
                    };
                    resolve(statusInfo);
                } else {
                    const statusInfo = {
                        status: false,
                        data: {},
                        ack: 'No Data Found'
                    };
                    resolve(statusInfo);
                }
            }
        });
    });
}


// Update
async function updateWPChannel(id, provider, provider_config, message_templates) {
    const connection = await sql.getConnection();
    try {
        const query = 'UPDATE channel_whatsapp SET provider = ?, provider_config = ?, message_templates = ? WHERE id = ?';
        await connection.execute(query, [provider, provider_config, message_templates, id]);
        statusInfo.status = true;
        return statusInfo
    } finally {
        connection.release();
    }
}

// Delete

// Function to delete a channel and its associated records based on channel_type
async function deleteChannel(adminId, channelId, channelType) {
    const statusInfo = { status: false, data: {} };
    try {
        // Retrieve channel details before deleting
        const channelDetails = await new Promise((resolve, reject) => {
            const selectChannelQuery = 'SELECT * FROM channels WHERE id = ? AND adminId = ?';
            const selectChannelParams = [channelId, adminId];

            sql.query(selectChannelQuery, selectChannelParams, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        reject(new Error('Channel not found'));
                    } else {
                        resolve(results[0]); // Resolve with the channel details
                    }
                }
            });
        });

        await new Promise((resolve, reject) => {
            let deleteQuery;
            let deleteParams;

            // Define conditional delete statements based on channel_type
            if (channelType === 'whatsapp') {
                deleteQuery = 'DELETE FROM channel_whatsapp WHERE id = ? AND adminId = ?';
                deleteParams = [channelDetails.channel_id, adminId];
            } else if (channelType === 'sms') {
                deleteQuery = 'DELETE FROM channel_sms WHERE id = ? AND account_id = ?';
                deleteParams = [channelDetails.channel_id, adminId];
            } else {
                // Handle other channel types here
                reject(new Error('Unsupported channel_type'));
                return;
            }

            // Execute the appropriate delete statement
            sql.query(deleteQuery, deleteParams, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    // Delete the channel record from the 'channels' table
                    sql.query("DELETE FROM channels WHERE id = ? AND adminId = ?", [channelId, adminId], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                }
            });
        });

        statusInfo.status = true;
        statusInfo.data.message = 'Channel deleted successfully';
        statusInfo.data.channelDetails = channelDetails; // Include channel details in the response
        return statusInfo;
    } catch (error) {
        console.error('Error:', error.message);
        statusInfo.status = false;
        statusInfo.error = error.message;
        return statusInfo;
    }
}


async function deleteWPChannel(id) {
    const connection = await sql.getConnection();
    try {
        const query = 'DELETE FROM channel_whatsapp WHERE id = ?';
        await connection.execute(query, [id]);
        statusInfo.status = true;
        return statusInfo
    } finally {
        connection.release();
    }
}

async function getChannelByID(adminId, channelId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM channels WHERE adminId = ? and id = ? limit 1';

        let statusInfo = {
            status: false,
            error: "error"
        };

        sql.query(query, [adminId, channelId], (err, row) => {
            if (err) {
                reject(statusInfo);
            } else {
                if (row.length > 0) {
                    const channel_whatsapp_id = row[0].channel_id;
                    const query2 = 'SELECT * FROM channel_whatsapp WHERE adminId = ? and id = ? limit 1';
                    sql.query(query2, [adminId, channel_whatsapp_id], (err2, row2) => {

                        if (err2) {
                            reject(statusInfo)
                        } else {
                            statusInfo.status = true
                            statusInfo.data = row2[0]
                            statusInfo.ack = 'Data Fetched Successfully!'
                            resolve(statusInfo)
                        }
                    })
                } else {
                    statusInfo.ack = 'No Data Found'
                    resolve(statusInfo);
                }
            }
        });
    });
}

async function getWaCloudChannelByFilter(adminId, filter_data) {

    console.log("filter data");
    let statusInfo = {};

    // info

    // filter_data = [{column:'provider',value:'WhatsApp Cloud',action:'eq'}];
    // action : eq,neq,gt,lt

    const actions = { eq: "=", neq: "<>", gt: ">", lt: "<" };
    return await new Promise((resolve, reject) => {
        let filter_string = ""
        filter_data.forEach(filter => {
            filter_string += ` and ${filter.column} ${actions[filter.action]} ${filter.value}`;
        });
        // filter_string += " and";

        console.log("f--------:",filter_string);
        const query = `SELECT * FROM channel_whatsapp WHERE adminId = ? ${filter_string} limit 1`;
        sql.query(query, [adminId], (err, row) => {
            if (err) {
                console.log(err);
                reject(statusInfo);
            } else {
                if (row.length > 0) {
                    console.log("data",row);
                    statusInfo.status = true
                    statusInfo.data = row[0]
                    statusInfo.ack = 'data found'
                    resolve(statusInfo)
                } else {
                    statusInfo.ack = 'no data found'
                    reject(statusInfo);
                }
            }
        });
    });
}

// --------------------- END WhatsApp -------------------------- 

module.exports = {
    createChannel,
    createWPChannel,

    updateWPChannel,

    fetchChannels,
    getChannel,
    getWPChannelByPhoneNumber,
    getWPChannelByAdminId,

    deleteChannel,
    deleteWPChannel,
    getChannelByID,
    getWaCloudChannelByFilter
};
