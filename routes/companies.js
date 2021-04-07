const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');



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
            res.status(404).json({"Error" : `Cannot locate ${code} in our databases`})
            return new ExpressError(`Cannot locate ${code} in our databases`, 404)
        }
    } catch (err){
        next(err)
    }
})

router.post('/', async function(req, res, next){
    if(!req.body.code || !req.body.name ){
        res.status(404).json({
            "Error" : "Input data missing",
            "Example Request" : {
                "code" : "nli",
                "name" : "Nextlink Internet",
                "description" : "Sucky internet company that serves rural areas"
            }
        })
    }
    let {code, name, description} = req.body;
    try{
        const { rows } = await db.query("INSERT INTO companies (name, code, description) VALUES ($1, $2, $3) RETURNING name, code, description;", [name, code, description])
        return res.status(201).json(rows[0])
    }catch(err){
        next(err)
    }
    
})

router.put('/:code', async function(req, res, next){
    const {code} = req.params
    let company;
    let {name, description} = req.body
    if(!name && !description){
        res.status(404).json({"ERROR" : "Request is improperly formatted, either `name` or `description` values must be present"})
    }
    try {
        const quest = await db.query('SELECT * FROM companies WHERE code=$1--', [code])
        company = quest.rows[0]
    } catch(err){
        next(err)
    }
    if(!company){
        return res.status(404).json({"ERROR" : "Can't locate that company"})
    }
    name = name? name : company.name;
    description = description ? description : company.description;
    try {
        const edit = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3;`, [name, description, code])
    } catch(err){
        return next(err)
    }
    return res.json({"Success!" : {
        "name" : name,
        "code" : code,
        "description" : description
    }})
    
})

router.delete('/:code', async function(req, res, next){
    const {code} = req.params;
    let company;
    try{
        company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
    }catch(err){
        return next(err)
    }
    if(!company){
        return res.status(404).json({"ERROR" : "Can't locate that company"})
    } else{
        try{
            await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
            return res.json({"status" : "deleted"})
        } catch(err){
            return next(err)
        }
    }
})




module.exports = router