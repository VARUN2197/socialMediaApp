const express = require('express');
const expbhs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require('./models/user');
const Post = require('./models/post');
const methodOverride = require('method-override');

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
app.use(methodOverride('_method'));

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
 
app.get('/auth/facebook/callback',
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


//handle profile
app.get('/profile', ensureAuthenticated, (req, res) => {
    Post.find({user : req.user._id}) 
    .populate('user')
    .sort({date: 'desc'})
    .then((posts) => {
        res.render('profile', {
            posts:posts
        });
    });
});

//handle edit post
app.get('/editPost/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        res.render('editingPost', {
            post: post
        });
    });
});

//save post after edit
app.put('/editingPost/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        var allowComment;
        if(req.body.allowComment){
            allowComment=true;
        } else {
            allowComment=false;
        }
        post.title= req.body.title;
        post.body= req.body.postBody;
        post.status= req.body.status;
        post.allowComment= allowComment;
        post.save().then(() => {
            res.redirect('/profile');
        })
    });
});

//delete post
app.delete('/deletePost/:id', (req,res) => {
    Post.deleteOne({_id: req.params.id})
    .then(() => {
        res.redirect('/profile');
    })
});

//add Comment to post
app.post('/addComment/:id', (req,res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        var comment = {
            commentBody: req.body.commentBody,
            commentUser: req.user
        }
        post.comments.push(comment);
        post.save()
        .then(() => {
            res.redirect('/allPost')
        })
    })
})

//show all user
app.get('/allUsers', ensureAuthenticated, (req, res) => {
    User.find({}).then((users) => {
        res.render('users', {
            users:users
        });
    });
});

//show a particular user
app.get('/user/:id', (req, res) => {
    User.findById({_id: req.params.id})
    .then((user) => {
        res.render('user', {
            user: user
        });
    })
});

//handle logout
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

//add post
app.get('/addPost', ensureAuthenticated, (req, res) => {
    res.render('addPost');
});


//save post
app.post('/savePost', (req, res) => {
    var allowComment;
    if (req.body.allowComment) {
        allowComment= true;
    } else {
        allowComment= false;
    }
    const newPost = {
        title: req.body.title,
        body: req.body.postBody,
        status: req.body.status,
        allowComment: allowComment,
        user: req.user._id
    }
    new Post(newPost).save()
    .then(() => {
        res.redirect('/allPost');
    });
});

//handle display all post
app.get('/allPost', ensureAuthenticated, (req, res) => {
    Post.find({status: 'public'})
    .populate('user')
    .populate('comments.commentUser')
    .sort({date: 'desc'})
    .then((posts) => {
        res.render('publicPosts', {
            posts: posts
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