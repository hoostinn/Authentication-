import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs')
app.use(express.static('public'))

// initializing sessions

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));


//setting up database connection pool
const pool = mysql.createPool({
    host: "justin-park.online",
    user: "justinpa_webuser",
    password: "WEBuser444",
    database: "justinpa_quotes",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

// global variable
let authenticated = false;

//routes
app.get('/', (req, res) => {
   res.render('login')
});

app.get('/profile', (req, res) => {
    if (req.session.authenticated) {
        res.render('profile')
    } else {
        res.redirect("/");
    }
 });

 app.get('/settings', isAuthenticated, (req, res) => {
        res.render('settings')
 });

 app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
 });



app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(password);

    let passwordHash = "$2b$10$lL03Srz/P22qWCWKdyJOUOEXWvgxvyxMzFbj3TIFUwtQjzdUzWK7u";
    // let match = await bcrypt.compare(password, passwordHash);

    let sql = `SELECT * 
                FROM admin
                WHERE username = ?
                `;

    const [rows] = await conn.query(sql, [username]); // this executes the query

    if (rows.length > 0) {// found the record, it found at least one record where the username is equal to whatever we pass in the 'form username' - form tag 
        // passwordHash = rows[0].password; // we're assigning the database value from password to passwordHash
    }

    let match = await bcrypt.compare(password, passwordHash);
    console.log(passwordHash);
    if (match) {
        req.session.fullName = rows[0].firstName + "" + rows[0].lastName;
        req.session.authenticated = true;
        res.render('welcome')
    } else {
        res.redirect("/")
    }
 });

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

// Middleware functions
function isAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect("/");
    }
}


app.listen(3001, ()=>{
    console.log("Express server running")
})