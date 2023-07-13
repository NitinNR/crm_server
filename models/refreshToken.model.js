const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");
const mysql = require('mysql');
const sql = require('./db.model');

const refreshToken = function(app){
    this.username = app.username
}

refreshToken.RefreshToken = async(user) => {

    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
    let _token = uuidv4();
    await App.update(`admins`, `expiryDate=${expiredAt.getTime()} AND refresh_token=${_token} `,`adminId=${req.adminId}`,(data)=>{
        return _token;
    })
};

refreshToken.RefreshToken = (token) => {
    console.log("token inside refreshTOken Model", token);
    return token.expiryDate.getTime() < new Date().getTime();

};

module.exports = refreshToken;