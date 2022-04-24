//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const res = require('express/lib/response');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));




const session_key = process.env.SESSION_KEY;
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: session_key,
  cookie: { maxAge: oneDay },
  resave: false,
  saveUninitialized: false
}));




app.use(passport.initialize());
app.use(passport.session());

const mongoUrl =  process.env.MONGODB_URI;
mongoose.connect(mongoUrl, {useNewUrlParser: true});





const userSchema = new mongoose.Schema ({
  name:String,
  username: String,
  password: String
});

const productsSchema = new mongoose.Schema ({
  productUrl :String,
  productName: String,
  type: String
});




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

const Product = new mongoose.model("Product", productsSchema);




passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

    

function render(req,res,page){

  if(req.isAuthenticated()){
      User.find({"_id": req.user.id}, function(err, foundUsers){
          res.render(page, {isLoggedIn : true,username: foundUsers[0].name });
      });   
      }
      else{
        res.render(page,{isLoggedIn : false});
      }
}


function renderProducts(req,res,page,products){

  if(req.isAuthenticated()){
      User.find({"_id": req.user.id}, function(err, foundUsers){
          res.render(page,{isLoggedIn : true,username: foundUsers[0].name, availableProducts : products });
      });   
      }
      else{
        res.render(page,{isLoggedIn : false, availableProducts : products });
      }
}


app.get("/", function(req, res){
      render(req,res,"home");
    });


app.get("/products/apps", function(req, res){
 Product.find({"type": "APPS"}, function(err, foundProducts){
    if (err){
      console.log(err);
    } else {
      if (foundProducts) {
          renderProducts(req,res,"productListingPage",foundProducts);
      }
    }
  })});


app.get("/products/games", function(req, res){
    Product.find({"type": "GAME"}, function(err, foundProducts){
    if (err){
      console.log(err);
    } else {
      if (foundProducts) {
          renderProducts(req,res,"productListingPage",foundProducts);
      }
    }
  })
});


app.post("/signup/newUser", function(req, res){


  User.register({username: req.body.username}, req.body.password, function(err, user){
    User.updateOne({username: req.body.username}, {
    $set: {name : req.body.name}},
    function(err){
      if(err){
        console.log(err);
      }
      else{
      }
    }
    );   

    if (err) {
      console.log(err);
    res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  });
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  });

});









app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
