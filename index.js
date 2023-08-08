const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const util = require('util');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testPass1?',
    database: 'business_db'
});

const query = util.promisify(db.query).bind(db);

function getAllDepartments() {
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function getAllRoles() {
    db.query(`SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function getAllEmployees() {
    db.query(`
    SELECT e1.id, e1.first_name, e1.last_name, role.title, role.salary, department.name AS department, CONCAT(e2.first_name, ' ', e2.last_name) AS manager
    FROM employee e1
    JOIN role ON e1.role_id = role.id
    LEFT JION employee e2
    ON e1.manager_id = e2.id`, (err, results) => {
        if (err) console.log(err)
        else {
            console.table(results);
            mainMenu();
        }
    })
}

function addDepartment() {
    inquirer.createPromptModule([
        {
            name: 'deptName',
            message: 'What would you like to call the department?',
            type: 'input'
        }
    ])
    .then(answer => {
        db.query(`INSERT INTO department (name) VALUES (?)`, answer.deptName, (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`${answer.deptName} added to the database!`);
                mainMenu();
            }
        })
    })
}

async function addRole() {
    const depts = await query(`SELECT * FROM department`)
    inquirer.createPromptModule([
        {
            name: 'title',
            message: 'Give this role a title:',
            type: 'Input'
        },
        {
            name: 'salary',
            message: 'Enter the salary:',
            type: 'input'
        },
        {
            name: 'dept',
            message: 'Which department does this role occupy?',
            type: 'list',
            choices: depts.map(obj => obj.name)
        }
    ])
    .then(answer => {
        let deptID = depts.filter(obj => {
            return obj.name == answer.dept;
        })
        db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answer.title, answer.salary, deptID[0].id], (err, results) => {
            if (err) console.log(err)
            else {
                console.log(`The role of ${answer.title} has been added to the database!`);
                mainMenu();
            }
        })
    })
}

async function addEmployees() {
    
}