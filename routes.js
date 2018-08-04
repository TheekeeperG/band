var express = require('express');
var Band = require('./models/band');
var Info = require('./models/info');
var passport = require('passport');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var pathext = "";
var acl = require("express-acl");
acl.config({
        baseUrl:'/',
        defaultRole: 'guest',
        decodedObjectName:'band', 
        roleSearchPath: 'band.role'
    });
    
    router.use(acl.authorize);

//use
router.use((req, res, next) => {
        res.locals.currentBand = req.band;
        res.locals.message = "";
        res.locals.errors = req.flash('error');
        res.locals.infos = req.flash('info');
        if (req.band) {
                req.session.role = req.band.role;
                name = req.band.username;
        } else {
                req.session.role = 'guest';
        }
        console.log(req.session.role);
        next();
});



router.get("/", (req, res, next) => {
        Info.find()
        .sort({name: "descending"})
        .exec((err, info) => {
            if(err){
                return next(err);
            }
            res.render("index", {info: info} );
        });
    });


//Registro
router.get("/signup", (req, res, next) => {
        res.render("signup");
});

router.post("/signup", (req, res, next) => {

        var username = req.body.Username;
        var password = req.body.Password;
        var Bandname = "";
        var email = req.body.Email;
        var Description = req.body.Description;
        Band.findOne({
                username: username
        }, (err, band) => {
                if (err)
                        return next(err);
                if (band) {
                        req.flash("error", "El nombre de usuario no esta disponible");
                        return res.redirect("/signup");
                }


                var newBand = new Band({
                        username: username,
                        password: password,
                        email: email,
                        bandname: Bandname,
                        description: Description,
                        role: "user"
                });
                newBand.save(next);
                return res.redirect("/");
        });
});


//Inicio de sesión
router.get("/login", (req, res, next) => {
        res.render("login");
});
router.get("/loginF", (req, res, next) => {
        res.render("login", {
                message: "Sorry bruh"
        });
});
router.post("/login", passport.authenticate("login", {
        successRedirect: "/",
        failureRedirect: "/loginF",
        failureFlash: true
}));


//use
router.use((req, res, next) => {
        res.locals.currentBand = req.band;
        res.locals.errors = req.flash('error');
        res.locals.infos = req.flash('info');
        if (req.band) {
                req.session.role = req.band.role;

        } else {
                req.session.role = 'guest';
        }
        console.log(req.session.role);
        next();
});



function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
                next();
        } else {
                req.flash("info", "necesitas iniciar sesion para acceder a esta zona");
                res.redirect("/login");
        }
}

router.get("/logOut", (req, res) => {
        req.logOut();
        res.redirect("/");

});


//Agregar banda
router.get("/addBand", (req, res, next) => {

        res.render("band");
});




var storage = multer.diskStorage({
        destination: './public/uploads',
        filename: function (req, file, cb) {

                cb(null, req.band.username + path.extname(file.originalname))
                var ext = path.extname(file.originalname);
                if (ext == ".png" || ext == ".jpg" || ext == ".jepg") {
                        pathext = req.band.username + path.extname(file.originalname);
                }
                console.log("ey");
        }
})

var upload = multer({
        storage: storage
}).array("pes", 2);


router.post("/addBand", (req, res, next) =>  {
        upload(req, res, function (err) {

                if (err) {
                        console.log("ey");
                        return next(err);
                }
                var name = req.body.BandName;
                var username = req.band.username;
                var image = pathext;
                var status = 0;
                var sample = username + ".mp3";
                Info.findOne({
                        name: name
                }, (err, info) => {
                        if (err) {
                                return next(err);
                        }

                        var newInfo = new Info({
                                name: name,
                                username: username,
                                image: image,
                                status: status,
                                sample: sample,
                                description: req.band.description, 

                        });
                        req.band.bandname = name;
                        req.band.save((err) => {
                                if (err) {
                                        next(err);
                                        return;
                                }
                                req.flash("info", "Perfil Actualizado");
                                req.band.bandname = name;
                        });
                        newInfo.save(next);
                        return res.redirect("/");
                });
               
        });
      
});

//modview
router.get("/mod", (req, res, next) => {
        Info.find()
        .sort({name: "descending"})
        .exec((err, info) => {
            if(err){
                return next(err);
            }
            res.render("mod", {info: info} );
        });
    });

router.post("/accept", (req, res, next) => {
        var btn = req.body.username1;
        console.log("Accept "+req.body.username1);
        Band.findOne({
                username: btn
        }, (err, band) => {
                if (err)
                        return next(err);
                if (band) {
                        band.role="UserAccepted";
                        band.save(next);
                        Info.findOne({
                         username: band.username       
                        }, (err,info) =>{
                                if (err)
                                return next(err);
                        if (info) {
                        info.status = "1";
                        info.save(next);
                        }

                        })
                }


               
                
                return res.redirect("/mod");
        });
});
 router.post("/delete", (req, res, next) => {
        var btn = req.body.username2;
        Band.findOne({
                username: btn
        }, (err, band) => {
                if (err)
                        return next(err);
                if (band) {
                        band.role="UserNotAccepted";
                        band.save(next);
                        Info.findOne({
                         username: band.username       
                        }, (err,info) =>{
                                if (err)
                                return next(err);
                        if (info) {
                        info.status = "2";
                        info.save(next);
                        }

                        })
                }


               
                
                return res.redirect("/mod");
        });
});
module.exports = router;