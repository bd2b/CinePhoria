# Installation de Bootstrap

## Téléchargement de bootstrap et construction de l'arborescence suivante 
Bootstrap est dans node_modules en prévision de l'installation de node.js
Seuls les répertoires scss et js sont conservés

├── assets
├── boilerplateBootstrap.html
├── components
│   └── tableautarif.html
├── css
│   ├── components
│   ├── custom-bootstrap.css
│   ├── custom-bootstrap.css.map
│   ├── global.css
│   ├── responsive.css
│   ├── sections
│   │   ├── footer.css
│   │   ├── header.css
│   │   ├── main-reservation.css
│   │   ├── main-visiteur.css
│   │   ├── main.css
│   │   └── reservation-panel.css
│   └── style.css
├── error.log
├── js
│   └── main.js
├── node_modules
│   └── bootstrap
│       ├── js
│       └── scss
├── readme
│   └── bootstrap.md
├── reservation.html
├── saas
│   ├── sass
├── scss
│   └── custom-bootstrap.scss
├── tutopadmarg.html
└── visiteur.html



# Customisation
## Mise en place de scss/custom-bootstrap.scss
Cela contient l'ajustement des parametres de bootstrap pour le site
```scss
// Customisation CinePhoria

// Map avec les couleurs par defaut
$theme-colors: (
  "primary": #2C3E50,
  "secondary": #F8F8FF,
  "tertiary": #C0C0C0,
  "success": #228B22,
  "danger": #B22222
);

// Ajout de 3 couleurs spécifiques
$custom-colors: (
  "accent": #DAA520,
  "bodybg": #E0E0E0,
  "bodyfg": #2C3E50
);

// Merge the maps
$theme-colors: map-merge($theme-colors, $custom-colors);

// Import de l'ensemble de bootstrap
@import "../node_modules/bootstrap/scss/bootstrap";
```
## Compilation
./saas/sass scss/custom-bootstrap.scss css/custom-bootstrap.css

Beaucoup de warning sur l'obsolescence de import...
Mais le fichier css/custom-bootstrap.css est généré avec les valeurs paramétrées

# Personnalisation du boilerplate
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boilerplate Bootstrap</title>
  <!-- CSS de base Bootstrap -->
  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
  <!-- CSS personnalisé -->
  <link rel="stylesheet" href="css/custom-bootstrap.css">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-primary bg-primary">
    <a class="navbar-brand text-light" href="#">Ma NavBar</a>
  </nav>

  <div class="container mt-5">
    <h1 class="text-primary">Bienvenue dans mon projet</h1>

    <h2 class="test-primary">Couleurs surchargées</h2>
    <p class="text-primary">Ce texte utilise la couleur primaire personnalisée.</p>
    <p class="text-secondary">Ce texte utilise la couleur secondary personnalisée.</p>
    <p class="text-tertiary">Ce texte utilise la couleur tertiairy personnalisée.</p>
    <p class="text-success">Ce texte utilise la couleur success personnalisée.</p>
    <p class="text-danger">Ce texte utilise la couleur danger personnalisée.</p>
    
    <h2 class="test-primary">Couleurs ajoutées</h2>
    <p class="text-accent">Ce texte utilise la couleur accent personnalisée.</p>
    <p class="text-bodybg">Ce texte utilise la couleur bodybg personnalisée.</p>
    <p class="text-bodyfg">Ce texte utilise la couleur bodyfg personnalisée.</p> 
  </div>

  <!-- JS de Bootstrap -->
  <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```
# Conclusion
Apres de nombreux efforts, compilation Saas du fichier custom-bootstrap.scss
De nombreux warning mais le fichier est bien généré custom-bootstrap.css

## Solution regardée :
https://lingtalfi.com/bootstrap4-color-generator
On genere un fichier CSS par couleur modifiée

## Solution vue sur stackOverflow

```scss
// required to get $orange variable
@import "functions"; 
@import "variables";

$primary: $orange; // set the $primary variable

// merge with existing $theme-colors map
$theme-colors: map-merge($theme-colors, (
  "primary": $primary
));

// set changes
@import "bootstrap";
```

# Memo
## container
    .container : il définit une largeur maximale à chaque breakpoint. C’est le container par défaut,

    .container-{breakpoint} : la largeur est de 100 % jusqu'au breakpoint spécifié,

    .container-fluid : la largeur est de 100 % à tous les breakpoints.

.container : 100% 
.container-sm : 100% < 540
.container-md : 100% < 720
.container-lg : 100% < 960
.container-xl : 100% < 1140
.container-xxl : 100% < 1320
.container-fluid : 100% 

## Display
    .d-none : l’élément ne sera pas affiché à partir du plus petit breakpoint (xs), donc pas du tout,

    .d-md-none : l’élément ne sera plus affiché à partir du moment où l’on arrive sur un écran medium autrement dit ≥768px.

    none
    inline
    inline-block
    block
    grid
    table
    table-cell
    table-row
    flex
    inline-flex

## Flexbox
https://getbootstrap.com/docs/5.3/utilities/flex/

## Margin et padding
.p ou .m
    t - pour Top (en haut)
    b - pour Bottom (en bas)
    s - pour Start (à gauche)
    e - pour End (à droite)
    x - pour gauche et droite
    y - pour haut et bas
mt-5 mb-3 pt-5 pb-3 ps-3 pe-5

## Sizing
.w ou.h pour auto par defaut, 25%, 50%, 75%, 100%
w-50 ou h-100
```HTML
<div class="min-vw-100">Largeur minimum 100% de la largeur du viewport</div>
<div class="min-vh-100">Hauteur minimum 100% de la hauteur du viewport </div>
<div class="vw-100"> Largeur 100% de la largeur du viewport </div>
<div class="vh-100">Hauteur 100% de la hauteur du viewport </div>
```

# Utilisation de bootstrap
## Layouts
A l'usage, utiliser BS pour décrire les layout nécessite de placer du code de présentation dans le HTML. Si on veut éviter cela, il faut faire des extensions de class dans le CSS et compiler cela en Saas. Un peu compliqué.

Du coup, les class CSS n'utilisent pas Bootstrap.

## Modal

## Formulaire de saisie

## Tableau