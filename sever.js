const express = require('express')
var mysql = require('mysql');
const cors = require("cors");
const app = express()
var bodyParser = require('body-parser')

"use strict";

//variables
var accountType;

// locate static css pages
app.use(express.static("css"))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs')

// create mysql connection
var con = mysql.createConnection({
    host: "107.180.1.16",
    user: "sprog20223",
    password: "sprog20223",
    database: 'sprog20223'
});

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("connected to db.");
// });

// load login page
app.get("/", function(req, res) {
    console.log("login page loaded.")
    res.render('Login_Page')
})

//load account type page
app.get("/account_type", function(req, res) {
    console.log("account type page loaded.")
    res.render('Account_Type')
})

//post account type to create_account
app.post("/account_type", function(req, res) {
    //account type is stored for use in sql query
    accountType = req.body.account_type
    console.log("create account page loaded.")
    console.log("account type:", accountType)
    res.render('Create_Account')
})

//post create account to db (then reload login)
app.post("/create_account", function(req, res) {
    let email = req.body.email
    let password = req.body.password
    let fName = req.body.firstName
    let lName = req.body.lastName

    // add code to query db to create user

    console.log("new account:")
    console.log(`email: ${email}`)
    console.log(`name: ${fName} ${lName}`)
    res.redirect('/')
})

//post to login
app.post("/login", function(req, res) {
    
    let email = req.body.email
    let password = req.body.password
    accountType = 'mentor'

    //set user type of user logging in
    if (accountType == 'mentor')
        res.redirect('/Mentor_Page')
    else
        res.redirect('/Mentee_Page')
})

//get mentor page
app.get("/mentor_page", function(req, res) {
    console.log("mentor page loaded.")
    res.render('Mentor_Page')
})

//get update mentor page
app.get("/update_mentor", function(req, res) {
    console.log("update mentor page loaded.")
    res.render("Update_Mentor_Profile")
})





app.use(cors());
app.use(express.json());


app.listen(3000)