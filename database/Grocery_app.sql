CREATE DATABASE Grocery_app;
show DATABASES;
USE Grocery_app;


CREATE TABLE CUSTOMER(

    Customer_ID INT PRIMARY KEY,

    Name VARCHAR(100),

    Email VARCHAR(100),

    Phone VARCHAR(20),

    Address VARCHAR(255),

    Registered_Date DATE

);



INSERT INTO CUSTOMER (Customer_ID, Name, Email, Phone, Address, Registered_Date) VALUES

(1,'Aarav Sharma','aarav1@gmail.com','9876500001','Mumbai, Maharashtra','2024-01-01'), 

(2,'Vivaan Patel','vivaan2@gmail.com','9876500002','Ahmedabad, Gujarat','2024-01-02'), 

(3,'Aditya Singh','aditya3@gmail.com','9876500003','Delhi, India','2024-01-03'), 

(4,'Krishna Kumar','krishna4@gmail.com','9876500004','Bangalore, Karnataka','2024-01-04'), 

(5,'Arjun Verma','arjun5@gmail.com','9876500005','Pune, Maharashtra','2024-01-05'), 

(6,'Sai Reddy','sai6@gmail.com','9876500006','Hyderabad, Telangana','2024-01-06'), 

(7,'Rohan Gupta','rohan7@gmail.com','9876500007','Jaipur, Rajasthan','2024-01-07'), 

(8,'Ishaan Mehta','ishaan8@gmail.com','9876500008','Surat, Gujarat','2024-01-08'), 

(9,'Kabir Joshi','kabir9@gmail.com','9876500009','Lucknow, Uttar Pradesh','2024-01-09'), 

(10,'Ananya Sharma','ananya10@gmail.com','9876500010','Chennai, Tamil Nadu','2024-01-10'),

(11,'Diya Patel','diya11@gmail.com','9876500011','Mumbai, Maharashtra','2024-01-11'), 

(12,'Myra Singh','myra12@gmail.com','9876500012','Delhi, India','2024-01-12'), 

(13,'Aadhya Gupta','aadhya13@gmail.com','9876500013','Kolkata, West Bengal','2024-01-13'), 

(14,'Sara Khan','sara14@gmail.com','9876500014','Bhopal, Madhya Pradesh','2024-01-14'), 

(15,'Kiara Verma','kiara15@gmail.com','9876500015','Pune, Maharashtra','2024-01-15'), 

(16,'Aryan Sharma','aryan16@gmail.com','9876500016','Nagpur, Maharashtra','2024-01-16'), 

(17,'Yash Patel','yash17@gmail.com','9876500017','Ahmedabad, Gujarat','2024-01-17'), 

(18,'Dhruv Singh','dhruv18@gmail.com','9876500018','Delhi, India','2024-01-18'), 

(19,'Reyansh Kumar','reyansh19@gmail.com','9876500019','Bangalore, Karnataka','2024-01-19'), 

(20,'Atharv Joshi','atharv20@gmail.com','9876500020','Hyderabad, Telangana','2024-01-20');





-- 2. DELIVERY AGENT TABLE

CREATE TABLE DELIVERY_AGENT (

    Agent_ID INT PRIMARY KEY,

    Name VARCHAR(100),

    Phone VARCHAR(15),

    Vehicle_No VARCHAR(20)

);



INSERT INTO DELIVERY_AGENT (Agent_ID, Name, Phone, Vehicle_No) VALUES

(1, 'Rahul Sharma', '9878100001', 'MH12AB1001'), (2, 'Amit Patel', '9878100002', 'MH12AB1002'), 

(3, 'Rohit Singh', '9878100003', 'DL01CD1003'), (4, 'Vikas Kumar', '9878100004', 'KA05EF1004'), 

(5, 'Sandeep Gupta', '9878100005', 'TS09GH1005'), (6, 'Arjun Verma', '9878100006', 'GJ01JK1006'), 

(7, 'Manoj Yadav', '9878100007', 'RJ14LM1007'), (8, 'Deepak Mishra', '9878100008', 'UP32NP1008'), 

(9, 'Karan Mehta', '9878100009', 'TN10QR1009'), (10, 'Nitin Jain', '9878100010', 'WB20ST1010'),

(11, 'Rakesh Singh', '9878100011', 'MH14UV1011'), (12, 'Sunil Kumar', '9878100012', 'MP04WX1012'), 

(13, 'Ankit Sharma', '9878100013', 'BR01YZ1013'), (14, 'Pankaj Gupta', '9878100014', 'CH01AA1014'), 

(15, 'Mohit Patel', '9878100015', 'KL07BB1015'), (16, 'Harsh Verma', '9878100016', 'TN37CC1016'), 

(17, 'Yash Singh', '9878100017', 'AP16DD1017'), (18, 'Vivek Kumar', '9878100018', 'UP16EE1018'), 

(19, 'Ajay Sharma', '9878100019', 'MH48FF1019'), (20, 'Saurabh Gupta', '9878100020', 'DL08GG1020');





-- 3. ORDERS TABLE 

CREATE TABLE ORDERS(

    Order_ID INT PRIMARY KEY,

    Order_Date DATE,

    Total_Amount DECIMAL(10,2),

    Status VARCHAR(20),

    Customer_ID INT,

    Agent_ID INT,

    FOREIGN KEY (Customer_ID) REFERENCES CUSTOMER(Customer_ID),

    FOREIGN KEY (Agent_ID) REFERENCES DELIVERY_AGENT(Agent_ID)

);



INSERT INTO ORDERS (Order_ID, Order_Date, Total_Amount, Status, Customer_ID, Agent_ID) VALUES

(1,'2024-05-01',1250.50,'Delivered',1,1), (2,'2024-05-01',890.00,'Delivered',2,2), 

(3,'2024-05-02',450.75,'Pending',3,3), (4,'2024-05-02',1120.00,'Delivered',4,4), 

(5,'2024-05-03',760.25,'Shipped',5,5), (6,'2024-05-03',1325.50,'Delivered',6,6), 

(7,'2024-05-04',980.00,'Cancelled',7,7), (8,'2024-05-04',675.30,'Delivered',8,8), 

(9,'2024-05-05',1450.00,'Delivered',9,9), (10,'2024-05-05',520.80,'Pending',10,10),

(11,'2024-05-06',890.25,'Delivered',11,11), (12,'2024-05-06',1100.00,'Shipped',12,12), 

(13,'2024-05-07',780.60,'Delivered',13,13), (14,'2024-05-07',620.40,'Pending',14,14), 

(15,'2024-05-08',950.00,'Delivered',15,15), (16,'2024-05-08',1300.50,'Delivered',16,16), 

(17,'2024-05-09',720.75,'Cancelled',17,17), (18,'2024-05-09',880.20,'Delivered',18,18), 

(19,'2024-05-10',1420.00,'Shipped',19,19), (20,'2024-05-10',560.90,'Delivered',20,20);





-- 4. CATEGORY TABLE

CREATE TABLE CATEGORY (

    Category_ID INT PRIMARY KEY,

    Category_Name VARCHAR(100),

    Description VARCHAR(255)

);



INSERT INTO CATEGORY (Category_ID, Category_Name, Description) VALUES

(1, 'Fruits', 'Fresh fruits and seasonal produce'), (2, 'Vegetables', 'Fresh vegetables and greens'), 

(3, 'Dairy', 'Milk, cheese, butter and dairy products'), (4, 'Bakery', 'Bread, cakes and baked goods'), 

(5, 'Beverages', 'Soft drinks, juices and beverages'), (6, 'Snacks', 'Chips, biscuits and snack items'), 

(7, 'Rice & Grains', 'Rice, wheat and grain products'), (8, 'Pulses', 'Lentils, beans and pulses'), 

(9, 'Cooking Oil', 'Edible oils and cooking fats'), (10, 'Spices', 'Spices, herbs and seasonings'),

(11, 'Frozen Foods', 'Frozen vegetables and ready meals'), (12, 'Meat & Poultry', 'Chicken, mutton and meat products'), 

(13, 'Seafood', 'Fish, prawns and seafood products'), (14, 'Personal Care', 'Shampoo, soap and hygiene products'), 

(15, 'Household Items', 'Cleaning and household supplies'), (16, 'Baby Care', 'Baby food, diapers and care products'), 

(17, 'Breakfast Items', 'Cereals, oats and breakfast foods'), (18, 'Sweets', 'Chocolates, candies and sweets'), 

(19, 'Organic Products', 'Certified organic food products'), (20, 'Pet Supplies', 'Food and accessories for pets');





-- 5. SUPPLIER TABLE

CREATE TABLE SUPPLIER (

    Supplier_ID INT PRIMARY KEY,

    Name VARCHAR(100),

    Contact_No VARCHAR(15),

    Address VARCHAR(255)

);



INSERT INTO SUPPLIER (Supplier_ID, Name, Contact_No, Address) VALUES

(1, 'Fresh Farms Pvt Ltd', '9877000001', 'Mumbai, Maharashtra'), (2, 'Green Valley Suppliers', '9877000002', 'Pune, Maharashtra'), 

(3, 'Nature Basket Distributors', '9877000003', 'Delhi, India'), (4, 'Healthy Harvest Traders', '9877000004', 'Bangalore, Karnataka'), 

(5, 'Organic World Suppliers', '9877000005', 'Hyderabad, Telangana'), (6, 'Daily Dairy Products', '9877000006', 'Ahmedabad, Gujarat'), 

(7, 'Golden Grain Traders', '9877000007', 'Jaipur, Rajasthan'), (8, 'Fresh Veggie Hub', '9877000008', 'Lucknow, Uttar Pradesh'), 

(9, 'Ocean Seafood Suppliers', '9877000009', 'Chennai, Tamil Nadu'), (10, 'Premium Poultry Farms', '9877000010', 'Kolkata, West Bengal'),

(11, 'Sunrise Beverages Ltd', '9877000011', 'Surat, Gujarat'), (12, 'Royal Spice Traders', '9877000012', 'Indore, Madhya Pradesh'), 

(13, 'Smart Household Supplies', '9877000013', 'Nagpur, Maharashtra'), (14, 'Happy Baby Products', '9877000014', 'Bhopal, Madhya Pradesh'), 

(15, 'Sweet Treat Distributors', '9877000015', 'Patna, Bihar'), (16, 'Healthy Snacks Pvt Ltd', '9877000016', 'Chandigarh, India'), 

(17, 'Organic Choice Suppliers', '9877000017', 'Kochi, Kerala'), (18, 'Pet Care Wholesale', '9877000018', 'Coimbatore, Tamil Nadu'), 

(19, 'Frozen Foods India', '9877000019', 'Visakhapatnam, Andhra Pradesh'), (20, 'Mega Grocery Distributors', '9877000020', 'Noida, Uttar Pradesh');





-- 6. PRODUCT TABLE

CREATE TABLE PRODUCT (

    Product_ID INT PRIMARY KEY,

    Product_Name VARCHAR(100),

    Price DECIMAL(10,2),

    Stock INT,

    Category_ID INT,

    Supplier_ID INT,

    FOREIGN KEY (Category_ID) REFERENCES CATEGORY(Category_ID),

    FOREIGN KEY (Supplier_ID) REFERENCES SUPPLIER(Supplier_ID)

);



INSERT INTO PRODUCT (Product_ID, Product_Name, Price, Stock, Category_ID, Supplier_ID) VALUES

(1,'Apple',120.00,150,1,1), (2,'Banana',60.00,200,1,1), 

(3,'Orange',90.00,180,1,2), (4,'Mango',150.00,120,1,2), 

(5,'Grapes',110.00,140,1,3), (6,'Potato',40.00,300,2,4), 

(7,'Tomato',50.00,250,2,4), (8,'Onion',45.00,280,2,5), 

(9,'Carrot',70.00,170,2,5), (10,'Cabbage',55.00,130,2,6),

(11,'Milk 1L',65.00,250,3,6), (12,'Cheese 200g',180.00,90,3,6), 

(13,'Butter 500g',220.00,75,3,7), (14,'Curd 500g',50.00,140,3,7), 

(15,'Paneer 200g',95.00,120,3,8), (16,'White Bread',40.00,160,4,8), 

(17,'Brown Bread',50.00,140,4,8), (18,'Burger Bun',45.00,110,4,9), 

(19,'Cake',350.00,50,4,9), (20,'Croissant',80.00,70,4,10);





-- 7. ORDER ITEM TABLE (Refined to match ER Diagram attributes & use Composite PK)

CREATE TABLE ORDER_ITEM(

    Order_ID INT,

    Product_ID INT,

    Quantity INT,

    Price DECIMAL(10,2), -- Changed from Subtotal to Price per the ER Diagram

    PRIMARY KEY (Order_ID, Product_ID),

    FOREIGN KEY (Order_ID) REFERENCES ORDERS(Order_ID),

    FOREIGN KEY (Product_ID) REFERENCES PRODUCT(Product_ID)

);



INSERT INTO ORDER_ITEM (Order_ID, Product_ID, Quantity, Price) VALUES

(1, 1, 2, 120.00),  

(2, 2, 3, 60.00),  

(3, 3, 1, 90.00),   

(4, 4, 2, 150.00),  

(5, 5, 2, 110.00),  

(6, 6, 4, 40.00),  

(7, 7, 3, 50.00),  

(8, 8, 2, 45.00),   

(9, 9, 1, 70.00),   

(10, 10, 2, 55.00), 

(11, 11, 2, 65.00), 

(12, 12, 1, 180.00), 

(13, 13, 1, 220.00), 

(14, 14, 3, 50.00), 

(15, 15, 2, 95.00), 

(16, 16, 4, 40.00), 

(17, 17, 2, 50.00), 

(18, 18, 3, 45.00), 

(19, 19, 1, 350.00), 

(20, 20, 2, 80.00); 





-- 8. PAYMENT TABLE (Strict 1:1 Enforcement)

CREATE TABLE PAYMENT (

    Payment_ID INT PRIMARY KEY,

    Order_ID INT NOT NULL UNIQUE, -- NOT NULL ensures a payment cannot exist without an order

    Amount DECIMAL(10,2) NOT NULL,

    Payment_Mode VARCHAR(30),

    Payment_Status VARCHAR(20),

    Payment_Date DATE,

    FOREIGN KEY (Order_ID) REFERENCES ORDERS(Order_ID)

);

INSERT INTO PAYMENT (Payment_ID, Order_ID, Amount, Payment_Mode, Payment_Status, Payment_Date) VALUES

(1,1,1250.50,'UPI','Success','2024-05-01'),

(2,2,890.00,'Credit Card','Success','2024-05-01'),

(3,3,450.75,'UPI','Pending','2024-05-02'),

(4,4,1120.00,'Debit Card','Success','2024-05-02'),

(5,5,760.25,'Net Banking','Success','2024-05-03'),

(6,6,1325.50,'UPI','Success','2024-05-03'),

(7,7,980.00,'Credit Card','Failed','2024-05-04'),

(8,8,675.30,'UPI','Success','2024-05-04'),

(9,9,1450.00,'Debit Card','Success','2024-05-05'),

(10,10,520.80,'Cash on Delivery','Pending','2024-05-05'),

(11,11,890.25,'UPI','Success','2024-05-06'),

(12,12,1100.00,'Credit Card','Success','2024-05-06'),

(13,13,780.60,'Debit Card','Success','2024-05-07'),

(14,14,620.40,'UPI','Pending','2024-05-07'),

(15,15,950.00,'Net Banking','Success','2024-05-08'),

(16,16,1300.50,'Credit Card','Success','2024-05-08'),

(17,17,720.75,'UPI','Failed','2024-05-09'),

(18,18,880.20,'Debit Card','Success','2024-05-09'),

(19,19,1420.00,'UPI','Success','2024-05-10'),

(20,20,560.90,'Cash on Delivery','Success','2024-05-10');