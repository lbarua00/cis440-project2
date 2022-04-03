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

// GET LOGIN PAGE
app.get("/", function(req, res) {
    console.log("login page loaded.")
    res.render('Login_Page')
})

// POST LOGIN
app.post("/login", function(req, res) {
    
    let email = req.body.email
    let password = req.body.password
    accountType = 'mentee' // hardcoded for now.

    // add login code here

    // redirect to home page based on account type
    if (accountType == 'mentor')
        res.redirect('/mentor_page')
    else
        res.redirect('/Mentee_Page')
})

// GET ACCOUNT TYPE PAGE
app.get("/account_type", function(req, res) {
    console.log("account type page loaded.")
    res.render('Account_Type')
})

// POST ACCOUNT TYPE
app.post("/account_type", function(req, res) {
    //account type is stored for use in sql query
    accountType = req.body.account_type

    // send user to create account page
    res.redirect('Create_Account')
})

// GET CREATE ACCOUNT PAGE
app.get("/create_account", function(req, res) {
    console.log("create account page loaded.")
    console.log("account type:", accountType)

    res.render('create_account')
})

// POST CREATE ACCOUNT
app.post("/create_account", function(req, res) {
    let email = req.body.email
    let password = req.body.password
    let fName = req.body.firstName
    let lName = req.body.lastName

    // add code to query db to create user

    console.log("new account:")
    console.log(`email: ${email}`)
    console.log(`name: ${fName} ${lName}`)
    // redirect to login page
    res.redirect('/')
})

// GET MENTOR PAGE
app.get("/mentor_page", function(req, res) {
    console.log("mentor page loaded.")
    res.render('Mentor_Page')

    // add code to query db for logged in mentor
    // add code to fill page variables with query result
})

// GET UPDATE MENTOR PAGE
app.get("/update_mentor", function(req, res) {
    console.log("update mentor page loaded.")
    res.render("update_mentor_profile")

    // add code to query db for logged in mentor
    // add code to populate input boxes with current info
})

// POST UPDATE MENTOR
app.post("/update_mentor", function(req, res) {
    console.log("mentor profile updated.")

    // add code to query db and save new input data

    // redirect back to mentor home page
    res.redirect('/mentor_page')
})

// GET MENTEE PAGE
app.get("/mentee_page", function(req, res) {
    console.log("mentee page loaded.")
    res.render('mentee_page')

    // add code to query db for logged in mentee
    // add code to fill page variables with query result
})

// GET UPDATE MENTEE PAGE
app.get("/update_mentee", function(req, res) {
    console.log("update mentee page loaded.")
    res.render("update_mentee_profile")

    // add code to query db for logged in mentee
    // add code to populate input boxes with current info
})

// POST UPDATE MENTEE
app.post("/update_mentee", function(req, res) {
    console.log("mentee profile updated.")

    // add code to query db and save new input data

    // redirect back to mentee home page
    res.redirect('/mentee_page')
})

// GET FIND MENTORS PAGE
app.get("/find_mentors", function(req, res) {
    console.log("find mentors page loaded.")
    res.render('find_mentors')

    // add code to query db for all mentors
    // add code to populate page variables with query results
    // add code to filter results
})

app.use(cors());
app.use(express.json());


app.listen(3000)