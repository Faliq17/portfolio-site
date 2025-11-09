/* --- js/script.js - FINAL STABLE VERSION WITH THEME AND STABILITY FIXES --- */

// --- Global Variables for Modal Carousel Tracking ---
let currentModalImageSet = [];
let currentModalIndex = 0;

document.addEventListener('DOMContentLoaded', function() {

    // FIX: STABILITY FIX: Ensure the page always starts at the top (0, 0) on every load
    window.scrollTo(0, 0);

    // =======================================================
    // 0. Global Element Initialization
    // =======================================================
    // FIX: Reference the root HTML element for theme class application
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
            // Apply the saved theme and set the correct icon
            setMode(savedMode);
        } else {
            // Default to dark mode based on initial CSS
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
    // 2. Navigation Loader and Active Link Setting
    // =======================================================

    const headerElement = document.getElementById('site-header');
    if (headerElement) {
        // FIX: Corrected file path to 'navtemplate.html'
        fetch('navtemplate.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.text();
            })
            .then(html => {
                headerElement.innerHTML = html;

                // Set the active link after the nav is loaded
                const currentPath = window.location.pathname.split('/').pop();
                const navLinks = headerElement.querySelectorAll('nav a');

                navLinks.forEach(link => {
                    const linkPath = link.getAttribute('href').split('/').pop();

                    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                        link.classList.add('active-link');
                    }
                });

                // Initialize the mode toggle functionality now that the button exists in the DOM
                initializeModeToggle();
            })
            .catch(error => console.error('Error loading navigation:', error));
    } else {
        // Fallback for mode toggle initialization
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
    }

});