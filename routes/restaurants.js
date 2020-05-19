var express= require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);




router.get("/", function(req, res){
	
    Restaurant.find({}, function(err, allRestaurants){
       if(err){
           console.log(err);
       } else {
          res.render("restaurants/index",{restaurants: allRestaurants, page: 'restaurants'});
       }
    });
});

router.post("/", middleware.isLoggedIn, function(req,res){
    var name=req.body.name;
     var price = req.body.price;
    var image=req.body.image;
     var contact = req.body.contact;
     var cuisine = req.body.cuisine;
     var address = req.body.address;
     var desc=req.body.description;
     var author = {
         id: req.user._id,
         username: req.user.username
         
     };
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address' + req.body.location);
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newRestaurant = {name:name, price:price, image:image, description: desc, author:author, contact:contact, cuisine:cuisine, address:address, location:location, lat:lat, lng:lng};
    Restaurant.create(newRestaurant, function(err, newlyCreated){
        if(err){
			console.log(address);
            console.log(err);
        }
        else{
            //console.log(newlyCreated)
            res.redirect("/restaurants");
        }
    });
	});
   
});

router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("restaurants/new"); 
});



router.get("/:id", function(req,res){
    Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurants){
        if(err){
            console.log(err);
        }
        else{
            //console.log(foundRestaurants)
           res.render("restaurants/show", {restaurant: foundRestaurants});  
        }
    });
   
});

//EDIT

router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req, res){
    
             
            Restaurant.findById(req.params.id, function(err, foundRestaurant){
                 res.render("restaurants/edit", {restaurant: foundRestaurant});
            });
});

router.put("/:id", middleware.checkRestaurantOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
    // if (err || !data.length) {
    //   req.flash('error', 'Invalid address');
    //   return res.redirect('back');
    // }
    req.body.restaurant.lat = data[0].latitude;
    req.body.restaurant.lng = data[0].longitude;
    req.body.restaurant.location = data[0].formattedAddress;
    Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, function(err, restaurant){
        if(err){
			req.flash("error", err.message);
        res.redirect("back");
    } else{
		 req.flash("success","Successfully Updated!");
        res.redirect("/restaurants/"+ restaurant._id);
    }
	});
});
});

router.delete("/:id", middleware.checkRestaurantOwnership, function(req, res){
    Restaurant.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/restaurants");
        } else{
            res.redirect("/restaurants"); 
        }
    });
    
});



module.exports = router;