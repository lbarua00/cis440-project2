let connection = require('./server');
const LocalStrategy = require('passport-local').Strategy

function initialize(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => { 
    // connection.query(`SELECT * FROM M_Mentor WHERE Email = '${email}'`, (e, rows) => { 
    connection.query(`SELECT * from (SELECT * FROM sprog20223.M_Mentor UNION SELECT * FROM sprog20223.M_Mentee) as m WHERE Email = '${email}'`, (e, rows) => { 
      
      if (rows.length === 0)
        return done(null, false, { message: 'No user with that email' })

      let mentor = rows[0];
      console.log(mentor);
      if (password === mentor.Password)
        return done(null, mentor)
      else 
        return done(null, false, { message: 'Password incorrect' })
    })
  }))
  
  passport.serializeUser((mentor, done) => {
    done(null, mentor.MentorID)
    console.log("serializeUser: ",mentor);
  })
  passport.deserializeUser( (id, done) => {
    // connection.query(`SELECT * FROM M_Mentor WHERE MentorID = '${id}' or MenteeID = '${id}'` ,  (err, rows) => {
    connection.query(`
    SELECT *
      from (SELECT * FROM sprog20223.M_Mentor
    UNION
      SELECT * FROM sprog20223.M_Mentee)  as m where m.MentorID = '${id}'
    ` ,  (err, rows) => {
      console.log("deserializeUser: ",rows);
      let mentor = rows[0]
      done(err, mentor) 
    })
  })
}

module.exports = initialize;
