const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const router = express.Router();

// EXPRESS VERSION
/*router.use((req, res, next) => {
    console.log(req.method + " to " + req.baseUrl + ".");
    next();
})

// POST - Create Account
router.post('/', (req, res) => {
    res.send('Created Account: ' + req.body.name);
})

// GET - Get Account
router.get('/:id', (req, res) => {
    res.send('Got Account: ' + req.params.id);
})

router.delete('/:id', (req, res) => {
    res.send('Deleted Account: ' + req.params.id)
})
*/

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
