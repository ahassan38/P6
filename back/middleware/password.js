// récupère le modèle password
const passwordSchema = require("../models/Password");

//check du password selon le modèle
module.exports = (req, res, next) => {
  if (!passwordSchema.validate(req.body.password)) {
    res.writeHead(
      400,
      "Le mot de passe doit comprendre 8 caractères dont un chiffre, sans espaces",
      {
        "content-type": "application/json",
      }
    );
    res.end("Le format du mot de passe est incorrect.");
  } else {
    next();
  }
};