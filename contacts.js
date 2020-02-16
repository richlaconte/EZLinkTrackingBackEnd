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

// Add contact to account
router.post('/create', (req, res) => {
    let contact = req.body.contact;
    let name = "";
    let lastName = "";
    let phone = "";
    let custom = "";
    let forms = "";
    if (contact.name) { name = contact.name }
    if (contact.lastName) { lastName = contact.lastName }
    if (contact.phone) { phone = contact.phone }
    if (contact.custom) { custom = contact.custom }
    if (contact.forms) { forms = contact.forms }

    if (contact.email === "" || !contact.email) {
        res.status(500).send("Missing email");
    }

    if (req.body.account && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            const contacts = db.collection("Contacts");

            let unique = uuidv4();

            contacts.find({ unique }).toArray((err, docs) => {
                if (docs.length > 0) {
                    uuidv4();
                }
            })

            let contact = {
                "unique": unique.toString(),
                "name": name,
                "lastName": lastName,
                "email": req.body.contact.email,
                "account": req.body.account,
                "phone": phone,
                "custom": custom,
                "notes": [],
                "forms": forms,
                "events": []
            }

            accounts.find({ email: req.body.account }).toArray((err, docs) => {
                if (docs.length > 0) {
                    if (docs[0].password === req.body.password) {
                        for (contact in docs[0].contacts) {
                            if (contact.email === contact.email) {
                                res.status(409).send("Contact with that email already exists on account");
                                break;
                            }
                        }
                        try {
                            accounts.updateOne(
                                { "email": req.body.account },
                                { $push: { contacts: { "unique": unique, "email": contact.email } } }
                            )
                        } catch (err) {
                            console.log(err.message);
                            res.send(err.message);
                        }
                    } else {
                        res.send("Oops, wrong password");
                    }
                } else {
                    res.send("No accounts found with that email");
                }
            })
            try {
                contacts.insertOne(contact)
            } catch (err) {
                console.log(err.message);
                res.send(err.message);
            }
            res.send("Successfully created contact");
        })
    } else {
        res.status(500).send("Missing account or password");
    }
})

// Get all contacts on account
router.get("/", (req, res) => {
    if (req.body.account && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            const contacts = db.collection("Contacts");

            let contactArray = [];

            accounts.find({ email: req.body.account }).toArray((err, docs) => {
                if (docs.length > 0) {
                    if (docs[0].password !== req.body.password) {
                        res.send("Oops, wrong password");
                    }
                } else {
                    res.send("No accounts found with that email");
                }
            })

            contacts.find({ account: req.body.account }).toArray((err, docs) => {
                for (let i = 0; i < docs.length; i++) {
                    contactArray.push(docs[i]);
                }

                res.send(contactArray);
            })
        })
    } else {
        res.status(500).send("Missing account or password");
    }
})


module.exports = router;