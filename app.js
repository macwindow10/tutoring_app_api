const express = require('express');
const bodyparser = require('body-parser');
const { use } = require('express/lib/application');
const axios = require('axios');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

const hostname = '127.0.0.1';
const port = 3000;
let db = new sqlite3.Database("tutoring_app.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log("Error Occurred - " + err.message);
    }
    else {
        console.log("DataBase Connected");
    }
});
/*
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
*/

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

app.get('/get_all_grades', function (req, res) {
    var data = []; // for storing the rows.
    db.serialize(() => {
        db.each(`SELECT ID, Name
                 FROM grade`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            // console.log(row.ID + "\t" + row.Name);
            data.push(row);
        }, function () {
            // callback(data); 
            res.send(data);
        });
    });
});

app.get('/get_all_classes', function (req, res) {
    var data = []; // for storing the rows.
    db.serialize(() => {
        db.each(`SELECT c.ID, c.Name, c.ScheduleDay, g. ID 'GradeID', g.Name 'Grade'
            FROM class c INNER JOIN grade g ON c.GradeID=g.ID ;`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
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
});


app.listen(port, hostname, () => {
    console.log(`Tutoring App API server running at http://${hostname}:${port}/`);
});