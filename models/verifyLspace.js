const verifyLspace = (space_id, user_token, dbconnection, callback) => {

    response_obj = { ack: false, data: "something went wrong Try again later" };

    const verify_query = `select access_tokens.token 
    from accounts left join access_tokens on access_tokens.owner_type = 'User' and 
    access_tokens.owner_id = accounts.id
    where accounts.id = $1`;

    dbconnection.query(verify_query, [space_id], async (err, res) => {
        // if (err) return callback(false, [])
        if (res.rows.length === 0) {
            response_obj.data = "No such user exist"
        }
        // return callback(false, "No such user exist")
        else {
            const { token } = res.rows[0]
            if (token === user_token) {
                // return callback(true, [])
                response_obj.data = []
            } else {
                // return callback(false, "Wrong credentials provided")
                response_obj.data = "Wrong credentials provided"
            }
        }

        if (!response_obj.ack) {

            inDepthSeach(space_id, user_token, dbconnection, (ack, data) => {
                console.log(ack, data);
                if (!ack) return callback(false, data)
                else return callback(true, data)
            })
        } else {
            return callback(true, response_obj.data)
        }
    })

}

const inDepthSeach = (space_id, user_token, dbconnection, callback2) => {

    const verify_query2 = `SELECT account_users.user_id,access_tokens.token
    FROM account_users left join access_tokens on account_users.user_id = access_tokens.owner_id
    WHERE account_users.account_id = $1 and account_users.role = '1'`;

    dbconnection.query(verify_query2, [space_id], async (err, res) => {

        if (err) return callback2(false, [])
        else {
            const statusobj = { ack: false, data: "" }
            const tokendata = res.rows;
            const total = tokendata.length;
            let count = 0;
            tokendata.forEach(item => {
                
                if (item.token === user_token) {
                    statusobj.ack = true
                    statusobj.data = "Done"
                    return false
                } else {
                    statusobj.data = "No users found"
                }
                count += 1;
            });
            if (count === total) return callback2(statusobj.ack, statusobj.data)
        }


    })
}

module.exports = verifyLspace