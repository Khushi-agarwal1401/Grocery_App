/**
 * Products & Catalog Manager Module (Includes Unsplash premium product image mapping)
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
         * Retrieve high-quality Unsplash image mapping for categories
         */
        getCategoryImage(categoryName) {
            const images = {
                'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=150&q=80',
                'Vegetables': 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?auto=format&fit=crop&w=150&q=80',
                'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80',
                'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
                'Beverages': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80',
                'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&w=150&q=80',
                'Rice & Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80',
                'Pulses': 'https://images.unsplash.com/photo-1545114197-2f6a7e1b6015?auto=format&fit=crop&w=150&q=80',
                'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'
            };
            return images[categoryName] || images['default'];
        },

        /**
         * Retrieve high-quality Unsplash image mapping for products
         */
        getProductImage(categoryName, productName) {
            const images = {
                'Fruits': {
                    'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
                    'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
                    'Orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80',
                    'Mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
                    'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80',
                    'default': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=400&q=80'
                },
                'Vegetables': {
                    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
                    'Tomato': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80',
                    'Onion': 'https://images.unsplash.com/photo-1508747705-3de207a84595?auto=format&fit=crop&w=400&q=80',
                    'Carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
                    'Cabbage': 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?auto=format&fit=crop&w=400&q=80',
                    'default': 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?auto=format&fit=crop&w=400&q=80'
                },
                'Dairy': {
                    'Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
                    'Cheese': 'https://images.unsplash.com/photo-1486299267070-8382e0543112?auto=format&fit=crop&w=400&q=80',
                    'Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
                    'Curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
                    'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
                    'default': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'
                },
                'Bakery': {
                    'Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
                    'Bun': 'https://images.unsplash.com/photo-1581334643200-e13f20dd574a?auto=format&fit=crop&w=400&q=80',
                    'Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
                    'Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
                    'default': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
                },
                'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
            };

            const catImages = images[categoryName] || {};
            // Substring match for product names
            let mappedUrl = null;
            Object.keys(catImages).forEach(key => {
                if (productName && productName.toLowerCase().includes(key.toLowerCase())) {
                    mappedUrl = catImages[key];
                }
            });

            return mappedUrl || catImages['default'] || images['default'];
        },

        /**
         * Helper to render fallback product placeholder
         */
        getProductPlaceholder(categoryName, productName) {
            const imageUrl = this.getProductImage(categoryName, productName);
            return `<div style="width:100%; height:100%; overflow:hidden;"><img src="${imageUrl}" alt="${productName || 'Grocery'}" style="width:100%; height:100%; object-fit:contain;"></div>`;
        }
    };

    window.Products = Products;
})();
