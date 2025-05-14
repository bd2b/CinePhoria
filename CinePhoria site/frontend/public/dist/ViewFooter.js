var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dataController } from './DataController.js';
export function chargerCinemaSites() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log("===== chargerCinemaSites");
        const footerElement = document.getElementById('footer');
        if (!footerElement)
            return;
        footerElement.innerHTML = `
    <div class="footer__container">
        <div class="container__legal">
            <a href="#" class="container__legal-a" id="linkMentions">Mentions légales</a>
            <a href="#" class="container__legal-a" id="linkPolitique">Politique de confidentialité</a>
            <p class="container__legal-a" >&copy; 2024 - Tous droits réservés - <span id="version">1.0(4)</span></p>
        </div>
        
        <div class="container__sites" id="container__sites">  
        </div>
    </div>
  `;
        // Création de la modale vide pour mentions légales et politique
        const modal = document.createElement('div');
        modal.id = 'modalLegal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.zIndex = '1000';
        const modalContent = document.createElement('div');
        modalContent.id = 'modalLegalContent';
        modal.appendChild(modalContent);
        const closeModal = document.createElement('button');
        closeModal.textContent = 'Fermer';
        closeModal.onclick = () => modal.style.display = 'none';
        modal.appendChild(closeModal);
        document.body.appendChild(modal);
        const linkMentions = document.getElementById('linkMentions');
        const linkPolitique = document.getElementById('linkPolitique');
        if (linkMentions) {
            linkMentions.addEventListener('click', (e) => {
                e.preventDefault();
                modalContent.innerHTML = `<h1>Mentions légales</h1>
      <p>Le site cinephoria.bd2b.com est édité par BD2DB</p>
      <p>Le directeur de la publication est BD2DB cinephoria@free.fr</p>
      <p>Ce site est auto hébergé par BD2DB cinephoria@free.fr</p>
      <p>Développement du site : BD2DB cinephoria@free.fr</p>`;
                modal.style.display = 'block';
            });
        }
        if (linkPolitique) {
            linkPolitique.addEventListener('click', (e) => {
                e.preventDefault();
                modalContent.innerHTML = `<h1>Politique de confidentialité</h1>
              <h2>1 - Édition du site</h2>
<p>En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet https://cinephoria.bd2db.com l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi:
</p>
<ul>
<li>Propriétaire du site : BD2DB  - Contact : cinephoria@free.fr 

<li>Directeur de la publication : BD2DB - Contact : cinephoria@free.fr.

<li>Hébergeur : Auto hébergé par BD2DB

<li>Délégué à la protection des données : BD2DB - cinephoria@free.fr
</ul>

</p>
<h2>2 - Propriété intellectuelle et contrefaçons.</h2>

<p>BD2DB  est propriétaire des droits de propriété intellectuelle et détient les droits d’usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons.
</p>
<p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de BD2DB  .
</p>
<p>Toute exploitation non autorisée du site ou de l’un quelconque des éléments qu’il contient sera considérée comme constitutive d’une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
</p>
<h2>3 - Limitations de responsabilité.</h2>

<p>BD2DB  ne pourra être tenu pour responsable des dommages directs et indirects causés au matériel de l’utilisateur, lors de l’accès au site https://cinephoria.bd2db.com.
</p>
<p>BD2DB  décline toute responsabilité quant à l’utilisation qui pourrait être faite des informations et contenus présents sur https://cinephoria.bd2db.com.
</p>
<p>BD2DB  s’engage à sécuriser au mieux le site https://cinephoria.bd2db.com, cependant sa responsabilité ne pourra être mise en cause si des données indésirables sont importées et installées sur son site à son insu.
</p>
<p>Des espaces interactifs (espace contact ou commentaires) sont à la disposition des utilisateurs. BD2DB  se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France, en particulier aux dispositions relatives à la protection des données.
</p>
<p>Le cas échéant, BD2DB  se réserve également la possibilité de mettre en cause la responsabilité civile et/ou pénale de l’utilisateur, notamment en cas de message à caractère raciste, injurieux, diffamant, ou pornographique, quel que soit le support utilisé (texte, photographie …).
</p>
<h2>4 - CNIL et gestion des données personnelles.</h2>

<p>Conformément aux dispositions de la loi 78-17 du 6 janvier 1978 modifiée, l’utilisateur du site https://cinephoria.bd2db.com dispose d’un droit d’accès, de modification et de suppression des informations collectées. Pour exercer ce droit, envoyez un message à notre Délégué à la Protection des Données : BD2DB - cinephoria@free.fr.
</p>

<h2>5 - Liens hypertextes et cookies</h2>

<p>Le site https://cinephoria.bd2db.com contient des liens hypertextes vers d’autres sites et dégage toute responsabilité à propos de ces liens externes ou des liens créés par d’autres sites vers https://cinephoria.bd2db.com.
</p>
<p>La navigation sur le site https://cinephoria.bd2db.com est susceptible de provoquer l’installation de cookie(s) sur l’ordinateur de l’utilisateur.
</p>
<p>Un "cookie" est un fichier de petite taille qui enregistre des informations relatives à la navigation d’un utilisateur sur un site. Les données ainsi obtenues permettent d'obtenir des mesures de fréquentation, par exemple.
</p>
<p>Vous avez la possibilité d’accepter ou de refuser les cookies en modifiant les paramètres de votre navigateur. Aucun cookie ne sera déposé sans votre consentement.
</p>
<p>Les cookies sont enregistrés pour une durée maximale de 2 mois.
</p>

<h2>6 - Droit applicable et attribution de juridiction.</h2>

<p>Tout litige en relation avec l’utilisation du site https://cinephoria.bd2db.com est soumis au droit français. En dehors des cas où la loi ne le permet pas, il est fait attribution exclusive de juridiction aux tribunaux compétents de Lyon.
</p>
      
      `;
                modal.style.display = 'block';
            });
        }
        console.log(" Version connu ", JSON.stringify(dataController.version));
        majFooterVersion(((_a = dataController.version.MAJEURE) === null || _a === void 0 ? void 0 : _a.toString(10)) || '', ((_b = dataController.version.MINEURE) === null || _b === void 0 ? void 0 : _b.toString(10)) || '', ((_c = dataController.version.BUILD) === null || _c === void 0 ? void 0 : _c.toString(10)) || '');
        footerElement.offsetHeight; // Force un reflow
        try {
            const cinemas = dataController.cinemas;
            const container = document.getElementById('container__sites');
            if (!container) {
                console.log("pas de container__sites");
                return;
            }
            ;
            container.innerHTML = '';
            cinemas.forEach((cinema) => {
                const cinemaElement = document.createElement('div');
                cinemaElement.classList.add('container__site');
                cinemaElement.innerHTML = `
            <div class="site__title">
                <img src="assets/camera-150-inverse.png" alt="Logo" class="site__title-img">
                <h1 class="site__title-h1">${cinema.nameCinema}</h1>
            </div>
            <div class="site__adresse">
                <p class="site_adresse-p">${cinema.adresse}<br>${cinema.postalcode} ${cinema.ville}</p>
            </div>
            <div class="site__telephone">
                <img src="assets/tel.svg" class="site__telephone-img">
                <p class="site__telephone-p">${cinema.telCinema}</p>
            </div>
            <div class="site__seance">
                <p class="site__seance-p">${cinema.ligne1}</p>
                <p class="site__seance-p">${cinema.ligne2}</p>
            </div>
        </div>
        `;
                container.appendChild(cinemaElement);
            });
        }
        catch (error) {
            console.error('Erreur lors du chargement des cinemas', error);
        }
    });
}
export function majFooterVersion(majStr, minStr, buildStr) {
    const verstionSpan = document.getElementById("version");
    if (verstionSpan)
        verstionSpan.textContent = `${majStr}.${minStr}(${buildStr})`;
}
