// Carousel snap highlights logic and fallback

document.addEventListener('DOMContentLoaded', () => {
  if (window.initCarousel) window.initCarousel();
});

window.initCarousel = function initCarousel() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach(carousel => {
    // Check if browser supports container-type: scroll-state
    if (!CSS.supports('container-type', 'scroll-state')) {
      setupCarouselFallback(carousel);
    }
  });
}

function setupCarouselFallback(carousel) {
  const items = carousel.querySelectorAll('.carousel-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Toggle a class based on intersection
      const card = entry.target.querySelector('.card');
      if (card) {
        if (entry.isIntersecting) {
          card.classList.add('snapped-fallback');
        } else {
          card.classList.remove('snapped-fallback');
        }
      }
    });
  }, {
    root: carousel,
    // Carousel item intersects if any part of it is in the middle 2%
    rootMargin: "0px -49%"
  });

  items.forEach(item => {
    observer.observe(item);
  });
}
