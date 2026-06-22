/**
 * Orders Management & Tracking Module
 */
(function() {
    const Orders = {
        /**
         * Fetch all orders from backend
         */
        async fetchAll() {
            try {
                const res = await window.API.get('crud_handlers.php', { module: 'orders', action: 'list' });
                if (res.success) {
                    return res.data;
                }
                throw new Error(res.message || 'Failed to fetch orders');
            } catch (error) {
                console.error('Error fetching orders:', error);
                return [];
            }
        },

        /**
         * Fetch full details for a single order (Metadata, Items, Payment)
         */
        async fetchDetails(orderId) {
            try {
                const res = await window.API.get('order_actions.php', { action: 'get_details', id: orderId });
                if (res.success) {
                    return {
                        order: res.order,
                        items: res.items,
                        payment: res.payment
                    };
                }
                throw new Error(res.message || 'Failed to fetch order details');
            } catch (error) {
                console.error(`Error fetching order #${orderId} details:`, error);
                return null;
            }
        },

        /**
         * Create a new order (Checkout)
         */
        async create(customerId, items, paymentMode, paymentStatus = 'Success') {
            const formData = new FormData();
            formData.append('Customer_ID', customerId);
            formData.append('Order_Date', new Date().toISOString().split('T')[0]);
            formData.append('Status', 'Pending');
            formData.append('Payment_Mode', paymentMode);
            formData.append('Payment_Status', paymentStatus);
            
            // Append items array
            items.forEach((item, index) => {
                formData.append(`items[${index}][Product_ID]`, item.Product_ID);
                formData.append(`items[${index}][Quantity]`, item.Quantity);
            });

            formData.append('csrf_token', window.csrfToken);

            try {
                const res = await window.API.post('order_actions.php?action=create', formData);
                return res;
            } catch (error) {
                console.error('Checkout failed:', error);
                throw error;
            }
        },

        /**
         * Assign delivery agent to order
         */
        async assignAgent(orderId, agentId) {
            const formData = new FormData();
            formData.append('Order_ID', orderId);
            formData.append('Agent_ID', agentId);
            formData.append('csrf_token', window.csrfToken);

            try {
                const res = await window.API.post('order_actions.php?action=assign_agent', formData);
                if (res.success) {
                    window.API.showToast('Delivery agent assigned successfully!', 'success');
                    return true;
                }
                window.API.showToast(res.message || 'Failed to assign agent', 'danger');
                return false;
            } catch (error) {
                console.error('Assign agent error:', error);
                return false;
            }
        },

        /**
         * Update order status
         */
        async updateStatus(orderId, status) {
            const formData = new FormData();
            formData.append('Order_ID', orderId);
            formData.append('Status', status);
            formData.append('csrf_token', window.csrfToken);

            try {
                const res = await window.API.post('order_actions.php?action=update_status', formData);
                if (res.success) {
                    window.API.showToast(`Order status updated to: ${status}`, 'success');
                    return true;
                }
                window.API.showToast(res.message || 'Failed to update status', 'danger');
                return false;
            } catch (error) {
                console.error('Update status error:', error);
                return false;
            }
        },

        /**
         * Cancel order
         */
        async cancel(orderId) {
            const formData = new FormData();
            formData.append('id', orderId);
            formData.append('csrf_token', window.csrfToken);

            try {
                const res = await window.API.post('order_actions.php?action=cancel', formData);
                if (res.success) {
                    window.API.showToast('Order cancelled successfully!', 'success');
                    return true;
                }
                window.API.showToast(res.message || 'Failed to cancel order', 'danger');
                return false;
            } catch (error) {
                console.error('Cancel order error:', error);
                return false;
            }
        },

        /**
         * Get numeric order value for delivery stages
         */
        getStatusStep(status) {
            const steps = {
                'Pending': 0,
                'Confirmed': 1,
                'Packed': 2,
                'Shipped': 3,
                'Delivered': 4,
                'Cancelled': -1
            };
            return steps[status] !== undefined ? steps[status] : 0;
        },

        /**
         * Render active timeline status html
         */
        renderTracker(status) {
            const stepNum = this.getStatusStep(status);
            if (stepNum === -1) {
                return `
                    <div class="alert alert-danger border-0 d-flex align-items-center" role="alert">
                        <i class="bi bi-x-circle-fill me-2 fs-5"></i>
                        <div><strong>Order Cancelled.</strong> This order has been cancelled and stock was restored.</div>
                    </div>
                `;
            }

            const stepNames = [
                { name: 'Pending', label: 'Order Placed', desc: 'We have received your order' },
                { name: 'Confirmed', label: 'Order Confirmed', desc: 'Store has accepted your order' },
                { name: 'Packed', label: 'Packed & Ready', desc: 'Your items have been packed' },
                { name: 'Shipped', label: 'Out for Delivery', desc: 'Our delivery agent is on the way' },
                { name: 'Delivered', label: 'Delivered', desc: 'Enjoy your fresh groceries!' }
            ];

            let html = '<ul class="tracker-timeline">';
            stepNames.forEach((step, index) => {
                let statusClass = '';
                if (index === stepNum) {
                    statusClass = 'active';
                } else if (index < stepNum) {
                    statusClass = 'completed';
                }
                
                html += `
                    <li class="tracker-step ${statusClass}">
                        <div class="tracker-step-title text-primary">${step.label}</div>
                        <div class="tracker-step-desc">${step.desc}</div>
                    </li>
                `;
            });
            html += '</ul>';
            return html;
        }
    };

    window.Orders = Orders;
})();
