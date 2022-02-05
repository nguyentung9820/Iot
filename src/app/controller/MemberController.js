const { mutipleMongooseToObject } = require('../../util/mongoose')
const { json } = require("express");
const Member = require("../models/Member")

class MemberController {

    // [GET] /
    addMember(req, res){
        res.render('templates/addmember',{
            layout: 'home'
        })
    }

    saveMember(req, res){
        var body = req.body;
        var file = {avatar: req.file.filename}
        var data = Object.assign(body, file);
            try{
                var member = new Member(data);
                member.save();
                res.redirect('/')       
            } catch (error) {
                res.send('fail')
            }              
    }

    viewMember(req, res){
        Member.find({_id: req.params.id})
        .then(members => {
                res.render('templates/viewmember', { 
                    members: mutipleMongooseToObject(members),
                    layout: 'home' 
                });            
        })    
    }

    editMember(req, res){
        Member.find({_id: req.params.id})
        .then(members => {
                res.render('templates/editmember', { 
                    members: mutipleMongooseToObject(members),
                    layout: 'home' 
                });            
        })    
    }
    deleteMember(req,res, next){
        var param = req.params.id;
        Member.deleteOne({_id: param})
        .then(() => res.redirect('/'))
        .catch(next);
    }
    updateMember(req,res){
        var body = req.body;
        if(req.file != null){
            var file = {avatar: req.file.filename}
        }else{
            var file = {avatar: req.body.last_image}
        }
        var data = Object.assign(body, file);
        if(req.params.id != null){
            Member.updateOne({_id: req.params.id}, data)
            .then(() => res.redirect('/'))
        }
    }
}



module.exports = new MemberController;