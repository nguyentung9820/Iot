const express = require('express');
const router = express.Router();
const memberController = require('../app/controller/MemberController');
const upload = require('../multer')


router.get('/delete/:id', memberController.deleteMember);
router.get('/edit/:id', memberController.editMember);
router.get('/view/:id', memberController.viewMember);
router.get('/add', memberController.addMember);
router.post('/save', upload.single('avatar'), memberController.saveMember);
router.post('/update/:id', upload.single('avatar'), memberController.updateMember);


module.exports = router;