const express = require('express');
const router = new express.Router();
const db = require('./db')



router.get('/', (req, res, next) => {
    res.send('Hi')
});


module.exports = router