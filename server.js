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



/* 
IGNORE FOR NOW
SET FOREIGN_KEY_CHECKS=0
SET FOREIGN_KEY_CHECKS=1
*/

// MENTOR AND MENTEE HOME PAGES
app.get('/', checkAuthenticated, (req, res) => {
  let IsMentor = req.user.IsMentor
  let MentorID = req.user.MentorID
  console.log('Check Mentor Type ',IsMentor);
  if (IsMentor === 0) {  
     connection.query // QUERY TO PASS MENTEE DATA TO MENTOR HOME PAGE
     (`
     SELECT * FROM M_Mentee m join M_Mentorship m_ship
		  on m.MenteeID = m_ship.MenteeID
        where m.MenteeId in ( 
	   SELECT MenteeID 
		  FROM M_Mentorship 
		  WHERE MentorID = ${MentorID}
		)
     `, 
     function(err, rows) {
      res.render('Mentor_Page.ejs', { name: req.user.Fname, mentee_data: rows }) // pass Mentor and Mentee info to the mentor page
      console.log('Mentorships table data:', rows)
      })
  } else {

    connection.query // QUERY TO PASS MENTOR DATA TO MENTEE HOME PAGE
    (`
    SELECT * FROM M_Mentor m join M_Mentorship m_ship
    on m.MentorID = m_ship.MentorID
      where m.MentorId = ( 
   SELECT MentorID 
    FROM M_Mentorship 
    WHERE MenteeID = ${MentorID}
  ) and MenteeID = ${MentorID}
    `, 
    function(err, rows) {
     res.render('Mentee_Page.ejs', { name: req.user.Fname, mentor_data: rows }) // pass Mentor and Mentee info to the mentor page
     console.log('Mentorships table data:', rows)
     })


    // res.render('Mentee_Page.ejs', { name: req.user.Fname }) 
  }

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
        // console.log(rows)
    })
    }  else {
      connection.query(`INSERT INTO M_Mentee (MenteeID, Fname, Lname, Email, State, Password, Position, Bio, IsMentor) VALUES (${makedID},'${req.body.Fname}', '${req.body.Lname}', '${req.body.Email}', 'n', '${req.body.Password}', 'n', 'n', 1)`, 
      function(err, rows) {
        // console.log(rows)
      })
    } 
    res.redirect('/Login_Page')
  } catch {
    res.redirect('/Create_Account')
  }
})

// GET LOGIN
app.get('/Login_Page', checkNotAuthenticated, (req, res) => {
  res.render('Login_Page.ejs')
})
// POST LOGIN
app.post('/Login_Page', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',  
  failureRedirect: '/Login_Page',
  failureFlash: true
}))

// LOGOUT 
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/Login_Page')
})

// GET UPDATE MENTOR PAGE
app.get("/update_mentor", function(req, res) {
  let user = req.user
  let firstName = req.user.Fname
  let lastName = req.user.Lname
  let state = req.user.State
  let bio = req.user.Bio
  
  // console.log("test", Fname);
  res.render('Update_Mentor_Profile.ejs', { firstName: firstName,
    lastName: lastName,  // pass Mentor and Mentee info to the mentor page
    state: state,  // pass Mentor and Mentee info to the mentor page
    bio: bio })
})


// POST UPDATE MENTOR
app.post("/update_mentor", function(req, res) {
  console.log("mentor profile updated.")

  let user = req.session.passport.user
  let newlocation   = req.body.location;
  let newyears      = req.body.yearsOfExperience
  let newbio        = req.body.bio
  let skill1  = req.body.SQL
  let skill2  = req.body.Python
  let skill3  = req.body.Tableau
  let skill4  = req.body.JavaScript
  let skill5  = req.body.HTML
  let skill6  = req.body.CSS

  const skills  = ['SQL','Python','Tableau','JavaScript','HTML','CSS']
  // const skillsChecked = [skill1, skill2, skill3, skill4, skill5, skill6]

  console.log(` THIS IS POST UPDATE MENTOR: ${user}, ${newyears}, ${newbio}, ${skill1}, ${skill2}, ${skill3}, ${skill4}`)

  connection.query(`UPDATE M_Mentor 
	SET State = '${newlocation}',
		Bio = '${newbio}',
		Skill1 = '${skill1}',
		Skill2 = '${skill2}',
		Skill3 = '${skill3}',
		Skill4 = '${skill4}',
		Skill5 = '${skill5}',
		Skill6 = '${skill6}'
	WHERE MentorID = ${user}`
                      , 
    function(err, rows) {
     console.log('Checking if worked:', rows)
     })
  // // add code to query db and save new input data
  // let user = req.session.passport.user
  // let newlocation   = req.body.location;
  // let newyears      = req.body.yearsOfExperience
  // let newbio        = req.body.bio
  
  // let skill1  = Boolean(req.body.skill1);
  // let skill2  = Boolean(req.body.skill2);
  // let skill3  = Boolean(req.body.skill3);
  // let skill4  = Boolean(req.body.skill4);
  // let skill5  = Boolean(req.body.skill5);
  // let skill6  = Boolean(req.body.skill6);

  // const skills  = ['SQL','Python','Tableau','JavaScript','HTML','CSS']
  // const skillsChecked = [skill1, skill2, skill3, skill4, skill5, skill6]

  // console.log(`${user}, ${newyears}, ${newlocation}, ${newbio}, ${skillsChecked}`)

  // // NEED TO ADD IF CHECK BASED ON IF USER IS MENTOR. USE req.user.IsMentor 
  // // 0 MEANS MENTOR
  // // 1 MEANS MENTEE

  // connection.query(`UPDATE M_Mentor 
  //                     SET State = '${newlocation}', Bio = '${newbio}'
  //                       WHERE MentorId = ${user}`, function(err, rows) {
  //                         console.log(rows)
  //                       })

                       

  // for (let i = 0; i<skills.length; i++) {
  //   if (skillsChecked[i] === 'true') {
  //     console.log(skills[i])
  //     connection.query(`INSERT INTO M_HaveSkill
  //                       VALUES ${user}, '${i}'`, function(err, rows) {
  //                         console.log(rows)
  //                       })
  //   }
  // }
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
  let user = req.user
  let firstName = req.user.Fname
  let lastName = req.user.Lname
  let state = req.user.State
  let bio = req.user.Bio
  // console.log("test", Fname);
  res.render('Update_Mentee_Profile.ejs', { firstName: firstName,
    lastName: lastName,  // pass Mentor and Mentee info to the mentor page
    state: state,  // pass Mentor and Mentee info to the mentor page
    bio: bio })
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
  let newbio        = req.body.bio
  let skill1  = req.body.SQL
  let skill2  = req.body.Python
  let skill3  = req.body.Tableau
  let skill4  = req.body.JavaScript
  let skill5  = req.body.HTML
  let skill6  = req.body.CSS

  const skills  = ['SQL','Python','Tableau','JavaScript','HTML','CSS']
  // const skillsChecked = [skill1, skill2, skill3, skill4, skill5, skill6]

  console.log(` THIS IS POST UPDATE MENTEE: ${user}, ${newyears}, ${newbio}, ${skill1}, ${skill2}, ${skill3}, ${skill4}`)
  console.log("This is the skills is",typeof(skill1));
  connection.query(`UPDATE M_Mentee 
	SET State = '${newlocation}',
		Bio = '${newbio}',
		Skill1 = '${skill1}',
		Skill2 = '${skill2}',
		Skill3 = '${skill3}',
		Skill4 = '${skill4}',
		Skill5 = '${skill5}',
		Skill6 = '${skill6}'
	WHERE MenteeId = ${user}`
                      , 
    function(err, rows) {
     console.log('Checking if worked:', rows)
     })
  // redirect back to mentee home page
  res.redirect('/')
})

// GET FIND MENTORS PAGE
app.get("/find_mentors", function(req, res) {
  console.log("find mentors page loaded.")

  connection.query // QUERY TO PASS LIST OF ALL MENTORS TO PAGE
    (`SELECT * FROM M_Mentor`, 
    function(err, rows) {
     res.render('Find_Mentors.ejs', { mentor_data: rows }) // pass Mentor and Mentee info to the mentor page
     console.log('Mentor Data:', rows)
     })
  
})


//REQUEST MENTORSHIP
app.post("/request_mentorship/:id", function(req, res) {
  let mentorid = req.params.id

  console.log(`INSERT INTO M_Mentorship (MenteeID, MentorID, Accepted)
  VALUES ('${req.session.passport.user}','${mentorid}','0')`)
  console.log(`Mentee: Mentor requested: ${mentorid}`)
  
  connection.query(`INSERT INTO M_Mentorship (MenteeID, MentorID, Accepted)
                    VALUES ('${req.session.passport.user}','${mentorid}', 0)`, 
                    function(err, rows){
                    }
                  )

  res.redirect('/')
                    
})

//ACCEPT MENTORSHIP
app.post("/accept/:id", function(req, res) {

  let menteeid = req.params.id
  console.log(`UPDATE M_Mentorship
               SET Accepted = 1
               WHERE MenteeID = ${menteeid} AND 
                     MentorID = ${req.session.passport.user}`)

  connection.query(`UPDATE M_Mentorship
                    SET Accepted = 1
                    WHERE MenteeID = ${menteeid} AND 
                          MentorID = ${req.session.passport.user}`, 
                  function(err, rows){})

  res.redirect('/')
})

//DENY MENTORSHIP
app.post("/deny/:id", function(req, res) {

  let menteeid = req.params.id
  console.log(`UPDATE M_Mentorship
               SET Accepted = 2
               WHERE MenteeID = ${menteeid} AND 
                     MentorID = ${req.session.passport.user}`)

  connection.query(`UPDATE M_Mentorship
                    SET Accepted = 2
                    WHERE MenteeID = ${menteeid} AND 
                          MentorID = ${req.session.passport.user}`, 
                  function(err, rows){})

  res.redirect('/')
})

// GET MENTEE PROFILE
app.get("/mentee_profile/:id", function(req, res) {
  let menteeid = req.params.id

  console.log("Mentee_Profile page loaded.")
  console.log("Request Id from url:", menteeid );

  connection.query(`SELECT * FROM sprog20223.M_Mentee where MenteeId = ${menteeid}`, 
  function(err, rows) 
  {
    res.render("Mentee_Profile.ejs",
    { firstName: rows[0].Fname,
      lastName:  rows[0].Lname,
      state:     rows[0].State,
      bio:       rows[0].Bio ,
      skills1: rows[0].Skill1,
      skills2: rows[0].Skill2,
      skills3: rows[0].Skill3,
      skills4: rows[0].Skill4,
      skills5: rows[0].Skill5,
      skills6: rows[0].Skill6,
    })
  })
})

// POST MENTOR PROFILE
app.post("/mentor_profile", function(req, res) {


})

// GET MENTOR PROFILE
app.get("/mentor_profile/:id", function(req, res) {
  // let mentorid = req.params.id

  // console.log("Mentee_Profile page loaded.")
  // console.log("Request Id from url:", mentorid );

  // connection.query(`SELECT * FROM sprog20223.M_Mentor where MentorID = ${mentorid}`, 
  // function(err, rows) 
  // {
  //   console.log("GET MENTOR PROFILE", rows)

  //   res.render("Mentor_Profile.ejs"
  //   ,
  //   { firstName: rows[0].Fname,
  //     lastName:  rows[0].Lname,
  //     state:     rows[0].State,
  //     bio:       rows[0].Bio 

  //   }
  //   )
  // })
  let mentorid = req.params.id

  console.log("Mentor_Profile page loaded.")
  console.log("Request Id from url:", mentorid );

  connection.query(`SELECT * FROM sprog20223.M_Mentor where MentorID = ${mentorid}`, 
  function(err, rows) 
  {
    res.render("Mentor_Profile.ejs",
    { firstName: rows[0].Fname,
      lastName:  rows[0].Lname,
      state:     rows[0].State,
      bio:       rows[0].Bio,
      skills1: rows[0].Skill1,
      skills2: rows[0].Skill2,
      skills3: rows[0].Skill3,
      skills4: rows[0].Skill4,
      skills5: rows[0].Skill5,
      skills6: rows[0].Skill6,
    })
  })
})



// PASSPORT FUNCTIONS
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