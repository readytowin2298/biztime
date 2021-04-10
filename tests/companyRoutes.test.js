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
    test("Get a company that isn't there", async () => {
        const response = await request(app).get('/companies/alcon');
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("ERROR");
    })
})

describe("POST to companies", function(){
    test("Create a new company", async function(){
        const response = await request(app)
            .post('/companies')
            .send({
                "code" : "nli",
                "name" : "Nextlink Internet",
                "description" : "Sucky internet company that serves rural areas"
            });
        const response1 = await request(app).get('/companies')

        expect(response)
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('code', 'nli');
        expect(response1.body.companies[response1.body.companies.length -1]).toHaveProperty('code', 'nli');

    })
    test("Invalid Post", async () => {
        const response = await request(app)
            .post('/companies')
            .send({
                "name" : "springboard",
                "description" : "An Awesome School!"
            })
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("ERROR");
    })
})

describe("PUT companies", function(){
    test("Valid edit", async () => {
        const response = await request(app)
            .put('/companies/apple')
            .send({
                "name" : "orange",
                "description" : "A better tasting knock-off"
            })
        expect(response)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("Success.name", "orange")
    })

})

describe("DELETE comapny", function(){
    test("Delete Apple (hahahahaha)", async function(){
        const response = await request(app).delete('/companies/apple')
        expect(response);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status", "deleted")
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

