const express = require("express");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const cors = require('cors');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config({
  path: './.env'
});

// Connection URL
const url = process.env.DB;
// Database Name
const dbName = 'trackable';
// New MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

// EXPRESS VERSION
router.use((req, res, next) => {
  console.log(req.method + " to " + req.baseUrl + ".");
  next();
})

// POST - Create Account
router.post('/', (req, res) => {
  if (req.body.email && req.body.password) {
    let newEmail = req.body.email;
    let newPassword = req.body.password;

    let today = new Date();
    // Added +1 to month to return 1-12 instead of 0-11
    let month = today.getMonth() + 1;
    let day = today.getDate();

    let newAccount = {
      "email": newEmail,
      "password": newPassword,
      "links": [],
      "contacts": [],
      "forms": [],
      "blocks": [],
      "createdMonth": month,
      "createdDay": day
    }

    client.connect(function (err) {
      assert.equal(null, err);
      console.log("Connected to the server");

      const db = client.db(dbName);
      const collection = db.collection('Accounts');

      try {
        collection.find({ email: newEmail }).toArray(function (err, docs) {
          // Check if ID already exists
          if (docs.length > 0) {
            res.status(409);
            return res.send("Account with that email already exists.");
          } else {
            collection.insertOne(newAccount)
              .then(res => console.log(`Successfully inserted item with _id: ${res.insertedId}`))
              .catch(err => console.error(`Failed to insert item: ${err}`))
            return res.send("Created: " + newEmail);
          }
        })
      } catch (err) {
        console.log(err.message);
        res.status(409);
        res.send(err.message);
      }
    });

  }
  else {
    res.status(409);
    res.send("Missing name or password.");
  }
})

// Log in 
router.post('/login', (req, res) => {
  if (req.body.email && req.body.password) {

    client.connect(function (err) {
      assert.equal(null, err);
      console.log("Connected to the server");

      const db = client.db(dbName);
      const collection = db.collection('Accounts');

      try {
        collection.find({ email: req.body.email }).toArray(function (err, docs) {
          // Check if ID already exists
          if (docs.length > 0) {
            if (docs[0].password === req.body.password) {
              res.status(200).send(docs[0]);
            } else {
              res.status(409).send("Incorrect password");
            }
          } else {
            res.status(409).send("Can't find account with that email");
          }
        })
      } catch (err) {
        console.log(err.message);
        res.status(409).send(err.message);
      }
    });

  }
  else {
    res.status(500).send("Missing name or password.");
  }
})

module.exports = router;