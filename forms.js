const express = require("express");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const router = express.Router();
const uuidv4 = require('uuid/v4');

dotenv.config({
    path: './.env'
});

// Connection URL
const url = process.env.DB;
// Database Name
const dbName = 'trackable';
// New MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true })

// EXPRESS VERSION
router.use((req, res, next) => {
    console.log(req.method + " to " + req.baseUrl + ".");
    next();
})

let createUnique = (forms) => {
    let unique = uuidv4();
    let isUnique = false;
    while (isUnique === false) {
        forms.find({ unique }).toArray((err, docs) => {
            if (docs.length === 0) {
                return unique;
            }
        })
    }
}

// Add block to account
router.post('/create', (req, res) => {
    if (req.body.form.html === "" || !req.body.form.html) {
        res.status(500).send("Missing form HTML");
    }
    if (!req.body.form.name === "" || !req.body.form.name) {
        res.status(500).send("Missing form name");
    }

    if (req.body.account && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            const forms = db.collection('Forms');

            let unique = uuidv4();

            forms.find({ unique }).toArray((err, docs) => {
                if (docs.length > 0) {
                    uuidv4();
                }
            })

            let form = {
                "name": req.body.form.name,
                "unique": unique.toString(),
                "account": req.body.account,
                "publicEndpoint": "",
                "submissions": [],
                "contacts": [],
                "endpoints": [],
                "filters": [],
                "thankYouPage": "",
                "origin": req.get('origin'),
                "html": req.body.form.html
            }

            accounts.find({ email: req.body.account }).toArray((err, docs) => {
                if (docs.length > 0) {
                    if (docs[0].password === req.body.password) {
                        for (form in docs[0].forms) {
                            if (form.name === req.body.form.name) {
                                res.send("Form with that name already exists on account");
                            }
                        }
                        try {
                            accounts.updateOne(
                                { "email": req.body.account },
                                { $push: { forms: { "name": req.body.form.name, "unique": unique } } }
                            )
                        } catch (err) {
                            console.log(err.message);
                            res.send(err.message);
                        }

                        //res.send("Succesfully added form to account");

                    } else {
                        res.send("Oops, wrong password");
                    }
                } else {
                    res.send("No accounts found with that email");
                }
            })
            try {
                forms.insertOne(form)
            } catch (err) {
                console.log(err.message);
                res.send(err.message);
            }
            res.send("Successfully created form");
        })
    }
})


module.exports = router;