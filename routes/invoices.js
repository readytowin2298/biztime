const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');





router.get('/', async function(req, res, next){
    try{
        const invoices = await db.query(`SELECT * FROM invoices;`);
        return res.json({"invoices" : invoices.rows})
    }catch(err){
        return next(err)
    }
})

router.get('/:id', async function(req, res, next){
    try{
        const id = req.params.id
        const company = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (company.rows.length >= 1){
            return res.json({"invoice" : company.rows[0]})
        }
        else{
            return res.status(404).json({"ERROR" : `Cannot locate ${id} in our databases`})
            //  new ExpressError(`Cannot locate ${id} in our databases`, 404)
        }
    } catch (err){
        return next(err)
    }
})

router.post('/', async function(req, res, next){
    const {comp_code, amt} = req.body
    if(!comp_code || !amt){
        return res.status(400).json({"ERROR" : "Request must include comp_code and amt"})
    }
    let data;
    try{
        let company = await db.query("SELECT * FROM companies WHERE code=$1;", [comp_code])
        if(!company.rows[0]){
            return res.status(404).json({"ERROR" : `Cannot Find company ${comp_code}`})
        }
        data = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *;`, [comp_code, amt])
    }catch(err){
        return next(err)
    }
    return res.status(201).json({"invoice" : data.rows[0]})
})

router.put('/:id', async function(req, res, next){
    const {id} = req.params;
    const {amt} = req.body
    let data;
    try{
        let invoice = await db.query("SELECT * FROM invoices WHERE id=$1", [id])
        if(!invoice.rows[0]){
            return res.status(404).json({"ERROR" : `Cannot Find company ${comp_code}`})
        }
        data = await db.query("UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *;", [amt, id])
    }catch(err){
        return next(err)
    }
    return res.json({"invoice" : data.rows[0]})
})

router.delete('/:id', async function(req, res, next){
    const {id} = req.params;
    let company;
    try{
        company = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    }catch(err){
        return next(err)
    }
    if(!company){
        return res.status(404).json({"ERROR" : "Can't locate that invoice"})
    } else{
        try{
            await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
            return res.json({"status" : "deleted"})
        } catch(err){
            return next(err)
        }
    }
})







module.exports = router