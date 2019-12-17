const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Dotenv Config
dotenv.config({
    path: './.env'
});

app.use(cors());
app.use(express.json());

// Connection URL
const url = process.env.DB;
// Database Name
const dbName = 'trackable';
// New MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});

app.get('/', function(req, res) {
    res.send("<h1>App Page</h1>");
})

// Create new link
app.post('/link', cors(), function(req, res) {
    // Looking for id: __ and redirect:__ in body of request
    if (req.body.id && req.body.redirect) {
        let newUrl = req.body.redirect.trim();
        let newID = req.body.id.trim();

        let newItem = {
            "id": newID,
            "redirect": newUrl,
            "clicks": []
        }

        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const collection = db.collection('track');

            try {
                collection.find({ id: newID }).toArray(function(err, docs) {
                    // Check if ID already exists
                    if (docs.length > 0) {
                        res.status(409);
                        return res.send("ID already exists. Please try a new one.");
                    } else {
                        collection.insertOne(newItem)
                        .then(res => console.log(`Successfully inserted item with _id: ${res.insertedId}`))
                        .catch(err => console.error(`Failed to insert item: ${err}`))
                        return res.send("created " + newID);
                    }
                })
            } catch(err) {
                console.log(err.message);
                res.send(err.message);
            } 
            client.close();
        });

    }
})

// Route used to access link
// Records click and redirects client
app.get('/link/:id/', cors(), function(req, res) {

    let id = req.params.id.trim();

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        const collection = db.collection('track');

        let today = new Date();
        // Added +1 to month to return 1-12 instead of 0-11
        let month = today.getMonth() + 1;
        let day = today.getDate();
        let hour = today.getHours();
        let min = today.getMinutes();
        let sec = today.getSeconds();

        let time = month +  "/" + day + " - " + hour + ":" + min + ":" + sec;

            
            collection.updateOne(
                { "id": id },
                { $push: { clicks: { dateTime: time } } }
            )
            .catch(err => console.log(err))
            
            
            collection.find({ id }).toArray(function(err, docs) { 
                try {
                    res.redirect("https://" + docs[0].redirect);
                }
                catch(err) {
                    console.log(err.message);
                    res.send(err.message)
                }  
            })
        client.close();
    })
})

// Return the array of clicks of a certain link
app.get('/stats/:id', cors(), function(req, res) {

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        let id = req.params.id.trim();

        const collection = db.collection('track');

        collection.find({ id }).toArray(function(err, docs) {
            if (err) {
                res.sendStatus(403);
            } else {
                console.log(docs[0]);
                res.send(docs[0].clicks);
            }
        })
        client.close();
    })
})

let upTime = 0;
setInterval(function(){upTime++}, 1000);

app.get('/logs', function(req, res) {
    let minutes = upTime / 60;
    let minutesRounded = Math.floor(minutes);
    let hours = minutes / 60;
    let hoursRounded = Math.floor(hours);
    res.send("<h1>Logs</h1><h3>Uptime at page load: " + minutes + " minutes</h3><h3>Uptime at page load: " + hours + " hours</h3>");
})