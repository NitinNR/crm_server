const chanelmodel = require("../models/integration.model.js");

exports.getAllChanels = (req, res) => {

    const data = req.body;
    console.log("integration body:",data);
    console.log("integration params:",req.params);
    res.status(500).send({
        message:"test chanel route"
    })
};

exports.adminSetup = (req, res) => {

    const data = req.body;
    console.log("integration body:",data);
    console.log("integration params:",req.params);
    res.status(500).send({
        message:"user setup route"
    })
};




