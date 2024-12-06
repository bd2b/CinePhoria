const handleMobileMenu = () => {
    const navMobileMenu = document.getElementById('navMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    const openMenu = () => {
        mobileMenu.classList.add('mobile-menu--open');
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('mobile-menu--open');
    };

    navMobileMenu.addEventListener('click', openMenu);
    mobileMenuClose.addEventListener('click', closeMenu);    

}

const animateMainContent = () => {
    const elementsToAnimate = [
        {selector: ".container__filmsreservation", transform: false},
        ...Array.from(document.querySelectorAll(".container__filmsreservation")).map((feature) => ({
            element: feature,
            transform: true
        }))
        
    ];
    const animateElement = (element, delay = 0, transform = false) => {
        setTimeout(() => {
            element.style.opacity = 1;
            if (transform) {
                element.style.transform = "translateY(0)";
            }
        }, delay);
    };

    elementsToAnimate.forEach((item, index) => {
        const element = item.element || document.querySelector(item.selector);
        if (element) {
            animateElement(element, index * 50, item.transform);
        }
    })
        
}

handleMobileMenu();
animateMainContent();
