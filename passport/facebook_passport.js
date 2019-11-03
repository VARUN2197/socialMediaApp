const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
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

passport.use(new FacebookStrategy({
    clientID: keys.FacebookClientId,
    clientSecret: keys.FacebookClientSecret, 
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'photos', 'emails'], 
    passReqToCallback: true
  },
  (request, accessToken, refreshToken, profile, done) => {
      User.findOne({
        facebook: profile.id
      }).then((user) => {
        if(user) {
            done(null, user);
        } else {
            console.log(profile);
            const newUser = {
                facebook: profile.id,
                fullName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                image: `https://graph.facebook.com/${profile.id}/picture?type=large`
            }
            new User(newUser).save().then((user) => {
                done(null, user);
            });
        }

      });
  }
));