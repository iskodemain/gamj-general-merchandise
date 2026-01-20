# 📦 Ordering and Inventory Monitoring System

## 📌 Overview

The **Ordering and Inventory Monitoring System** is a web-based application designed to automate product ordering, monitor inventory levels in real time, and support efficient business operations for **GAMJ General Merchandise**. The system addresses common problems in manual inventory handling such as stock inaccuracies, delayed order processing, and lack of real-time visibility.

Developed as an academic and industry-aligned system, it follows modern **full‑stack development practices** and supports secure, role-based access for administrators and customers.

---

## 🚀 Key Features

### 🛒 Ordering Module

* Product browsing and ordering
* Quantity validation based on available stock
* Order status tracking (Pending, Approved, Delivered, Cancelled)

### 📊 Inventory Monitoring

* Real-time stock level updates
* Automatic stock deduction upon order approval
* Inventory alerts for low-stock items
* Inventory dashboard for administrators

### 👥 User Management

* Customer registration and profile management
* Account verification using uploaded proof of legitimacy
* Role-Based Access Control (Admin / Customer)

### 🔐 Security & Validation

* Secure authentication using JWT
* Input validation on both frontend and backend
* Protected API routes

### 📦 Product & Category Management

* Add, update, and remove products
* Category-based product organization
* Inventory ID and Product ID tracking

---

## 🧱 System Architecture

**Frontend**

* Vite + ReactJS
* Tailwind CSS combined with custom CSS for responsive and flexible UI design  
* Axios for API communication

**Backend**

* Node.js + Express.js
* Sequelize ORM
* RESTful API architecture

**Database**

* MySQL
* Relational schema for users, products, orders, and inventory

---

## 🛠️ Technology Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Frontend       | ReactJS (Vite), Tailwind CSS |
| Backend        | Node.js, Express.js          |
| Database       | MySQL                        |
| ORM            | Sequelize                    |
| Authentication | JWT                          |
| File Storage   | Cloudinary                   |

---
