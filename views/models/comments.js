var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/yelpcamp',{useNewUrlParser:true});
// Creating Schema
var CommentSchema = new mongoose.Schema({
    comment:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment"
        },
        username:String
    }
});
// creating model
var comment = mongoose.model("comment",CommentSchema);
module.exports = comment;