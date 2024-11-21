//declaring the dependancies and variables;
var express = require('express');
const cors  = require("cors");
var morgan = require('morgan');
let propertiesReader = require("properties-reader");
let path = require('path');

var app = express();
app.use(express.json());
app.use(cors());
app.set('json spaces', 3);

var staticPath = path.join(__dirname, "static");
app.use(express.static(staticPath));

//Configuring the conection 
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");

//URL-Encoding of User and PWD
//for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = `${dbPprefix}${dbUsername}:${dbPwd}${dbUrl}${dbParams}`;

//code for connecting to the DB.
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
// let db = client.db(dbName);
let db;

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      db = client.db(dbName);
      // Send a ping to confirm a successful connection
      await client.db(dbName).command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(err) {
      // Ensures that the client will close when you finish/error
      console.error("Failed to connect to MongoDB", err);
      await client.close();
    }
}

app.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
});

app.use((req, res, next) => {
    console.log("In comes a request to " + req.url)
    next();
});

app.get("/collections/products", function(req, res) {
    res.json();
});

app.get('/collections/:collectionName', async function(req, res, next) {
    try{
        const results = await req.collection.find({}).toArray();
        console.log("retrived: ", results);
        res.json(results)
    }
    catch(err){
        console.log("error fetching data: ", err.message);
        next(err);
    }
});

app.post('/collections/:collectionName', async function(req, res, next) {
    try{
        console.log("Recived request: ", req.body);
        const result = await req.collection.insertOne(req.body);
        console.log("Retrived data: ", result);
        res.json(result);
    }
    catch(err){
        console.log("error fetching data: ", err.message);
        next(err);
    }
});

app.delete('/collections/:collectionName', async function(req, res, next) {
    try{
        console.log("Recived request: ", req.params.id);
        const result = await req.collection.deleteOne( { _id: new ObjectId(req.params.id) } );
        console.log("deleted data: ", result);
        res.json(result);
    }
    catch(err){
        console.log("error fetching data: ", err.message);
        next(err);
    }
});

app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

app.listen(3000, function() {
    console.log("CRUD app listening on port 3000");
});

run();


