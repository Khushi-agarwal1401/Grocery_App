/**
 * Core API & UI Helper Module (Supports dynamic mock database for static GitHub Pages)
 */
(function() {
    const API_BASE = '/backend/api/';

    // Seed data structure
    const MOCK_SEEDS = {
        customers: [
            { Customer_ID: 1, Name: 'Aarav Sharma', Email: 'aarav1@gmail.com', Phone: '9876500001', Address: '102, Ocean Breeze, Bandra West, Mumbai, Maharashtra', Registered_Date: '2024-01-01' },
            { Customer_ID: 2, Name: 'Vivaan Patel', Email: 'vivaan2@gmail.com', Phone: '9876500002', Address: '405, Green Acres, Satellite, Ahmedabad, Gujarat', Registered_Date: '2024-01-02' },
            { Customer_ID: 3, Name: 'Aditya Singh', Email: 'aditya3@gmail.com', Phone: '9876500003', Address: '72, Park Avenue, Connaught Place, New Delhi, Delhi', Registered_Date: '2024-01-03' },
            { Customer_ID: 4, Name: 'Krishna Kumar', Email: 'krishna4@gmail.com', Phone: '9876500004', Address: '12/A, Fernwood Lane, Indiranagar, Bangalore, Karnataka', Registered_Date: '2024-01-04' },
            { Customer_ID: 5, Name: 'Arjun Verma', Email: 'arjun5@gmail.com', Phone: '9876500005', Address: 'B-304, Royal Crest, Koregaon Park, Pune, Maharashtra', Registered_Date: '2024-01-05' }
        ],
        categories: [
            { Category_ID: 1, Category_Name: 'Fruits', Description: 'Fresh fruits and seasonal produce' },
            { Category_ID: 2, Category_Name: 'Vegetables', Description: 'Fresh vegetables and greens' },
            { Category_ID: 3, Category_Name: 'Dairy', Description: 'Milk, cheese, butter and dairy products' },
            { Category_ID: 4, Category_Name: 'Bakery', Description: 'Bread, cakes and baked goods' },
            { Category_ID: 5, Category_Name: 'Beverages', Description: 'Soft drinks, juices and beverages' },
            { Category_ID: 6, Category_Name: 'Snacks', Description: 'Chips, biscuits and snack items' },
            { Category_ID: 7, Category_Name: 'Rice & Grains', Description: 'Rice, wheat and grain products' },
            { Category_ID: 8, Category_Name: 'Pulses', Description: 'Lentils, beans and pulses' }
        ],
        suppliers: [
            { Supplier_ID: 1, Name: 'Fresh Farms Farms', Contact_No: '9877000001', Address: 'Nashik, Maharashtra' },
            { Supplier_ID: 2, Name: 'Green Valley Farms', Contact_No: '9877000002', Address: 'Pune, Maharashtra' },
            { Supplier_ID: 3, Name: 'Nature Organic Basket', Contact_No: '9877000003', Address: 'Delhi, India' },
            { Supplier_ID: 4, Name: 'Healthy Harvest Traders', Contact_No: '9877000004', Address: 'Bangalore, Karnataka' },
            { Supplier_ID: 6, Name: 'Daily Dairy Products', Contact_No: '9877000006', Address: 'Ahmedabad, Gujarat' },
            { Supplier_ID: 8, Name: 'Healthy Snacks Ltd', Contact_No: '9877000016', Address: 'Chandigarh, India' }
        ],
        products: [
            { Product_ID: 1, Product_Name: 'Apple (Premium Red)', Price: 120.00, Stock: 150, Category_ID: 1, Supplier_ID: 1 },
            { Product_ID: 2, Product_Name: 'Banana (Robusta)', Price: 60.00, Stock: 200, Category_ID: 1, Supplier_ID: 1 },
            { Product_ID: 3, Product_Name: 'Orange (Nagpur)', Price: 90.00, Stock: 180, Category_ID: 1, Supplier_ID: 2 },
            { Product_ID: 4, Product_Name: 'Mango (Alphonso)', Price: 150.00, Stock: 120, Category_ID: 1, Supplier_ID: 2 },
            { Product_ID: 5, Product_Name: 'Grapes (Seedless Black)', Price: 110.00, Stock: 140, Category_ID: 1, Supplier_ID: 3 },
            { Product_ID: 6, Product_Name: 'Potato (Organic)', Price: 40.00, Stock: 300, Category_ID: 2, Supplier_ID: 4 },
            { Product_ID: 7, Product_Name: 'Tomato (Local)', Price: 50.00, Stock: 250, Category_ID: 2, Supplier_ID: 4 },
            { Product_ID: 8, Product_Name: 'Onion (Red)', Price: 45.00, Stock: 280, Category_ID: 2, Supplier_ID: 5 },
            { Product_ID: 9, Product_Name: 'Carrot (Local)', Price: 70.00, Stock: 170, Category_ID: 2, Supplier_ID: 5 },
            { Product_ID: 10, Product_Name: 'Cabbage (Green)', Price: 55.00, Stock: 130, Category_ID: 2, Supplier_ID: 6 },
            { Product_ID: 11, Product_Name: 'Organic Milk 1L', Price: 65.00, Stock: 250, Category_ID: 3, Supplier_ID: 6 },
            { Product_ID: 12, Product_Name: 'Gouda Cheese 200g', Price: 180.00, Stock: 90, Category_ID: 3, Supplier_ID: 6 },
            { Product_ID: 13, Product_Name: 'Salted Butter 500g', Price: 220.00, Stock: 75, Category_ID: 3, Supplier_ID: 7 },
            { Product_ID: 14, Product_Name: 'Fresh Curd 500g', Price: 50.00, Stock: 140, Category_ID: 3, Supplier_ID: 7 },
            { Product_ID: 15, Product_Name: 'Fresh Paneer 200g', Price: 95.00, Stock: 120, Category_ID: 3, Supplier_ID: 8 },
            { Product_ID: 16, Product_Name: 'White Bread (Classic)', Price: 40.00, Stock: 160, Category_ID: 4, Supplier_ID: 8 },
            { Product_ID: 17, Product_Name: 'Brown Bread (Multi-grain)', Price: 50.00, Stock: 140, Category_ID: 4, Supplier_ID: 8 },
            { Product_ID: 18, Product_Name: 'Burger Bun (Sesame)', Price: 45.00, Stock: 110, Category_ID: 4, Supplier_ID: 9 },
            { Product_ID: 19, Product_Name: 'Chocolate Cake 500g', Price: 350.00, Stock: 50, Category_ID: 4, Supplier_ID: 9 },
            { Product_ID: 20, Product_Name: 'Butter Croissant', Price: 80.00, Stock: 70, Category_ID: 4, Supplier_ID: 10 }
        ],
        orders: [
            { Order_ID: 1, Order_Date: '2026-06-20', Total_Amount: 300.00, Status: 'Delivered', Customer_ID: 1, Agent_ID: 1, created_at: Date.now() - 48*3600*1000 },
            { Order_ID: 2, Order_Date: '2026-06-21', Total_Amount: 180.00, Status: 'Delivered', Customer_ID: 1, Agent_ID: 2, created_at: Date.now() - 24*3600*1000 }
        ],
        order_items: {
            1: [
                { Product_ID: 1, Product_Name: 'Apple (Premium Red)', Quantity: 2, Price: 120.00 },
                { Product_ID: 2, Product_Name: 'Banana (Robusta)', Quantity: 1, Price: 60.00 }
            ],
            2: [
                { Product_ID: 12, Product_Name: 'Gouda Cheese 200g', Quantity: 1, Price: 180.00 }
            ]
        },
        payments: {
            1: { Payment_ID: 1, Order_ID: 1, Amount: 300.00, Payment_Mode: 'UPI', Payment_Status: 'Success', Payment_Date: '2026-06-20' },
            2: { Payment_ID: 2, Order_ID: 2, Amount: 180.00, Payment_Mode: 'Card', Payment_Status: 'Success', Payment_Date: '2026-06-21' }
        },
        delivery_agents: [
            { Agent_ID: 1, Name: 'Rahul Sharma', Phone: '98781-00001', Vehicle_No: 'MH12AB1001' },
            { Agent_ID: 2, Name: 'Amit Patel', Phone: '98781-00002', Vehicle_No: 'MH12AB1002' }
        ]
    };

    // Determine if we should use mock APIs (GitHub Pages or local file loading, or port other than PHP's 8000)
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isLocalFile = window.location.protocol === 'file:';
    const forceMock = localStorage.getItem('api_mock_mode') === 'true' || window.location.port !== '8000';
    const useMock = isGitHubPages || isLocalFile || forceMock;

    // Seeder function
    function initializeMockStorage() {
        if (localStorage.getItem('mock_db_initialized') === 'true') return;
        localStorage.setItem('mock_customers', JSON.stringify(MOCK_SEEDS.customers));
        localStorage.setItem('mock_categories', JSON.stringify(MOCK_SEEDS.categories));
        localStorage.setItem('mock_suppliers', JSON.stringify(MOCK_SEEDS.suppliers));
        localStorage.setItem('mock_products', JSON.stringify(MOCK_SEEDS.products));
        localStorage.setItem('mock_orders', JSON.stringify(MOCK_SEEDS.orders));
        localStorage.setItem('mock_order_items', JSON.stringify(MOCK_SEEDS.order_items));
        localStorage.setItem('mock_payments', JSON.stringify(MOCK_SEEDS.payments));
        localStorage.setItem('mock_delivery_agents', JSON.stringify(MOCK_SEEDS.delivery_agents));
        localStorage.setItem('mock_db_initialized', 'true');
    }

    if (useMock) {
        initializeMockStorage();
    }

    // --- Mock Request Interceptors ---
    function mockGet(endpoint, params) {
        // Read database tables from localStorage
        const categories = JSON.parse(localStorage.getItem('mock_categories'));
        const products = JSON.parse(localStorage.getItem('mock_products'));
        const suppliers = JSON.parse(localStorage.getItem('mock_suppliers'));
        const customers = JSON.parse(localStorage.getItem('mock_customers'));
        const orders = JSON.parse(localStorage.getItem('mock_orders'));
        const orderItems = JSON.parse(localStorage.getItem('mock_order_items'));
        const payments = JSON.parse(localStorage.getItem('mock_payments'));
        const agents = JSON.parse(localStorage.getItem('mock_delivery_agents'));

        // Parse query params out of URL if inside endpoint string
        let endpointClean = endpoint;
        const queryParams = { ...params };
        if (endpoint.includes('?')) {
            const parts = endpoint.split('?');
            endpointClean = parts[0];
            const urlSearch = new URLSearchParams(parts[1]);
            for (const [key, val] of urlSearch.entries()) {
                queryParams[key] = val;
            }
        }

        if (endpointClean === 'auth_status.php') {
            let session = JSON.parse(localStorage.getItem('customer_session'));
            if (!session) {
                // Auto log in a default mock customer so they have a seamless showcase
                session = { role: 'customer', user_id: 1, username: 'user', name: 'Aarav Sharma' };
                localStorage.setItem('customer_session', JSON.stringify(session));
            }
            return { 
                success: true, 
                authenticated: !!session, 
                username: session ? session.name : null, 
                session: session, 
                csrf_token: 'mock-csrf-token' 
            };
        }

        if (endpointClean === 'crud_handlers.php') {
            const module = queryParams.module;
            const action = queryParams.action;

            if (module === 'categories' && action === 'list') {
                return { success: true, data: categories };
            }

            if (module === 'products') {
                if (action === 'list') {
                    // Populate category names and supplier names
                    const expanded = products.map(p => {
                        const cat = categories.find(c => c.Category_ID === p.Category_ID);
                        return {
                            ...p,
                            Category_Name: cat ? cat.Category_Name : 'Groceries'
                        };
                    });
                    return { success: true, data: expanded };
                }
                if (action === 'get') {
                    const pId = parseInt(queryParams.id);
                    const prod = products.find(p => p.Product_ID === pId);
                    if (prod) {
                        const cat = categories.find(c => c.Category_ID === prod.Category_ID);
                        return { success: true, data: { ...prod, Category_Name: cat ? cat.Category_Name : 'Groceries' } };
                    }
                    return { success: false, message: 'Product not found' };
                }
            }

            if (module === 'suppliers' && action === 'get') {
                const sId = parseInt(queryParams.id);
                const sup = suppliers.find(s => s.Supplier_ID === sId);
                return { success: true, data: sup || { Name: 'Local Farm Fresh' } };
            }

            if (module === 'customers') {
                if (action === 'list') {
                    return { success: true, data: customers };
                }
                if (action === 'get') {
                    const cId = parseInt(queryParams.id);
                    const cust = customers.find(c => c.Customer_ID === cId);
                    if (cust) {
                        const myOrders = orders.filter(o => parseInt(o.Customer_ID) === cId);
                        const totalSpent = myOrders.reduce((sum, o) => sum + parseFloat(o.Total_Amount || 0), 0);
                        const custWithStats = {
                            ...cust,
                            stats: {
                                OrderCount: myOrders.length,
                                TotalSpent: totalSpent
                            }
                        };
                        return { success: true, data: custWithStats };
                    }
                    return { success: false, message: 'Customer not found' };
                }
            }

            if (module === 'orders' && action === 'list') {
                return { success: true, data: orders };
            }
        }

        if (endpointClean === 'order_actions.php') {
            const action = queryParams.action;

            if (action === 'get_details') {
                const oId = parseInt(queryParams.id);
                const order = orders.find(o => o.Order_ID === oId);
                if (order) {
                    // Dynamic tracking simulator updates status based on elapsed seconds
                    if (order.created_at && !['Cancelled', 'Delivered'].includes(order.Status)) {
                        const elapsedSeconds = (Date.now() - order.created_at) / 1000;
                        let newStatus = 'Pending';
                        if (elapsedSeconds > 100) {
                            newStatus = 'Delivered';
                        } else if (elapsedSeconds > 75) {
                            newStatus = 'Shipped';
                        } else if (elapsedSeconds > 50) {
                            newStatus = 'Packed';
                        } else if (elapsedSeconds > 25) {
                            newStatus = 'Confirmed';
                        }
                        
                        if (newStatus !== order.Status) {
                            order.Status = newStatus;
                            localStorage.setItem('mock_orders', JSON.stringify(orders));
                            
                            // If delivered, mark payment success
                            if (newStatus === 'Delivered' && payments[oId]) {
                                payments[oId].Payment_Status = 'Success';
                                localStorage.setItem('mock_payments', JSON.stringify(payments));
                            }
                        }
                    }

                    // Populate agent details
                    let agentName = null;
                    let agentPhone = null;
                    const agent = agents.find(a => a.Agent_ID === order.Agent_ID);
                    if (agent) {
                        agentName = agent.Name;
                        agentPhone = agent.Phone;
                    }

                    const items = orderItems[oId] || [];
                    const payment = payments[oId] || { Payment_Mode: 'UPI', Payment_Status: 'Success' };

                    return {
                        success: true,
                        order: {
                            ...order,
                            Agent_Name: agentName,
                            Agent_Phone: agentPhone
                        },
                        items: items,
                        payment: payment
                    };
                }
                return { success: false, message: 'Order not found' };
            }
        }

        return { success: false, message: 'Endpoint not simulated' };
    }

    function mockPost(endpoint, data) {
        // Read database tables from localStorage
        const products = JSON.parse(localStorage.getItem('mock_products'));
        const orders = JSON.parse(localStorage.getItem('mock_orders'));
        const orderItems = JSON.parse(localStorage.getItem('mock_order_items'));
        const payments = JSON.parse(localStorage.getItem('mock_payments'));
        const customers = JSON.parse(localStorage.getItem('mock_customers'));

        // Handle multipart data extraction
        let postData = data;
        if (data instanceof FormData) {
            postData = {};
            for (const [key, val] of data.entries()) {
                postData[key] = val;
            }
        }

        let endpointClean = endpoint;
        if (endpoint.includes('?')) {
            endpointClean = endpoint.split('?')[0];
        }

        if (endpointClean === 'login_handler.php') {
            const username = postData.username;
            const password = postData.password;

            if ((username === 'user' && password === 'user123') || (username === 'admin' && password === 'admin123')) {
                const cust = customers.find(c => c.Customer_ID === 1) || { Name: 'Aarav Sharma' };
                const session = {
                    role: username === 'admin' ? 'admin' : 'customer',
                    user_id: 1,
                    username: username,
                    name: cust.Name
                };
                localStorage.setItem('customer_session', JSON.stringify(session));
                return { success: true, message: 'Logged in successfully' };
            }
            return { success: false, message: 'Invalid username or password. Use user/user123 or admin/admin123.' };
        }

        if (endpointClean === 'logout_handler.php') {
            localStorage.removeItem('customer_session');
            return { success: true, message: 'Logged out successfully' };
        }

        if (endpointClean === 'order_actions.php') {
            const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
            const action = urlParams.get('action');

            if (action === 'create') {
                const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.Order_ID)) + 1 : 1;
                
                // Parse order items from FormData keys like items[0][Product_ID]
                const itemsMap = {};
                Object.keys(postData).forEach(key => {
                    const match = key.match(/items\[(\d+)\]\[(Product_ID|Quantity)\]/);
                    if (match) {
                        const index = match[1];
                        const field = match[2];
                        if (!itemsMap[index]) itemsMap[index] = {};
                        itemsMap[index][field] = postData[key];
                    }
                });
                const itemsArray = Object.values(itemsMap);

                let subtotal = 0;
                const newItemsList = [];
                itemsArray.forEach(item => {
                    const pId = parseInt(item.Product_ID);
                    const qty = parseInt(item.Quantity);
                    const prod = products.find(p => p.Product_ID === pId);
                    if (prod) {
                        const itemPrice = parseFloat(prod.Price);
                        newItemsList.push({
                            Product_ID: pId,
                            Product_Name: prod.Product_Name,
                            Quantity: qty,
                            Price: itemPrice
                        });
                        subtotal += itemPrice * qty;
                    }
                });

                const gst = subtotal * 0.05;
                const delivery = (subtotal > 500 || subtotal === 0) ? 0 : 40;
                const grandTotal = subtotal + gst + delivery;

                const newOrder = {
                    Order_ID: nextId,
                    Order_Date: new Date().toISOString().split('T')[0],
                    Total_Amount: grandTotal,
                    Status: 'Pending',
                    Customer_ID: parseInt(postData.Customer_ID) || 1,
                    Agent_ID: 1, // Rahul Sharma by default
                    created_at: Date.now() // for tracking simulation
                };

                orders.push(newOrder);
                localStorage.setItem('mock_orders', JSON.stringify(orders));

                orderItems[nextId] = newItemsList;
                localStorage.setItem('mock_order_items', JSON.stringify(orderItems));

                payments[nextId] = {
                    Payment_ID: nextId,
                    Order_ID: nextId,
                    Amount: grandTotal,
                    Payment_Mode: postData.Payment_Mode || 'UPI',
                    Payment_Status: postData.Payment_Status || 'Pending',
                    Payment_Date: newOrder.Order_Date
                };
                localStorage.setItem('mock_payments', JSON.stringify(payments));

                return { success: true, message: 'Order placed successfully!', order_id: nextId };
            }

            if (action === 'cancel') {
                const oId = parseInt(postData.id);
                const order = orders.find(o => o.Order_ID === oId);
                if (order) {
                    order.Status = 'Cancelled';
                    localStorage.setItem('mock_orders', JSON.stringify(orders));
                    return { success: true, message: 'Order cancelled successfully' };
                }
                return { success: false, message: 'Order not found' };
            }
        }

        if (endpointClean === 'crud_handlers.php') {
            const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
            const module = urlParams.get('module');
            const action = urlParams.get('action');

            if (module === 'customers' && (action === 'update' || action === 'save')) {
                const cId = parseInt(postData.Customer_ID || postData.id);
                const cust = customers.find(c => c.Customer_ID === cId);
                if (cust) {
                    cust.Name = postData.Name || cust.Name;
                    cust.Email = postData.Email || cust.Email;
                    cust.Phone = postData.Phone || cust.Phone;
                    cust.Address = postData.Address || cust.Address;
                    localStorage.setItem('mock_customers', JSON.stringify(customers));
                    
                    // Sync active session if profile updated
                    const session = JSON.parse(localStorage.getItem('customer_session'));
                    if (session && session.user_id === cId) {
                        session.name = cust.Name;
                        localStorage.setItem('customer_session', JSON.stringify(session));
                    }
                    return { success: true, message: 'Profile updated successfully!' };
                }
                return { success: false, message: 'Customer not found' };
            }
        }

        return { success: false, message: 'Endpoint not simulated' };
    }

    // --- Core API Class definition ---
    const API = {
        /**
         * Perform GET request
         */
        async get(endpoint, params = {}) {
            if (useMock) {
                console.log(`[API Mock GET] Intercepting ${endpoint}`, params);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(mockGet(endpoint, params)), 300);
                });
            }

            let url = API_BASE + endpoint;
            const queryKeys = Object.keys(params);
            if (queryKeys.length > 0) {
                const searchParams = new URLSearchParams();
                queryKeys.forEach(key => searchParams.append(key, params[key]));
                url += (url.includes('?') ? '&' : '?') + searchParams.toString();
            }

            try {
                const response = await fetch(url);
                return await handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
                throw error;
            }
        },

        /**
         * Perform POST request
         */
        async post(endpoint, data = {}, isMultipart = false) {
            if (useMock) {
                console.log(`[API Mock POST] Intercepting ${endpoint}`, data);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(mockPost(endpoint, data)), 400);
                });
            }

            const url = API_BASE + endpoint;
            let body = data;
            const headers = {};

            if (window.csrfToken) {
                headers['X-CSRF-TOKEN'] = window.csrfToken;
                
                if (data instanceof FormData) {
                    if (!data.has('csrf_token')) {
                        data.append('csrf_token', window.csrfToken);
                    }
                } else if (typeof data === 'object' && data !== null) {
                    if (!data.csrf_token) {
                        data.csrf_token = window.csrfToken;
                    }
                }
            }

            let requestOptions = {
                method: 'POST',
                headers: headers
            };

            if (isMultipart) {
                requestOptions.body = data;
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                if (data instanceof FormData) {
                    requestOptions.body = new URLSearchParams(data);
                } else if (typeof data === 'object') {
                    const params = new URLSearchParams();
                    Object.keys(data).forEach(key => params.append(key, data[key]));
                    requestOptions.body = params;
                } else {
                    requestOptions.body = data;
                }
            }

            try {
                const response = await fetch(url, requestOptions);
                return await handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
                throw error;
            }
        },

        /**
         * Display premium Toast Notification
         */
        showToast(message, type = 'success') {
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast-custom ${type}`;
            
            let icon = 'bi-check-circle-fill';
            if (type === 'danger') icon = 'bi-exclamation-triangle-fill';
            if (type === 'warning') icon = 'bi-exclamation-circle-fill';
            if (type === 'info') icon = 'bi-info-circle-fill';

            toast.innerHTML = `
                <i class="bi ${icon} fs-5"></i>
                <div class="toast-content flex-grow-1 fw-500">${message}</div>
                <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
            `;

            container.appendChild(toast);

            // Bind click to dismiss
            toast.querySelector('.btn-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
                setTimeout(() => toast.remove(), 300);
            });

            // Auto dismiss
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-10px)';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 4000);
        }
    };

    /**
     * Parse HTTP Responses
     */
    async function handleResponse(response) {
        if (response.status === 401) {
            window.location.href = './login.html';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP Error ${response.status}`);
        }

        const json = await response.json();
        return json;
    }

    /**
     * Handle Network Errors
     */
    function handleNetworkError(error) {
        console.error('API Error:', error);
        API.showToast('Network error: Unable to connect to server. Please try again.', 'danger');
    }

    // Export globally
    window.API = API;
})();
