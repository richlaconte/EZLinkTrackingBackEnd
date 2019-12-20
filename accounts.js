const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
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

    let newAccount = {
      "email": newEmail,
      "password": newPassword,
      "links": []
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
        res.send(err.message);
      }
      client.close();
    });

  }
  else {
    res.send("Missing name or password.");
  }
})

// Associate a link to an account
// Give link account: account
// POST - body: name: name, password: password

// Check password before doing

router.post('/link/:id', (req, res) => {
  if (req.body.email && req.body.password) {

    let email = req.body.email;

    client.connect(function (err) {
      assert.equal(null, err);
      console.log("Connected to the server");

      const db = client.db(dbName);
      const accounts = db.collection('Accounts');
      const links = db.collection('track');

      try {
        accounts.find({ email: email }).toArray(function (err, docs) {
          // Check if ID already exists
          if (docs.length < 1) {
            res.status(409);
            return res.send("Account not found.");
          } else {
            links.updateOne(
              { "id": req.params.id },
              { $set: { account: req.body.email } }
            )
              .catch(err => console.log(err))

            // Update account to show link id in array
            // This is breaking things
            /*
            accounts.updateOne(
              { "email": email },
              { $push: { links: req.params.id } }
            )
              .catch(err => console.log(err))
              .then(() => {
                return res.send("Link " + req.params.id + " associated with account: " + req.body.email);
              })
              */
          }
        })
      } catch (err) {
        console.log(err.message);
        res.send(err.message);
      }
      client.close();
    });

  }
  else {
    res.send("Missing account name or password.");
  }
})

// Return all links associated with account
router.get('/links', (req, res) => {
  if (req.body.email && req.body.password) {

    let email = req.body.email;

    client.connect(function (err) {
      assert.equal(null, err);
      console.log("Connected to the server");

      const db = client.db(dbName);
      const accounts = db.collection('Accounts');
      const links = db.collection('track');

      try {
        links.find({ account: email }).toArray(function (err, docs) {
          // Check if ID already exists
          if (docs.length < 1) {
            res.status(409);
            return res.send("No links found.");
          } else {
            return res.send(docs);
          }
        })
      } catch (err) {
        console.log(err.message);
        res.send(err.message);
      }
      client.close();
    });

  }
  else {
    res.send("Missing account name or password.");
  }
})

// GET - Get Account
router.get('/', (req, res) => {
  res.send('Got Account: ' + req.params.id);
})

router.delete('/', (req, res) => {
  res.send('Deleted Account: ' + req.params.id)
})

/*
const schema = buildSchema(`
    type Account {
        id: ID!
        name: String!
        password: String!
    }
`);

class Account {
  constructor(id, { name, password }) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}

let fakeDatabase = {};

let root = {
  createAccount: ({ input }) => {
    let id = fakeDatabase.length;

    fakeDatabase[id] = input;
    return new Account(id, input);
  },
  getAccount: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no account found with id: " + id);
    }
    return new Account(id, fakeDatabase[id]);
  }
};

// GRAPHQL VERSION
router.use(
  "/",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);
*/
module.exports = router;
