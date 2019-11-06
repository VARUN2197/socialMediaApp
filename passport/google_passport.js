const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const keys = require('../config/keys');

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: keys.GoogleClientId,
    clientSecret: keys.GoogleClientSecret, 
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
  },
  (request, accessToken, refreshToken, profile, done) => {
      User.findOne({
        google: profile.id
      }).then((user) => {
        if(user){
          done(null, user);
        } else {
          var newUser = {
            google: profile.id, 
            fullName: profile.displayName,
            lastName: profile.name.family,
            firstName: profile.name.givenName,
            image: profile.photos[0].value,
            email: profile.emails[0].value 
          }
          new User(newUser).save().then((user) => {
            done(null, user);
          });
        }
      });
  }
));