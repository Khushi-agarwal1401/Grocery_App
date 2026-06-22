/**
 * Products & Catalog Manager Module
 */
(function() {
    const Products = {
        _productsCached: null,
        _categoriesCached: null,

        /**
         * Fetch all products from API
         */
        async fetchAll() {
            try {
                const res = await window.API.get('crud_handlers.php', { module: 'products', action: 'list' });
                if (res.success) {
                    this._productsCached = res.data;
                    return res.data;
                }
                throw new Error(res.message || 'Failed to fetch products');
            } catch (error) {
                console.error('Error fetching products:', error);
                return [];
            }
        },

        /**
         * Fetch all categories from API
         */
        async fetchCategories() {
            if (this._categoriesCached) return this._categoriesCached;
            try {
                const res = await window.API.get('crud_handlers.php', { module: 'categories', action: 'list' });
                if (res.success) {
                    this._categoriesCached = res.data;
                    return res.data;
                }
                throw new Error(res.message || 'Failed to fetch categories');
            } catch (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
        },

        /**
         * Fetch single product detail
         */
        async fetchDetails(id) {
            try {
                const res = await window.API.get('crud_handlers.php', { module: 'products', action: 'get', id: id });
                if (res.success) {
                    return res.data;
                }
                throw new Error(res.message || 'Product not found');
            } catch (error) {
                console.error(`Error fetching product #${id}:`, error);
                return null;
            }
        },

        /**
         * Filter and search products locally
         */
        filterProducts(products, filters = {}) {
            let result = [...products];

            // Search query
            if (filters.search) {
                const query = filters.search.toLowerCase().trim();
                result = result.filter(p => 
                    p.Product_Name.toLowerCase().includes(query) || 
                    (p.Category_Name && p.Category_Name.toLowerCase().includes(query))
                );
            }

            // Category filter
            if (filters.categoryIds && filters.categoryIds.length > 0) {
                const catIds = filters.categoryIds.map(id => parseInt(id));
                result = result.filter(p => catIds.includes(parseInt(p.Category_ID)));
            }

            // Price range filter
            if (filters.minPrice !== undefined) {
                result = result.filter(p => parseFloat(p.Price) >= parseFloat(filters.minPrice));
            }
            if (filters.maxPrice !== undefined) {
                result = result.filter(p => parseFloat(p.Price) <= parseFloat(filters.maxPrice));
            }

            // Stock filter
            if (filters.inStockOnly) {
                result = result.filter(p => parseInt(p.Stock) > 0);
            }

            // Sorting
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price_asc':
                        result.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
                        break;
                    case 'price_desc':
                        result.sort((a, b) => parseFloat(b.Price) - parseFloat(a.Price));
                        break;
                    case 'name_asc':
                        result.sort((a, b) => a.Product_Name.localeCompare(b.Product_Name));
                        break;
                    case 'name_desc':
                        result.sort((a, b) => b.Product_Name.localeCompare(a.Product_Name));
                        break;
                }
            }

            return result;
        },

        /**
         * Helper to render category icon
         */
        getCategoryIcon(categoryName) {
            const icons = {
                'Fruits': 'bi-apple',
                'Vegetables': 'bi-egg',
                'Dairy': 'bi-moisture',
                'Bakery': 'bi-cookie',
                'Beverages': 'bi-cup-straw',
                'Snacks': 'bi-lightning-fill',
                'Rice & Grains': 'bi-water',
                'Pulses': 'bi-circle-half',
                'Cooking Oil': 'bi-droplet-half',
                'Spices': 'bi-fire',
                'Frozen Foods': 'bi-snow2',
                'Meat & Poultry': 'bi-egg-fill',
                'Seafood': 'bi-water',
                'Personal Care': 'bi-gender-ambiguous',
                'Household Items': 'bi-house-heart',
                'Baby Care': 'bi-heart-fill',
                'Breakfast Items': 'bi-cup-hot',
                'Sweets': 'bi-trophy-fill',
                'Organic Products': 'bi-flower1',
                'Pet Supplies': 'bi-award'
            };
            return icons[categoryName] || 'bi-bag-check';
        },

        /**
         * Helper to render fallback product placeholder
         */
        getProductPlaceholder(categoryName) {
            const colors = {
                'Fruits': 'linear-gradient(135deg, #f87171, #ef4444)',
                'Vegetables': 'linear-gradient(135deg, #34d399, #10b981)',
                'Dairy': 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                'Bakery': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                'Beverages': 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                'Snacks': 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                'default': 'linear-gradient(135deg, #94a3b8, #64748b)'
            };
            const background = colors[categoryName] || colors['default'];
            const icon = this.getCategoryIcon(categoryName);
            return `<div class="d-flex align-items-center justify-content-center text-white" style="width:100%; height:100%; background: ${background}; font-size: 3rem;"><i class="bi ${icon}"></i></div>`;
        }
    };

    window.Products = Products;
})();
