//appel de jsonwebtoken
const jwt = require('jsonwebtoken');
//exportation de la requête
module.exports = (req, res, next) => {
    try {
        // on utilise le header authorization de la requete (CORS) on split le tableau et on récupère l'élément à l'indice 1 (Bearer Token)
        const token = req.headers.authorization.split(' ')[1];
        //décoder le token en vérifiant qu'il correspond à sa clef 
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        //récupération du user id décodé
        const userId = decodedToken.userId;
        //ajout de l'objet userId à l'objet requête
        req.auth = {
            userId: userId
        }; 
    next();
    } catch(error) {
        res.status(401).json({
            error: new Error("Invalid request!"),
    });
    }
};