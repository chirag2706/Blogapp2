//seeding of database
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelpcamp');
var campground = require("./campground.js");
var comment = require("./comments.js");
var data = [
        {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
];
function seedDB(){
        campground.remove(function(err){
        if (err){
            console.log("ERROR");
        }else{
            console.log("Campgrounds removed");
    //         // add campgrounds
            for(var i=0;i<data.length;i++){
                campground.create(data[i],function(err,data){
                    if (err){
                        console.log("ERROR");
                    }else{
                        // console.log(data);
                        // create comments
                        comment.create({
                            text:"Hi,How are U???",
                            author:"Chirag gupta"
                        },function(err,comment){
                            if (err){
                                console.log("Something went wrong in comment creating callback");
                            }else{
                                console.log("new comment created");
                                data.comments.push(comment);
                                data.save(function(err){
                                    if (err){
                                        console.log("Something went wrong while saving comments");
                                    }else{
                                        console.log(data);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}
module.exports = seedDB;
