
const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config.js");
const App = require("../models/app.model");


const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
      return res.status(401).send({ status: false, ack: "Unauthorized! Access Token was expired!" });
    }
    return res.sendStatus(401).send({ status: false, ack: "Unauthorized!" });
  };

const verifyToken = (req, res, next) =>{
    // console.log("req.headers",req.headers)
    let token = req.headers?.["x-access-token"] || req.headers?.["api-key"]
    // console.log("token",token)
    if (!token){
        return res.status(403).send({
          status: false, ack: "No token provided!"
            });      
    }
    jwt.verify(token, config.secret, (err, decoded) =>{
        if (err){
            return res.status(401).send({
              status: false, ack: "Unauthorized!"
              });        
        }
        req.adminId = decoded.id;
        // console.log("req.userId",req.adminId);
        next();
    })
};




const verifyToken1 = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};


const authJwt = {
    verifyToken: verifyToken
};

module.exports = authJwt;
