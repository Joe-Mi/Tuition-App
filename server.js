var express = require('express');
const cors  = require("cors");
var morgan = require('morgan');
let propertiesReader = require("properties-reader");
let path = require('path');

var app = express();
app.use(express.json());
app.use(cors());
app.set('json spaces, 3');

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
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

//code for connecting to the DB.
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

app.use((req, res, next) => {
    console.log("In comes a request to " + req.url)
    next();
});

app.get("/collections/products", function(req, res) {
    res.json(myProduct);
});

app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

app.listen(3000, function() {
    console.log("CRUD app listening on port 3000");
});