const { mutipleMongooseToObject } = require('../../util/mongoose')
const { json } = require("express");
const Member = require("../models/Member")

class HomeController {

    // [GET] /
    home(req, res){
        Member.find({})
        .then(members => {
            res.render('templates/home2', { 
                members: mutipleMongooseToObject(members),
                layout: 'home' 
            });
        }) 
    }
    // [GET] /
    history(req, res){
        Member.find({})
        .then(members => {
            res.render('templates/history', { 
                members: mutipleMongooseToObject(members),
                layout: 'home' 
            });
        }) 
    }

}



module.exports = new HomeController;