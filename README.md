# 📔 Journal Mémoire (Vocal & Clavier) - Application Android

Une application mobile personnelle de **Journal intime et Carnet de souvenirs**, conçue pour capturer vos journées instantanément à la **voix** (dictée vocale en français + note audio) ou au **clavier**, 100% gratuite, sans publicité, sans abonnement, et totalement privée (hors-ligne).

---

## ✨ Fonctionnalités Principales

1. **🎙️ Saisie Vocale & Dictée Instantanée** :
   - Reconnaissance vocale en direct en français (`Speech-to-Text`) : vous parlez, le texte s'écrit tout seul.
   - Commandes vocales de ponctuation automatique (*"point"*, *"virgule"*, *"à la ligne"*, *"point d'interrogation"*, etc.).
   - Possibilité de conserver la note vocale audio originale pour réécouter votre voix à tout moment.
   - Onde sonore animée en temps réel pendant la parole.

2. **✍️ Saisie Clavier & Édition Riche** :
   - Titre, récit détaillé, compteur de mots.
   - Sélecteur d'humeur émotionnelle (😊 Heureux, 😌 Paisible, ⚡ Énergique, 💖 Reconnaissant, 🤔 Pensif, 😴 Fatigué, 😢 Triste, 🤯 Débordé).
   - Catégories et tags personnalisables (*Quotidien*, *Famille*, *Travail*, *Voyage*, *Santé*, *Idée*, *Gratitude*...).
   - Ajout de photos souvenirs avec prévisualisation.

3. **📅 Organisation & Consultation** :
   - **Vue Journal (Fil chronologique)** : cartes visuelles élégantes, lecteur audio intégré, affichage des photos, favoris (★).
   - **Vue Calendrier** : calendrier mensuel interactif avec pastilles pour chaque jour ayant un souvenir.
   - **Recherche instantanée** : par mots-clés, thèmes, lieux ou humeurs.

4. **📊 Statistiques & Rétrospective** :
   - Série de jours consécutifs d'écriture (*streak*).
   - Total de souvenirs et nombre de mots écrits.
   - Répartition des humeurs.
   - Section *"Ce jour-là dans le passé"* pour redécouvrir d'anciens moments.

5. **🔒 Confidentialité & Sauvegarde 100% Locale** :
   - Toutes les données sont stockées dans votre appareil (`IndexedDB`). Rien n'est envoyé sur des serveurs distants.
   - Code PIN à 4 chiffres optionnel pour verrouiller l'accès à votre journal.
   - Exportation complète de secours en fichier JSON en 1 clic.
   - Restauration facile en cas de changement d'appareil.

---

## 🚀 Comment lancer l'application

### Méthode 1 (La plus simple) :
Double-cliquez sur le fichier **`Lancer-Journal.bat`**.

### Méthode 2 (En ligne de commande) :
Ouvrez un terminal dans ce dossier et tapez :
```bash
python server.py
```

L'application s'ouvrira automatiquement sur votre navigateur PC : `http://localhost:8000`.

---

## 📱 Comment installer l'application sur votre smartphone Android

1. Assurez-vous que votre téléphone Android et votre ordinateur sont connectés au **même réseau Wi-Fi**.
2. Lorsque vous lancez `server.py` ou `Lancer-Journal.bat`, le terminal affiche l'adresse réseau de votre machine (par exemple `http://192.168.1.XX:8000`).
3. Sur votre téléphone Android, ouvrez **Google Chrome** et tapez cette adresse.
4. Appuyez sur le menu de Chrome (**les 3 points verticaux ⋮** en haut à droite).
5. Appuyez sur **« Installer l'application »** ou **« Ajouter à l'écran d'accueil »**.
6. L'application est installée sur votre écran d'accueil avec son icône dédiée et fonctionne en **plein écran** comme une vraie application native du Play Store !

---

## 📦 Optionnel : Générer un fichier `.apk` autonome
Si vous souhaitez un fichier `.apk` distribuable :
1. Rendez-vous sur [PWABuilder](https://www.pwabuilder.com/).
2. Entrez l'URL de votre application (ou utilisez Capacitor avec `npm install @capacitor/core @capacitor/cli @capacitor/android`).
3. PWABuilder génère directement un fichier APK signé pour Android.
