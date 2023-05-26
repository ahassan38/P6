const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const saucesCtrl = require('../controllers/sauces');

// Routes avec "auth" pour l'identification,
// et "multer" pour le téléchargement et transfert de fichiers
router.post('/', auth, multer, saucesCtrl.createSauces);
router.put('/:id', auth, multer, saucesCtrl.modifySauces);
router.delete('/:id', auth, saucesCtrl.deleteSauces);     
router.get('/:id', auth, saucesCtrl.getOneSauces);
router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/:id/like', auth, saucesCtrl.likeSauces);

module.exports = router;