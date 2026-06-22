// Global App Logic for the Premium Grocery Store

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initViewTransitions();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // Shrink and add glassmorphism effect when scrolled
      if (!entry.isIntersecting) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    },
    { threshold: 0 }
  );
  
  // Create a sentinel at the top
  let sentinel = document.querySelector('.scroll-sentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    document.body.prepend(sentinel);
  }
  
  observer.observe(sentinel);
}

function initViewTransitions() {
  // Gracefully handle anchor clicks for View Transitions
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Ignore external links or anchor links
    if (link.hostname !== window.location.hostname || link.hash) return;
    
    // Check if browser supports View Transitions
    if (!document.startViewTransition) return;

    e.preventDefault();
    const url = link.href;

    document.startViewTransition(async () => {
      const response = await fetch(url);
      const text = await response.text();
      const temp = document.createElement('html');
      temp.innerHTML = text;

      // Swap body content
      const newBody = temp.querySelector('body');
      if (newBody) {
        document.body.innerHTML = newBody.innerHTML;
        document.body.className = newBody.className;
      }
      
      // Swap document title
      const newTitle = temp.querySelector('title');
      if (newTitle) {
        document.title = newTitle.textContent;
      }
      
      // Re-initialize logic after DOM update
      initNavbar();
      if (window.initCarousel) window.initCarousel();
      
      // Update history
      window.history.pushState({}, '', url);
    });
  });
  
  window.addEventListener('popstate', () => {
    window.location.reload();
  });
}
