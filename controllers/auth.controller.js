const App = require("../models/app.model");
const config = require("../configs/auth.config");


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.SignUp = async (req, res) => {
    const name = req.body.fullName

    const email = req.body.email;
    const password = req.body.password;
    const confPassword = req.body.password;
    const companyName = req.body.companyName ? req.body.companyName : '';
    const chatbotNumber = req.body.chatbotNumber ? req.body.chatbotNumber : '';
    const website = req.body.website ? req.body.website : '';

    if (password != confPassword) return res.status(400).json({ ack: "Password and Confirm Password do not match" });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    // console.log("register", email, hashPassword)
    // const hashPassword = await bcrypt.hashSync(password, 8);
    try {
        await App.Register(name, email, hashPassword, companyName, chatbotNumber, website, (data) => {
            // console.log(data);
            if (data) {
                res.status(200).json(data);
            } else if (data == 0) {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred try again."
                })
            }
        })
    } catch (error) {
        // console.log(error);
    }
};

exports.SignIn = async (req, res) => {
    const { email, password } = req.body;

    let statusInfo = {
        status: false,
        ack: "Login Failed!",
        userInfo: {
            id: '',
            data: {},
            accessToken: '',
            refreshToken: '',
        }
    };

    App.findOne(`admins`, `email = '${email}'`, (data) => {
        // console.log("DATA", data.data[0]);


        // if(!data) {
        //     data.ack = "User Not found." ;
        //     return res.status(404).send({ data });}
        if (!data.data[0]?.email) {
            // console.log("USER NOT FOUND")
            statusInfo = { ...statusInfo, ack: "USER NOT FOUND" }
            return res.status(404).send(statusInfo);
        }
        // console.log("password",password,data.data[0].password);
        bcrypt.compare(
            password, data.data[0].password
        ).then((passwordIsValid) => {
            // console.log("passwordIsValid", passwordIsValid);
            if (!passwordIsValid) {
                statusInfo.ack = "Invalid Password!"
                statusInfo.accessToken = null,
                    statusInfo.userInfo.id = data.data[0].adminId
                // console.log("statusInfo", statusInfo)

                return res.status(200).send(statusInfo);
            } else if (passwordIsValid) {
                const { adminId, email } = data.data[0]
                var token = jwt.sign({ id: adminId, email }, config.secret, {
                    expiresIn: config.jwtExpiration
                });

                let refreshToken = jwt.sign({ id: data.data[0].adminId, email: data.data[0].email }, config.REFRESH_TOKEN_SECRET, {
                    expiresIn: config.jwtRefreshExpiration
                });

                let expiredAt = new Date() // .toISOString().slice(0, 19).replace('T', ' ');
                // console.log("Expirrr",new Date(expiredAt).getSeconds())
                expiredAt.setSeconds((expiredAt).getSeconds() + config.jwtRefreshExpiration)
                // console.log("SET SECS",expiredAt.setSeconds((expiredAt).getSeconds() + config.jwtRefreshExpiration) )
                // console.log("TIme expiredAt", expiredAt.getTime() )
                // console.log("Current TIme",new Date().getDate(),"expiredAt", expiredAt.getDate())

                // Date(expiredAt).setSeconds(
                //     Date(expiredAt).getSeconds() + config.jwtRefreshExpiration
                //   );

                // exit()
                App.update(`admins`, `refresh_token='${refreshToken}', expiryDate='${expiredAt.getTime()}'`, `adminId=${data.data[0].adminId}`, (data) => {
                    console.log("ACK:", data);
                });
                // console.log("data.data[0].adminId",data.data[0])

                statusInfo.status = true
                statusInfo.ack = "Login Successful!"
                statusInfo.data = {}
                statusInfo.accessToken = token
                statusInfo.refreshToken = refreshToken
                statusInfo.userInfo.id = adminId

                // statusInfo = {...statusInfo.userInfo, id: data.data[0].adminId, fullName: data.data[0].name,
                //     ...statusInfo.userInfo, role: data.data[0].role,
                //     ...statusInfo.userInfo, email: data.data[0].email,
                //     ...statusInfo.userInfo, companyName: data.data[0].companyName,
                //     }

                App.GetApp(adminId, (ack, data) => {
                    if (ack && data.length > 0) {
                        statusInfo.userInfo.space_id = parseInt(data[0].configs.AccountID, 10)
                        return res.status(200).send(statusInfo);

                    } else {
                        statusInfo.userInfo.space_id = 0
                        return res.status(200).send(statusInfo);

                    }
                })
            }

        })




        // res.cookie('refreshToken', refreshToken,{
        //     httpOnly: true,
        //     maxAge: 24 * 60 * 60 * 1000
        // });




    });
};

exports.SignOut = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(204);
    await App.findOne(`admins`, `refresh_token=${refreshToken}`, (data) => {
        if (!data.status) return res.status(204);
        const userId = data.data.adminId;
        App.update(`admins`, `refresh_token=${null}`, `adminId=${userId}`, (data) => {
        });
    });
    return res.status(200).clearCookie('refreshToken');
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, adminId } = req.body;
    var statusInfo = { status: false, data: {}, ack: '' }
    // console.log(req.body);
    // verify Password

    App.findOne(`admins`, `adminId=${adminId}`, (data) => {
        // console.log("change PASS data", data);
        const { password } = data.data[0]
        bcrypt.compare(oldPassword, password)
            .then(async (passwordIsValid) => {
                console.log("passwordIsValid", passwordIsValid);
                if (!passwordIsValid) {
                    statusInfo = data
                    statusInfo.status = false
                    statusInfo.ack = 'Invalid current password'
                    statusInfo.data = { adminId: data.data[0].adminId, email: data.data[0].email }
                    res.status(200).send(statusInfo)
                } else if (passwordIsValid) {

                    // check if new password is the same as old password
                    if (oldPassword === newPassword) {
                        statusInfo.status = false
                        statusInfo.ack = 'Old password used again, try new one'
                        statusInfo.data = { email: data.data[0].email, adminId: data.data[0].adminId }
                        res.status(200).send(statusInfo)
                        return
                    }


                    // update password in DB
                    const saltRounds = await bcrypt.genSalt();
                    bcrypt.hash(newPassword, saltRounds).then((hashPassword) => {
                        App.update(`admins`, `password='${hashPassword}'`, `adminId=${adminId}`, (data) => {
                            if (!data) {
                                statusInfo.ack = 'failed to update password'

                            }
                        })
                    })

                    // generate new token
                    // console.log("EMAIL", data.data);
                    const token = jwt.sign({ id: adminId, email: data.data.email }, config.secret, { expiresIn: config.jwtExpiration });

                    // console.log("statusInfo.data",statusInfo);
                    statusInfo.data.accessToken = token
                    statusInfo.status = true
                    statusInfo.ack = "password updated successfully"
                    res.status(200).send(statusInfo)
                }
            })
    })

};

exports.ApiKey = (req, res) => {
    // console.log("BODY",req.body)
    const adminId = req.body?.adminId || ''
    const whatsapp_number = req.body?.whatsapp_number || ''
    const email = req.body?.email || ''
    let statusInfo = {
        status: false,
        ack: "USER Not Found!",
        userInfo: {
            id: '',
            apkiKey: ''
        }
    };
    // console.log("adminId--",adminId)
    App.findOne(`admins`, `adminId = '${adminId}' OR email='${email}' OR chatbotNumber='${whatsapp_number}'`, (data) => {
        if (!data.data[0]?.email) {
            console.log("USER NOT FOUND")
            // statusInfo= {...statusInfo, ack: "USER NOT FOUND" }
            return res.status(404).send(statusInfo);
        }
        if (!data.data[0]?.apkiKey) {
            var token = jwt.sign({ id: data.data[0].adminId, email: data.data[0].email }, config.secret, {
                expiresIn: config.jwtApiKeyExpiration
            });
            App.update(`admins`, `apiKey='${token}'`, `adminId=${data.data[0].adminId}`, (data) => {
                console.log("ACK:", data);
            });
            statusInfo.ack = "USER FOUND"
            statusInfo.status = true
            statusInfo.userInfo.id = data.data[0].adminId
            statusInfo.userInfo.apkiKey = token
            return res.status(200).send(statusInfo);
        }
        statusInfo.ack = "USER FOUND"
        statusInfo.status = true
        statusInfo.userInfo.id = data.data[0].adminId
        statusInfo.userInfo.apkiKey = data.data[0].apkiKey
        return res.status(200).send(statusInfo);
    })
};

exports.refreshToken = async (req, res) => {
    const requestToken = req.body.refreshToken;
    // console.log("refreshToken",requestToken)
    if (requestToken == null) {
        return res.status(403).json({ status: false, ack: "Refresh Token is required!" });
    }
    try {
        await App.findOne(`admins`, `refresh_token='${requestToken}'`, (refreshToken) => {
            console.log("Refresh Token Data generated from refreshToken in auth.controller", refreshToken);

            if (!refreshToken.status) {
                return res.status(403).json({ status: false, ack: "Refresh token is not in database!" });
            }

            const expiryDate = refreshToken.data[0].expiryDate < new Date().getTime();
            console.log("Expired Date", expiryDate);
            if (expiryDate) {
                App.update(`admins`, `expiryDate=null`, `adminId=${refreshToken.data[0].adminId}`, (data) => {
                    console.log("Expiry Date Deleted of Admin", refreshToken.data[0].adminId);
                })
                return res.status(403).json({
                    status: false, ack: "Refresh token was expired. Please make a new signin request",
                });
            }

            let newAccessToken = jwt.sign({ id: refreshToken.data[0].adminId }, config.secret, {
                expiresIn: config.jwtExpiration,
            });
            return res.status(200).json({
                status: true,
                ack: "new access Token generated",
                accessToken: newAccessToken,
                refreshToken: refreshToken.data[0].refresh_token,
            });


        });

    } catch (err) {
        return res.status(500).send({ status: false, ack: err });
    }
};


// PREVIOUS CODE ----------

exports.refreshTokenOLD = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log("req.cookies", req);
        if (!refreshToken) return res.status(401);
        await App.findOne(`admins`, `refresh_token='${refreshToken}'`, (data) => {
            if (!data.status) return res.status(403).json({ message: "Refresh token is not in database!" });;
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) return res.sendStatus(403);
                const adminId = data.data.adminId;
                const accessToken = jwt.sign({ adminId }, config.ACCESS_TOKEN_SECRET, {
                    expiresIn: '15s'
                });
                data.accessToken = accessToken
                res.json({ data });
            });
        });
        // if(!user[0]) return res.sendStatus(403);

    } catch (error) {
        console.log(error);
    }
}

exports.RefreshToken2 = async (req, res) => {
    try {
        let expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
        let _token = uuidv4();
        await App.update(`admins`, `expiryDate=${expiredAt.getTime()} AND refresh_token=${_token} `, `adminId=${req.adminId}`, (data) => {
            return _token;
        })

        console.log("req.cookies", req);
        if (!refreshToken) return res.status(401);
        await App.findOne(`admins`, `refresh_token='${refreshToken}'`, (data) => {
            if (!data.status) return res.status(403);
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) return res.sendStatus(403);
                const adminId = data.data.adminId;
                const accessToken = jwt.sign({ adminId }, config.ACCESS_TOKEN_SECRET, {
                    expiresIn: '15s'
                });
                data.accessToken = accessToken
                res.json({ data });
            });
        });
        // if(!user[0]) return res.sendStatus(403);

    } catch (error) {
        console.log(error);
    }
};



// https://mfikri.com/en/blog/react-express-mysql-authentication

// https://www.bezkoder.com/node-js-jwt-authentication-mysql/


// https://www.bezkoder.com/react-jwt-auth/
// https://www.bezkoder.com/react-hooks-jwt-auth/


// https://www.bezkoder.com/react-hooks-jwt-auth/
// https://www.bezkoder.com/react-refresh-token/ - ADV