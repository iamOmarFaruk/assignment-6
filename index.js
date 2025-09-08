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

    async function fetchAllPlants() {
        const productsGrid = document.getElementById('products-grid');
        const productsLoading = document.getElementById('products-loading');
        const noProductsMessage = document.getElementById('no-products-message');
        
        try {
            // Show loading overlay
            if (productsLoading) productsLoading.classList.remove('hidden');
            if (noProductsMessage) noProductsMessage.classList.add('hidden');

            const response = await fetch('https://openapi.programming-hero.com/api/plants');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status && data.plants) {
                displayPlants(data.plants);
                // Store plants data for filtering
                window.allPlantsData = data.plants;
            } else {
                throw new Error('Invalid plants data structure received');
            }
            
        } catch (error) {
            console.error('Error fetching plants:', error);
            displayErrorMessage('Failed to load plants. Please try again later.');
        } finally {
            // Hide loading overlay
            if (productsLoading) productsLoading.classList.add('hidden');
        }
    }

    async function fetchPlantsByCategory(categoryId) {
        const productsGrid = document.getElementById('products-grid');
        const productsLoading = document.getElementById('products-loading');
        const noProductsMessage = document.getElementById('no-products-message');
        
        try {
            // Show loading overlay
            if (productsLoading) productsLoading.classList.remove('hidden');
            if (noProductsMessage) noProductsMessage.classList.add('hidden');

            const response = await fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status && data.plants) {
                if (data.plants.length === 0) {
                    showNoProductsMessage();
                } else {
                    displayPlants(data.plants);
                }
            } else {
                throw new Error('Invalid category plants data structure received');
            }
            
        } catch (error) {
            console.error('Error fetching plants by category:', error);
            displayErrorMessage('Failed to load plants for this category. Please try again later.');
        } finally {
            // Hide loading overlay
            if (productsLoading) productsLoading.classList.add('hidden');
        }
    }

    function displayPlants(plants) {
        const productsGrid = document.getElementById('products-grid');
        const noProductsMessage = document.getElementById('no-products-message');
        
        if (!productsGrid) {
            console.error('Products grid not found');
            return;
        }

        // Clear existing products
        productsGrid.innerHTML = '';
        
        // Hide no products message
        if (noProductsMessage) noProductsMessage.classList.add('hidden');

        plants.forEach(plant => {
            const plantCard = createPlantCard(plant);
            productsGrid.appendChild(plantCard);
        });
    }

    function createPlantCard(plant) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-4 shadow-sm product-card';
        card.setAttribute('data-category', getCategorySlug(plant.category));
        card.setAttribute('data-plant-id', plant.id);
        
        // Truncate description if too long
        const description = plant.description.length > 100 
            ? plant.description.substring(0, 100) + '...' 
            : plant.description;

        card.innerHTML = `
            <div class="mb-6 xl:mb-8 card-content cursor-pointer">
                <div class="bg-gray-100 rounded-xl mb-4 overflow-hidden">
                    <img src="${plant.image}" alt="${plant.name}" class="product-image" onerror="this.src='assets/about.png'">
                </div>
                <h4 class="font-bold text-lg text-gray-800 mb-2">${plant.name}</h4>
                <p class="text-sm text-gray-600 mb-4 xl:h-16 card-description">${description}</p>
            </div>
            <div class="flex justify-between items-center mb-4">
                <span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">${plant.category}</span>
                <span class="font-bold text-lg text-gray-800">৳${plant.price}</span>
            </div>
            <button class="w-full bg-[#15803D] text-white py-3 rounded-full hover:bg-green-700 transition-colors add-to-cart-btn" 
                    onclick="addToCart(${plant.id}, '${plant.name}', ${plant.price}, '${plant.image}')">
                Add to Cart
            </button>
        `;

        return card;
    }

    function getCategorySlug(categoryName) {
        return categoryName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/-tree$/i, '');
    }

    function showNoProductsMessage() {
        const productsGrid = document.getElementById('products-grid');
        const noProductsMessage = document.getElementById('no-products-message');
        
        if (productsGrid) productsGrid.innerHTML = '';
        if (noProductsMessage) noProductsMessage.classList.remove('hidden');
    }

    function displayErrorMessage(message) {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-red-500 text-lg mb-4">${message}</p>
                    <button class="bg-[#15803D] text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors" 
                            onclick="fetchAllPlants()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    // Global function to show all products
    window.showAllProducts = function() {
        // Reset to "All Trees" category
        const allTreesItems = document.querySelectorAll('.category-item[data-category="all"]');
        if (allTreesItems.length > 0) {
            allTreesItems[0].click();
        }
    };

    // Global function to add items to cart (placeholder for now)
    window.addToCart = function(id, name, price, image) {
        console.log('Adding to cart:', { id, name, price, image });
        // TODO: Implement cart functionality
        alert(`Added ${name} to cart for ৳${price}`);
    };

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
                    
                    // Fetch plants based on category
                    if (category === 'all') {
                        fetchAllPlants();
                    } else {
                        fetchPlantsByCategory(categoryId);
                    }
                    
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
    fetchAllPlants(); // Load all plants initially
});
