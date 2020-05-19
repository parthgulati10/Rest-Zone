var express= require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");

//root Routes
router.get("/", function(req,res){
    res.render("landing");
});


// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
		username: req.body.username,
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	});
	if(req.body.adminCode === 'secretcode123'){
		newUser.isAdmin = true;
	}
    User.register(newUser, req.body.password, function(err, user){
        if(err){
			console.log(err);
			return res.render("register", {error: err.message});
		}
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to RestZone " + user.username);
            res.redirect("/restaurants");
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login",passport.authenticate("local",
     {
         successRedirect: "/restaurants",
         failureRedirect: "/login"
         
     }), function(req, res){
    
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/restaurants");
});

router.get("/users/:id", function(req, res){
		User.findById(req.params.id, function(err, foundUser){
			if(err){
				req.flash("error", "Something went wrong!");
				return res.redirect("/");
			}
			Restaurant.find().where('author.id').equals(foundUser._id).exec(function(err, restaurants){
				if(err){
				req.flash("error", "Something went wrong!");
				return res.redirect("/");
			    }
			    res.render("users/show", {user: foundUser, restaurants:restaurants});
			});
		});
});




module.exports = router;