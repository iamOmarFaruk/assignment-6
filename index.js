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

    // Global Loading Utilities (for categories only)
    function showLoading() {
        const globalLoading = document.getElementById('global-loading');
        if (globalLoading) {
            globalLoading.classList.remove('hidden');
        }
    }

    function hideLoading() {
        const globalLoading = document.getElementById('global-loading');
        if (globalLoading) {
            globalLoading.classList.add('hidden');
        }
    }

    // Products Loading Utilities (localized overlay)
    function showProductsLoading() {
        const productsLoading = document.getElementById('products-loading-overlay');
        const noProductsMessage = document.getElementById('no-products-message');
        
        if (productsLoading) {
            productsLoading.classList.remove('hidden');
            productsLoading.classList.add('show');
        }
        if (noProductsMessage) {
            noProductsMessage.classList.add('hidden');
        }
    }

    function hideProductsLoading() {
        const productsLoading = document.getElementById('products-loading-overlay');
        if (productsLoading) {
            productsLoading.classList.add('hidden');
            productsLoading.classList.remove('show');
        }
    }

    // API Functions
    async function fetchCategories() {
        try {
            showLoading();

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
            hideLoading();
        }
    }

    async function fetchAllPlants() {
        try {
            showProductsLoading();

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
            hideProductsLoading();
        }
    }

    async function fetchPlantsByCategory(categoryId) {
        try {
            showProductsLoading();

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
            hideProductsLoading();
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
            <div class="mb-6 xl:mb-8 card-content cursor-pointer" data-plant-id="${plant.id}">
                <div class="image-container mb-4">
                    <img src="${plant.image}" alt="${plant.name}" class="product-image" onerror="this.src='assets/about.png'; this.classList.add('loaded');">
                    <div class="image-loading-spinner">
                        <div class="spinner-small"></div>
                    </div>
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

        // Add image load event listener to hide spinner when image loads
        const img = card.querySelector('.product-image');
        const spinner = card.querySelector('.image-loading-spinner');
        
        img.addEventListener('load', function() {
            this.classList.add('loaded');
            if (spinner) {
                spinner.style.display = 'none';
            }
        });

        // Handle case where image is already cached
        if (img.complete) {
            img.classList.add('loaded');
            if (spinner) {
                spinner.style.display = 'none';
            }
        }

        // Add click event listener to card content for modal
        const cardContent = card.querySelector('.card-content');
        cardContent.addEventListener('click', function() {
            const plantId = this.getAttribute('data-plant-id');
            openProductModal(plantId);
        });

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

    // Cart Management System
    let cart = [];

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger the slide down animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    // Cart utility functions
    function findCartItemIndex(id) {
        return cart.findIndex(item => item.id === id);
    }

    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        if (!cartItemsContainer || !cartTotalElement) return;

        // Clear current cart display
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p class="text-sm">Your cart is empty</p>
                </div>
            `;
            cartTotalElement.textContent = '৳0';
            return;
        }

        // Display cart items
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'bg-[#EFFDF4] rounded-xl p-3 xl:p-4 flex justify-between items-start';
            cartItem.innerHTML = `
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 text-sm xl:text-base">${item.name}</h4>
                    <p class="text-gray-500 text-sm">৳${item.price} × ${item.quantity}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600 text-lg xl:text-xl remove-from-cart" 
                        data-id="${item.id}" title="Remove from cart">×</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `৳${total}`;

        // Add event listeners to remove buttons
        const removeButtons = cartItemsContainer.querySelectorAll('.remove-from-cart');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId);
            });
        });
    }

    function addToCart(id, name, price, image) {
        const existingItemIndex = findCartItemIndex(id);
        
        if (existingItemIndex !== -1) {
            // Item exists, increment quantity
            cart[existingItemIndex].quantity += 1;
            showToast(`${name} quantity updated in cart`);
        } else {
            // New item, add to cart
            cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
            showToast(`${name} added to cart`);
        }
        
        updateCartDisplay();
        console.log('Cart updated:', cart);
    }

    function removeFromCart(id) {
        const itemIndex = findCartItemIndex(id);
        
        if (itemIndex !== -1) {
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            updateCartDisplay();
            showToast(`${itemName} removed from cart`, 'error');
            console.log('Item removed from cart:', itemName);
        }
    }

    // Global functions
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;

    // Product Modal Functions
    async function fetchPlantDetails(plantId) {
        try {
            const response = await fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status && data.plants) {
                return data.plants;
            } else {
                throw new Error('Invalid plant data structure received');
            }
            
        } catch (error) {
            console.error('Error fetching plant details:', error);
            throw error;
        }
    }

    function displayProductModal(plant) {
        const modalProductDetails = document.getElementById('modal-product-details');
        
        if (!modalProductDetails) return;

        modalProductDetails.innerHTML = `
            <div class="relative">
                <!-- Close button -->
                <button class="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors shadow-lg" 
                        onclick="document.getElementById('product-modal').close()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Product Image -->
                <div class="w-full h-64 md:h-80 bg-gray-100 relative overflow-hidden">
                    <img src="${plant.image}" alt="${plant.name}" 
                         class="w-full h-full object-cover" 
                         onerror="this.src='assets/about.png';">
                </div>

                <!-- Product Info -->
                <div class="p-6 md:p-8">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div class="flex-1">
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">${plant.name}</h2>
                            <span class="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">${plant.category}</span>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-bold text-gray-900">৳${plant.price}</p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p class="text-gray-600 leading-relaxed">${plant.description}</p>
                    </div>

                    <!-- Add to Cart Button -->
                    <button class="w-full bg-[#15803D] text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                            onclick="addToCartFromModal(${plant.id}, '${plant.name}', ${plant.price}, '${plant.image}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    function showModalLoading() {
        const modalLoading = document.getElementById('modal-loading');
        const modalProductDetails = document.getElementById('modal-product-details');
        const modalError = document.getElementById('modal-error');
        
        if (modalLoading) modalLoading.classList.remove('hidden');
        if (modalProductDetails) modalProductDetails.classList.add('hidden');
        if (modalError) modalError.classList.add('hidden');
    }

    function showModalContent() {
        const modalLoading = document.getElementById('modal-loading');
        const modalProductDetails = document.getElementById('modal-product-details');
        const modalError = document.getElementById('modal-error');
        
        if (modalLoading) modalLoading.classList.add('hidden');
        if (modalProductDetails) modalProductDetails.classList.remove('hidden');
        if (modalError) modalError.classList.add('hidden');
    }

    function showModalError() {
        const modalLoading = document.getElementById('modal-loading');
        const modalProductDetails = document.getElementById('modal-product-details');
        const modalError = document.getElementById('modal-error');
        
        if (modalLoading) modalLoading.classList.add('hidden');
        if (modalProductDetails) modalProductDetails.classList.add('hidden');
        if (modalError) modalError.classList.remove('hidden');
    }

    async function openProductModal(plantId) {
        const modal = document.getElementById('product-modal');
        
        if (!modal) {
            console.error('Product modal not found');
            return;
        }

        // Show modal with loading state
        showModalLoading();
        modal.showModal();

        try {
            // Fetch plant details
            const plantDetails = await fetchPlantDetails(plantId);
            
            // Display plant details in modal
            displayProductModal(plantDetails);
            showModalContent();
            
        } catch (error) {
            console.error('Error loading plant details:', error);
            showModalError();
        }
    }

    function addToCartFromModal(id, name, price, image) {
        // Add to cart
        addToCart(id, name, price, image);
        
        // Close modal after adding
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.close();
        }
    }

    // Make functions globally available
    window.openProductModal = openProductModal;
    window.addToCartFromModal = addToCartFromModal;

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
    updateCartDisplay(); // Initialize cart display
    fetchCategories();
    fetchAllPlants(); // Load all plants initially
});
