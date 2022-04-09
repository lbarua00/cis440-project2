if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const bodyParser = require('body-parser')
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
  let IsMentor = req.user.IsMentor
  console.log('Check Mentor Type ',IsMentor);
  if (IsMentor === 0) {
    res.render('Mentor_Page.ejs', { name: req.user.Fname }) // for mentor commented out for now to test mentee
  } else {
    res.render('Mentee_Page.ejs', { name: req.user.Fname }) // for mentor commented out for now to test mentee
  }
  // res.render('Mentee_Page.ejs') // for mentor
})

/* Create_Account */
app.get('/Create_Account', checkNotAuthenticated, (req, res) => {
  res.render('Create_Account.ejs')
})

app.post('/Create_Account', checkNotAuthenticated, async (req, res) => {
  try {
    let makedID = generateId()
    console.log(makedID);
    console.log("req.body", req.body)
    // Comment out for now to hard code 'n' for a few inputs due to Create_Account issues
    // connection.query(`INSERT INTO M_Mentor (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', '${req.body.State}', '${req.body.Password}', '${req.body.Position}', '${req.body.Bio}')`, function(err, rows) {
      // console.log('query: ',`INSERT INTO M_Mentee (Fname, Lname, Email, State, Password, Position, Bio) VALUES ('${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n')`);
    if (req.body.account_type === 'mentor') {      
      connection.query(`INSERT INTO M_Mentor (MentorID, Fname, Lname, Email, State, Password, Position, Bio, IsMentor) VALUES (${makedID},'${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n', 0)`, function(err, rows) {
        console.log(rows)
    })
    }  else {
      connection.query(`INSERT INTO M_Mentee (MenteeID, Fname, Lname, Email, State, Password, Position, Bio, IsMentor) VALUES (${makedID},'${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n', 1)`, 
      function(err, rows) {
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
  let user = req.session.passport.user
  let newlocation   = req.body.location;
  let newyears      = req.body.yearsOfExperience
  let newbio        = req.body.bio
  
  let skill1  = Boolean(req.body.skill1);
  let skill2  = Boolean(req.body.skill2);
  let skill3  = Boolean(req.body.skill3);
  let skill4  = Boolean(req.body.skill4);
  let skill5  = Boolean(req.body.skill5);
  let skill6  = Boolean(req.body.skill6);

  const skills  = ['SQL','Python','Tableau','JavaScript','HTML','CSS']
  const skillsChecked = [skill1, skill2, skill3, skill4, skill5, skill6]

  console.log(`${user}, ${newyears}, ${newlocation}, ${newbio}, ${skillsChecked}`)

  // NEED TO ADD IF CHECK BASED ON IF USER IS MENTOR. USE req.user.IsMentor 
  // 0 MEANS MENTOR
  // 1 MEANS MENTEE

  connection.query(`UPDATE M_Mentor 
                      SET State = '${newlocation}', Bio = '${newbio}'
                        WHERE MentorId = ${user}`, function(err, rows) {
                          console.log(rows)
                        })

                       

  for (let i = 0; i<skills.length; i++) {
    if (skillsChecked[i] === 'true') {
      console.log(skills[i])
      connection.query(`INSERT INTO M_HaveSkill
                        VALUES ${user}, '${skills[i]}'`, function(err, rows) {
                          console.log(rows)
                        })
    }
  }
  // redirect back to mentor home page
  res.redirect('/')
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
  let user = req.session.passport.user
  let newlocation   = req.body.location;
  let newyears      = req.body.yearsOfExperience
  let newbio        = req.body.Bio
  let skill1  = Boolean(req.body.skill1);
  let skill2  = Boolean(req.body.skill2);
  let skill3  = Boolean(req.body.skill3);
  let skill4  = Boolean(req.body.skill4);
  let skill5  = Boolean(req.body.skill5);
  let skill6  = Boolean(req.body.skill6);

  const skills  = ['SQL','Python','Tableau','JavaScript','HTML','CSS']
  const skillsChecked = [skill1, skill2, skill3, skill4, skill5, skill6]

  console.log(`${user}, ${newyears}, ${newbio}, ${skillsChecked}`)

  connection.query(`UPDATE M_Mentee 
                      SET State = ${newlocation}, Bio = ${newbio}
                        WHERE MenteeId = ${user}`)

  for (let i = 0; i<skills.length; i++) {
    if (skillsChecked[i] = 'on') {
      connection.query(`INSERT INTO M_Desired_Skill
                        VALUES ${user}, ${skills[i]}`)
    }
  }

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

function generateId() {
  let d = new Date().getTime().toString().substring(6,15);
  return parseInt(d)
}

console.log("Listening on Port 8080");
app.listen(8080)