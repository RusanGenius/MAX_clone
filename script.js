// --- STATE VARIABLES ---
let currentSlide = 0;
let autoSlideInterval;
let touchStartX = 0;
let touchEndX = 0;
let isFullscreen = false;
let fullscreenCurrentSlide = 0;

// --- DOM ELEMENTS ---
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
const slider = document.querySelector('.slider');
const slideImages = document.querySelectorAll('.slide-img');
const screenshotItems = document.querySelectorAll('.screenshot-item');

// Fullscreen Modal Elements
const fullscreenModal = document.getElementById('fullscreen-modal');
const fullscreenImg = document.getElementById('fullscreen-img');
const closeFullscreenBtn = document.getElementById('close-fullscreen');
const fullscreenPrevBtn = document.getElementById('fullscreen-prev');
const fullscreenNextBtn = document.getElementById('fullscreen-next');

/**
 * Initializes the slider and all related event listeners.
 */
function initSlider() {
    showSlide(0);
    startAutoSlide();
    addTouchListeners();
    addImageClickHandlers();
    addDesktopScreenshotHandlers();
    addFullscreenListeners();
}

/**
 * Displays a specific slide by its index.
 * @param {number} n The index of the slide to show.
 */
function showSlide(n) {
    // Stop auto-sliding when manually changing slides to avoid conflicts.
    stopAutoSlide();
    
    currentSlide = n;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update the active state of navigation dots.
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
    });
    
    // Restart auto-sliding after a manual change.
    startAutoSlide();
}

/**
 * Moves the slider by a given number of slides (e.g., 1 for next, -1 for previous).
 * @param {number} n The number of slides to move.
 */
function moveSlide(n) {
    showSlide(currentSlide + n);
}

/**
 * Starts the automatic slide transition.
 */
function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval to prevent multiple auto-sliders running.
    autoSlideInterval = setInterval(() => {
        moveSlide(1);
    }, 5000);
}

/**
 * Stops the automatic slide transition.
 */
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

/**
 * Adds touch event listeners for swipe gestures on the main slider and fullscreen view.
 */
function addTouchListeners() {
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, false);

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
    }, false);
    
    // Touch listeners for the fullscreen image
    fullscreenImg.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    fullscreenImg.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleFullscreenSwipe();
    }, false);
}

/**
 * Handles the swipe gesture on the main slider.
 */
function handleSwipe() {
    const minSwipeDistance = 50; // Minimum distance in pixels to register a swipe.
    
    if (touchStartX - touchEndX > minSwipeDistance) {
        // Swipe left (next slide)
        moveSlide(1);
    } else if (touchEndX - touchStartX > minSwipeDistance) {
        // Swipe right (previous slide)
        moveSlide(-1);
    }
}

/**
 * Handles the swipe gesture in the fullscreen modal.
 */
function handleFullscreenSwipe() {
    const minSwipeDistance = 50;
    
    if (touchStartX - touchEndX > minSwipeDistance) {
        // Swipe left (next slide)
        moveFullscreenSlide(1);
    } else if (touchEndX - touchStartX > minSwipeDistance) {
        // Swipe right (previous slide)
        moveFullscreenSlide(-1);
    }
}

/**
 * Adds click handlers to slider images to open them in fullscreen.
 */
function addImageClickHandlers() {
    slideImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            openFullscreen(this.src, index); // `this` refers to the clicked img
        });
    });
}

/**
 * Adds click handlers to the desktop screenshot grid items to open them in fullscreen.
 */
function addDesktopScreenshotHandlers() {
    screenshotItems.forEach((item, index) => {
        const img = item.querySelector('img');
        img.addEventListener('click', function() {
            openFullscreen(this.src, index); // `this` refers to the clicked img
        });
    });
}

/**
 * Adds event listeners for the fullscreen modal functionality.
 */
function addFullscreenListeners() {
    closeFullscreenBtn.addEventListener('click', closeFullscreen);
    fullscreenPrevBtn.addEventListener('click', () => moveFullscreenSlide(-1));
    fullscreenNextBtn.addEventListener('click', () => moveFullscreenSlide(1));
    
    // Close the modal when clicking on the dark overlay.
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) {
            closeFullscreen();
        }
    });
    
    // On mobile, allow closing the modal by clicking the image itself.
    fullscreenImg.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            closeFullscreen();
            e.stopPropagation(); // Prevent the modal's own click listener from firing.
        }
    });
    
    // Keyboard controls for the fullscreen modal.
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            closeFullscreen();
        }

        if (isFullscreen) {
            if (e.key === 'ArrowLeft') {
                moveFullscreenSlide(-1);
            } else if (e.key === 'ArrowRight') {
                moveFullscreenSlide(1);
            }
        }
    });
}

/**
 * Opens the fullscreen image viewer.
 * @param {string} src The source URL of the image to display.
 * @param {number} index The index of the image, used for navigation.
 */
function openFullscreen(src, index) {
    fullscreenCurrentSlide = index;
    fullscreenImg.src = src;
    fullscreenModal.style.display = 'flex';
    isFullscreen = true;
    
    // Prevent the background from scrolling while the modal is open.
    document.body.style.overflow = 'hidden';
    
    // Show/hide navigation controls based on screen width.
    if (window.innerWidth <= 768) {
        fullscreenPrevBtn.style.display = 'none';
        fullscreenNextBtn.style.display = 'none';
        closeFullscreenBtn.style.display = 'none';
    } else {
        fullscreenPrevBtn.style.display = 'block';
        fullscreenNextBtn.style.display = 'block';
        closeFullscreenBtn.style.display = 'block';
    }
}

/**
 * Closes the fullscreen image viewer.
 */
function closeFullscreen() {
    fullscreenModal.style.display = 'none';
    isFullscreen = false;
    
    // Restore background scrolling.
    document.body.style.overflow = 'auto';
}

/**
 * Navigates to the next or previous slide in the fullscreen view.
 * @param {number} n The direction to move (-1 for previous, 1 for next).
 */
function moveFullscreenSlide(n) {
    fullscreenCurrentSlide += n;
    
    if (fullscreenCurrentSlide >= slides.length) fullscreenCurrentSlide = 0;
    if (fullscreenCurrentSlide < 0) fullscreenCurrentSlide = slides.length - 1;
    
    const newSrc = slideImages[fullscreenCurrentSlide].src;
    fullscreenImg.src = newSrc;
}

// --- GLOBAL EVENT LISTENERS ---

// Add click listeners to navigation dots.
dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showSlide(idx));
});

// Pause auto-sliding on mouse hover.
slider.addEventListener('mouseenter', stopAutoSlide);
slider.addEventListener('mouseleave', startAutoSlide);

// Handle window resize events.
window.addEventListener('resize', function() {
    // Update UI elements in the fullscreen modal on resize.
    if (isFullscreen) {
        if (window.innerWidth <= 768) {
            fullscreenPrevBtn.style.display = 'none';
            fullscreenNextBtn.style.display = 'none';
            closeFullscreenBtn.style.display = 'none';
        } else {
            fullscreenPrevBtn.style.display = 'block';
            fullscreenNextBtn.style.display = 'block';
            closeFullscreenBtn.style.display = 'block';
        }
    }
});

// Initialize the slider once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initSlider);