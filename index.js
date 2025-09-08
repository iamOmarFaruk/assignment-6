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

    // API Functions
    async function fetchCategories() {
        const mobileLoadingSpinner = document.getElementById('mobile-categories-loading');
        const desktopLoadingSpinner = document.getElementById('desktop-categories-loading');
        
        try {
            // Show loading spinners
            if (mobileLoadingSpinner) mobileLoadingSpinner.style.display = 'flex';
            if (desktopLoadingSpinner) desktopLoadingSpinner.style.display = 'flex';

            const response = await fetch('https://openapi.programming-hero.com/api/categories');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status && data.categories) {
                loadCategories(data.categories);
            } else {
                throw new Error('Invalid data structure received');
            }
            
        } catch (error) {
            console.error('Error fetching categories:', error);
            loadFallbackCategories();
        } finally {
            // Hide loading spinners
            if (mobileLoadingSpinner) mobileLoadingSpinner.style.display = 'none';
            if (desktopLoadingSpinner) desktopLoadingSpinner.style.display = 'none';
        }
    }

    function loadCategories(categories) {
        const mobileDropdown = document.getElementById('mobile-categories-dropdown');
        const desktopCategories = document.getElementById('desktop-categories');
        
        if (!mobileDropdown || !desktopCategories) {
            console.error('Category containers not found');
            return;
        }

        // Clear existing content (keeping loading spinners for now)
        const mobileLoadingSpinner = mobileDropdown.querySelector('#mobile-categories-loading');
        const desktopLoadingSpinner = desktopCategories.querySelector('#desktop-categories-loading');
        
        mobileDropdown.innerHTML = '';
        desktopCategories.innerHTML = '';

        // Add "All Trees" option first
        const allTreesOption = {
            id: 0,
            category_name: "All Trees",
            small_description: "View all available trees and plants"
        };

        // Add All Trees to mobile dropdown
        const allTreesMobile = document.createElement('li');
        allTreesMobile.innerHTML = `<a class="category-item active" data-category="all" data-id="${allTreesOption.id}">${allTreesOption.category_name}</a>`;
        mobileDropdown.appendChild(allTreesMobile);

        // Add All Trees to desktop sidebar
        const allTreesDesktop = document.createElement('div');
        allTreesDesktop.className = 'px-4 py-2 rounded cursor-pointer active-item category-item bg-[#15803D] text-white';
        allTreesDesktop.setAttribute('data-category', 'all');
        allTreesDesktop.setAttribute('data-id', allTreesOption.id);
        allTreesDesktop.textContent = allTreesOption.category_name;
        desktopCategories.appendChild(allTreesDesktop);

        // Add API categories
        categories.forEach(category => {
            // Generate a simplified data-category attribute from category name
            const categorySlug = category.category_name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '')
                .replace(/-tree$/i, '');

            // Add to mobile dropdown
            const mobileItem = document.createElement('li');
            mobileItem.innerHTML = `<a class="category-item" data-category="${categorySlug}" data-id="${category.id}" title="${category.small_description}">${category.category_name}</a>`;
            mobileDropdown.appendChild(mobileItem);

            // Add to desktop sidebar
            const desktopItem = document.createElement('div');
            desktopItem.className = 'text-gray-600 px-4 py-2 hover:bg-[#15803D] hover:text-white cursor-pointer rounded category-item';
            desktopItem.setAttribute('data-category', categorySlug);
            desktopItem.setAttribute('data-id', category.id);
            desktopItem.setAttribute('title', category.small_description);
            desktopItem.textContent = category.category_name;
            desktopCategories.appendChild(desktopItem);
        });

        // Reinitialize category functionality with new elements
        initializeCategoryFunctionality();
    }

    function loadFallbackCategories() {
        // Fallback categories in case API fails
        const fallbackCategories = [
            { id: 1, category_name: "Fruit Trees", small_description: "Trees that bear edible fruits" },
            { id: 2, category_name: "Flowering Trees", small_description: "Trees grown for their beautiful flowers" },
            { id: 3, category_name: "Shade Trees", small_description: "Large trees providing cool shade" },
            { id: 4, category_name: "Medicinal Trees", small_description: "Trees valued for their healing properties" },
            { id: 5, category_name: "Timber Trees", small_description: "Trees grown for wood production" },
            { id: 6, category_name: "Evergreen Trees", small_description: "Trees that stay green year-round" }
        ];
        
        console.log('Loading fallback categories due to API error');
        loadCategories(fallbackCategories);
    }

    // Category functionality functions
    function filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function updateActiveCategory(clickedItem, categoryText) {
        const categoryItems = document.querySelectorAll('.category-item');
        
        // Remove active class from all items
        categoryItems.forEach(cat => {
            cat.classList.remove('active', 'active-item');
            if (cat.closest('.category-sidebar')) {
                cat.classList.add('text-gray-600');
                cat.classList.remove('bg-[#15803D]', 'text-white');
            }
        });
        
        // Add active class to clicked item
        clickedItem.classList.add('active');
        if (clickedItem.closest('.category-sidebar')) {
            clickedItem.classList.add('active-item', 'bg-[#15803D]', 'text-white');
            clickedItem.classList.remove('text-gray-600');
        }
        
        // Update selected category text for mobile dropdown
        const selectedCategory = document.getElementById('selected-category');
        if (selectedCategory) {
            selectedCategory.textContent = categoryText;
        }
    }

    function initializeCategoryFunctionality() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        if (categoryItems.length > 0) {
            categoryItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const category = this.getAttribute('data-category');
                    const categoryId = this.getAttribute('data-id');
                    const categoryText = this.textContent.trim();
                    
                    // Update active states
                    updateActiveCategory(this, categoryText);
                    
                    // Filter products
                    filterProducts(category);
                    
                    // Close dropdown if it's a mobile dropdown item
                    const dropdown = this.closest('.dropdown');
                    if (dropdown) {
                        const button = dropdown.querySelector('[role="button"]');
                        if (button) {
                            button.blur();
                        }
                    }
                    
                    console.log('Selected category:', {
                        id: categoryId,
                        slug: category,
                        name: categoryText
                    });
                });
            });
        }
    }

    // Initialize the app
    fetchCategories();
});
