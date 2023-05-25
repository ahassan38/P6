const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Créer un compte utilisateur
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        // créer une instance du model User
        const user = new User({
            email: req.body.email,
            password: hash
          });
          user.save() //créer et sauvegarder un nouvel user
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
            
    })
    .catch(error => res.status(500).json({error}));
};

// Connexion à un compte utilisateur existant
exports.login = (req, res, next) => {
    // cherche si un utilisateur utilise déjà cet adresse mail
    User.findOne({ email: req.body.email })
        .then(user => {
            //si aucun utilisateur trouvé
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // si un utilisateur est trouvé, il compare le hash du mot de passe enregistré, et celui de la requête.
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // si mdp incorrect
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //utilisateur authentifié
                    res.status(200).json({
                        userId: user._id,
                        //assignation d'un token aux utilisateurs authentifiés, cela les autorisent à utiliser les routes, CRUD, ...
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };