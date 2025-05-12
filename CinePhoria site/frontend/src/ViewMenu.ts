// ViewMenu.ts
import { userDataController, ProfilUtilisateur } from './DataControllerUser.js';
// On suppose qu'il existe un localStorage key = "jwtToken" pour vérifier la connexion
import { login, logout } from './Login.js'; // si vous avez besoin de l’appeler
import { onClickContact } from './ViewContact.js';
// Ou tout autre endroit où est définie la fonction login()


/**
 * Chargement des items de menus en fonction du profil
 */
export async function chargerMenu() {
  console.log("===== chargerMenu");

  // 1) Identifier le profil
  const profil = userDataController.profil();
  console.log("Profil charge depuis global= ", profil);

  // 2) Récupérer l’élément .header pour changer son background
  const header = document.querySelector('.header') as HTMLElement | null;
  if (!header) {
    console.warn('Aucun élément .header trouvé');
    return;
  }

  const logoHeader = document.querySelector('.nav__logo-img') as HTMLImageElement;

  // 3) Construire le menu selon le profil
  switch (profil) {
    case ProfilUtilisateur.Visiteur:
      // a) Menu  (Réservation, Films, Contact, Connexion)
      buildMenuVisiteur();

      // b) Couleur de fond
      header.style.background = 'linear-gradient(90deg, #F8F8FF 0%, #999999 100%)';
      break;

    case ProfilUtilisateur.Utilisateur: {
      // a) Vérifier la présence d’un jeton JWT
      const jwtToken = localStorage.getItem('jwtAccessToken');
      if (!jwtToken) {
        // Pas de token => invalider + rediriger
        userDataController.invalidate();

        // const currentPage = window.location.pathname.split("/").pop();
        // if (currentPage !== "visiteur.html") {
        //   window.location.replace("visiteur.html");
        // } else {
        //   console.log("Chargement manuel de onLoadVisiteur()");
        //   onLoadVisiteur(); // Appeler directement la fonction si déjà sur la page
        // }



        window.location.href = 'visiteur.html';
        return;
      }
      // b) Construire le menu (Mes Réservations, Films, Contact, Deconnexion)
      buildMenuUtilisateur();

      // c) Couleur de fond
      header.style.background = 'linear-gradient(90deg, #F8F8FF 0%, rgba(218, 165, 32, 0.25) 100%)';
      break;
    }

    case ProfilUtilisateur.Administrateur: {
      // a) Vérifier la présence d’un jeton JWT
      const jwtToken = localStorage.getItem('jwtAccessToken');
      if (!jwtToken) {
        userDataController.invalidate();
        window.location.href = 'visiteur.html';
        return;
      }

      // b) Construire le menu administrateur
      buildMenuAdministrateur();

      // c) Couleur de fond
      header.style.background = 'linear-gradient(90deg, #F8F8FF 0%, rgba(178, 34, 34, 0.3) 100%)';

      // d) Logo
      if (!logoHeader) { console.error("Pas de logo") }
      logoHeader.src = "assets/camera-cinephoria-admin.png";
      break;
    }

    case ProfilUtilisateur.Employee: {
      // a) Vérifier la présence d’un jeton JWT
      const jwtToken = localStorage.getItem('jwtAccessToken');
      if (!jwtToken) {
        userDataController.invalidate();
        window.location.href = 'visiteur.html';
        return;
      }

      // b) Construire le menu employé
      buildMenuEmploye();

      // c) Couleur de fond
      header.style.background = 'linear-gradient(90deg, #F8F8FF 0%, rgba(34, 139, 34, 0.25) 100%)';

      // d) Logo
      if (!logoHeader) { console.error("Pas de logo") }
      logoHeader.src = "assets/camera-cinephoria-employe.png";
      break;
    }

    default:
      console.error('Profil inconnu, on considère Visiteur');
      buildMenuVisiteur();
      header.style.background = 'linear-gradient(90deg, #F8F8FF 0%, #999999 100%)';
      break;
  }
}

/**
 * Menu du Visiteur :
 *  - Réservation -> reservation.html
 *  - Films -> films.html
 *  - Contact -> contact.html
 *  - Connexion -> exécuter login() ou rediriger
 */
function buildMenuVisiteur(): void {
  // On cible les nav :
  const navActions = document.querySelector('.nav__actions') as HTMLElement | null;
  const mobileNav = document.querySelector('.mobile-menu__nav') as HTMLElement | null;

  if (!navActions || !mobileNav) return;

  // Vider le contenu existant
  navActions.innerHTML = '';
  mobileNav.innerHTML = '';

  // Construire les boutons
  const btnReservation = createLinkButton('Réservation', 'reservation.html');
  const btnFilms = createLinkButton('Films', 'films.html');
  const btnContact = createActionButton('Contact');
  const btnConnexion = createActionButton('Connexion');
  btnConnexion.classList.add('nav__actions-button--signin');

  const actionContact =  (ev: MouseEvent) => {
        ev.preventDefault();
        onClickContact();
        const mobileMenu = document.getElementById('mobileMenu')
        if (mobileMenu) mobileMenu.classList.remove('mobile-menu--open');
      };
  const actionConnexion = () => {
        login('Saisissez votre email et votre mot de passe', true);
        const mobileMenu = document.getElementById('mobileMenu')
        if (mobileMenu) mobileMenu.classList.remove('mobile-menu--open');
      };


  // Clonage avec ré-attachement des listeners
  function cloneWithListeners(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement;
    if (source.textContent?.includes('Contact')) {
      clone.addEventListener('click', (ev) => actionContact );
    } else if (source.textContent?.includes('Connexion')) {
      clone.addEventListener('click', actionConnexion );
    }
    return clone;
  }

  // Ajouter dans .nav__actions
  navActions.append(btnReservation, btnFilms, btnContact, btnConnexion);
  btnContact.addEventListener('click', actionContact);
  btnConnexion.addEventListener('click', actionConnexion);

  // Ajouter dans .mobile-menu__nav avec gestion des listeners
  mobileNav.append(
    cloneWithListeners(btnReservation),
    cloneWithListeners(btnFilms),
    cloneWithListeners(btnContact),
    cloneWithListeners(btnConnexion)
  );
}

/**
 * Menu de l'Utilisateur :
 *  - Mes Réservations -> mesreservations.html
 *  - Films -> films.html
 *  - Contact -> contact.html
 *  - Deconnexion -> supprime jwt + visiteur.html
 */
function buildMenuUtilisateur(): void {
  const navActions = document.querySelector('.nav__actions') as HTMLElement | null;
  const mobileNav = document.querySelector('.mobile-menu__nav') as HTMLElement | null;
  if (!navActions || !mobileNav) return;

  navActions.innerHTML = '';
  mobileNav.innerHTML = '';

  const btnMesResa = createLinkButton('Mes Réservations', 'mesreservations.html');
  const btnReserve = createLinkButton('Reservation', 'reservation.html');
  const btnFilms = createLinkButton('Films', 'films.html');
  const btnContact = createActionButton('Contact');
  // Bouton Déconnexion stylisé à partir des initiales
  const btnDeconnexion = createActionButton('Déconnexion');
  btnDeconnexion.classList.add('nav__actions-button--signin');

  const actionContact = (ev: MouseEvent) => {
        ev.preventDefault();
        onClickContact();
        const mobileMenu = document.getElementById('mobileMenu')
        if (mobileMenu) mobileMenu.classList.remove('mobile-menu--open');
      }

  const actionDeconnexion =  async (ev: MouseEvent) => {
        ev.preventDefault();
        await logout();
        const mobileMenu = document.getElementById('mobileMenu')
        if (mobileMenu) mobileMenu.classList.remove('mobile-menu--open');
      }

  // Clonage avec ré-attachement des listeners
  function cloneWithListeners(source: HTMLElement): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement;
    if (source.textContent?.includes('Contact')) {
      clone.addEventListener('click', actionContact);
    } else if (source.textContent?.includes('Déconnexion')) {
      clone.addEventListener('click',actionDeconnexion);
    }
    return clone;
  }

  // nav__actions
  navActions.append(btnMesResa, btnReserve, btnFilms, btnContact, btnDeconnexion);
  btnContact.addEventListener('click', actionContact);
  btnDeconnexion.addEventListener('click', actionDeconnexion);

  // Ajouter dans .mobile-menu__nav avec gestion des listeners
  mobileNav.append(
    cloneWithListeners(btnMesResa),
    cloneWithListeners(btnReserve),
    cloneWithListeners(btnFilms),
    cloneWithListeners(btnContact),
    cloneWithListeners(btnDeconnexion)
  );
}

/**
 * Menu de l'Administrateur :
 *   - Vérif jeton déjà faite
 *   - Intranet (sous-menu)
 *     -> Gérer les films (manageFilm.html)
 *     -> Gérer les salles (manageSalle.html)
 *     -> Gérer les comptes employés (manageEmployes.html)
 *   - Deconnexion
 */
function buildMenuAdministrateur(): void {
  const navActions = document.querySelector('.nav__actions');
  const mobileNav = document.querySelector('.mobile-menu__nav');
  if (!navActions || !mobileNav) return;

  navActions.innerHTML = '';
  mobileNav.innerHTML = '';

  // Bouton Intranet + sous-menu
  const intranetButton = buildIntranetMenuAdmin();

  // Bouton Deconnexion
  const initials = getUserInitials();
  const btnDeconnexion = document.createElement('button');
  btnDeconnexion.classList.add('nav__actions-button', 'nav__actions-button--signin');
  btnDeconnexion.textContent = initials;
  btnDeconnexion.addEventListener('click', () => {
    logout();
  });

  navActions.append(intranetButton, btnDeconnexion);
  mobileNav.append(intranetButton.cloneNode(true), btnDeconnexion.cloneNode(true));
}

/**
 * Menu de l'Employé :
 *  - Intranet (sous-menu)
 *    -> Gérer les films (manageFilms.html)
 *    -> Gérer les salles (manageSalles.html)
 *    -> Gérer les séances (manageSeances.html)
 *    -> Modérer les avis (moderer.html)
 *  - Deconnexion
 */
function buildMenuEmploye(): void {
  const navActions = document.querySelector('.nav__actions');
  const mobileNav = document.querySelector('.mobile-menu__nav');
  if (!navActions || !mobileNav) return;

  navActions.innerHTML = '';
  mobileNav.innerHTML = '';

  // Bouton Intranet + sous-menu
  const intranetButton = buildIntranetMenuEmploye();

  // Bouton Deconnexion
  const initials = getUserInitials();
  const btnDeconnexion = document.createElement('button');
  btnDeconnexion.classList.add('nav__actions-button', 'nav__actions-button--signin');
  btnDeconnexion.textContent = initials;
  btnDeconnexion.addEventListener('click', () => {
    logout();
  });

  navActions.append(intranetButton, btnDeconnexion);
  mobileNav.append(intranetButton.cloneNode(true), btnDeconnexion.cloneNode(true));
}

/**
 * Construit le sous-menu Intranet pour l'Administrateur
 */
function buildIntranetMenuAdmin(): HTMLElement {
  // Bouton principal "Intranet"
  const container = document.createElement('div');
  container.style.position = 'relative'; // pour positionner le sous-menu
  // Par exemple, un simple bouton
  const mainBtn = document.createElement('button');
  mainBtn.textContent = 'Intranet';
  mainBtn.classList.add('nav__actions-button', 'nav__actions-button--link');

  // Sous-menu
  const subMenu = document.createElement('div');
  subMenu.style.display = 'none'; // masqué par défaut
  subMenu.style.position = 'absolute';
  subMenu.style.zIndex = '1000'; // Assure que le sous-menu passe au-dessus des autres éléments
  subMenu.style.top = '100%';
  subMenu.style.left = '0';
  subMenu.style.backgroundColor = '#F8F8FF';
  subMenu.style.border = '1px solid #999';
  // Ajout des items
  const item1 = createLevel2Item('Modérer les avis', 'manageAvis.html');
  const item2 = createLevel2Item('Gérer les films', 'manageFilms.html');
  const item3 = createLevel2Item('Gérer les salles', 'manageSalles.html');
  const item4 = createLevel2Item('Gérer les comptes employés', 'manageEmployes.html');
  const item5 = createLevel2Item('Dashboard', 'dashboard.html');

  subMenu.append(item1, item2, item3, item4, item5);

  // Au survol ou clic, on affiche
  mainBtn.addEventListener('mouseover', () => {
    subMenu.style.display = 'block';
  });
  mainBtn.addEventListener('mouseout', (ev: MouseEvent) => {
    // Vérifier si on survole le sous-menu
    const related = ev.relatedTarget as HTMLElement;
    if (!subMenu.contains(related)) {
      subMenu.style.display = 'none';
    }
  });
  // Fermer le sous-menu quand on quitte le sous-menu
  subMenu.addEventListener('mouseleave', () => {
    subMenu.style.display = 'none';
  });

  container.append(mainBtn, subMenu);
  return container;
}

/**
 * Construit le sous-menu Intranet pour l'Employé
 */
function buildIntranetMenuEmploye(): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'relative';

  const mainBtn = document.createElement('button');
  mainBtn.textContent = 'Intranet';
  mainBtn.classList.add('nav__actions-button', 'nav__actions-button--link');

  const subMenu = document.createElement('div');
  subMenu.style.display = 'none';
  subMenu.style.position = 'absolute';
  subMenu.style.zIndex = '1000'; // Assure que le sous-menu passe au-dessus des autres éléments
  subMenu.style.top = '100%';
  subMenu.style.left = '0';
  subMenu.style.backgroundColor = '#F8F8FF';
  subMenu.style.border = '1px solid #999';

  const item1 = createLevel2Item('Gérer les films', 'manageFilms.html');
  const item2 = createLevel2Item('Gérer les salles', 'manageSalles.html');
  const item3 = createLevel2Item('Gérer les séances', 'manageSeances.html');
  const item4 = createLevel2Item('Moderer les avis', 'manageAvis.html');

  subMenu.append(item1, item2, item3, item4);

  mainBtn.addEventListener('mouseover', () => {
    subMenu.style.display = 'block';
  });
  mainBtn.addEventListener('mouseout', (ev: MouseEvent) => {
    const related = ev.relatedTarget as HTMLElement;
    if (!subMenu.contains(related)) {
      subMenu.style.display = 'none';
    }
  });
  subMenu.addEventListener('mouseleave', () => {
    subMenu.style.display = 'none';
  });

  container.append(mainBtn, subMenu);
  return container;
}

/**
 * Crée un bouton-lien pour le menu (Visiteur/Utilisateur)
 */
function createLinkButton(label: string, href: string): HTMLElement {
  const a = document.createElement('a');
  a.classList.add('nav__actions-button', 'nav__actions-button--link');
  a.textContent = label;
  a.href = href;
  return a;
}

/**
 * Crée un bouton-action pour le menu (Visiteur/Utilisateur)
 */
function createActionButton(label: string): HTMLElement {
  const btn = document.createElement('button');
  btn.classList.add('nav__actions-button', 'nav__actions-button--link');
  btn.textContent = label;
  return btn;
}

/**
 * Récupère les initiales depuis userDataController.displayName?
 */
function getUserInitials(): string {
  const c = userDataController.compte();
  const displayName = c?.utilisateurDisplayName || '??';
  const parts = displayName.trim().split(' ');
  let initials = '';
  parts.forEach((p) => {
    if (p.length > 0) initials += p[0].toUpperCase();
  });
  if (initials.length === 0) {
    initials = displayName.slice(0, 2).toUpperCase();
  }
  if (initials === '?') initials = "Déconnexion"
  return initials;
}

/**
 * Crée un item "niveau 2" (tel que spécifié) pour le sous-menu d’admin/employé.
 */
function createLevel2Item(label: string, href: string): HTMLDivElement {
  const divItem = document.createElement('div');
  divItem.classList.add('submenu-level2-item'); // On appliquera le style CSS
  // On peut y mettre un <a> ou juste un <p> cliquable
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.style.textDecoration = 'none';
  a.style.color = '#000000'; // ex. noir
  // Ajustez si besoin

  divItem.appendChild(a);
  // Gérer survol (hover) en CSS (ou JS)
  return divItem;
}

// document.addEventListener('DOMContentLoaded', chargerMenu);

document.addEventListener('click', function (e) {
  const mobileMenu = document.getElementById('mobileMenu') as HTMLElement | null;
  const menuButton = document.getElementById('navMobileMenu');
  const menuClose = document.getElementById('mobileMenuClose');

  if (!mobileMenu || !mobileMenu.classList.contains('mobile-menu--open')) return;

  // Si on clique sur le bouton menu ou bouton close, ne rien faire ici
  if (menuButton?.contains(e.target as Node) || menuClose?.contains(e.target as Node)) return;

  // Si le clic n'est pas dans le menu, on le ferme
  if (!mobileMenu.contains(e.target as Node)) {
    mobileMenu.classList.remove('mobile-menu--open');
  }
});