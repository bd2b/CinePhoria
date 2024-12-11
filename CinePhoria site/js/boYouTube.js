// Sélection des éléments
const openModalBtn = document.getElementById('openModal');
const modal = document.getElementById('videoModal');
const closeModalBtn = modal.querySelector('.close');
const youtubeVideo = document.getElementById('youtubeVideo');

// URL de la vidéo YouTube
const youtubeUrl = 'https://www.youtube.com/embed/Q0EiAfDmqx0'; // Remplacez par votre URL

// Fonction pour ouvrir la modal
openModalBtn.addEventListener('click', () => {
  modal.style.display = 'flex'; // Affiche la modal
  youtubeVideo.src = `${youtubeUrl}?autoplay=1`; // Charge et lit la vidéo
});

// Fonction pour fermer la modal
const closeModal = () => {
  modal.style.display = 'none'; // Masque la modal
  youtubeVideo.src = ''; // Arrête la vidéo
};

closeModalBtn.addEventListener('click', closeModal);

// Fermer la modal en cliquant en dehors du contenu
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});