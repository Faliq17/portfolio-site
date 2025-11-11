// --- Global State and Paths ---
let currentModalSlide = 0;
let currentSliderId = '';

// --- Section 1: Navigation and Setup (Runs when the DOM is fully loaded) ---
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');

    // 🚨 IMPORTANT PATH CHECK: This path must be correct for the navigation to load.
    // Use the relative path confirmed to work in your IDE setup:
    fetch('../navtemplate.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            header.innerHTML = data;

            // After the header is loaded, initialize all features:
            markActiveLink();
            toggleMenu();
            toggleTheme();
            initializeIntersectionObserver();
        })
        .catch(error => {
            console.error('Error loading navigation:', error);
            // Optionally, display a fallback or error message
        });
});

// --- Section 2: Navigation Utilities ---

/** Marks the current link in the navigation as 'active' */
const markActiveLink = () => {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        // Link's href is "index.html". We check if the current page matches that link's file name.
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
};

// --- Section 3: Mobile Menu Toggle ---

/** Sets up the event listener for the hamburger icon */
const toggleMenu = () => {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navUl = document.querySelector('nav ul');

    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            // Toggles the visibility/display of the navigation list based on CSS
            navUl.classList.toggle('nav-open');
        });

        // OPTIONAL: Close menu if a link is clicked (useful on mobile)
        navUl.querySelectorAll('a').forEach(link => {
             link.addEventListener('click', () => {
                 navUl.classList.remove('nav-open');
             });
        });
    }
};

// --- Section 4: Dark/Light Mode Toggle ---

/** Sets up the event listener for the theme toggle button */
const toggleTheme = () => {
    const toggleButton = document.getElementById('mode-toggle');
    const htmlElement = document.documentElement;
    const icon = toggleButton ? toggleButton.querySelector('i') : null;

    if (toggleButton && icon) {
        // Initial icon state based on saved mode or default (dark)
        const savedMode = localStorage.getItem('mode');
        if (savedMode === 'light' || htmlElement.classList.contains('light-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }

        toggleButton.addEventListener('click', () => {
            htmlElement.classList.toggle('light-mode');

            // Toggle icon appearance
            if (htmlElement.classList.contains('light-mode')) {
                localStorage.setItem('mode', 'light');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                localStorage.setItem('mode', 'dark');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
};

// --- Section 5: Intersection Observer (Scroll Animation) ---

/** Sets up the observer for fade-in animations */
const initializeIntersectionObserver = () => {
    const elementsToAnimate = document.querySelectorAll('.timeline-item, .skill-category, .project-card');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the item is visible
    });

    elementsToAnimate.forEach(el => observer.observe(el));
};

// --- Section 6: Modal/Lightbox Functions (For projects.html) ---

/** Opens the lightbox modal with content from the project card */
window.openModal = (mainImagePath, sliderContainerId) => {
    const modal = document.getElementById('image-modal');
    currentSliderId = sliderContainerId;

    // Clear previous slides
    const sliderContainer = document.getElementById(currentSliderId);
    if (!sliderContainer) return;

    // Get all slides from the hidden slider container
    const slides = Array.from(sliderContainer.querySelectorAll('.slide img'));

    if (slides.length > 0) {
        // Set the initial image to the main image or the first slide
        const modalImg = document.getElementById('modal-img');
        modalImg.src = mainImagePath;

        currentModalSlide = slides.findIndex(img => img.src.includes(mainImagePath.split('/').pop())) !== -1
                            ? slides.findIndex(img => img.src.includes(mainImagePath.split('/').pop()))
                            : 0;

        modal.style.display = "block";
    }
}

/** Closes the lightbox modal */
window.closeModal = () => {
    document.getElementById('image-modal').style.display = "none";
    currentSliderId = '';
};

/** Changes the image in the lightbox */
window.plusModalSlides = (n) => {
    const sliderContainer = document.getElementById(currentSliderId);
    if (!sliderContainer) return;

    const slides = Array.from(sliderContainer.querySelectorAll('.slide img'));
    const modalImg = document.getElementById('modal-img');

    if (slides.length === 0) return;

    // Calculate new index
    currentModalSlide += n;

    if (currentModalSlide >= slides.length) {
        currentModalSlide = 0;
    }
    if (currentModalSlide < 0) {
        currentModalSlide = slides.length - 1;
    }

    // Update the image source
    modalImg.src = slides[currentModalSlide].src;
};