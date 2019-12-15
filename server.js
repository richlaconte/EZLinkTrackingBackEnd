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
    //res.send("ID is: " + req.body.id);
    // Looking for id: __ and redirect:__
    
    if (req.body.id && req.body.redirect) {
        let newUrl = req.body.redirect;
        let newID = req.body.id;

        let newItem = {
            "id": newID,
            "redirect": newUrl,
            "newClicks": []
        }

        //Use connect method to connect to the server
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);
            const collection = db.collection('track');

            collection.insertOne(newItem)
                .then(res => console.log(`Successfully inserted item with _id: ${res.insertedId}`))
                .catch(err => console.error(`Failed to insert item: ${err}`))
        });
        return res.send("created " + newID);
    }
    
    res.send("missing params or other issue");
})

app.get('/link/:id/', cors(), function(req, res) {

    let id = req.params.id;

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        const collection = db.collection('track');

        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();

        let time = h + ":" + m + ":" + s;

            try {
                collection.update(
                    { "id": id },
                    { $push: { newClicks: { time: time } } }
                )
                .catch(err => console.log(err))
            }
            catch(err) {
                console.log(err.message);
                res.send(err.message)
            }
            
    
            
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

app.get('/stats/all/:id', cors(), function(req, res) {

    let id = req.params.id;

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        const collection = db.collection('track');

        try {
            collection.find({ id }).toArray(function(err, docs) {
            
                res.send(docs);
            })
        } catch (err) {
            res.send(err);
        }
        



        client.close();

    })
})

app.get('/stats/total/:id', cors(), function(req, res) {

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        let id = req.params.id;

        const collection = db.collection('track');

        collection.find({ id }).toArray(function(err, docs) {
            if (err) {
                res.sendStatus(403);
            } else {
                try {
                    //res.send(docs.id);
                    docs.find({ newClicks }).toArray(function(err, docs2) {
            
                        res.send(docs2);
                    })
                }
                catch(error){
                    res.send(error);
                }
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
    res.send("<h1>Logs</h1><h3>Uptime at page load: " + hoursRounded + " hours</h3>");
})