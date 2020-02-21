const express = require("express");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const router = express.Router();

const axios = require('axios');

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

let template = `let test = (req) => { let object = {url: "https://enic23h1g656j.x.pipedream.net/", body: {"test1": "1", "test2": "2"}};return object;} test();`

router.post('/create/', (req, res) => {
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected to the server");

        const db = client.db(dbName);
        const endpoints = db.collection("Endpoints");

        let endpoint = {
            "url": req.body.url,
            "function": req.body.function
        }


        try {
            endpoints.insertOne(endpoint)
        } catch (err) {
            console.log(err.message);
            res.send(err.message);
        }
        res.send("Successfully created endpoint.");
})
})

router.post('/consume/:url', (req, res) => {
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected to the server");

    // object.body should be an object like this:
    //{
    //  "item": "value",
    //  "item": "value"
    //}

    let theFunction = "let req = " + JSON.stringify(req.body.data) + ";";

    const db = client.db(dbName);
    const endpoints = db.collection("Endpoints");

    endpoints.find({ url: req.params.url }).toArray((err, docs) => {
        console.log(docs);
        if (docs.length > 0) {
            let test = docs[0].function;
            console.log(test);
            theFunction += "" + test;
            console.log(theFunction);
            let object = eval(theFunction);

            axios.post(object.url, object.body)
            .then(function (response) {
                console.log(response);
                if (response.status === 200) {
                    console.log(response.data);
                    return true;
                } else {
                    console.log(response);
                    return false;
                }
            })
            .catch(function (error) {
                console.log(error);
                return false;
            });
    

        } else {
            res.send("No endpoints found with that url");
        }
    })
    res.send("done");
})
})

module.exports = router;