const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
   fullName: {
        type: String,
        default: ''
   },
   firstName: {
        type: String,
        default: ''
   },
   lastName: {
        type: String,
        default: ''
   },
   email: {
       type: String,
       default: ''
   },
   image: {
       type: String,
       default: ''
   },
   phone: {
       type: Number
   },
   location: {
       type: String
   },
   fbTokens: Array,
   facebook: {
       type: String
   },
   google: {
       type: String
   },
   instagram: {
       type: String
   }

});

module.exports = mongoose.model('user', userSchema); 