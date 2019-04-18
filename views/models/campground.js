var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelpcamp',{useNewUrlParser:true});
var campgroundSchema = new mongoose.Schema({
    name:String,
    price:String,
    image:String,
    location:String,
    lat:Number,
    lng:Number,
    description:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"author"
        },
        username:String
    },
    comments:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"comment"
            }
        ]
});

var campground = mongoose.model("campground",campgroundSchema);
module.exports = campground;
