var passwordValidator = require("password-validator");

// Creer un schema
var passwordSchema = new passwordValidator();

// Ajouter les propriétés du schéma
passwordSchema
  .is().min(8) // Minimum longueur 8
  .is().max(100) // Maximum longueur 100
  .has().uppercase() // contient des majuscules
  .has().lowercase() // contient des minuscules
  .has().digits(1) // au moins 1 chiffre
  .has().not().spaces() // pas d'espaces
  .is().not().oneOf(["Passw0rd", "Password123"]); 

module.exports = passwordSchema;