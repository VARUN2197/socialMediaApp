const express = require('express');
const expbhs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require('./models/user');

//connect to MongoURI
const keys = require('./config/keys');
require('./passport/google_passport');

 //initialize application
const app = express();

const port = process.env.PORT || 5002;

//setup template
app.engine('handlebars', expbhs( {
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
 
//static folder for css anf js
app.use(express.static('public'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ 
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


//set global vars for user
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

mongoose.Promise = global.Promise;
mongoose.connect(keys.MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() =>{
    console.log("connected to db");
}).catch((err) =>{
    console.log(err);
});

app.get('/', (req, res) => {
    res.render('home.handlebars');
});

//google auth route
app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'email', 'profile' ] }
));
 
app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/profile',    
        failureRedirect: '/'
}));

app.get('/profile', (req, res) => {
    User.findById({_id: req.user._id}) 
    .then((user) => {
        res.render('profile', {
            user:user
        });
    });
});

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

app.listen(port, () => {
    console.log("Server is running");
});