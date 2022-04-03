if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const passport = require('passport')
var mysql = require('mysql');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

var connection = mysql.createPool({
  host: "107.180.1.16",
  user: "sprog20223",
  password: "sprog20223",
  database: 'sprog20223'
});

module.exports = connection;

const initializePassport = require('./passport-config.js')

initializePassport(passport)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static("css"))
app.use(express.urlencoded({ extended: true }))




// Will need to add functionaility to handle if mentor or mentee redirect to respetive page
app.get('/', checkAuthenticated, (req, res) => {
  // res.render('Mentor_Page.ejs', { name: req.user.Fname }) // for mentor commented out for now to test mentee
  res.render('Mentee_Page.ejs') // for mentor
})

/* Create_Account */
app.get('/Create_Account', checkNotAuthenticated, (req, res) => {
  res.render('Create_Account.ejs')
})

app.post('/Create_Account', checkNotAuthenticated, async (req, res) => {
  try {
    console.log("req.body", req.body)
    // Comment out for now to hard code 'n' for a few inputs due to Create_Account issues
    // connection.query(`INSERT INTO M_Mentor (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', '${req.body.State}', '${req.body.Password}', '${req.body.Position}', '${req.body.Bio}')`, function(err, rows) {
      // console.log('query: ',`INSERT INTO M_Mentee (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n')`);
    if (req.body.account_type === 'mentor') {      
      connection.query(`INSERT INTO M_Mentor (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n')`, function(err, rows) {
      console.log(rows)
    })
    }  else {
      connection.query(`INSERT INTO M_Mentee (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n')`, function(err, rows) {
        console.log(rows)
      })
    } 
    res.redirect('/Login_Page')
  } catch {
    res.redirect('/Create_Account')
  }
})

/* Login */
app.get('/Login_Page', checkNotAuthenticated, (req, res) => {
  res.render('Login_Page.ejs')
})

app.post('/Login_Page', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',  
  failureRedirect: '/Login_Page',
  failureFlash: true
}))

/* Logout */
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/Login_Page')
})

// GET UPDATE MENTOR PAGE
app.get("/update_mentor", function(req, res) {
  console.log("update mentor page loaded.")
  res.render("Update_Mentor_Profile.ejs")
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
  res.render('mentee_page.ejs')

  // add code to query db for logged in mentee
  // add code to fill page variables with query result
})

// GET UPDATE MENTEE PAGE
app.get("/update_mentee", function(req, res) {
  console.log("update mentee page loaded.")
  res.render("Update_Mentee_Profile.ejs")

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
  res.render('find_mentors.ejs')

  // add code to query db for all mentors
  // add code to populate page variables with query results
  // add code to filter results
})



/* Dunno */
// Possiblly, 'req.isAuthenticated()' is '(user, done) => done(null, user.MentorID)'
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/Login_Page')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

console.log("Listening on Port 8080");
app.listen(8080)