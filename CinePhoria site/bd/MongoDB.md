** installation MongoDB
brew tap mongodb/brew

brew install mongodb-community@5.0

echo 'export PATH="/opt/homebrew/opt/mongodb-community@5.0/bin:$PATH"' >> /Users/bgrossin/.bash_profile



** Arret et démarrage de MongoDB
brew services start mongodb-community@8.0
et
brew services stop mongodb-community@8.0

** Connexion 
par defaut pas de user mot de passe
Utiliser MongoDB Compass

** BD
On se connecte avec mongosh
show dbs
Par defaut le premier use cree la BD
pour vérifier l'existence d'un objet
db.qrcodes.findOne({_id: ObjectId('67d1b8ec9b322d2af2f3e940')})



