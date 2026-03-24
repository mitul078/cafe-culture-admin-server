# 🍽️ Menu Item Module (Production-Ready Guide)

This module manages menu items for a food ordering / restaurant system. It is designed with scalability, validation, and performance in mind.

---

# 📦 Features

* Create, Read, Update, Delete (Soft Delete)
* Advanced Validation Layer
* Pagination & Filtering
* Full-text Search
* Variants & Add-ons support
* Image Upload (S3)
* Slug Generation (Unique)
* Tag-based filtering
* Admin-based multi-tenancy

---

# 🏗️ Architecture

```
Controller → Service → Model → Database
```

### Layers:

## 1. Controller

Handles:

* Request parsing
* Validation calls
* Sending response

## 2. Service (Recommended Improvement)

Handles:

* Business logic
* DB operations

## 3. Model

Handles:

* Schema definition
* Indexing

## 4. Validation Layer

Handles:

* Input sanitization
* Type coercion
* Error collection

---

# 📁 Folder Structure

```
item/
 ├── item.controller.js
 ├── item.model.js
 ├── item.validation.js
 ├── item.service.js (recommended)
```

---

# 🚀 API Endpoints

## 1. Create Item

**POST** `/items`

### Body:

```json
{
  "name": "Pizza",
  "price": 200,
  "categoryId": "...",
  "order": 1,
  "globalOrder": 1
}
```

---

## 2. Get Items

**GET** `/items`

### Query Params:

* page
* limit
* categoryId
* type (VEG / NON-VEG / EGGS)
* isAvailable
* search
* tags
* sortBy
* sortOrder

---

## 3. Update Item

**PUT** `/items/:id`

---

## 4. Delete Item (Soft Delete)

**DELETE** `/items/:id`

---

# 🧠 Data Model Overview

## Menu Item Fields:

* adminId
* name
* slug
* description
* price
* categoryId
* order
* globalOrder
* image
* variants[]
* addOns[]
* tags[]
* rating
* reviewsCount
* isAvailable
* isDeleted
* type

---

# ⚙️ Key Concepts

## 1. Soft Delete

Items are not removed from DB.

```js
isDeleted: true
```

---

## 2. Pagination

```js
skip = (page - 1) * limit
```

---

## 3. Full-text Search

```js
{ $text: { $search: search } }
```

---

## 4. Slug Generation

* Generated from name
* Unique using Snowflake ID

---

## 5. Image Upload

* Uploaded to S3
* Stored as:

```js
image: {
  url,
  publicId
}
```

---

# ⚡ Performance Optimizations

## Implemented:

* Indexing
* Pagination
* Parallel queries (Promise.all)

## Recommended Improvements:

* Use `.lean()` for faster queries
* Use projection (`.select()`)
* Add Redis caching
* Use cursor-based pagination

---

# 🔒 Security Best Practices

* Validate all inputs
* Sanitize request body (prevent NoSQL injection)
* Use rate limiting
* Use helmet middleware

---

# 📊 Scaling Strategy

For large-scale systems:

* Add Redis cache layer
* Replace skip with cursor pagination
* Optimize indexes (compound indexes)
* Use CDN for images

---

# ❗ Missing but Recommended Features

* Inventory (stock management)
* SKU uniqueness
* Audit logs (createdBy, updatedBy)
* Variant-level pricing strategy
* Bulk operations (bulk create/update)
* Transactions support

---

# 🧪 Error Handling Strategy

Use centralized error middleware:

```js
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  });
});
```

---

# 🧾 Environment Variables

```
CDN_URL=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
MONGO_URI=
```

---

# 🧰 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* AWS S3

---

# 🧑‍💻 Future Enhancements

* Microservice architecture
* Search engine (Elasticsearch)
* GraphQL support
* Real-time updates

---

# ✅ Summary

This module is:

* Scalable
* Modular
* Validated
* Optimized

With additional improvements, it can be production-ready for large-scale platforms like food delivery systems.

---

🔥 Ready for integration into a full-stack system.

---

# 🤖 Agent Prompts (Code Generation Ready)

Use the following prompts with AI agents (like ChatGPT, Copilot, or internal tools) to rebuild or extend this module in an industry-standard way.

---

## 🧩 1. Generate Mongoose Model

**Prompt:**

```
Create a production-ready Mongoose schema for a Menu Item system with the following features:
- Fields: name, slug (unique), description, price, categoryId, order, globalOrder
- Admin-based multi-tenancy (adminId indexed)
- Variants array with fields: name, size, price, sku, isActive
- Add-ons array with name and price
- Tags array
- Image object (url, publicId)
- Soft delete (isDeleted)
- Availability flag
- Type enum (VEG, NON-VEG, EGGS)
- Rating and reviewsCount

Also:
- Add proper indexes for filtering and search
- Add full-text search on name and description
- Use timestamps
- Disable versionKey
```

---

## 🧠 2. Generate Validation Layer

**Prompt:**

```
Create a robust validation layer for a Menu Item API:
- Validate create, update, delete, and get APIs
- Support type coercion (string to number, string to boolean)
- Validate ObjectId fields
- Parse JSON arrays from request (variants, addOns, tags)
- Return structured errors
- Normalize data (trim strings, uppercase SKU)
```

---

## ⚙️ 3. Generate Controller Layer

**Prompt:**

```
Create an Express controller for Menu Items with:
- createItem
- getItems (with pagination, filtering, search, sorting)
- updateItem
- deleteItem (soft delete)

Requirements:
- Use validation layer
- Handle errors properly
- Support file upload (image)
- Generate unique slug using slugify + unique ID
- Use Promise.all for performance
```

---

## 🏗️ 4. Generate Service Layer

**Prompt:**

```
Create a service layer for Menu Items:
- Move all database logic from controller to service
- Functions: createItemService, getItemsService, updateItemService, deleteItemService
- Keep controller thin
- Add reusable query builder for filters
```

---

## 🚀 5. Add Performance Optimizations

**Prompt:**

```
Optimize a Mongoose-based API for large-scale usage:
- Add .lean() to queries
- Add projection using .select()
- Replace skip-based pagination with cursor-based pagination
- Suggest Redis caching strategy for GET APIs
```

---

## 🔒 6. Add Security Layer

**Prompt:**

```
Improve security of an Express API:
- Prevent NoSQL injection
- Add rate limiting
- Add helmet middleware
- Sanitize request input
- Validate environment variables
```

---

## 📊 7. Add Scaling Features

**Prompt:**

```
Enhance a Menu Item system for scalability:
- Add Redis caching layer
- Optimize MongoDB indexes (compound indexes)
- Suggest horizontal scaling strategy
- Add CDN-based image delivery
```

---

## 🧾 8. Add Missing Business Logic

**Prompt:**

```
Improve business logic of a Menu Item system:
- Add inventory (stock management)
- Ensure SKU uniqueness
- Define variant pricing strategy
- Add audit fields (createdBy, updatedBy)
- Add bulk operations (bulk create/update)
```

---

## 🧪 9. Add Error Handling Middleware

**Prompt:**

```
Create a centralized error handling middleware for Express:
- Handle validation errors
- Handle MongoDB duplicate key errors
- Return consistent API responses
- Log errors properly
```

---

## 🎯 10. Full Production Setup Prompt

**Prompt:**

```
Build a production-ready Menu Item module using Node.js, Express, and MongoDB with:
- MVC + Service architecture
- Validation layer
- Pagination, filtering, search
- Redis caching
- Security middleware
- Logging system (Winston)
- Scalable folder structure

The code should be clean, modular, and follow industry best practices.
```

---

💡 Tip: You can paste these prompts into AI tools to auto-generate high-quality code step by step.
