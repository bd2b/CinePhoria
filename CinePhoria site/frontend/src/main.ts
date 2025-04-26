// Point de chargement du module Global
import "./Global.js";

const handleMobileMenu = () => {
    const navMobileMenu = document.getElementById('navMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    const openMenu = () => {
        mobileMenu?.classList.add('mobile-menu--open');
    };

    const closeMenu = () => {
        mobileMenu?.classList.remove('mobile-menu--open');
    };

    navMobileMenu?.addEventListener('click', openMenu);
    mobileMenuClose?.addEventListener('click', closeMenu);    

}

const animateMainContent = () => {
    // Déclare les types explicitement
    type AnimatableElement =
        | { selector: string; transform: boolean }
        | { element: HTMLElement; transform: boolean };

    const elementsToAnimate: AnimatableElement[] = [
        { selector: ".container__filmsreservation", transform: false },
        ...Array.from(document.querySelectorAll<HTMLElement>(".container__filmsreservation")).map((feature) => ({
            element: feature,
            transform: true,
        })),
    ];

    // Typage pour animateElement
    const animateElement = (element: HTMLElement, delay = 0, transform = false) => {
        setTimeout(() => {
            element.style.opacity = "1"; // Type string pour `opacity`
            if (transform) {
                element.style.transform = "translateY(0)";
            }
        }, delay);
    };

    elementsToAnimate.forEach((item, index) => {
        // Vérifie si `item` contient un `element` ou un `selector`
        const element = "element" in item ? item.element : document.querySelector<HTMLElement>(item.selector);
        if (element) {
            animateElement(element, index * 50, item.transform);
        }
    });
};

 handleMobileMenu();
 animateMainContent();
