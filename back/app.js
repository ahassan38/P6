const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();
require('dotenv').config();

//middleware express et helmet
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site"}
}));

//Middleware pour limiter le nombre de requêtes effectuées
const limiter = rateLimit({
  window: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

//connexion a la base de données mongoose atlas via variables d'environnements
mongoose.connect("mongodb+srv://" +
process.env.MONGO_DB_USER +
":" +
process.env.MONGO_DB_USER_MDP +
"@cluster0.znayied.mongodb.net/" +
process.env.MONGO_DB_MARQUE,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie'))
    .catch(() => console.log('Connexion à MongoDB échouée'));



// Le CORS définit comment les serveurs et les navigateurs interagissent, en spécifiant quelles ressources peuvent être demandées de manière légitime
// Pour permettre des requêtes cross-origin (et empêcher des erreurs CORS), des headers spécifiques de contrôle d'accès doivent être précisés pour tous vos objets de réponse
app.use((req, res, next) => {
  //droit d'accès à tous "*"
    res.setHeader('Access-Control-Allow-Origin', '*');
  //headers acceptés 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //méthodes acceptées  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//routes
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//appel de la constante body-parser
app.use(bodyParser.json());
//route pour les images
app.use('/images', express.static(path.join(__dirname, 'images')));
//routes sauces et user
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);


//exportation pour pouvoir accéder a app depuis d'autres fichiers
module.exports = app;