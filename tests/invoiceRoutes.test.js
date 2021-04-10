process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");

const app = require("../app");

beforeEach(async function(){
    const companies = await db.query(`INSERT INTO companies
            VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
                ('ibm', 'IBM', 'Big blue.')`)
    const invoices = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
            VALUES ('apple', 100, false, null),
                ('apple', 200, false, null),
                ('apple', 300, true, '2018-01-01'),
                ('ibm', 400, false, null)`)
})




describe("GET invoices", function(){
    test("Get all invoices", async () => {
        const response = await request(app).get('/invoices');
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoices.length).toBeGreaterThan(0);
        expect(response.body.invoices[0]).toHaveProperty('comp_code', 'apple')
    } )

    test("Get one invoice", async ()=>{
        const invoices = await request(app).get('/invoices')
        const id = invoices.body.invoices[0].id
        const response = await request(app).get(`/invoices/${id}`);
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice).toHaveProperty("comp_code", invoices.body.invoices[0].comp_code)
    })
    test("Get an invoice that doesn't exist", async ()=>{
        const response = await request(app).get('/invoices/100000');
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("ERROR")
    })
})

describe("POST new invoice", function(){
    test("Create new invoice", async ()=>{
        const response = await request(app)
            .post('/invoices')
            .send({
                "comp_code" : "ibm",
                "amt" : "10000"
            })
        const companies = await request(app).get('/companies/ibm')
        expect(response);
        expect(response.statusCode).toBe(201);
        expect(response.body.invoice).toHaveProperty("comp_code", "ibm")
        expect(companies.body.company.invoices).toContainEqual(response.body.invoice)
    })
    test("Fail to post correct data", async ()=>{
        const response = await request(app)
            .post('/invoices')
            .send({
                "what does the fox say" : "(___)"
            })
        expect(response);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("ERROR")
    })
})

describe("PUT invoice", function(){
  test("Edit an invoice", async()=>{
        const invoices = await request(app).get('/invoices');
        const id = invoices.body.invoices[0].id
        const response = await request(app)
            .put(`/invoices/${id}`)
            .send({
                "amt" : `${invoices.body.invoices[0].amt * 10}`
            })
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice.amt).toBe(invoices.body.invoices[0].amt * 10)
  })  
})







afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies")
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });