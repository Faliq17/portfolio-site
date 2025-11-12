/* --- js/script.js - REFACTORED FOR MINIMAL & CORRECT RESPONSIVENESS --- */

(function() {
    "use strict";

    // =======================================================
    // Global Element References & State
    // =======================================================
    const rootElement = document.documentElement;
    const itemsToAnimate = document.querySelectorAll('.timeline-item, .skill-category, .project-card');

    // Modal Lightbox Elements
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const captionText = document.getElementById("caption");

    let currentModalImageSet = [];
    let currentModalIndex = 0;


    // =======================================================
    // 1. Dark/Light Mode Toggle Functionality
    // =======================================================

    /**
     * Sets the theme mode ('dark' or 'light') and updates the icon/localStorage.
     * @param {string} mode - The mode to set ('dark' or 'light').
     */
    function setMode(mode) {
        const toggleIcon = document.getElementById('mode-toggle')?.querySelector('i');

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

    /**
     * Initializes the mode toggle based on localStorage or system preference.
     */
    function initializeModeToggle() {
        const savedMode = localStorage.getItem('mode');
        const toggleBtn = document.getElementById('mode-toggle');

        if (savedMode) {
            setMode(savedMode);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            // Default to system preference if no saved mode exists
            setMode('light');
        } else {
            setMode('dark'); // Default to dark mode
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const newMode = rootElement.classList.contains('light-mode') ? 'dark' : 'light';
                setMode(newMode);
            });
        }
    }


    // =======================================================
    // 2. Navigation Loader and Active Link Setting
    // =======================================================

    /**
     * Fetches and injects the navigation HTML, then sets the active link.
     */
    function loadNavigation() {
        const headerElement = document.getElementById('site-header');
        if (!headerElement) {
            initializeModeToggle();
            return;
        }

        fetch('navtemplate.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                headerElement.innerHTML = html;
                setActiveLink(headerElement);
                initializeModeToggle();
                initializeMobileMenu(); // <--- NEW: Initialize mobile menu logic
            })
            .catch(error => {
                console.error('Error loading navigation:', error);
                initializeModeToggle();
            });
    }

    // NEW FUNCTION: Mobile Menu Toggle Logic
    /**
     * Adds an event listener to the mobile menu toggle button.
     */
    function initializeMobileMenu() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (toggleBtn && navMenu) {
            toggleBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active-menu');

                // Toggle icon between bars and close (X)
                const isMenuOpen = navMenu.classList.contains('active-menu');
                // Note: The 'hidden-desktop' class is no longer necessary as it's handled by pure CSS now,
                // but we use 'menu-toggle' class to style it.
                toggleBtn.className = isMenuOpen ? 'fas fa-times menu-toggle' : 'fas fa-bars menu-toggle';
            });

            // Close menu when a link is clicked (in mobile view)
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    // Assuming mobile breakpoint is 768px (same as CSS media query)
                    if (window.innerWidth < 768) {
                        navMenu.classList.remove('active-menu');
                        toggleBtn.className = 'fas fa-bars menu-toggle'; // Reset icon
                    }
                });
            });
        }
    }


    /**
     * Sets the 'active-link' class based on the current page path.
     * @param {HTMLElement} container - The element containing the navigation links.
     */
    function setActiveLink(container) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = container.querySelectorAll('nav a');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop() || 'index.html';

            if (linkPath === currentPath) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link'); // Ensure non-active links are clean
            }
        });
    }

    // =======================================================
    // 3. Scroll-based Visibility (Fade-in) Functionality
    // =======================================================

    /**
     * Checks if animated elements are in the viewport and adds the 'is-visible' class.
     */
    function checkVisibility() {
        const windowHeight = window.innerHeight;

        itemsToAnimate.forEach(item => {
            // Optimization: Skip if already visible
            if (item.classList.contains('is-visible')) return;

            const itemTop = item.getBoundingClientRect().top;
            // Trigger when 150px of the item is visible
            if (itemTop < windowHeight - 150) {
                item.classList.add('is-visible');
            }
        });
    }


    // =======================================================
    // 4. Modal Lightbox (Carousel) Functions
    // =======================================================

    /**
     * Normalizes a URL path by removing protocol/domain and leading slashes.
     * Used for reliably comparing the clicked image source to the carousel images.
     * @param {string} url - The URL to normalize.
     * @returns {string} The normalized path.
     */
    const normalizePath = (url) => {
        const a = document.createElement('a');
        a.href = url;
        // Removes protocol/domain, leading slashes, and relative path traversal
        return a.pathname.replace(/^\/+/g, '').replace(/(\.\.\/)+/g, '');
    };

    /**
     * Updates the modal image and caption based on the currentModalIndex.
     */
    function updateModalImage() {
        if (currentModalImageSet.length === 0) return;

        // Circular navigation logic
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

    // Expose to global scope for use in inline HTML click handlers
    window.openModal = function(clickedImgSrc, sliderId) {
        if (!modal) return;

        currentModalImageSet = [];
        const sliderContainer = document.getElementById(sliderId);

        if (sliderContainer) {
            // Carousel mode: get all slides from the container
            const slides = sliderContainer.querySelectorAll('.slide img');
            slides.forEach(img => currentModalImageSet.push(img.src));
        } else {
            // Single image mode
            currentModalImageSet.push(clickedImgSrc);
        }

        const clickedPath = normalizePath(clickedImgSrc);
        // Find the index of the clicked image in the set
        let startIndex = currentModalImageSet.findIndex(resolvedUrl => {
            return normalizePath(resolvedUrl).endsWith(clickedPath);
        });

        currentModalIndex = (startIndex !== -1) ? startIndex : 0;

        updateModalImage();
        modal.style.display = "block";
        rootElement.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Expose to global scope for use in lightbox control buttons
    window.plusModalSlides = function(n) {
        currentModalIndex += n;
        updateModalImage();
    }

    // Expose to global scope for use in close button/escape key
    window.closeModal = function() {
        if (!modal) return;
        modal.style.display = "none";
        rootElement.style.overflow = "auto"; // Restore background scrolling
        currentModalImageSet = []; // Reset state
        currentModalIndex = 0;
    }


    // =======================================================
    // Main Initialization on DOM Ready
    // =======================================================

    document.addEventListener('DOMContentLoaded', function() {

        // FIX: STABILITY FIX: Ensure the page always starts at the top (0, 0)
        window.scrollTo(0, 0);

        // Load Nav and initialize Mode Toggle
        loadNavigation();

        // Initialize Scroll-based Visibility
        window.addEventListener('scroll', checkVisibility);
        // Check once on load to show elements already in the viewport
        checkVisibility();

        // Close modal when clicking outside the image
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    window.closeModal();
                }
            });
            // Close modal on Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === "Escape" && modal.style.display === "block") {
                    window.closeModal();
                }
            });
        }
    });

})();