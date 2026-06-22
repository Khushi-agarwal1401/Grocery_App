/**
 * Admin Dashboard & Charts Controller
 */
(function() {
    const Dashboard = {
        charts: {},

        /**
         * Initialize Dashboard
         */
        async init() {
            try {
                const data = await window.API.get('dashboard_data.php');
                if (data.success) {
                    this.bindStats(data.stats);
                    this.renderCharts(data);
                } else {
                    window.API.showToast(data.message || 'Failed to load dashboard data', 'danger');
                }
            } catch (error) {
                console.error('Failed to initialize dashboard:', error);
            }
        },

        /**
         * Bind numbers to card text nodes
         */
        bindStats(stats) {
            const mappings = {
                'stat-customers': stats.total_customers,
                'stat-products': stats.total_products,
                'stat-orders': stats.total_orders,
                'stat-revenue': this.formatCurrency(stats.total_revenue),
                'stat-categories': stats.total_categories,
                'stat-suppliers': stats.total_suppliers,
                'stat-agents': stats.total_agents
            };

            Object.keys(mappings).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = mappings[id];
                }
            });
        },

        /**
         * Format number to Indian Rupees
         */
        formatCurrency(value) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2
            }).format(value);
        },

        /**
         * Render all 5 charts
         */
        renderCharts(data) {
            // Helper for color-scheme adaptive configurations
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const textColor = isDark ? '#9ca3af' : '#475569';
            const gridColor = isDark ? '#374151' : '#e2e8f0';

            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
                    }
                },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
                }
            };

            // 1. Revenue Analytics (Line)
            const ctxRevenue = document.getElementById('revenueChart');
            if (ctxRevenue) {
                this.charts.revenue = new Chart(ctxRevenue, {
                    type: 'line',
                    data: {
                        labels: data.months,
                        datasets: [{
                            label: 'Revenue (₹)',
                            data: data.revenues,
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3
                        }]
                    },
                    options: defaultOptions
                });
            }

            // 2. Orders Analytics (Bar)
            const ctxOrders = document.getElementById('ordersChart');
            if (ctxOrders) {
                this.charts.orders = new Chart(ctxOrders, {
                    type: 'bar',
                    data: {
                        labels: data.months,
                        datasets: [{
                            label: 'Orders Count',
                            data: data.order_counts,
                            backgroundColor: '#10b981',
                            borderRadius: 6
                        }]
                    },
                    options: defaultOptions
                });
            }

            // 3. Top Products (Doughnut)
            const ctxTopProducts = document.getElementById('topProductsChart');
            if (ctxTopProducts) {
                this.charts.topProducts = new Chart(ctxTopProducts, {
                    type: 'doughnut',
                    data: {
                        labels: data.top_products,
                        datasets: [{
                            data: data.top_qty,
                            backgroundColor: ['#4f46e5', '#10b981', '#fbbf24', '#ef4444', '#06b6d4'],
                            borderWidth: isDark ? 2 : 1,
                            borderColor: isDark ? '#111827' : '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
                            }
                        }
                    }
                });
            }

            // 4. Order Status Distribution (Polar Area)
            const ctxStatus = document.getElementById('statusChart');
            if (ctxStatus) {
                this.charts.status = new Chart(ctxStatus, {
                    type: 'polarArea',
                    data: {
                        labels: data.statuses,
                        datasets: [{
                            data: data.status_counts,
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.7)',  // Pending
                                'rgba(16, 185, 129, 0.7)', // Delivered
                                'rgba(6, 182, 212, 0.7)',  // Shipped
                                'rgba(239, 68, 68, 0.7)'   // Cancelled
                            ],
                            borderColor: isDark ? '#111827' : '#ffffff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
                            }
                        },
                        scales: {
                            r: {
                                grid: { color: gridColor },
                                angleLines: { color: gridColor },
                                pointLabels: { color: textColor }
                            }
                        }
                    }
                });
            }

            // 5. Category Performance (Radar)
            const ctxCategory = document.getElementById('categoryPerformanceChart');
            if (ctxCategory) {
                this.charts.category = new Chart(ctxCategory, {
                    type: 'radar',
                    data: {
                        labels: data.categories,
                        datasets: [{
                            label: 'Sales (₹)',
                            data: data.category_sales,
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            borderColor: '#6366f1',
                            pointBackgroundColor: '#6366f1',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
                            }
                        },
                        scales: {
                            r: {
                                grid: { color: gridColor },
                                angleLines: { color: gridColor },
                                pointLabels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } },
                                ticks: { display: false }
                            }
                        }
                    }
                });
            }
        },

        /**
         * Re-render charts on theme change to update font and grid colors
         */
        updateChartsTheme() {
            Object.keys(this.charts).forEach(name => {
                this.charts[name].destroy();
            });
            this.init();
        }
    };

    window.Dashboard = Dashboard;
})();
