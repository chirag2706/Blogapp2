require('dotenv').config();
var express = require("express");
var app = express();
var Nodegeocoder = require("node-geocoder");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine",'ejs');
var passport  = require("passport");
var passportLocal = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var expressSession = require("express-session");
var methodOverride = require("method-override");
var flash = require("connect-flash");
app.use(flash());
app.use(express.static("public"));
function isloggedin(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }else{
        req.flash("error","Please Login First");
        res.redirect("/login");
    }
}

function Owner(req,res,next){
    if (req.isAuthenticated()){
        campground.findById(req.params.id,function(err,campground){
            if (err){
                console.log(err);
                req.flash("error","Campground not found");
                res.redirect("back");
            }else{
                if (campground.author.id.equals(req.user._id)){
                    // res.render("edit",{campground:campground});
                    
                    console.log("next");
                    return next();
                }
                else{
                    req.flash("error","You are not owner of this campground");
                    console.log("back");
                    res.redirect("back");
                }
            }
            
        });
    }else{
        req.flash("error","You need to login");
        console.log("login page");
        res.redirect("/login");
    }
}



function commentOwner(req,res,next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,comment){
            if (err){
                req.flash("error","Comment not found");
                console.log(err);
                res.redirect("back");
            }else{
                if (comment.author.id.equals(req.user._id)){
                    // res.render("edit",{campground:campground});
                    console.log("next");
                    return next();
                }
                else{
                    req.flash("error","You have not posted this comment");
                    console.log("back");
                    res.redirect("back");
                }
            }
            
        });
    }else{
        req.flash("error","Login First Bro!!");
        console.log("login page");
        res.redirect("/login");
    }
}

var options = {
    provider:"google",
    httpAdapter:"https",
    apiKey:process.env.GEOCODER_API_KEY,
    formatter:null
}

var geocoder = Nodegeocoder(options);


var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true });

// schema
var seedDB = require("./views/models/seeds.js");
// seedDB();
var campground = require("./views/models/campground.js");

var Comment = require("./views/models/comments.js");

var user = require("./views/models/user.js");
// passport configuration

app.use(expressSession({
    secret : "Chirag nickname is Chiggi",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function(req,res,next){
    var currentUser = req.user;
        res.locals.name = currentUser;
        res.locals.errorMessage = req.flash("error");
        res.locals.successMessage = req.flash("success");
        console.log(res.locals)
        next();
});
app.use(methodOverride("_method"));
app.get("/",function(req,res){
    res.render('landing');    
});

app.get("/campgrounds",function(req,res){
    campground.find({},function(err,allcampground){
        if (err){
            req.flash("error","Campground not found!!");
            res.redirect("back");
        }
        else{
            // var currentUser = req.user;
            // console.log("Your data has successfully founded in database");
            // console.log(campground);
            res.render("campgrounds/campground",{camp:allcampground}); 
        }
    });
    // res.render("campground",{camp:camp}); 
});


app.post("/campgrounds",isloggedin,function(req,res){
//   res.send("Hiii !!!"); 
   //takes the data and add it to  array
   //redirect to /campgrounds
//   console.log(req);
   
   var nam =  req.body.name;
   var imag = req.body.image,des = req.body.description,price = req.body.price;
   
   geocoder.geocode(req.body.location,function(err,data){
       if (err || !data.length ){
           console.log(req.body.location);
           console.log(data);
           console.log(err);
           req.flash("error","Invalid address");
           res.redirect("back");
       }else{
           console.log(data);
           var lat = data[0].latitude,lng = data[0].longitude
            ,location = data[0].formattedAddress;
            console.log(lat+" "+lng+" "+location);
            campground.create({name:nam,image:imag,description:des,author:{
       id:req.user._id,
       username:req.user.username
   },price:price,location:location,lat:lat,lng:lng},function(err,camp){
       if (err){
           req.flash('error',"Campground Not Created");
           res.redirect("back");
       }else{
        //   camp.author.id = req.user._id;
        //   camp.author.username = req.user.username;
        //   camp.save(function(err){
        //       if (err){
        //           console.log("ERROR");
        //       }else{
                    req.flash("success","Campground created successfully");
                    console.log("Your data has successfully stored in database");
                    res.redirect("/campgrounds");
              }
           });
           
       }
       
   });
    
});
   
   
   
   
//   campground.create({name:nam,image:imag,description:des,author:{
//       id:req.user._id,
//       username:req.user.username
//   },price:price},function(err,camp){
//       if (err){
//           req.flash('error',"Campground Not Created");
//           res.redirect("back");
//       }else{
//         //   camp.author.id = req.user._id;
//         //   camp.author.username = req.user.username;
//         //   camp.save(function(err){
//         //       if (err){
//         //           console.log("ERROR");
//         //       }else{
//                     req.flash("success","Campground created successfully");
//                     console.log("Your data has successfully stored in database");
//                     res.redirect("/campgrounds");
//               }
//           });
           
           
       
//   });

   


app.get("/campgrounds/new",isloggedin,function(req,res){
    res.render("campgrounds/new");
});


app.get("/campgrounds/:id",isloggedin,function(req,res){
    // console.log(req);
    campground.findById(req.params.id).populate("comments").exec(function(err,campgroundfound){
        if (err){
            req.flash("error","Something Went wrong!!!");
            res.redirect("back");
        }else{
            console.log(campgroundfound);
            res.render("campgrounds/show",{campgroundfound:campgroundfound,User:req.user});
            
        }
    });
    
});


// comment routes
app.get("/campgrounds/:id/comments/new",isloggedin,function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if (err){
            req.flash("error","Comments not found");
            res.render("back");
        }else{
            res.render("comments/new",{campground:campground});  
        }
    });
      
});
app.post("/campgrounds/:id/comments",isloggedin,function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if (err){
            // console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/campgrounds");
        }else{
            // var obj = mongoose({
            //     comment:req.body.text,
            //     author:req.body.author
            // });
            // obj.save();
            // campground.comments.push(obj);
            // // console.log(req.body.text);
            // // console.log(req.body.author);
            // campground.save(function(err){
            //     if (err){
            //         console.log(err);
            //         // res.redirect("/campgrounds");
            //     }else{
            //       res.redirect("/campgrounds/"+campground._id); 
            //     }
            // });
            console.log(req.body);
            Comment.create({
                comment:req.body.text,
                // author:req.body.author
                author:{
                    id : req.params.id,
                    username:req.body.author
                }
            },function(err,comment){
                if (err){
                    req.flash("error","Comment not created");
                    res.redirect("/");
                }else{
                    // console.log(req.user);
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save(function(err,comment){
                        if (err){
                            req.flash("error",'Comment not saved');
                            res.redirect("/");
                        }else{
                            campground.comments.push(comment);
                            campground.save(function(err,campground){
                                if (err){
                                    req.flash("error",'Comment not saved');
                                    res.redirect("/");
                                }else{
                                    req.flash("success",'Hurray!,Comment created successfully');
                                    res.redirect("/campgrounds/"+campground._id); 
                                }
                            });
                        }
                    });
                    
                    
                }
            });
            
            
        }
    });
});



// auth routes

app.get("/register",function(req,res){
    res.render('register');
});


app.post("/register",function(req,res){
    var a = req.body.username;
    user.register(new user({
        username : a,
    }),req.body.password,function(err,user){
        if (err){
            // console.log(err);
            req.flash("error",err.message+"("+err.name+")");
            // req.flash("error","Either (username or password) is incorrect or username already exists");
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Registered successfully");
               res.redirect("/campgrounds"); 
            });
        }
    });
});

// login routes

app.get("/login",function(req,res){
   res.render("login"); 
});

app.post("/login",passport.authenticate("local",{successRedirect:"/campgrounds",
failureRedirect:"/login"}),function(req,res){
    // if (err){
    //     req.flash("error","Username or password is incorrect!");
    //     res.redirect("back");
    // }else{
        req.flash("success","Logged in successfully!!!");
    // }
    
});


//logout route

app.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged out success");
    res.redirect("/campgrounds");
});

app.get("/campgrounds/:id/edit",Owner,function(req,res){
    //check whether user is logged in or not
    // if (req.isAuthenticated()){
    //     campground.findById(req.params.id,function(err,campground){
    //         if (err){
    //             console.log(err);
    //         }else{
    //             if (campground.author.id == req.user._id)
    //             res.render("edit",{campground:campground});
    //             else{
    //                 res.redirect("/login");
    //             }
    //         }
            
    //     });
    // }else{
    //     res.redirect("/login");
    // }
    campground.findById(req.params.id,function(err,campground){
        if (err){
            req.flash('error',"Something went wrong");
            res.redirect("back");
        }else{
            res.render("edit",{campground:campground});
        }
    });
    
});

app.put("/campgrounds/:id",Owner,function(req,res){
    //find and update the data
    var name = req.body.name,image = req.body.image,des = req.body.description;
    var idd = req.params.id;
    
    geocoder.geocode(req.body.location,function(err,data){
        if (err || !data.length){
            req.flash("error","Invalid Information");
            res.redirect("back");
        }else{
            console.log(data);
            var location = data[0].formattedAddress,lat = data[0].lat,lng = data[0].lng;
            campground.findByIdAndUpdate(idd,{name:name,image:image,description:des,location:location,lat:lat,lng:lng},function(err,campground){
        if (err){
            req.flash("error","Campground Not updated!!!");
            res.redirect("back");
        }else{
            req.flash("success",'Campground updated!!!');
            console.log(campground);
            res.redirect("/campgrounds/"+idd);
        }
    });
        }
    });
    
    // campground.findByIdAndUpdate(idd,{name:name,image:image,description:des},function(err,campground){
    //     if (err){
    //         req.flash("error","Campground Not updated!!!");
    //         res.redirect("back");
    //     }else{
    //         req.flash("success",'Campground updated!!!');
    //         console.log(campground);
    //         res.redirect("/campgrounds/"+idd);
    //     }
    // });
});

//delete route
app.delete("/campgrounds/:id",Owner,function(req,res){
    campground.findByIdAndRemove(req.params.id,function(err){
        if (err){
            req.flash("error","Campground Not Deleted");
            res.redirect("back");
        }else{
            req.flash("success","Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});



//editing of comments

app.get("/campgrounds/:id/comments/:comment_id/edit",commentOwner,function(req,res){
    // res.render("./comments/edit");
    var campground_id = req.params.id;
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if (err){
            req.flash("error",'Comment not founded');
            res.redirect("back")
        }else{
            // req.flash("success","Comment ")
            res.render("comments/edit",{campground_id:campground_id,comment:foundComment});
        }
    });
    
    
});

app.put("/campgrounds/:id/comments/:comment_id",commentOwner,function(req,res){
    console.log(req.body);
    Comment.findByIdAndUpdate(req.params.comment_id,req.body,function(err,comment){
        if (err){
            req.flash("error","Comment not updated");
            res.redirect("back");
        }else{
            comment.comment = req.body.text;
            comment.save();
            console.log(comment);
            req.flash("success","Comment updated");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//delete comment route
app.delete("/campgrounds/:id/comments/:comment_id",commentOwner,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
       if (err){
           req.flash("error","Comment not deleted");
           res.redirect("back");
       } else{
           req.flash("success",'Comment deleted successfully');
           res.redirect("/campgrounds/"+req.params.id);
       }
    });
});


app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server has started with port number "+process.env.PORT+" and IP address is "+process.env.IP);
});