const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const app = express();

app.use(cors());

// Connection URL
const url = 'mongodb+srv://testUser:test123@cluster0-tu18z.mongodb.net/test?retryWrites=true&w=majority';
// Database Name
const dbName = 'trackable';
// New MongoClient
const client = new MongoClient(url);


/*app.set('port', 3000);
app.listen(process.env.PORT || app.get('port'));*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

let newUrl;
let newID;

app.get('/', function(req, res) {
    res.send("<h1>App Page</h1>");
})

// Express
app.options('/create', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});

app.options('/link', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});

app.options('/stats', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});
app.get('/create/:id/:url', function(req, res) {
    
    if (req.params.url && req.params.id) {
        //res.send(req.params.url);
        newUrl = req.params.url;
        newID = req.params.id;
        newClicks = [];

        //Use connect method to connect to the server
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected to the server");

            const db = client.db(dbName);

            insertDocuments(db, function() {
                client.close();
            });
        });
        res.send("created " + req.params.id);
    }
    
    res.send("missing params or other issue");
    //res.redirect("https://" + newUrl);
    
})

app.get('/link/:id/', function(req, res) {

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        let id = req.params.id;

        const collection = db.collection('track');

        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();

        let time = h + ":" + m + ":" + s;

            collection.update(
                { id: id },
                { $push: { newClicks: { time: time } } }
            )
    
            if (collection.find({ id })) {
                collection.find({ id }).toArray(function(err, docs) {
                
                    if (docs[0].redirect === !null) {
                        res.redirect("https://" + docs[0].redirect);
                    }
                })
            }
        
        client.close();
    })
})

app.get('/stats/:id', function(req, res) {

    client.connect(function(err) {
        
        console.log("Connected to the server");

        const db = client.db(dbName);

        let id = req.params.id;

        const collection = db.collection('track');

        collection.find({ id }).toArray(function(err, docs) {
            
            res.send(docs);
        })



        client.close();

    })
})



const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('track');
    // Insert some documents
    
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();

    let time = h + ":" + m + ":" + s;

    myobj = {id: newID, time: time, redirect: newUrl, newClicks: newClicks};

    collection.insertOne(myobj, function(err, res) {
        if(err) throw err;
        console.log("1 document inserted");
    })
}