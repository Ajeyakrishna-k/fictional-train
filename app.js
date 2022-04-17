//jshint esversion:6
// require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req, res){
  res.render("home");
});

app.get("/products", function(req, res){
  res.render("productListingPage");
});

app.get("/product", function(req, res){
  res.render("productDescriptionPage");
});



app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
