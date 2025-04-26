// Point de chargement du module Global
import "./Global.js";
const handleMobileMenu = () => {
    const navMobileMenu = document.getElementById('navMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const openMenu = () => {
        mobileMenu === null || mobileMenu === void 0 ? void 0 : mobileMenu.classList.add('mobile-menu--open');
    };
    const closeMenu = () => {
        mobileMenu === null || mobileMenu === void 0 ? void 0 : mobileMenu.classList.remove('mobile-menu--open');
    };
    navMobileMenu === null || navMobileMenu === void 0 ? void 0 : navMobileMenu.addEventListener('click', openMenu);
    mobileMenuClose === null || mobileMenuClose === void 0 ? void 0 : mobileMenuClose.addEventListener('click', closeMenu);
};
const animateMainContent = () => {
    const elementsToAnimate = [
        { selector: ".container__filmsreservation", transform: false },
        ...Array.from(document.querySelectorAll(".container__filmsreservation")).map((feature) => ({
            element: feature,
            transform: true,
        })),
    ];
    // Typage pour animateElement
    const animateElement = (element, delay = 0, transform = false) => {
        setTimeout(() => {
            element.style.opacity = "1"; // Type string pour `opacity`
            if (transform) {
                element.style.transform = "translateY(0)";
            }
        }, delay);
    };
    elementsToAnimate.forEach((item, index) => {
        // Vérifie si `item` contient un `element` ou un `selector`
        const element = "element" in item ? item.element : document.querySelector(item.selector);
        if (element) {
            animateElement(element, index * 50, item.transform);
        }
    });
};
handleMobileMenu();
animateMainContent();
