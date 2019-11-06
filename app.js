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
require('./passport/facebook_passport');

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

app.get('/', ensureGuest, (req, res) => {
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


//facebook auth route
app.get('/auth/facebook',
  passport.authenticate('facebook',  { scope : ['email'] }));
 
app.get( '/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',    
        failureRedirect: '/'
}));

//instagram auth route
app.get('/auth/instagram',
  passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile', ensureAuthenticated, (req, res) => {
    User.findById({_id: req.user._id}) 
    .then((user) => {
        res.render('profile', {
            user:user
        });
    });
});

app.get('/allUsers', (req, res) => {
    User.find({}).then((users) => {
        res.render('users', {
            users:users
        });
    });
});

app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

//handle phone 
app.post('/addPhone', (req,res) => {
    const phone = req.body.phone;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.phone = phone;
        user.save().then(() => {
            res.redirect('/profile');
        });
    });
});

//handle location
app.post('/addLocation', (req,res) => {
    const location = req.body.location;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.location = location;
        user.save().then(() => {
            res.redirect('/profile');
        });
    });
});

//ensure authethication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
        next(); 
    } else {
        res.redirect('/');
    }
}
//ensure guest   
function ensureGuest(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/profile');
    } else{
        next();
    }
}

app.listen(port, () => {
    console.log("Server is running");
});