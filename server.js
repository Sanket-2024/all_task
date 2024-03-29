const express = require('express');
const dotenv = require('dotenv');
const a = require('./connection');
const bodyParser = require('body-parser');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();
process.env.PORT;


var app = express();

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {

    var sqlselect = [[]];
    var sqlcheckselect = [[]];
    var hours = 0;

    res.render("./pages/registration", { sqlselect, hours, sqlcheckselect });

});

app.post('/', async (req, res) => {

    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var id = null;
    var activationCode = null;
    var hours = null;
    var sqlselect = [[]];


    const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    console.log(arr.length);

    var sault = "";
    var activationCode = "";

    for (let i = 0; i < 4; i++) {

        sault += arr[Math.floor(Math.random() * 62)];

    }

    for (let i = 0; i < 12; i++) {

        activationCode += arr[Math.floor(Math.random() * 62)];

    }

    console.log(sault);
    console.log(activationCode);

    var sqlcheck = `SELECT * FROM registrationdetails_tbl WHERE email = '${email}'`;

    const sqlcheckselect = await a.promise().query(sqlcheck);
    console.log(sqlcheckselect);

    if (sqlcheckselect[0][0]) {
        res.render("./pages/registration", { id, sqlselect, sqlcheckselect, activationCode, hours });
    } else {


        var sql = `INSERT INTO registrationdetails_tbl(firstname, lastname, email, sault, activation_code) VALUES(?,?,?,?,?);`

        const regInsert = await a.promise().query(sql, [fname, lname, email, sault, activationCode], (err, result) => {
            if (err) throw err;
            // console.log(result);

        });
        console.log(regInsert);

        const x = regInsert[0].insertId;
        console.log(x);


        res.render('./pages/activation', { x, activationCode });
    }

});

app.get('/activation/:id', async (req, res) => {

    const id = req.params.id;
    const activationCode = req.query.activationCode;
    const sqlcheckselect = [[]];
    console.log(req.params.id);
    console.log(activationCode);


    const sql = ` SELECT * FROM registrationdetails_tbl WHERE id = ?`;

    const sqlselect = await a.promise().query(sql, [id]);
    console.log(sqlselect);

    var diff = new Date().valueOf() - sqlselect[0][0].created_date.valueOf();
    let hours = Math.floor(diff / (1000 * 60 * 60));

    res.render("./pages/registration", { id, sqlselect, sqlcheckselect, activationCode, hours });

});

app.post('/activation/:id', async (req, res) => {

    var id = req.params.id;
    var re_entered_password = req.body.re_entered_password;
    var sault = req.body.sault;
    console.log(re_entered_password);
    console.log(sault);

    const passwordMd5 = md5(re_entered_password + sault);
    console.log(re_entered_password + sault);
    console.log(passwordMd5);

    var updatesql = `UPDATE registrationdetails_tbl SET password='${passwordMd5}' WHERE  id = '${id}'`;

    const updatePassword = await a.promise().query(updatesql);

    console.log(updatePassword);
    res.render('./pages/log', { id });

});

app.get('/login', (req, res) => {

    const id = req.params.id || "";
    var username = null;
    var password = null;

    res.render('./pages/login', { id, username, password });

});

app.post('/login', async (req, res) => {

    const id = req.params.id || "";
    const username = req.body.username;
    const password = req.body.password;

    var sql = `SELECT * FROM registrationdetails_tbl WHERE email = '${username}'`;

    const registrationData = await a.promise().query(sql);
    console.log(registrationData);

    const passwordMd5 = md5(password + registrationData[0][0].sault);
    console.log(passwordMd5);

    if (username === registrationData[0][0].email && passwordMd5 === registrationData[0][0].password) {

        const token = jwt.sign({ id }, `passwordMd5`, { expiresIn: '1h' });
        res.cookie('token', token, { expires: new Date(Date.now() + 900000), httpOnly: true });
        // res.send("Login Successful!");
        return res.redirect("/home");

    } else {

        return res.redirect('/login');

    }

});

app.get('/forget/:id', async (req, res) => {

    var username = req.query.email;
    console.log(username);
    var id = req.params.id;
    var sqlcheckupdateselect = [[]];
    var hours = 0;
    var sqlcheckselect = [[]];
    var sqlselect = [[]];


    const sql = `SELECT * FROM registrationdetails_tbl WHERE id=${id}`;

    var sqlcheckupdateselect = await a.promise().query(sql);
    console.log(sqlcheckupdateselect);


    if (sqlcheckupdateselect[0][0].email == username) {


        const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        console.log(arr.length);

        var sault = "";
        var activationCode = "";

        for (let i = 0; i < 4; i++) {

            sault += arr[Math.floor(Math.random() * 62)];

        }

        for (let i = 0; i < 12; i++) {

            activationCode += arr[Math.floor(Math.random() * 62)];

        }

        console.log(sault);
        console.log(activationCode);

        var sqlupdate = `UPDATE registrationdetails_tbl SET sault='${sault}', activation_code='${activationCode}' WHERE email = '${username}'`;

        const sqlcheckupdate = await a.promise().query(sqlupdate);
        console.log(sqlcheckupdate);
        res.render('./pages/forget', { activationCode, id });

    } else {
        var password = null;
        res.render('./pages/login', { id, username, password });
    }


});

app.get('/home', (req, res) => {
    console.log(req.cookies);
    console.log(req.query);
    console.log(req.cookies.token);
    const username = "";
    const password = "";
    const id = "";
    if (req.cookies.token) {
        res.render('./pages/home');
    } else {
        res.redirect('/login');
    }
});

app.post('/home', (req, res) => {

    res.send("hello again");
});


app.get('/task01', (req, res) => {

    try {
        if (req.cookies.token) {
            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'table.html'));
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }


});

app.get('/task02', (req, res) => {

    try {
        if (req.cookies.token) {
            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'onclick.html'));
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }


});

app.get('/task03', (req, res) => {

    try {
        if (req.cookies.token) {
            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'game.html'));
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});

app.get('/task04', (req, res) => {

    try {
        if (req.cookies.token) {
            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'tictactoe.html'));
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});

app.get('/task05', (req, res) => {

    try {
        if (req.cookies.token) {


            try {

                const { stuid, name, lastname, dob, contact, email, address1, address2, age, created_date, operator } = req.query;

                const p = req.query.page || 1;
                const offset = (Number(p) - 1) * 50;
                console.log(req.query.operator);
                console.log(req.query);

                var query = `SELECT *,DATE_FORMAT(dob, "%d/%m/%Y") as DOB, DATE_FORMAT(created_date, "%d/%m/%Y %T") as created_at from student_master_tbl `

                const limit = `limit 50 offset ${offset}`

                var data = "";

                const keys = Object.keys(req.query);
                console.log(keys);

                keys.forEach((k) => {

                    if (!query.includes("where") && k != 'page') query += "where";

                    if (k == 'stuid' && k != 'page') query += ` ${k} ="${req.query[k]}" `;

                    console.log(req.query[k]);

                    if (req.query[k] && k != 'operator' && k != 'stuid' && k != 'page') query += ` ${k} LIKE "%${req.query[k]}%" ${req.query['operator']} `;
                })

                if (req.query['operator'] === 'AND') data = query.slice(0, -4);

                if (req.query['operator'] === 'OR') data = query.slice(0, -3);

                console.log(query);


                console.log(data);

                if (data) {
                    a.query(data, (err, result) => {
                        if (err) console.log(err);
                        else {
                            const maxlength = Math.ceil(result.length / 50);
                            const query2 = data + limit;
                            a.query(query2, (err, result) => {
                                if (err) console.log(err);
                                else {
                                    res.render('./pages/view_04_march', { result, p, stuid, name, lastname, dob, contact, email, address1, address2, age, created_date, operator, maxlength });
                                }
                            })
                        }
                    })
                } else {
                    a.query(query, (err, result) => {
                        if (err) console.log(err);
                        else {
                            const maxlength = Math.ceil(result.length / 50);
                            console.log(result.length);
                            console.log(maxlength);
                            const query2 = query + limit;
                            console.log(query2);
                            a.query(query2, (err, result) => {
                                if (err) console.log(err);
                                else {
                                    res.render('./pages/view_04_march', { result, p, stuid, name, lastname, dob, contact, email, address1, address2, age, created_date, operator, maxlength });
                                }
                            })
                        }
                    });
                }
            } catch (error) {
                console.log(error);
            }


        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});

app.get('/task06', (req, res) => {


    try {
        if (req.cookies.token) {
            const p = req.query.page || 1;
            console.log(p);
            const limit = 50;
            const offset = (p - 1) * limit;
            const lastpage = Math.ceil(200 / limit);
            const m = req.query.month || 'december2023'
            const y = m.slice(0, -4);

            var sql = "SELECT s.stuid,s.name,monthname(a.date) as month,count(a.attendance)as presentDay  FROM student_master as s INNER JOIN attendance_tbl as a ON s.stuid = a.er_no WHERE a.attendance = 'P' group by s.stuid,month having month='" + y + "' ORDER BY a.er_no LIMIT " + limit + " offset " + offset + ";"

            a.query(sql, function (err, result) {
                if (err) throw err;
                res.render('./pages/data', { result, p, m, lastpage });
                console.log(result);
            });

        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }



});

app.get('/task07', (req, res) => {


    try {
        if (req.cookies.token) {
            const p = req.query.page || 1;
            const limit = 120;
            const offset = (Number(p) - 1) * limit;
            const lastpage = 5;

            const sql = `SELECT r.result_er_no, s.name, ext.exam_type, sum(r.theorymarks) as theory, sum(r.practicalmarks) as practical FROM result_tbl as r INNER JOIN student_master AS s ON r.result_er_no = s.stuid INNER JOIN examtype_master AS ext ON r.extype_id = ext.id INNER JOIN subject_master as sub ON r.sub_id=sub.id GROUP BY ext.id, s.stuid ORDER BY r.result_er_no LIMIT ${limit} OFFSET ${offset};`

            a.query(sql, (err, result) => {
                if (err) throw err;
                res.render('./pages/resultView', { result, p, lastpage });
                console.log(result);
            });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }



});

app.get('/task07/data', (req, res) => {


    try {
        if (req.cookies.token) {
            const p = req.query.page || 1;
            const id = req.query.id || 1;

            const sql1 = `SELECT s.stuid,s.name,sub.subject_name,r.extype_id,r.theorymarks AS theory, r.practicalmarks AS practical FROM student_master
            AS s INNER JOIN result_tbl as r on r.result_er_no = s.stuid INNER JOIN subject_master as sub on sub.id = r.sub_id where r.result_er_no =${id};`

            const sql2 = `SELECT COUNT(*) AS attendance FROM attendance_tbl WHERE er_no = ${id} and attendance = 'P';`

            a.query(sql1, (err, result1) => {
                if (err) throw err;
                console.log(result1);
                a.query(sql2, (err, result2) => {
                    if (err) throw err;
                    console.log(result2);
                    res.render('./pages/dataView', { result1, result2, id });

                });
            });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }


});

app.get('/task08', async (req, res) => {

    try {
        if (req.cookies.token) {


            const data = req.query.s || "";

            var name = [];
            var lastname = [];
            var dob = [];
            var contact = [];
            var email = [];
            var address1 = [];
            var address2 = [];
            var age = [];
            var created_date = [];

            var sql = `select * ,DATE_FORMAT(dob, "%d/%m/%Y") as DOB,DATE_FORMAT(created_date, "%d/%m/%Y %T") as created_at From student_master`

            var response = await value(data);

            response.forEach((r) => {
                if (!sql.includes(" where ")) sql += " where ";
                if (r.charAt(0) == '_') name.push(`name LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '^') lastname.push(`lastname LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '$') dob.push(`dob LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '{') contact.push(`contact LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '}') email.push(`email LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == ':') address1.push(`address1 LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '>') address2.push(`address2 LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '<') age.push(`age LIKE "%${r.slice(1)}%"`);
                if (r.charAt(0) == '|') created_date.push(`created_date LIKE "%${r.slice(1)}%"`);

            });

            if (name.length > 0) sql += name.join(" OR ") + " AND ";
            if (lastname.length > 0) sql += lastname.join(" OR ") + " AND ";
            if (dob.length > 0) sql += dob.join(" OR ") + " AND ";
            if (contact.length > 0) sql += contact.join(" OR ") + " AND ";
            if (email.length > 0) sql += email.join(" OR ") + " AND ";
            if (address1.length > 0) sql += address1.join(" OR ") + " AND ";
            if (address2.length > 0) sql += address2.join(" OR ") + " AND ";
            if (age.length > 0) sql += age.join(" OR ") + " AND ";
            if (created_date.length > 0) sql += created_date.join(" OR ") + " AND ";


            if (sql.includes("where")) sql = sql.slice(0, -4);

            console.log(sql);

            a.query(sql, (err, result) => {
                if (err) console.log(err);
                else res.render('./pages/search_data', { result, data });
            });



            async function value(data) {
                var values = [];
                let i = 0;

                while (i < data.length) {
                    let v = data.charAt(i);
                    let j = i + 1;
                    while (data.charAt(j) != '_' && data.charAt(j) != '^' && data.charAt(j) != '$' && data.charAt(j) != '{' && data.charAt(j) != '}' && data.charAt(j) != ':' && data.charAt(j) != '<' && data.charAt(j) != '>' && data.charAt(j) != '|' && j != data.length) {
                        v += data.charAt(j);
                        j++;
                    }
                    values.push(v);
                    i = j;
                }
                return values;
            }

        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});

app.get('/task09', (req, res) => {
    try {
        if (req.cookies.token) {
            const p = req.query.page || 1;
            console.log(p);
            const limit = 200;
            const order = req.query.sort || 'asc';
            const order_by = req.query.select || 'stuid';
            const offset = (p - 1) * limit;
            const lastpage = Math.ceil(100000 / limit);

            var sql = `SELECT * FROM student_master_tbl ORDER BY ${order_by} ${order} LIMIT ${limit} offset ${offset}`

            a.query(sql, function (err, result) {
                if (err) throw err;
                const keys = Object.keys(result[0]);
                res.render('./pages/sort_view', { result, p, order_by, keys, order, lastpage });
                console.log(result);

            });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});



app.get('/task10', (req, res) => {

    try {
        if (req.cookies.token) {

            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'info.html'));


        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});

app.get('/task10/detail/:id', (req, res) => {

    try {
        if (req.cookies.token) {

            res.sendFile(path.join(__dirname, 'views', 'pages', 'html_pages', 'detail.html'));


        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});



app.get('/task11', (req, res) => {

    try {
        if (req.cookies.token) {


            var workRecordId = req.body.workRecordId || [];
            var educationId = req.body.educationId || [];
            var languageId = req.body.languageId || [];
            var techrecord = req.body.techrecord || [];

            var empid = req.body.empid || null
            var b_fname = req.body.b_fname || null;
            var b_lname = req.body.b_lname || null;
            var b_designation = req.body.b_designation || null;
            var b_address1 = req.body.b_address1 || null;
            var b_address2 = req.body.b_address2 || null;
            var b_email = req.body.b_email || null;
            var b_phoneno = req.body.b_phoneno || null;
            var b_city = req.body.b_city || null;
            var b_gender = req.body.b_gender || null;
            var b_zipcode = req.body.b_zipcode || null;
            var b_relationship = req.body.b_relationship || null;
            var b_dob = req.body.b_dob || null;


            var e_nameofboard = req.body.e_nameofboard || [];
            var e_passingyear = req.body.e_passingyear || [];
            var e_percentage = req.body.e_percentage || [];


            var w_companyname = req.body.w_companyname || [];
            var w_designation = req.body.w_designation || [];
            var w_from = req.body.w_from || [];
            var w_to = req.body.w_to || [];


            var l_hindi = req.body.l_hindi;
            var l_read_hindi = req.body.l_read_hindi || 0;
            var l_write_hindi = req.body.l_write_hindi || 0;
            var l_speak_hindi = req.body.l_speak_hindi || 0;
            var l_english = req.body.l_english;
            var l_read_english = req.body.l_read_english || 0;
            var l_write_english = req.body.l_write_english || 0;
            var l_speak_english = req.body.l_speak_english || 0;
            var l_gujarati = req.body.l_gujarati;
            var l_read_gujarati = req.body.l_read_gujarati || 0;
            var l_write_gujarati = req.body.l_write_gujarati || 0;
            var l_speak_gujarati = req.body.l_speak_gujarati || 0;





            var languageName = req.body.languageName || [];
            var read = req.body.read || [];
            var write = req.body.write || [];
            var speak = req.body.speak || [];


            var tech = req.body.tech || [];
            var php = req.body.php || null;
            var mysql = req.body.mysql || null;
            var laravel = req.body.laravel || null;
            var oracle = req.body.oracle || null;



            var ref_name = req.body.ref_name || [];
            var ref_contactno = req.body.ref_contactno || [];
            console.log();
            var ref_relation = req.body.ref_relation || [];

            var preferedlocation = req.body.preferedlocation || null;
            var noticeperiod = req.body.noticeperiod || null;
            var expectedctc = req.body.expectedctc || null;
            var currentctc = req.body.currentctc || null;
            var department = req.body.department || null;




            res.render('./pages/form', { workRecordId, educationId, languageId, techrecord, empid, b_fname, b_lname, b_designation, b_address1, b_address2, b_email, b_phoneno, b_city, b_gender, b_zipcode, b_relationship, b_dob, e_nameofboard, e_passingyear, e_percentage, w_companyname, w_designation, w_from, w_to, languageName, read, write, speak, tech, php, mysql, laravel, oracle, ref_name, ref_contactno, ref_relation, preferedlocation, noticeperiod, expectedctc, currentctc, department });




        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }


});

app.post('/task11', async (req, res) => {

    try {
        if (req.cookies.token) {
            console.log(req.body);

            var b_fname = req.body.b_fname || null;
            var b_lname = req.body.b_lname || null;
            var b_designation = req.body.b_designation || null;
            var b_address1 = req.body.b_address1 || null;
            var b_address2 = req.body.b_address2 || null;
            var b_email = req.body.b_email || null;
            var b_phoneno = req.body.b_phoneno || null;
            var b_city = req.body.b_city || null;
            var b_gender = req.body.b_gender || null;
            var b_zipcode = req.body.b_zipcode || null;
            var b_relationship = req.body.b_relationship || null;
            var b_dob = req.body.b_dob || null;
            
            var e_nameofboard = req.body.e_nameofboard || [];
            var e_passingyear = req.body.e_passingyear || [];
            var e_percentage = req.body.e_percentage || [];

           
            var w_companyname = req.body.w_companyname || [];
            var w_designation = req.body.w_designation || [];
            var w_from = req.body.w_from || [];
            var w_to = req.body.w_to || [];


            var l_hindi = req.body.l_hindi;
            var l_read_hindi = req.body.l_read_hindi || 0;
            var l_write_hindi = req.body.l_write_hindi || 0;
            var l_speak_hindi = req.body.l_speak_hindi || 0;
            var l_english = req.body.l_english;
            var l_read_english = req.body.l_read_english || 0;
            var l_write_english = req.body.l_write_english || 0;
            var l_speak_english = req.body.l_speak_english || 0;
            var l_gujarati = req.body.l_gujarati;
            var l_read_gujarati = req.body.l_read_gujarati || 0;
            var l_write_gujarati = req.body.l_write_gujarati || 0;
            var l_speak_gujarati = req.body.l_speak_gujarati || 0;



            var languageName = req.body.languageName || [];
            var read = req.body.read || [];
            var write = req.body.write || [];
            var speak = req.body.speak || [];


            var tech = req.body.tech || [];
            var php_check = req.body.php_check;
            var php = req.body.php || null;
            var mysql_check = req.body.mysql_check;
            var mysql = req.body.mysql || null;
            var laravel_check = req.body.laravel_check;
            var laravel = req.body.laravel || null;
            var oracle_check = req.body.oracle_check;
            var oracle = req.body.oracle || null;

            

            var ref_name = req.body.ref_name || [];
            var ref_contactno = req.body.ref_contactno || [];
            console.log();
            var ref_relation = req.body.ref_relation || [];

            var preferedlocation = req.body.preferedlocation || null;
            var noticeperiod = req.body.noticeperiod || null;
            var expectedctc = req.body.expectedctc || null;
            var currentctc = req.body.currentctc || null;
            var department = req.body.department || null;

            var sqlBasic = `INSERT INTO employeebasic_details(firstname, lastname, dob, email, phoneno, address1, address2, designation, gender_id, relationship_id,city, zipcode) VALUES('${b_fname}', '${b_lname}', '${b_dob}', '${b_email}', '${b_phoneno}', '${b_address1}', '${b_address2}', '${b_designation}', '${b_gender}', '${b_relationship}','${b_city}', '${b_zipcode}');`

            const basicDtl = await a.promise().query(sqlBasic);
            console.log(basicDtl);

            const employee_id = basicDtl[0].insertId;

            // Education Details

            for (let i = 0; i < e_nameofboard.length; i++) {

                if (e_nameofboard[i]) {
                    var sqlEducation = `INSERT INTO education_detail(edu_id, passingyear, percentage, edu_empid) VALUES('${e_nameofboard[i]}','${e_passingyear[i]}', '${e_percentage[i]}', '${employee_id}')`;

                    const eduDtl = await a.promise().query(sqlEducation);
                    console.log(eduDtl);
                }

            }

            // Work Experience

            for (let i = 0; i < w_companyname.length; i++) {

                if (w_companyname[i]) {

                    var sqlWorkExp = `INSERT INTO workexperience (work_empid,companyname,work_from,work_to,designation) VALUES('${employee_id}','${w_companyname[i]}', '${w_from[i]}', '${w_to[i]}', '${w_designation[i]}')`;

                    const workDtl = await a.promise().query(sqlWorkExp);
                    console.log(workDtl);

                }

            }

           

            if (!read[0]) { read[0] = 0 };
            if (!write[0]) { write[0] = 0 };
            if (!speak[0]) { speak[0] = 0 };
            if (!read[1]) { read[1] = 0 };
            if (!write[1]) { write[1] = 0 };
            if (!speak[1]) { speak[1] = 0 };
            if (!read[2]) { read[2] = 0 };
            if (!write[2]) { write[2] = 0 };
            if (!speak[2]) { speak[2] = 0 };

            

            var sqlLanguage1 = `INSERT INTO language_tbl(language_empid, lang_id, read_id, write_id, speak_id) VALUES(${employee_id},'${languageName[0]}','${read[0]}','${write[0]}','${speak[0]}')`;
            var sqlLanguage2 = `INSERT INTO language_tbl(language_empid, lang_id, read_id, write_id, speak_id) VALUES(${employee_id},'${languageName[1]}','${read[1]}','${write[1]}','${speak[1]}')`;
            var sqlLanguage3 = `INSERT INTO language_tbl(language_empid, lang_id, read_id, write_id, speak_id) VALUES(${employee_id},'${languageName[2]}','${read[2]}','${write[2]}','${speak[2]}')`;

            const languageinsert1 = await a.promise().query(sqlLanguage1);
            const languageinsert2 = await a.promise().query(sqlLanguage2);
            const languageinsert3 = await a.promise().query(sqlLanguage3);
            // console.log(languageinsert);
            // }

            // }


            // Technologies 

            var tech = req.body.tech || [];

            // for(let i=0; i<techrecord.length; i++){

            //     if(tech[i]){
            //         var sqlTech = `UPDATE technologies_tbl SET technologies_id='${tech[i]}', skilllevel_id=? WHERE  id='${techrecord[i]}'AND empid = '${empid}'`;

            //         if(tech[i]==1){const phptechDtl = await a.promise().query(sqlTech,[php]); console.log(phptechDtl);}
            //         if(tech[i]==2){const mysqltechDtl = await a.promise().query(sqlTech,[mysql]);console.log(mysqltechDtl);}
            //         if(tech[i]==3){const laraveltechDtl = await a.promise().query(sqlTech,[laravel]);console.log(laraveltechDtl);}
            //         if(tech[i]==4){const oracletechDtl = await a.promise().query(sqlTech,[oracle]);console.log(oracletechDtl);}

            //     }
            // }


            var sqlTech = `INSERT INTO technologies_tbl(empid, technologies_id, skilllevel_id) VALUES(${employee_id},?,?)`;

            if (tech[0]) { const phptechDtl = await a.promise().query(sqlTech, [tech[0], php]); console.log(phptechDtl); }
            if (tech[1]) { const mysqltechDtl = await a.promise().query(sqlTech, [tech[1], mysql]); console.log(mysqltechDtl); }
            if (tech[2]) { const laraveltechDtl = await a.promise().query(sqlTech, [tech[2], laravel]); console.log(laraveltechDtl); }
            if (tech[3]) { const oracletechDtl = await a.promise().query(sqlTech, [tech[3], oracle]); console.log(oracletechDtl); }


            // Reference Contact

            for (let i = 0; i < ref_name.length; i++) {

                if (ref_name[i]) {

                    var sqlReference = `INSERT INTO referencecontact_tbl(ref_empid, name, contactno, relation) VALUES(${employee_id}, '${ref_name[i]}', '${ref_contactno[i]}', '${ref_relation[i]}')`;

                    const refDtl = await a.promise().query(sqlReference);

                    console.log(refDtl);

                }

            }

            // preference 

            var sqlPref = `INSERT INTO preference_tbl(pref_empid, prefered_location, noticeperiod, expectedctc, currentctc, department_id) VALUES(${employee_id}, '${preferedlocation}', '${noticeperiod}', '${expectedctc}', '${currentctc}', '${department}')`;

            const prefDtl = await a.promise().query(sqlPref);
            console.log(prefDtl);


            // res.render('./pages/ajax_form_data',{employee_id});

        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});

app.get('/task11/grid', async (req, res) => {

    try {
        if (req.cookies.token) {

            var p = req.query.page || 1;
            const limit = 20;
            const offset = (Number(p) - 1) * limit;
            const lastpage = Math.ceil(300 / limit);



            var tsql = `SELECT * FROM employeebasic_details limit ${limit} offset ${offset} ;`

            const sd = await a.promise().query(tsql);
            console.log(sd);


            console.log(sd[0].length);

            res.render('./pages/ajax_form_data', { sd, lastpage, p });
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }

});



app.get('/task11/UpdateData', async (req, res) => {

    try {
        if (req.cookies.token) {

            var insertedId = req.query.id || 1;
            console.log(insertedId);

            var sqlBasicSelect = `SELECT * FROM employeebasic_details WHERE emp_id = ${insertedId}`;
            var sqlEduSelect = `SELECT * FROM education_detail WHERE edu_empid = ${insertedId}`;
            var sqlWorkSelect = `SELECT * FROM workexperience WHERE work_empid = ${insertedId}`;
            var sqlLanguageSelect = `SELECT * FROM language_tbl WHERE language_empid = ${insertedId}`;
            var sqltechSelect = `SELECT * FROM technologies_tbl WHERE empid = ${insertedId}`;
            var sqlrefSelect = `SELECT * FROM referencecontact_tbl WHERE ref_empid = ${insertedId}`;
            var sqlprefSelect = `SELECT * FROM preference_tbl WHERE pref_empid = ${insertedId}`;

            const UbasicDtl = await a.promise().query(sqlBasicSelect);
            console.log(UbasicDtl);
            const UeduDtl = await a.promise().query(sqlEduSelect);
            console.log(UeduDtl);
            const UworkDtl = await a.promise().query(sqlWorkSelect);
            if (!UworkDtl) {
                const UworkDtl = [];
            }
            console.log(UworkDtl);
            const UlangDtl = await a.promise().query(sqlLanguageSelect);
            if (!UlangDtl) {
                const UlangDtl = [];
            }
            console.log(UlangDtl);
            const UtechDtl = await a.promise().query(sqltechSelect);
            if (!UtechDtl) {
                const UtechDtl = [];
            }
            console.log(UtechDtl);
            const UrefDtl = await a.promise().query(sqlrefSelect);
            if (!UrefDtl) {
                const UrefDtl = [];
            }
            console.log(UrefDtl);
            const UprefDtl = await a.promise().query(sqlprefSelect) || [];
            console.log(UprefDtl);

            console.log(UbasicDtl[0][0].emp_id);
            // console.log(UprefDtl[0][0].prefered_location);

            res.render('./pages/UpdateForm', { UbasicDtl, UeduDtl, UworkDtl, UlangDtl, UtechDtl, UrefDtl, UprefDtl });

        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});

app.post('/task11/UpdateData', async (req, res) => {

    try {
        if (req.cookies.token) {

            console.log(req.body);

            var workRecordId = req.body.workRecordId || [];
            var educationId = req.body.educationId || [];
            var languageId = req.body.languageId || [];
            var techrecord = req.body.techrecord || [];


            var empid = req.body.empid || 100;
            console.log(empid);
            var b_fname = req.body.b_fname;
            var b_lname = req.body.b_lname;
            var b_designation = req.body.b_designation;
            var b_address1 = req.body.b_address1;
            var b_address2 = req.body.b_address2;
            var b_email = req.body.b_email;
            var b_phoneno = req.body.b_phoneno;
            var b_city = req.body.b_city;
            var b_gender = req.body.b_gender;
            var b_zipcode = req.body.b_zipcode;
            var b_relationship = req.body.b_relationship;
            var b_dob = req.body.b_dob;
           
           

            var e_nameofboard = req.body.e_nameofboard;
            var e_passingyear = req.body.e_passingyear;
            var e_percentage = req.body.e_percentage;

           

            var w_companyname = req.body.w_companyname;
            var w_designation = req.body.w_designation;
            var w_from = req.body.w_from;
            var w_to = req.body.w_to;


            var l_hindi = req.body.l_hindi;
            var l_read_hindi = req.body.l_read_hindi || 0;
            var l_write_hindi = req.body.l_write_hindi || 0;
            var l_speak_hindi = req.body.l_speak_hindi || 0;
            var l_english = req.body.l_english;
            var l_read_english = req.body.l_read_english || 0;
            var l_write_english = req.body.l_write_english || 0;
            var l_speak_english = req.body.l_speak_english || 0;
            var l_gujarati = req.body.l_gujarati;
            var l_read_gujarati = req.body.l_read_gujarati || 0;
            var l_write_gujarati = req.body.l_write_gujarati || 0;
            var l_speak_gujarati = req.body.l_speak_gujarati || 0;

          
            var languageName = req.body.languageName || [];
            var read = req.body.read || [];
            var write = req.body.write || [];
            var speak = req.body.speak || [];


            var php_check = req.body.php_check || null;
            var php = req.body.php || null;
            var mysql_check = req.body.mysql_check || null;
            var mysql = req.body.mysql || null;
            var laravel_check = req.body.laravel_check || null;
            var laravel = req.body.laravel || null;
            var oracle_check = req.body.oracle_check || null;
            var oracle = req.body.oracle || null;

           

            var ref_name = req.body.ref_name || null;
            var ref_contactno = req.body.ref_contactno || null;
            console.log();
            var ref_relation = req.body.ref_relation || null;

            var preferedlocation = req.body.preferedlocation || null;
            var noticeperiod = req.body.noticeperiod || null;
            var expectedctc = req.body.expectedctc || null;
            var currentctc = req.body.currentctc || null;
            var department = req.body.department || null;
            console.log(req.body);

            var sqlBasicUpdate = `UPDATE employeebasic_details SET firstname = '${b_fname}', lastname = '${b_lname}', dob= '${b_dob}', email ='${b_email}', phoneno = '${b_phoneno}', address1= '${b_address1}', address2 = '${b_address2}', designation='${b_designation}', gender_id='${b_gender}', relationship_id = '${b_relationship}',city='${b_city}', zipcode ='${b_zipcode}' WHERE emp_id = '${empid}'`;

            const updatebasicDtl = await a.promise().query(sqlBasicUpdate);
            console.log(updatebasicDtl);


            // Education Details

            for (let i = 0; i < e_nameofboard.length; i++) {

                if (e_nameofboard[i]) {

                    var sqlEducationUpdate = `UPDATE education_detail SET edu_id = '${e_nameofboard[i]}', passingyear = '${e_passingyear[i]}', percentage = '${e_percentage[i]}' WHERE  edu_empid = '${empid}' AND id = '${educationId[i]}'`;


                    const updateEduDtl = await a.promise().query(sqlEducationUpdate);
                    console.log(updateEduDtl);
                }

            }

            // Work Experience

            for (let i = 0; i < w_companyname.length; i++) {

                if (w_companyname[i]) {

                    var sqlWorkExpUpdate = `UPDATE workexperience SET companyname = '${w_companyname[i]}', work_from = '${w_from[i]}', work_to = '${w_to[i]}', designation = '${w_designation[i]}' WHERE work_empid = '${empid}' AND id = '${workRecordId[i]}'`;

                    const WorkExpup = await a.promise().query(sqlWorkExpUpdate);
                    console.log(WorkExpup);

                }

            }

            



            for (let i = 0; i < languageName.length; i++) {

                if (languageName[i]) {

                    if (!read[i]) { read[i] = 0 };
                    if (!write[i]) { write[i] = 0 };
                    if (!speak[i]) { speak[i] = 0 };

                    var sqlLanguageUpdate = `UPDATE language_tbl SET lang_id = '${languageName[i]}', read_id= '${read[i]}', write_id='${write[i]}', speak_id='${speak[i]}' WHERE language_empid = '${empid}' AND id = '${languageId[i]}'`;


                    const languageUpdate = await a.promise().query(sqlLanguageUpdate);
                    console.log(languageUpdate);
                }

            }

            // Technologies 
            var tech = req.body.tech || [];

            for (let i = 0; i < techrecord.length; i++) {

                if (tech[i]) {
                    var sqlTech = `UPDATE technologies_tbl SET technologies_id='${tech[i]}', skilllevel_id=? WHERE  id='${techrecord[i]}'AND empid = '${empid}'`;

                    if (tech[i] == 1) { const phptechDtl = await a.promise().query(sqlTech, [php]); console.log(phptechDtl); }
                    if (tech[i] == 2) { const mysqltechDtl = await a.promise().query(sqlTech, [mysql]); console.log(mysqltechDtl); }
                    if (tech[i] == 3) { const laraveltechDtl = await a.promise().query(sqlTech, [laravel]); console.log(laraveltechDtl); }
                    if (tech[i] == 4) { const oracletechDtl = await a.promise().query(sqlTech, [oracle]); console.log(oracletechDtl); }

                }
            }

            // Reference Contact
            var referenceRecord = req.body.referenceRecord;

            for (let i = 0; i < ref_name.length; i++) {

                if (ref_name[i]) {

                    var sqlReferenceUpdate = `UPDATE referencecontact_tbl SET name = '${ref_name[i]}', contactno = '${ref_contactno[i]}', relation =  '${ref_relation[i]}' WHERE ref_empid = '${empid}' AND referencecontact_id = '${referenceRecord[i]}'`;


                    const refDtl = await a.promise().query(sqlReferenceUpdate);

                    console.log(refDtl);

                }

            }


            // preference 

            var sqlPrefUpdate = `UPDATE preference_tbl SET prefered_location = '${preferedlocation}', noticeperiod = '${noticeperiod}', expectedctc =  '${expectedctc}', currentctc = '${currentctc}', department_id = '${department}' WHERE pref_empid = '${empid}'`;


            const prefDtl = await a.promise().query(sqlPrefUpdate);
            console.log(prefDtl);



            res.send("data updated");
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        console.log(e);
    }
});




app.listen("7000", () => {
    console.log("Server is listening on port 7000");
});