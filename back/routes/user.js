const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const passwordCheck = require("../middleware/password");
// route pour la création d'utilisateur ou le login (connexion avec un compte existant)
router.post('/signup', passwordCheck, userCtrl.signup);
router.post('/login', userCtrl.login);

//exportation
module.exports = router;