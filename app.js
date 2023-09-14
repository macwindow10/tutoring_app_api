const express = require('express');
const bodyparser = require('body-parser');
const { use } = require('express/lib/application');
const axios = require('axios');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

const hostname = '127.0.0.1';
const port = 3000;
var users = [
    {
        "username": "john",
        "password": "john",
        "name": "John Carter",
        "address": "House 1, Street 2, Garden Town, Lahore",
        "cnic": "23457-2342436-1",
    }
];
var carts = [];

function getNearestStores(currentlatitude, currentlongitude) {
    var neareststores = [
        {
            "name": "Fresh Meat Shop",
            "latitude": parseFloat(currentlatitude) + 0.1,
            "longitude": parseFloat(currentlongitude) + 0.2
        },
        {
            "name": "Meat One",
            "latitude": parseFloat(currentlatitude) - 0.15,
            "longitude": parseFloat(currentlongitude) + 0.2
        },
        {
            "name": "Chop Shop",
            "latitude": parseFloat(currentlatitude) + 0.2,
            "longitude": parseFloat(currentlongitude) + 0.3
        },
        {
            "name": "Organic Meat",
            "latitude": parseFloat(currentlatitude) + 0.2,
            "longitude": parseFloat(currentlongitude) - 0.2
        },
        {
            "name": "Metro Meat",
            "latitude": parseFloat(currentlatitude) - 0.3,
            "longitude": parseFloat(currentlongitude) + 0.4
        }
    ];
    return neareststores;
}

function getStoreProducts(storename) {
    const products = [
        {
            "name": "Beef",
            "categories": [
                {
                    "name": "Mix"
                },
                {
                    "name": "Boonless"
                },
                {
                    "name": "Ribs"
                }
            ]
        },
        {
            "name": "Mutton",
            "categories": [
                {
                    "name": "Mix"
                },
                {
                    "name": "Boonless"
                },
                {
                    "name": "Ribs"
                }
            ]
        },
        {
            "name": "Chicken",
            "categories": [
                {
                    "name": "Mix"
                },
                {
                    "name": "Boonless"
                }
            ]
        },
    ];
    if (storename === 'Fresh Meat Shop') {

    }
    return products;
}

function userExists(username) {
    var user = {};
    var found = false;
    users.forEach(u => {
        if (u.username === username) {
            user = u;
            found = true;
        }
    });
    if (found) {
        return user;
    }
    return null;
}

function authenticateUser(username, password) {
    var user = {};
    var found = false;
    users.forEach(u => {
        //console.log('for: ', u);
        if (u.username === username && u.password === password) {
            console.log(`found: ${u}`);
            user = u;
            found = true;
        }
    });
    if (found) {
        return user;
    }
    return null;
}

app.get('/', function (req, res) {
    res.send('home');
});

app.get('/signup', function (req, res) {
    console.log('signup. ', req.query.username);
    var user = {
        "username": req.query.username,
        "password": req.query.password,
        "name": req.query.name,
        "address": req.query.address,
        "cnic": req.query.address,
    };
    users.push(user);
    console.log(users);
    res.status(200).json('ok');
});

app.get('/login', function (req, res) {
    var username = req.query.username;
    var password = req.query.password;
    console.log('login. ', req.query);
    if (username === '' || password === '') {
        res.json('username/password required');
    } else {
        var user = authenticateUser(username, password);
        if (user) {
            console.log('login. ', user);
            res.status(200).json(user);
        } else {
            res.json('invalid username/password');
        }
    }
});

app.get('/logout', function (req, res) {
    console.log('logout. ', req.query);
    var username = req.query.username;
    var user = userExists(username);
    if (user) {

    } else {

    }

    axios({
        method: 'get',
        baseURL: 'http://127.0.0.1:3000?username=' + username,
        url: 'clearcart'
    }).then(resAxios => {
        console.log(`axios status code: ${resAxios.status}`);
        res.status(200).json('ok');
    }).catch(error => {
        console.error(error);
        res.status(200).json('ok');
    });
});

app.get('/neareststores', function (req, res) {
    console.log('/neareststores');
    const currentlatitude = req.query.currentlatitude;
    const currentlongitude = req.query.currentlongitude;
    //console.log(currentlatitude, currentlongitude);
    res.status(200).json(getNearestStores(currentlatitude, currentlongitude));
});

app.get('/neareststoreproducts', function (req, res) {
    console.log('/neareststoreproducts');
    const currentlatitude = req.query.currentlatitude;
    const currentlongitude = req.query.currentlongitude;
    const storename = req.query.storename;
    console.log('storename: ', storename);
    const neareststores = getNearestStores(currentlatitude, currentlongitude);
    const store = neareststores.find(element => element.name === storename);
    //console.log(store);
    const products = getStoreProducts(store.name);
    console.log(products);
    res.status(200).json(products);
});

app.get('/cart', function (req, res) {
    var username = req.query.username;
    console.log('cart. ', username);
    var user = userExists(username);
    if (user) {
        var cart = carts[username];
        if (cart) {
            console.log('Exists');
            res.status(200).json(cart);
        } else {
            cart = {
                "Beef": 0,
                "Mutton": 0,
                "Chicken": 0
            };
            carts[username] = cart;
            res.status(200).json(cart);
        }
    } else {
        res.status(200).json('user not loggedin');
    }
});

app.get('/addtocart', function (req, res) {
    var username = req.query.username;
    var productname = req.query.productname;
    console.log('addtocart. ', username, productname);
    var user = userExists(username);
    if (user) {
        var cart = carts[username];
        //console.log(cart);
        if (!cart) {
            cart = {
                "Beef": 0,
                "Mutton": 0,
                "Chicken": 0
            };
            carts[username] = cart;
        }

        if (productname === 'Beef') {
            cart.Beef = parseInt(cart.Beef) + 1;
        } else if (productname === 'Mutton') {
            cart.Mutton = parseInt(cart.Mutton) + 1;
        } if (productname === 'Chicken') {
            cart.Chicken = parseInt(cart.Chicken) + 1;
        }
        carts[username] = cart;
        console.log(carts);
        res.status(200).json(carts[username]);

    } else {
        res.status(200).json('user not loggedin');
    }
});

app.get('/clearcart', function (req, res) {
    console.log('clearcart. ', req.query);
    var username = req.query.username;
    var cart = carts[username];
    if (cart) {
        carts = carts.filter(function (el) { return el.username != username; });
    }
    res.status(200).json("ok");
});

app.listen(port, hostname, () => {
    console.log(`Meat store API server running at http://${hostname}:${port}/`);
});
