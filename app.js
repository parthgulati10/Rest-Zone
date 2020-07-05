require('dotenv').config();
var express =require("express");
var app= express();
var bodyParser=require("body-parser");
var bluebird = require("bluebird");
var mongoose= require("mongoose");
var flash = require("connect-flash");
app.locals.moment = require('moment');
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");


//requiring routes
var commentRoutes = require("./routes/comments"),
    restaurantRoutes = require("./routes/restaurants"),
    indexRoutes = require("./routes/index");



//mongoose.connect("mongodb://localhost/5000");
// mongoose.connect("mongodb+srv://parth123:parth123@cluster0-5bk5n.mongodb.net/test?retryWrites=true&w=majority")
mongoose.connect("mongodb+srv://parth123:parth123@cluster0-5bk5n.mongodb.net/test?retryWrites=true&w=majority" , {
	useNewUrlParser: true,
	useCreateIndex: true
})
.then(()=> {
	console.log("Connected to DB! Hurray");
}).catch(err => {
	console.log("ERROR:", err.message);
})
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();

app.use(require("express-session")({
    secret: "This is Parth",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/restaurants/:id/comments", commentRoutes);

const PORT = process.env.PORT || 7388;
app.listen(PORT , ()=> {
	console.log(`Now listening to Request on the chosen ${PORT}`);
});