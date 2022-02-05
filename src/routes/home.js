const express = require('express');
const router = express.Router();

const homeController = require('../app/controller/HomeController');
const memberController = require('../app/controller/MemberController');


router.get('/addmember', memberController.addMember);
router.get('/', homeController.home);


module.exports = router;