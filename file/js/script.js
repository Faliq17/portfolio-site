/* --- js/script.js - FINAL STABLE VERSION WITH THEME AND RESPONSIVENESS FIXES --- */

// --- Global Variables for Modal Carousel Tracking ---
let currentModalImageSet = [];
let currentModalIndex = 0;

document.addEventListener('DOMContentLoaded', function() {

    // FIX: STABILITY FIX: Ensure the page always starts at the top (0, 0) on every load
    window.scrollTo(0, 0);

    // =======================================================
    // 0. Global Element Initialization
    // =======================================================
    const rootElement = document.documentElement;
    const items = document.querySelectorAll('.timeline-item, .skill-category, .project-card');

    // Modal Lightbox Elements
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const captionText = document.getElementById("caption");

    // =======================================================
    // 1. Dark/Light Mode Toggle Functionality
    // =======================================================

    function setMode(mode) {
        const toggleIcon = document.getElementById('mode-toggle') ? document.getElementById('mode-toggle').querySelector('i') : null;

        if (mode === 'light') {
            rootElement.classList.add('light-mode');
            if (toggleIcon) toggleIcon.className = 'fas fa-sun';
            localStorage.setItem('mode', 'light');
        } else {
            rootElement.classList.remove('light-mode');
            if (toggleIcon) toggleIcon.className = 'fas fa-moon';
            localStorage.setItem('mode', 'dark');
        }
    }

    function initializeModeToggle() {
        const savedMode = localStorage.getItem('mode');
        const toggleBtn = document.getElementById('mode-toggle');

        if (savedMode) {
            setMode(savedMode);
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setMode('light');
            } else {
                setMode('dark');
            }
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                if (rootElement.classList.contains('light-mode')) {
                    setMode('dark');
                } else {
                    setMode('light');
                }
            });
        }
    }


    // =======================================================
    // 2. Navigation Loader, Active Link, and Mobile Toggle
    // =======================================================

    const headerElement = document.getElementById('site-header');
    if (headerElement) {
        // *** REVERTED FIX: Using original path that was working for local environment ***
        fetch('navtemplate.html') // <--- THIS LINE IS REVERTED
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.text();
            })
            .then(html => {
                headerElement.innerHTML = html;

                const navLinks = headerElement.querySelectorAll('nav a');
                const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
                const navUl = headerElement.querySelector('nav ul');

                // --- Active Link Setting ---
                const currentPath = window.location.pathname.split('/').pop();
                navLinks.forEach(link => {
                    const linkPath = link.getAttribute('href').split('/').pop();

                    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                        link.classList.add('active-link');
                    }

                    // Close menu after clicking a link (important for mobile UX)
                    link.addEventListener('click', () => {
                        if (navUl && navUl.classList.contains('nav-open')) {
                            navUl.classList.remove('nav-open');
                            mobileMenuToggle.classList.remove('fa-times');
                            mobileMenuToggle.classList.add('fa-bars');
                        }
                    });
                });

                // --- Mobile Menu Toggle Handler ---
                if (mobileMenuToggle && navUl) {
                    mobileMenuToggle.addEventListener('click', () => {
                        navUl.classList.toggle('nav-open');
                        // Toggle icon from bars to X and vice-versa
                        if (navUl.classList.contains('nav-open')) {
                            mobileMenuToggle.classList.remove('fa-bars');
                            mobileMenuToggle.classList.add('fa-times');
                        } else {
                            mobileMenuToggle.classList.remove('fa-times');
                            mobileMenuToggle.classList.add('fa-bars');
                        }
                    });
                }

                initializeModeToggle();
            })
            .catch(error => console.error('Error loading navigation:', error));
    } else {
        initializeModeToggle();
    }


    // =======================================================
    // 3. Scroll-based Visibility (Fade-in) Functionality
    // =======================================================

    function checkVisibility() {
        const windowHeight = window.innerHeight;

        items.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            if (itemTop < windowHeight - 150) {
                item.classList.add('is-visible');
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility();

    // =======================================================
    // 4. Modal Lightbox Functions
    // =======================================================

    const normalizePath = (url) => {
        const a = document.createElement('a');
        a.href = url;
        return a.pathname.replace(/^\/+/g, '').replace(/(\.\.\/)+/g, '');
    };


    function updateModalImage() {
        if (currentModalImageSet.length === 0) return;

        if (currentModalIndex >= currentModalImageSet.length) {
            currentModalIndex = 0;
        }
        if (currentModalIndex < 0) {
            currentModalIndex = currentModalImageSet.length - 1;
        }

        const newSrc = currentModalImageSet[currentModalIndex];
        modalImg.src = newSrc;
        captionText.innerHTML = `Project Screenshot (${currentModalIndex + 1} of ${currentModalImageSet.length})`;
    }


    window.openModal = function(clickedImgSrc, sliderId) {
        if (!modal) return;

        currentModalImageSet = [];
        const sliderContainer = document.getElementById(sliderId);

        if (sliderContainer) {
            const slides = sliderContainer.querySelectorAll('.slide img');
            slides.forEach(img => {
                currentModalImageSet.push(img.src);
            });
        } else {
            currentModalImageSet.push(clickedImgSrc);
        }

        const clickedPath = normalizePath(clickedImgSrc);
        let startIndex = currentModalImageSet.findIndex(resolvedUrl => {
            return normalizePath(resolvedUrl).endsWith(clickedPath);
        });

        currentModalIndex = (startIndex !== -1) ? startIndex : 0;

        updateModalImage();
        modal.style.display = "block";
        rootElement.style.overflow = "hidden"; // Apply overflow to root
    }

    window.plusModalSlides = function(n) {
        currentModalIndex += n;
        updateModalImage();
    }

    window.closeModal = function() {
        if (!modal) return;
        modal.style.display = "none";
        rootElement.style.overflow = "auto"; // Apply overflow to root
        currentModalImageSet = [];
        currentModalIndex = 0;
    }

    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });

        // Add keyboard support for closing (Escape) and navigating (Arrows)
        document.addEventListener('keydown', function(event) {
            if (modal.style.display === 'block') {
                if (event.key === 'Escape') {
                    closeModal();
                } else if (event.key === 'ArrowLeft') {
                    plusModalSlides(-1);
                } else if (event.key === 'ArrowRight') {
                    plusModalSlides(1);
                }
            }
        });
    }

});