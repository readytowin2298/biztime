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