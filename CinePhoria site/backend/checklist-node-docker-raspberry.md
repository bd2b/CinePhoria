## ✅ Checklist de préparation de l’environnement Node.js sur Raspberry Pi

Avant de lancer le build Docker, suivez ces étapes pour garantir un environnement propre et compatible avec les dépendances Node.js modernes.

### 🔥 1. Supprimer Node.js et NPM installés via APT

```bash
sudo apt purge nodejs npm -y
sudo apt autoremove -y
sudo rm -rf /usr/bin/node /usr/bin/npm
```

---

### 📦 2. Installer Node.js via `n` (Node Version Manager)

```bash
sudo npm install -g n
sudo n stable   # ou sudo n 20.19.1 pour figer la version
exec $SHELL
```

---

### 🧪 3. Vérifier l’installation de Node et NPM

```bash
node -v
npm -v
which node
which npm
```

✅ Attendu :

- Node : `v20.x.x`
- NPM : `v10+`
- Chemins : `/usr/local/bin/node` et `/usr/local/bin/npm`

---

### 📁 4. Installer les dépendances du projet

Depuis le dossier `/srv/cinephoria/app` :

```bash
npm install
```

Cela crée un dossier `node_modules` complet prêt à être copié dans le conteneur Docker.

---

### 🐳 5. Construire le conteneur Docker avec les dépendances locales

Vérifiez que le `Dockerfile` contient :

```dockerfile
COPY node_modules ./node_modules
```

Puis exécutez :

```bash
docker compose build node
docker compose up -d node
```

---

### ✅ Résultat attendu

- L’image Docker fonctionne sans accès Internet
- Tous les modules Node.js sont présents dans l’image
- Le serveur démarre et expose les routes Express

---


