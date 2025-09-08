// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const xIcon = document.getElementById('x-icon');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    
    let isMenuOpen = false;
    
    // Function to toggle icons
    function toggleIcons(menuOpen) {
        if (menuOpen) {
            hamburgerIcon.classList.add('hidden');
            xIcon.classList.remove('hidden');
        } else {
            hamburgerIcon.classList.remove('hidden');
            xIcon.classList.add('hidden');
        }
    }
    
    // Function to close menu
    function closeMenu() {
        isMenuOpen = false;
        toggleIcons(false);
        // Force close the dropdown by removing focus and active state
        mobileMenuToggle.blur();
        if (document.activeElement === mobileMenuToggle) {
            document.activeElement.blur();
        }
        // Additional method to ensure dropdown closes
        mobileDropdown.classList.remove('dropdown-open');
        mobileMenuToggle.parentElement.classList.remove('dropdown-open');
    }
    
    // Handle menu toggle click
    mobileMenuToggle.addEventListener('click', function(e) {
        // Check if we clicked on the X icon specifically
        if (!xIcon.classList.contains('hidden') && (e.target === xIcon || xIcon.contains(e.target))) {
            // X icon clicked - close the menu immediately
            closeMenu();
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Small delay to let DaisyUI handle the dropdown first for hamburger clicks
        setTimeout(() => {
            // Check if dropdown is actually visible to determine state
            const dropdownRect = mobileDropdown.getBoundingClientRect();
            const isVisible = dropdownRect.height > 0 && getComputedStyle(mobileDropdown).visibility !== 'hidden';
            
            isMenuOpen = isVisible;
            toggleIcons(isMenuOpen);
        }, 10);
    });
    
    // Handle clicks on X icon specifically
    xIcon.addEventListener('click', function(e) {
        closeMenu();
        e.preventDefault();
        e.stopPropagation();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenuToggle.contains(event.target) && !mobileDropdown.contains(event.target)) {
            closeMenu();
        }
    });
    
    // Close menu when clicking on a menu item
    const menuItems = mobileDropdown.querySelectorAll('a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
});
