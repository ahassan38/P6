const Sauces = require('../models/Sauce');
const fs = require('fs');

//créer une sauce avec l'userID de l'utilisateur
exports.createSauces = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce);
    delete saucesObject._id;
    delete saucesObject._userid;
    const sauces = new Sauces({
        ...saucesObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauces.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error }))
};

//modifier une sauce, uniquement autorisé par l'utilisateur qui l'a créée
exports.modifySauces = (req, res, next) => {
  let sauceObject = {};
  req.file ? (
      Sauces.findOne({_id: req.params.id})
          .then(sauces => {
              if(req.auth.userId !== sauces.userId){
                  res.status(403).json({message: `Non autorisé !`})
              } else {
                  const filename = sauces.imageUrl.split("/").at(-1);
                  fs.unlinkSync(`images/${filename}`)
              }
          }),
      sauceObject = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          }
      ) : sauceObject = {...req.body};
  Sauces.updateOne({_id: req.params.id},{...sauceObject, _id: req.params.id})
      .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
      .catch((error) => res.status(400).json({error}))
};

 //supprimer une sauce
 exports.deleteSauces = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id})
        .then(sauces => {
            if (sauces.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauces.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauces.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

 //afficher une seule sauce
exports.getOneSauces = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id})
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({ error }));
};
//afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauces.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

//liker/disliker une sauce
exports.likeSauces = (req, res, next) => {
  const like = req.body.like;

  //AJOUTER UN LIKE OU UN DISLIKE

  if (like === 1) {
      Sauces.findOne({ _id: req.params.id })
          .then((sauces) => {
              //On regarde si l'utilisateur n'a pas déjà liké ou disliké la sauce
              if (sauces.usersDisliked.includes(req.body.userId) || sauces.usersLiked.includes(req.body.userId)) {
                  res.status(401).json({ message: 'Opération non autorisée !'});
              } else {
                  Sauces.updateOne({ _id: req.params.id }, {
                      //Insère le userId dans le tableau usersLiked du modèle
                      $push: { usersLiked: req.body.userId },
                      //Ajoute le like
                      $inc: { likes: +1 },
              }) 
                  .then(() => res.status(200).json({ message: 'J\'aime !' }))
                  .catch((error) => res.status(400).json({ error }));
              }
          })
          .catch((error) => res.status(404).json({ error }));
  };
  if (like === -1) {
      Sauces.findOne({ _id: req.params.id })
          .then((sauces) => {
              //On regarde si l'utilisateur n'a pas déjà liké ou disliké la sauce
              if (sauces.usersDisliked.includes(req.body.userId) || sauces.usersLiked.includes(req.body.userId)) {
                  res.status(401).json({ message: 'Opération non autorisée !'});
              } else {
                  Sauces.updateOne({ _id: req.params.id }, {
                      //Insère le userId dans le tableau usersLiked du modèle
                      $push: { usersDisliked: req.body.userId },
                      //Ajoute le dislike
                      $inc: { dislikes: +1 },
              }) 
                  .then(() => res.status(200).json({ message: 'Je n\'aime pas !' }))
                  .catch((error) => res.status(400).json({ error }));
              }
          })
          .catch((error) => res.status(404).json({ error }));
  };

  //RETIRER SON LIKE OU SON DISLIKE

  if (like === 0) {
  Sauces.findOne({ _id: req.params.id })
      .then((sauces) => {
          //Regarde si le userId est déjà dans le tableau usersliked/disliked
          if (sauces.usersLiked.includes(req.body.userId)) {
              Sauces.updateOne({ _id: req.params.id }, {
                  //Retire le userId dans le tableau usersliked du modèle
                  $pull: { usersLiked: req.body.userId },
                  //Retire le likes
                  $inc: { likes: -1 },
              })
                  .then(() => res.status(200).json({ message: 'Like retiré !' }))
                  .catch((error) => res.status(400).json({ error }))
          };
          if (sauces.usersDisliked.includes(req.body.userId)) {
              Sauces.updateOne({ _id: req.params.id }, {
                  //Retire le userId dans le tableau usersDisliked du modèle
                  $pull: { usersDisliked: req.body.userId },
                  //Retire le dislikes
                  $inc: { dislikes: -1 },
              })
                  .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
                  .catch((error) => res.status(400).json({ error }))
          };
      })
      .catch((error) => res.status(404).json({ error }));
  };
};