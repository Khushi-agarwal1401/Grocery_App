/**
 * Shopping Cart Module (LocalStorage based)
 */
(function() {
    const CART_KEY = 'grocery_app_cart';

    const Cart = {
        /**
         * Get current active customer ID
         */
        getCustomerId() {
            return localStorage.getItem('active_customer_id') || '1';
        },

        /**
         * Get cart key for current customer
         */
        _getCartKey() {
            return `${CART_KEY}_cust_${this.getCustomerId()}`;
        },

        /**
         * Fetch all items in cart
         */
        getItems() {
            try {
                const data = localStorage.getItem(this._getCartKey());
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Failed to parse cart data:', e);
                return [];
            }
        },

        /**
         * Save items to cart
         */
        _saveItems(items) {
            localStorage.setItem(this._getCartKey(), JSON.stringify(items));
            // Dispatch global event for listeners (like navbar badge)
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
        },

        /**
         * Add product to cart
         */
        add(product, quantity = 1) {
            const items = this.getItems();
            const existing = items.find(item => parseInt(item.Product_ID) === parseInt(product.Product_ID));

            if (existing) {
                const newQty = existing.Quantity + parseInt(quantity);
                if (newQty > parseInt(product.Stock)) {
                    window.API.showToast(`Cannot add more. Only ${product.Stock} items available in stock.`, 'warning');
                    return false;
                }
                existing.Quantity = newQty;
            } else {
                if (parseInt(quantity) > parseInt(product.Stock)) {
                    window.API.showToast(`Cannot add. Only ${product.Stock} items available in stock.`, 'warning');
                    return false;
                }
                items.push({
                    Product_ID: parseInt(product.Product_ID),
                    Product_Name: product.Product_Name,
                    Price: parseFloat(product.Price),
                    Stock: parseInt(product.Stock),
                    Category_Name: product.Category_Name || '',
                    Quantity: parseInt(quantity)
                });
            }

            this._saveItems(items);
            window.API.showToast(`Added ${product.Product_Name} to cart!`, 'success');
            return true;
        },

        /**
         * Update item quantity in cart
         */
        updateQty(productId, quantity) {
            const items = this.getItems();
            const item = items.find(item => parseInt(item.Product_ID) === parseInt(productId));

            if (item) {
                const newQty = parseInt(quantity);
                if (newQty <= 0) {
                    return this.remove(productId);
                }
                if (newQty > parseInt(item.Stock)) {
                    window.API.showToast(`Cannot update. Only ${item.Stock} items in stock.`, 'warning');
                    return false;
                }
                item.Quantity = newQty;
                this._saveItems(items);
                return true;
            }
            return false;
        },

        /**
         * Remove item from cart
         */
        remove(productId) {
            let items = this.getItems();
            const originalLength = items.length;
            items = items.filter(item => parseInt(item.Product_ID) !== parseInt(productId));
            
            if (items.length !== originalLength) {
                this._saveItems(items);
                window.API.showToast('Item removed from cart.', 'info');
                return true;
            }
            return false;
        },

        /**
         * Clear cart
         */
        clear() {
            this._saveItems([]);
        },

        /**
         * Get items count
         */
        getCount() {
            return this.getItems().reduce((acc, item) => acc + item.Quantity, 0);
        },

        /**
         * Calculate cart summary totals
         */
        getTotals() {
            const items = this.getItems();
            const subtotal = items.reduce((acc, item) => acc + (item.Price * item.Quantity), 0);
            
            // Tax: 5% of subtotal
            const tax = subtotal * 0.05;
            
            // Delivery fee: 40, free if subtotal > 500
            const deliveryFee = (subtotal === 0 || subtotal > 500) ? 0 : 40;
            
            const total = subtotal + tax + deliveryFee;

            return {
                subtotal: subtotal,
                tax: tax,
                deliveryFee: deliveryFee,
                total: total
            };
        }
    };

    window.Cart = Cart;
})();
