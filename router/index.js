const express = require('express');
const router = express.Router();
const getItems = require('../app')

//import express from 'express';
//import getItems from '../app.js';

module.exports = () => {
    router.get('/', (req, res) => {
        getItems().then(function(FoundItems) {
            res.render('index', { items: FoundItems });
        });
    });
    /* router.get('/', (req, res) => {
        Stock.find({}, (err, stocks) => {
            if (err) {
                console.log(err);
            } else {
                res.render('index', { stocks });
            }
        });
    });

    router.get('/add', (req, res) => {
        res.render('add');
    });

    router.get('/add', (req, res) => {
        const newStock = new Stock(req.body);
        newStock.save(err => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    });

    router.get('/delete/:id', (req, res) => {
        Stock.findByIdAndRemove(req.params.id, err => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    }); */

    return router;
}