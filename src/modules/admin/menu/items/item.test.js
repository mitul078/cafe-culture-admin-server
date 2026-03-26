const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");

const MenuItem = require("./item.model");
const Category = require("../category/category.model");
const { createItem, getItems, updateItem, deleteItem } = require("./item.controller");
const { errorHandler } = require("../../../../middlewares/error.middleware");

let mongoServer;
let app;
let adminId;
let categoryId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    adminId = new mongoose.Types.ObjectId();

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // test middleware to set admin
    app.use((req, res, next) => {
        req.admin = { id: adminId.toString(), role: "ADMIN" };
        next();
    });

    app.post("/menu/item/create", createItem);
    app.get("/menu/item/get", getItems);
    app.patch("/menu/item/update/:id", updateItem);
    app.delete("/menu/item/delete/:id", deleteItem);

    app.use(errorHandler);
});

afterAll(async () => {
    try {
        await mongoose.disconnect();
    } finally {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    const cat = await Category.create({
        adminId: adminId.toString(),
        categoryName: "Drinks",
        order: 1,
        color: "#c67c4e",
        isActive: true,
    });
    categoryId = cat._id.toString();
});

test("create validation fails on bad input", async () => {
    const res = await request(app).post("/menu/item/create").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
});

test("create, update, delete, and get respects isDeleted", async () => {
    const created = await request(app).post("/menu/item/create").send({
        name: "Cappuccino",
        description: "Nice",
        price: 120,
        categoryId,
        order: 1,
        globalOrder: 1,
        variants: [],
        addOns: [],
        tags: ["bestseller"],
        type: "VEG",
        isAvailable: true,
    });
    expect(created.status).toBe(201);
    const itemId = created.body.data._id || created.body.data.id;
    expect(itemId).toBeDefined();

    const list1 = await request(app).get("/menu/item/get").query({ tags: "bestseller" });
    expect(list1.status).toBe(200);
    expect(list1.body.data.length).toBe(1);

    const updated = await request(app).patch(`/menu/item/update/${itemId}`).send({
        name: "Latte",
        description: "Updated",
        price: 140,
        categoryId,
        variants: [],
        addOns: [],
        tags: ["special"],
        type: "VEG",
        isAvailable: false,
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe("Latte");
    expect(updated.body.data.isAvailable).toBe(false);

    const list2 = await request(app).get("/menu/item/get").query({ tags: "special" });
    expect(list2.status).toBe(200);
    expect(list2.body.data.length).toBe(1);

    const del = await request(app).delete(`/menu/item/delete/${itemId}`);
    expect(del.status).toBe(200);

    const list3 = await request(app).get("/menu/item/get");
    expect(list3.status).toBe(200);
    expect(list3.body.data.length).toBe(0);
});