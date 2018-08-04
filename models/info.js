var mongoose = require('mongoose');

var infoSchema = mongoose.Schema({
    name:{type:String,require:true},
    username:{type:String,require:true},
    image:{type:String,require:true},
    status:{type:Number,require:true},
    sample:{type:String,require:true},
    description: {type: String},
});
var donothing = () =>{

}
var Info = mongoose.model("Info",infoSchema);
module.exports = Info;