const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()

app.use(bodyParser.json());
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppwsz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const productsCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLL}`);
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection('orders');

  app.post('/addProduct', (req, res) => {
    const products= req.body
    productsCollection.insertOne(products)
    .then(result => {
      console.log(result.insertedCount)
      res.send(result.insertedCount)
    })
  })

  app.get('/products', (req, res)=>{
    const search = req.query.search
    productsCollection.find({name: {$regex: search}})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/product/:key', (req, res)=>{
    productsCollection.find({key: req.params.key})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
  })

  app.post('/productByKeys', (req, res)=>{
    const productKeys = req.body;
    productsCollection.find({key: {$in: productKeys}})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.post('/addOrder', (req, res) => {
    const order= req.body
    ordersCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)