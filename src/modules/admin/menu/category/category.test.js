const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')

const Category = require('./category.model')
const { createCategory, getCategories, updateCategory, deleteCategory } = require('./category.controller')
const { errorHandler } = require('../../../../middlewares/error.middleware')

let mongoServer
let app
let adminId

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)

    adminId = new mongoose.Types.ObjectId()

    app = express()
    app.use(express.json())
    app.use(cookieParser())

    // test middleware to set admin
    app.use((req, res, next) => {
        req.admin = { id: adminId.toString(), role: 'ADMIN' }
        next()
    })

    app.post('/menu/category/create', createCategory)
    app.get('/menu/category/get', getCategories)
    app.patch('/menu/category/update/:id', updateCategory)
    app.delete('/menu/category/delete/:id', deleteCategory)

    app.use(errorHandler)
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

beforeEach(async () => {
    await Category.deleteMany({})
})

test('create validation fails on bad input', async () => {
    const res = await request(app).post('/menu/category/create').send({})
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.errors).toBeDefined()
})

test('create category, get categories, duplicate prevented', async () => {
    const payload = { categoryName: 'Drinks', order: 0 }
    const createRes = await request(app).post('/menu/category/create').send(payload)
    expect(createRes.status).toBe(201)
    expect(createRes.body.success).toBe(true)
    const id = createRes.body.data.id

    // duplicate
    const dup = await request(app).post('/menu/category/create').send(payload)
    expect(dup.status).toBe(400)

    const list = await request(app).get('/menu/category/get')
    expect(list.status).toBe(200)
    expect(list.body.data.length).toBe(1)
    expect(list.body.data[0].id).toBe(id)
})

test('order shifting on create and delete', async () => {
    // create three categories at orders 0,1,2
    await request(app).post('/menu/category/create').send({ categoryName: 'A', order: 0 })
    await request(app).post('/menu/category/create').send({ categoryName: 'B', order: 1 })
    await request(app).post('/menu/category/create').send({ categoryName: 'C', order: 2 })

    // insert at order 1 should shift B and C
    await request(app).post('/menu/category/create').send({ categoryName: 'X', order: 1 })

    const list1 = await request(app).get('/menu/category/get')
    expect(list1.status).toBe(200)
    const names = list1.body.data.map(d => d.categoryName)
    expect(names).toEqual(['A', 'X', 'B', 'C'])

    // delete X and ensure order fixed
    const x = list1.body.data.find(d => d.categoryName === 'X')
    const del = await request(app).delete(`/menu/category/delete/${x.id}`)
    expect(del.status).toBe(200)

    const list2 = await request(app).get('/menu/category/get')
    const names2 = list2.body.data.map(d => d.categoryName)
    expect(names2).toEqual(['A', 'B', 'C'])
})

test('update name and order moves correctly', async () => {
    const a = await request(app).post('/menu/category/create').send({ categoryName: 'One', order: 0 })
    const b = await request(app).post('/menu/category/create').send({ categoryName: 'Two', order: 1 })
    const idA = a.body.data.id
    const idB = b.body.data.id

    // move One from 0 to 1 (swap)
    const move = await request(app).patch(`/menu/category/update/${idA}`).send({ order: 1 })
    expect(move.status).toBe(200)

    const list = await request(app).get('/menu/category/get')
    const names = list.body.data.map(d => d.categoryName)
    expect(names).toEqual(['Two', 'One'])

    // rename Two to Second
    const two = list.body.data.find(d => d.categoryName === 'Two')
    const rename = await request(app).patch(`/menu/category/update/${two.id}`).send({ categoryName: 'Second' })
    expect(rename.status).toBe(200)
    const final = await request(app).get('/menu/category/get')
    expect(final.body.data.map(d => d.categoryName)).toEqual(['Second', 'One'])
})

test('update isActive and list includes inactive categories', async () => {
    const c = await request(app).post('/menu/category/create').send({ categoryName: 'Hidden', order: 0 })
    expect(c.status).toBe(201)
    const id = c.body.data.id

    const off = await request(app).patch(`/menu/category/update/${id}`).send({ isActive: false })
    expect(off.status).toBe(200)
    expect(off.body.data.isActive).toBe(false)

    const list = await request(app).get('/menu/category/get')
    expect(list.status).toBe(200)
    const row = list.body.data.find((d) => d.categoryName === 'Hidden')
    expect(row).toBeDefined()
    expect(row.isActive).toBe(false)
})
