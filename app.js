const express = require('express');
const bodyparser = require('body-parser');
const { use } = require('express/lib/application');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const { send } = require('express/lib/response');
const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

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
        console.log("Database Connected");
        // console.log(uuidv1())
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

function authenticate_user(username, password, callback) {
    var data = [];
    db.serialize(() => {
        db.each(`SELECT ID, Name
                 FROM student
                 WHERE Username='` + username + `' AND Password='` +
            password + `'`, (err, row) => {
                if (err) {
                    console.error(err.message);
                }
                data.push(row);
            }, function () {
                callback(data);
            });
    });
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
        db.each(`SELECT c.ID, c.Name, c.ScheduleDay, g.ID 'GradeID', g.Name 'Grade'
            FROM class c INNER JOIN grade g ON c.GradeID=g.ID`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/get_all_classes_for_grade', function (req, res) {
    var grade = req.query.grade;
    var data = [];
    if (grade == null || grade === "") {
        res.send("error");
        return;
    }
    db.serialize(() => {
        db.each(`SELECT c.ID, c.Name, c.ScheduleDay, g. ID 'GradeID', g.Name 'Grade'
            FROM class c INNER JOIN grade g ON c.GradeID=g.ID 
            WHERE g.Name='` + grade + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/add_class', function (req, res) {
    var gradeID = req.query.gradeID;
    var name = req.query.name;
    var scheduleDay = req.query.scheduleDay;
    if (gradeID == null || gradeID === "" ||
        name == null || name === "" ||
        scheduleDay == null || scheduleDay === "") {
        res.send("error");
        return;
    }
    console.log('add_class');
    console.log(req.query);
    var data = [];
    db.serialize(() => {
        db.each(`SELECT ID
            FROM class 
            WHERE Name='` + name + `' AND GradeID='` + gradeID + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            console.log(data);
            if (data.length == 0) {
                var newClassUUID = uuidv1();
                db.run('INSERT INTO class(ID, Name, GradeID, ScheduleDay) VALUES(?, ?, ?, ?)',
                    [newClassUUID, name, gradeID, scheduleDay], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log('class added in grade');
                        res.send(newClassUUID);
                    });
            } else {
                console.log('class already exists in this grade');
                res.send("class already exists in this grade");
            }
        });
    });
});

app.get('/get_all_students', function (req, res) {
    var data = [];
    db.serialize(() => {
        db.each(`SELECT sc.ID, s.ID 'StudentID', s.Name, CAST(s.Paid AS TEXT) Paid, g.ID 'GradeID', g.Name 'Grade', c.ID 'ClassID', c.Name 'Class', c.ScheduleDay 
            FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
            INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
            WHERE Is_In_Waiting=0 
            ORDER BY g.Name, s.Name`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/get_all_students_in_waiting', function (req, res) {
    var data = [];
    db.serialize(() => {
        db.each(`SELECT sc.ID, s.ID 'StudentID', s.Name, CAST(s.Paid AS TEXT) Paid, g.ID 'GradeID', g.Name 'Grade', c.ID 'ClassID', c.Name 'Class', c.ScheduleDay, sc.Added_In_Waiting_On 
            FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
            INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
            WHERE Is_In_Waiting=1 
            ORDER BY g.Name, s.Name`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/get_student_enrolled_grades_classes', function (req, res) {
    var studentID = req.query.studentID;
    var data = [];
    if (studentID == null || studentID === "") {
        res.send("error");
        return;
    }
    db.serialize(() => {
        db.each(`SELECT s.ID, s.Name, s.Paid, g.Name 'Grade', c.Name 'Class', c.ScheduleDay 
            FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
            INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
            WHERE Is_In_Waiting=0 AND s.ID='` + studentID + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/get_all_students_for_grade', function (req, res) {
    var grade = req.query.grade;
    var data = [];
    if (grade == null || grade === "") {
        res.send("error");
        return;
    }
    db.serialize(() => {
        db.each(`SELECT s.ID, s.Name, s.Paid, c.Name 'Class', g.Name 'Grade'
            FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
            INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
            WHERE g.Name='` + grade + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/register', function (req, res) {
    var name = req.query.name;
    var username = req.query.username;
    var password = req.query.password;
    var paid = req.query.paid;
    if (name == null || name === "" ||
        username == null || username === "" ||
        password == null || password === "" ||
        paid == null || paid === "") {

        res.send("error");
        return;
    }

    var data = [];
    db.serialize(() => {
        db.each(`SELECT s.ID
            FROM student s 
            WHERE username='` + username + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            if (data.length == 0) {
                let paidValue = (paid === "true" ? 1 : 0)
                db.run('INSERT INTO student(ID, Name, Username, Password, Paid) VALUES(?, ?, ?, ?, ?)',
                    [uuidv1(), name, username, password, paidValue], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log('student registered');
                        res.send('student registered');
                    })
            } else {
                res.send("student already exists");
            }
        });
    });
});

app.get('/add_student_in_class_waiting', function (req, res) {
    console.log('add_student_in_class_waiting');
    var classID = req.query.classID;
    var studentID = req.query.studentID;
    if (classID == null || classID === "" ||
        studentID == null || studentID === "") {
        res.send("error");
        return;
    }
    console.log(req.query);
    var data = [];
    db.serialize(() => {
        db.each(`SELECT ID
            FROM student_class 
            WHERE Student_ID='` + studentID + `' AND Class_ID='` + classID + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            console.log(data);
            if (data.length == 0) {
                var dt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                console.log(dt);
                db.run('INSERT INTO student_class(ID, Student_ID, Class_ID, Is_In_Waiting, Added_In_Waiting_On) VALUES(?, ?, ?, ?, ?)',
                    [uuidv1(), studentID, classID, 1, dt], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log('student record added in class in waiting');
                        res.send('student record added in class in waiting');
                    });
            } else {
                console.log('student already exists in this class');
                res.send("student already exists in this class");
            }
        });
    });
});

app.get('/update_student_in_class_waiting', function (req, res) {
    var classID = req.query.classID;
    var studentID = req.query.studentID;
    if (classID == null || classID === "" ||
        studentID == null || studentID === "") {
        res.send("error");
        return;
    }
    var data = [];
    db.serialize(() => {
        db.each(`SELECT ID
            FROM student_class 
            WHERE Student_ID='` + studentID + `' AND Class_ID='` + classID + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            console.log(data);
            if (data.length > 0) {
                db.run(`UPDATE student_class SET Is_In_Waiting=0
                    WHERE Student_ID='` + studentID + `' AND Class_ID='` + classID + `'`, (err) => {
                    if (err) {
                        return console.log(err.message);
                    }
                    console.log('student record updated in class in waiting');
                    res.send('student record updated in class in waiting');
                });
            } else {
                console.log('student does not exist in this class');
                res.send("student does not exist in this class");
            }
        });
    });
});

app.get('/get_all_attendances', function (req, res) {
    var data = [];
    db.serialize(() => {
        db.each(`SELECT sc.ID, s.ID 'StudentID', s.Name, CAST(s.Paid AS TEXT) Paid, g.ID 'GradeID', g.Name 'Grade', c.ID 'ClassID', c.Name 'Class', c.ScheduleDay, a.Date
            FROM student s INNER JOIN student_class sc ON s.ID=sc.Student_ID 
            INNER JOIN class c ON sc.Class_ID=c.ID INNER JOIN grade g ON c.GradeID=g.ID
            INNER JOIN attendance a ON a.Student_Class_ID=sc.ID
            WHERE Is_In_Waiting=0 
            ORDER BY g.Name, s.Name`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            res.send(data);
        });
    });
});

app.get('/mark_attendance', function (req, res) {
    console.log('mark_attendance');
    var studentClassID = req.query.studentClassID;
    var newValue = req.query.newValue;
    if (studentClassID == null || studentClassID === "" ||
        newValue == null || newValue === "") {
        res.send("error");
        return;
    }
    var data = [];
    db.serialize(() => {
        db.each(`SELECT ID
            FROM attendance 
            WHERE Student_Class_ID='` + studentClassID + `'`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            data.push(row);
        }, function () {
            console.log(data);
            var dt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            console.log(dt);
            if (data.length > 0) {
                db.run(`UPDATE attendance SET Date='` + dt + `' 
                    WHERE ID='` + data[0]["ID"] + `'`, (err) => {
                    if (err) {
                        return console.log(err.message);
                    }
                    console.log('student record updated in attendance');
                    res.send('student record updated in attendance');
                });
            } else {
                db.run('INSERT INTO attendance(ID, Student_Class_ID, Date) VALUES(?, ?, ?)',
                    [uuidv1(), studentClassID, dt], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                        console.log('student record added in attendance');
                        res.send('student record added in attendance');
                    });
            }
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
        authenticate_user(username, password, function (data) {
            // console.log(data);
            if (data) {
                // console.log('login. ', data);
                res.status(200).json(data);
            } else {
                res.json('invalid username/password');
            }
        });
    }
});

app.get('/logout', function (req, res) {
    console.log('logout. ', req.query);
    var username = req.query.username;
    res.send(username);
});


app.listen(port, hostname, () => {
    console.log(`Tutoring App API server running at http://${hostname}:${port}/`);
});
