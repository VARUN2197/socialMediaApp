const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/user');
const keys = require('../config/keys');

passport.use(new InstagramStrategy({
    clientID: keys.InstagramClientId,
    clientSecret: keys.InstagramClientSecret,
    callbackURL: "auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ instagramId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));