'use strict';

var express = require('express');
var router = express.Router();
var morgan = require('morgan');
var bodyParser = require('body-parser');

var _require = require('./models'),
    ShoppingList = _require.ShoppingList,
    Recipes = _require.Recipes;

var jsonParser = bodyParser.json();
var app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some items to ShoppingList
// so there's some data to look at
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

// adding some recipes to `Recipes` so there's something
// to retrieve.
Recipes.create('boiled white rice', ['1 cup white rice', '2 cups water', 'pinch of salt']);
Recipes.create('milkshake', ['2 tbsp cocoa', '2 cups vanilla ice cream', '1 cup milk']);

// when the root of this router is called with GET, return
// all current ShoppingList items
app.get('/shopping-list', function (req, res) {
    res.json(ShoppingList.get());
});

app.post('/shopping-list', jsonParser, function (req, res) {
    // ensure `name` and `budget` are in request body
    var requiredFields = ['name', 'budget'];
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!(field in req.body)) {
            var message = 'Missing `' + field + '` in request body';
            console.error(message);
            return res.status(400).send(message);
        }
    }

    var item = ShoppingList.create(req.body.name, req.body.budget);
    res.status(201).json(item);
});

// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `ShoppingList.update` with updated item.
app.put('/shopping-list/:id', jsonParser, function (req, res) {
    var requiredFields = ['name', 'budget', 'id'];
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!(field in req.body)) {
            var message = 'Missing `' + field + '` in request body';
            console.error(message);
            return res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id) {
        console.log('here');
        var _message = 'Request path id (' + req.params.id + ') and request body id (' + req.body.id + ') must match';
        console.error(_message);
        return res.status(400).send(_message);
    }
    console.log('Updating shopping list item `' + req.params.id + '`');
    ShoppingList.update({
        id: req.params.id,
        name: req.body.name,
        budget: req.body.budget
    });
    res.status(204).end();
});

// when DELETE request comes in with an id in path,
// try to delete that item from ShoppingList.
app.delete('/shopping-list/:id', function (req, res) {
    ShoppingList.delete(req.params.id);
    console.log('Deleted shopping list item `' + req.params.ID + '`');
    res.status(204).end();
});

app.put('/recipes/:id', jsonParser, function (req, res) {
    var requiredFields = ['name', 'ingredients', 'id'];
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!(field in req.body)) {
            var message = 'Missing `' + field + '` in request body';
            console.error(message);
            return res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id) {
        var message = 'Request path id (' + req.params.id + ') and request body id (' + req.body.id + ') must match';
        console.error(message);
        return res.status(400).send(message);
    }
    console.log('Updating recipe `' + req.params.id + '`');
    Recipes.update({
        id: req.params.id,
        name: req.body.name,
        ingredients: req.body.ingredients
    });
    res.status(204).end();
});

app.get('/recipes', function (req, res) {
    res.json(Recipes.get());
});

app.post('/recipes', jsonParser, function (req, res) {
    // ensure `name` and `budget` are in request body
    var requiredFields = ['name', 'ingredients'];
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!(field in req.body)) {
            var message = 'Missing `' + field + '` in request body';
            console.error(message);
            return res.status(400).send(message);
        }
    }
    var item = Recipes.create(req.body.name, req.body.ingredients);
    res.status(201).json(item);
});

app.delete('/recipes/:id', function (req, res) {
    Recipes.delete(req.params.id);
    console.log('Deleted recipe `' + req.params.ID + '`');
    res.status(204).end();
});

app.listen(process.env.PORT || 8080, function () {
    console.log('Your app is listening on port ' + (process.env.PORT || 8080));
});
