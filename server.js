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

async function createIndexes(db) { 
    try { 
        await db.collection("Lessons").createIndex({  
            subject: "text", 
            location: "text",
            price: "text"
        }); 
        console.log("Indexes created successfully"); 
    } catch (err) { 
        console.error("Error creating indexes: ", err.message);
    }
}

async function run() {
    try {
      // Connect the client to the server
      await client.connect();
      db = client.db(dbName);
      await createIndexes(db);
      // Send a ping to confirm a successful connection
      await client.db(dbName).command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(err) {
      // Ensures that the client will close when you finish/error
      console.error("Failed to connect to MongoDB", err);
      await client.close();
    }
}
//Seting up the url parameter collection, 
//allowing for easier access of collections within the database.
app.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
});

// A simpke logging method, to see all the request made to the back-end. 
app.use((req, res, next) => {
    console.log("In comes a request to " + req.url)
    next();
});

// A GET method to return all the Objects with a Collection.
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

//A GET method used to search and retrieve an array of objects from a collection.
app.get('/collections/:collectionName/:search', async function(req, res, next) {
    try{
        const searchTerm = req.params.search
        const query = { $text: { $search: searchTerm } };
        const results = await req.collection.find(query).toArray();
        console.log("retrived: ", results);
        res.json(results)
    }
    catch(err){
        console.log("error fetching data: ", err.message);
        next(err);
    }
});

// A POST method used to insert objects into a collection.
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

//A PUT method used to update specified objects in a colletion.
app.put('/collections/:collectionName/:id', async function(req, res, next) {
    try{
        console.log("Recived request: ", req.params.id);
        const result = await req.collection.updateOne(
            {_id: new ObjectId(req.params.id)},
            {$set: {"spaces": req.body.spaces}}, 
            {safe: true, multi: false}
        );
        if (result.matchedCount === 1) { 
            res.json({ msg: "success" }); 
        } else {
            res.json({ msg: "error" }); 
        }

        console.log("updated data: ", result);
    }
    catch(err){
        console.log("error fetching data: ", err.message);
        next(err);
    }
});

//This logs any errors when trying to access resources that dont exsist.
app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

//initialise the appliction from the port: 3000.
app.listen(3000, function() {
    console.log("CRUD app listening on port 3000");
});

//Connects to mongoDB, accessing the Database and it's colletions.
run();

