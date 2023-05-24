const Sauces = require('../models/Sauce');
const fs = require('fs');

//créer une sauce
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

//modifier une sauce
exports.modifySauces = (req, res, next) => {
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete saucesObject._userId;
    Sauces.findOne({_id: req.params.id})
        .then((sauces) => {
            if (sauces.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauces.updateOne({ _id: req.params.id}, { ...saucesObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
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
    const sauceId = req.params.id;
    const userId = req.body.userId;
    const like = req.body.like;
    // 1. l'user like la sauce pour la 1ère fois (like === 1)
    // push le userId sur le tableau userLiked, incrémentation du like 
    if (like === 1) {
      Sauces.updateOne(
        { _id: sauceId },
        {
          $inc: { likes: like },
          $push: { usersLiked: userId },
        }
      )
        .then((sauces) => res.status(200).json({ message: "Sauce appréciée" }))
        .catch((error) => res.status(500).json({ error }));
    }
  
    // 2. l'user dislike la sauce pour la 1ére fois (like === -1)
    // push le userId sur le tableau userLiked, incrémentation du dislike
    else if (like === -1) {
      Sauces.updateOne(
        { _id: sauceId },
        {
          $inc: { dislikes: -1 * like },
          $push: { usersDisliked: userId },
        }
      )
        .then((sauces) => res.status(200).json({ message: "Sauce dépréciée" }))
        .catch((error) => res.status(500).json({ error }));
    }
    // 3. User change son avis
    // 3.1. user veut enlever son like
    else {
      Sauces.findOne({ _id: sauceId })
        .then((sauces) => {
          if (sauces.usersLiked.includes(userId)) {
            Sauces.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then((sauces) => {
                res.status(200).json({ message: "Sauce dépréciée" });
              })
              .catch((error) => res.status(500).json({ error }));
            // 3.2 user change d'avis pour dislike
          } else if (sauces.usersDisliked.includes(userId)) {
            Sauces.updateOne(
              { _id: sauceId },
              {
                $pull: { usersDisliked: userId },
                $inc: { dislikes: -1 },
              }
            )
              .then((sauces) => {
                res.status(200).json({ message: "Sauce appréciée" });
              })
              .catch((error) => res.status(500).json({ error }));
          }
        })
        .catch((error) => res.status(401).json({ error }));
    }
  };