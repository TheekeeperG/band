var passport = require('passport');
var band = require('./models/band');

var LocalStrategy = require("passport-local").Strategy;

module.exports = () =>{
   
    passport.serializeUser((band,done) => {
        console.log(band);
        done(null,band._id);
    });
    passport.deserializeUser((id,done) => {
        band.findById(id,(err,band) => {
            done(err,band);
        });
    });
};

passport.use("login",new LocalStrategy(function(username,password,done){
 
    band.findOne({username:username},function(err,band){
        if(err){
            return done(err);
        }
        if(!band){
            return
            done(null,false,{message:"No existe ningun usuario con ese nombre"})
        }
        band.checkPassword(password,(err,isMatch) =>{
            if(err){
                return done(err);
            }
            if(isMatch){
                return done(null,band)
            }else{
                return done(null,false,{message:"La contraseñano es valida"})
            }
        })
    })
}));
   