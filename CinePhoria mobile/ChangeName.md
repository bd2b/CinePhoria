Voici les étapes détaillées pour changer le nom d’une application iOS dans un projet Swift ou Objective-C, de manière correcte et complète.

# Étape 1 : Changer le Nom Affiché sur l’Écran d’Accueil

	1.	Ouvrez votre projet dans Xcode.
	2.	Accédez au fichier Info.plist.
	3.	Recherchez la clé CFBundleDisplayName.

Si elle n’existe pas, ajoutez-la manuellement :

<key>CFBundleDisplayName</key>
<string>NouveauNomApp</string>


	4.	Remplacez la valeur actuelle par le nouveau nom de l’application :

<string>MonNouvelleApp</string>


	5.	Enregistrez les modifications.

	Note : Ce nom est ce qui apparaîtra sous l’icône de l’application sur l’écran d’accueil.

# Étape 2 : Changer le Nom du Projet (Facultatif)

	1.	Renommez le Projet dans Xcode :
	•	Cliquez sur le nom du projet dans le navigateur de projet (panneau de gauche dans Xcode).
	•	Appuyez sur Enter pour le renommer.
	•	Xcode vous demandera si vous voulez mettre à jour les références et les chemins associés. Cliquez sur Rename.
	2.	Assurez-vous que Tout Fonctionne :
	•	Xcode mettra à jour les fichiers du projet et les chemins d’accès.
	•	Testez le projet pour vérifier qu’il n’y a pas de problèmes liés au renommage.

# Étape 3 : Mettre à Jour le Bundle Identifier (Si Nécessaire)

Si le changement de nom nécessite de modifier l’identifiant unique de l’application (par exemple, pour un nouveau déploiement sur l’App Store) :
	1.	Allez dans les Paramètres de la Cible (Target) :
	•	Cliquez sur le projet dans la barre latérale.
	•	Sélectionnez l’onglet General.
	2.	Modifiez le Bundle Identifier :
	•	Dans la section Identity, changez le Bundle Identifier pour refléter le nouveau nom. Exemple :

com.votreEntreprise.NouveauNomApp


	3.	Mettez à Jour Vos Services :
	•	Si vous utilisez des services comme Firebase, Push Notifications ou autres, vous devrez les reconfigurer pour correspondre au nouveau Bundle Identifier.

# Étape 4 : Changer les Icônes et Ressources Visuelles (Facultatif)

	1.	Mettre à Jour les Icônes :
	•	Accédez à Assets.xcassets.
	•	Remplacez les icônes existantes par les nouvelles (format PNG, dimensions correctes pour chaque taille requise).
	•	Assurez-vous que toutes les variantes (iPhone, iPad, etc.) sont couvertes.
	2.	Mettre à Jour l’Écran de Lancement (LaunchScreen.storyboard) :
	•	Ouvrez LaunchScreen.storyboard.
	•	Modifiez le texte, les images ou les couleurs pour refléter le nouveau nom de l’application.

# Étape 5 : Nettoyer et Tester le Projet

	1.	Supprimez l’Ancienne Version de l’App :
	•	Supprimez l’ancienne version de l’application du simulateur ou de votre appareil pour éviter les conflits de cache.
	•	Lancez un build propre dans Xcode :

Command + Shift + K


	2.	Testez l’Application :
	•	Exécutez l’application sur un simulateur ou un appareil pour vérifier que tout fonctionne correctement, y compris le nouveau nom.

# Étape 6 : Soumettre à l’App Store (Si Nécessaire)

	1.	Connectez-vous à App Store Connect :
	•	Si le Bundle Identifier a été modifié, créez une nouvelle application dans App Store Connect avec le nouveau Bundle Identifier.
	2.	Soumettez la Nouvelle Version :
	•	Utilisez Xcode pour archiver et soumettre l’application :
	•	Menu Product > Archive.
	•	Une fois l’archive prête, choisissez Distribute App et suivez les étapes.

# Étape 7 : (Optionnel) Nettoyer l’Historique Git

Si vous utilisez Git et avez changé le nom du projet, nettoyez les références des fichiers supprimés ou modifiés.
	1.	Vérifiez les Changements :

git status


	2.	Ajoutez et Commitez les Modifications :

git add .
git commit -m "Renommage du projet en NouveauNomApp"
git push origin main

Résultat Attendu

	•	Le nom affiché sur l’écran d’accueil est modifié.
	•	Les paramètres du projet sont mis à jour pour refléter le nouveau nom.
	•	Les ressources visuelles sont adaptées si nécessaire.
	•	L’application peut être re-soumise à l’App Store sous le nouveau nom.

Si vous rencontrez des problèmes ou des erreurs spécifiques pendant le processus, n’hésitez pas à demander. 😊
