var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
//Veces que se repetira el algoritmo de encriptación
var SALT_FACTOR = 10;
var bandSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}, 
    email: {type: String, unique: true, required: true },                                 
    bandname: {type: String},                              
    description: {type: String}, 
    role: {type: String}
});

var donothing = () => {}
//Encriptación de la contraseña
bandSchema.pre("save", function(done) {
    var band = this;
    if(!band.isModified("password"))
        return done();
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if(err){
            return done(err);
        }
        bcrypt.hash(band.password, salt, donothing, function (err, hashedpassword){
                if(err)
                    return done(err);        
                band.password = hashedpassword;
                done();
        });
    });
});

    bandSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
}

bandSchema.methods.name = function() {
    return this.name || this.username;
}

var Band = mongoose.model("Band", bandSchema);
module.exports = Band;
