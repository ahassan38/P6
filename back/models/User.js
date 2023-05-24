//Appel de mongoose
const mongoose = require('mongoose');
// appel de mongoose-unique-validator après installation
const uniqueValidator = require('mongoose-unique-validator');

// création de schéma de connection d'utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
// utilisation du shema via le plugin de mongoose-unique-validator
userSchema.plugin(uniqueValidator);
// exportation du schema modele
module.exports = mongoose.model('User', userSchema);