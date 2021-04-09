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


describe("GET companies", function(){
    test("gets all companies", async function(){
        const response = await request(app).get('/companies');
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body.companies.length).toBeGreaterThan(0);
        expect(response.body.companies[0].invoices.length).toBeGreaterThan(0);
    })
    test("get only apple", async function(){
        const response = await request(app).get('/companies/apple')
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body)
        expect(response.body.company.code).toBe("apple")
        expect(response.body.company.name).toBe("Apple Computer")
    })

})

describe("GET invoices", function(){
    test("gets all invoices", async function(){
        const response = await request(app).get('/invoices')
        const testInvoice = response.body.invoices[0]
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoices.length).toBeGreaterThan(0);
        expect(testInvoice).toHaveProperty('comp_code', 'apple')
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

