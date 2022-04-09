// var connection = require('./server');
// const LocalStrategy = require('passport-local').Strategy

// async function initialize(passport) {
//   passport.use(new LocalStrategy({ usernameField: 'email' },
//      (email, password, done) => { 
//       // connection.query(`SELECT distinct * FROM M_Mentor m , M_Mentee e WHERE e.Email = '${email}' or m.Email = '${email}' limit 1 `, 
//       connection.query(`SELECT * FROM M_Mentor WHERE Email = '${email}'`, 
//          (err, rows) => {
//           console.log("The Rows: ", rows)
//           let user = null;

//           if (rows.length > 0) { // Empty array
//             user = rows[0]
//           } else {
//             console.log('Please use mentee query');
//           }
        
//           console.log('this is the user', user);
//           if (user == null) {
//             return done(null, false, { message: 'No user with that email' })
//           }

//           try {
//             console.log("The User", user)
//             console.log('testing passport',password, user.Password);
//             if (password === user.Password) {
//               return done(null, user)
//             } else {
//               console.log("Account -> Email:", user.Email, "| Password: ", user.Password)
//               console.log("Our Input Fields -> Email:", email, "| Password: ", password)
//               return done(null, false, { message: 'Password incorrect' })
//             }
//           } catch (e) {
//             return done(e)
//           }
//         }
//       )
//     }
//   ))
//   // This will be need to changed due to only working with mentor
//   // serializeUser is determines which data of the user object should be stored in the session
//   // deserializeUser is used to retrieve the whole object
//   passport.serializeUser((user, done) => {
//     console.log("SerializerUser ", user.MentorID);
//     if (user.MentorID == null) {
//       // done(null, user.MenteeID)
//       console.log('I am a mentee');
//     } else {
//       done(null, user.MentorID)
//     }
    
//   }) 
//   passport.deserializeUser(async (id, done) => {
//       connection.query(`SELECT * FROM M_Mentor WHERE MentorID = '${id}'`, function (err, rows) { 
//         done(err, rows[0]) 
//         console.log('deserializeUser ', rows[0]);
//       })
//   })
// }

// module.exports = initialize


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
