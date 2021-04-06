const express = require('express');
const router = new express.Router();
const db = require('./db');
const ExpressError = require('./expressError');



router.get('/', async function(req, res, next) {
    try{
        const {rows} = await db.query("SELECT * FROM companies")
    return res.json({"companies": rows})
    } catch (err){
        next(err)
    }
    
});

router.get('/:code', async function(req, res, next){
    try{
        const code = req.params.code
        console.log(code)
        const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])
        if (company.rows.length >= 1){
            return res.json({"company" : company.rows[0]})
        }
        else{
            return new ExpressError(`Cannot locate ${code} in our databases`, 404)
        }
    } catch (err){
        next(err)
    }
})




module.exports = router