const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const jwt = require('jsonwebtoken');

// Dotenv Config
dotenv.config({
    path: './.env'
});

app.use(cors());

// Connection URL
const url = process.env.DB;
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
/*
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

app.options('/stats/all', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});

app.options('/stats/total', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});

app.options('/account', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});
*/
app.get('/create/:id/:url', cors(), function(req, res) {
    
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
/*
app.post('/account/info', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post Created...',
                authData
            });
        }
    });
});

app.post('/account/login', (req, res) => {
    //Mock user
    const user = {
        id: 1,
        username: 'richard',
        email: 'brad@gmail.com'
    }

    jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({
            token
        });
    });
    
    jwt.sign()
});

//Format of Token
// Authorization: Bearer <acces_token>

//Verify Token
function verifyToken(req, res, next) {
    // Get Auth Header Value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
      //Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}
*/

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

let upTime = 0;
setInterval(function(){upTime++}, 1000);

app.get('/logs', function(req, res) {
    let minutes = upTime / 60;
    let minutesRounded = Math.floor(minutes);
    let hours = minutes / 60;
    let hoursRounded = Math.floor(hours);
    res.send("<h1>Logs</h1><h3>Uptime at page load: " + hoursRounded + " hours</h3>");
})