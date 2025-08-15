const User = require("../models/auth.model");

exports.signup = (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    const userData = new User({
        fullname: req.body.fullname, 
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        course: req.body.course,
        isBlocked: false
    });    

    User.create(userData, (err, data) => {
        if (err) {
            if (err.kind === "duplicate_email") {
                return res.status(409).send({ message: err.message });
            }
            if (err.kind === "duplicate_phone") {
                return res.status(409).send({ message: err.message });
            }
            return res.status(500).send({ 
                message: err.message || "An error occurred while creating the User."
            });
        }
        
        res.status(201).send(data);
    });
};