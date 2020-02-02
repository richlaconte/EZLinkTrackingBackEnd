const express = require("express");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const router = express.Router();

const geoip = require('geoip-lite');

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

// Add block to account
router.post('/', (req, res) => {
    if (req.body.email && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            accounts.find({ email: req.body.email }).toArray(function (err, docs) {
                if (docs.length > 0) {
                    if (docs[0].password === req.body.password) {
                        //res.send("Successfully connected to account: " + docs[0].email);
                        try {
                            accounts.updateOne(
                                { "email": req.body.email },
                                { $push: { blocks: req.body.blockString } }
                            )
                            res.send("Succesfully added block to account");
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
        })
    }
})

// Get blocks from account
router.get('/', (req, res) => {
    if (req.body.email && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            accounts.find({ email: req.body.email }).toArray(function (err, docs) {
                if (docs.length > 0) {
                    if (docs[0].password === req.body.password) {
                        res.send(docs[0].blocks);
                    } else {
                        res.send("Oops, wrong password");
                    }
                } else {
                    res.send("No accounts found with that email");
                }
            })
        })
    }
})

router.get('/test', (req, res) => {
    let ip = req.connection.remoteAddress;
    let geo = geoip.lookup(ip);

    res.send(geo);
})

// Get specific block from account
router.get('/:index', (req, res) => {
    if (req.body.email && req.body.password) {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const accounts = db.collection('Accounts');
            accounts.find({ email: req.body.email }).toArray(function (err, docs) {
                if (docs.length > 0) {
                    if (docs[0].password === req.body.password) {
                        if (docs[0].blocks[req.params.index]) {
                            res.send(docs[0].blocks[req.params.index]);
                        } else {
                            res.send("Couldn't find block at that index");
                        }
                    } else {
                        res.send("Oops, wrong password");
                    }
                } else {
                    res.send("No accounts found with that email");
                }
            })
        })
    }
})

module.exports = router;