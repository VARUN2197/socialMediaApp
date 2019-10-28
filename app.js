const express = require('express');
const expbhs = require('express-handlebars');
const  mongoose = require('mongoose');

//connect to MongoURI
 const keys = require('./config/keys');

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

app.listen(port, () => {
    console.log("Server is running");
});