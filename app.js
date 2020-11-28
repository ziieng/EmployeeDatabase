// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const { Table } = require("console-table-printer");
// documentation: https://console-table.netlify.app/docs/

// Set the port of our application
const PORT = process.env.PORT || 8080;

// MySQL DB Connection Information (remember to change this with our specific credentials)
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "empTrack_DB",
});

// Initiate MySQL Connection.
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  chooseRoute();
});

//REQUIREMENTS
// Employee Mgmt Database
//   Department table
//   Role table
//   Employee table
// MySQL Queries
//   Constructor or class to contain/organize them?
// Inquirer interface
//   console-table-printer is prettier

//Interface Path
//  If no database, create DB
//  (**If no departments, force create one?)
//  (**If no roles, force create one?)
//  (**If no employees, force create one?)
//
function chooseRoute() {
  inquirer
    .prompt({
      name: "next",
      type: "list",
      message: "What type of action would you like to take?",
      choices: ["View", "Edit", "Add", "Delete", "Exit"],
    })
    .then((ans) => {
      switch (ans.next) {
        case "View":
          chooseView();
          break;
        case "Edit":
          chooseEdit();
          //view choices
          break;
        case "Add":
          chooseAdd();
          //view choices
          break;
        case "Delete":
          chooseDelete();
          //view choices
          break;
        case "Exit":
          console.log("See you later!");
          //close
          break;
      }
    });
}

function chooseView() {
  inquirer
    .prompt({
      name: "query",
      type: "list",
      message: "What would you like to view?",
      choices: [
        new inquirer.Separator("DEPARTMENTS:"),
        "All departments",
        "Utilized budget of a department",
        new inquirer.Separator("ROLES:"),
        "All Roles",
        "Roles in a department",
        new inquirer.Separator("EMPLOYEES:"),
        "All employees",
        "Employees in a department",
        "Employees reporting to same manager",
        new inquirer.Separator("OR:"),
        "Go back",
        new inquirer.Separator("*****"),
      ],
    })
    .then((ans) => {
      switch (ans.query) {
        case "All departments":
          //query: select * from departments
          break;
        case "Utilized budget of a department":
          //query: select (sum of salaries) from role where dept_id is (selected)
          break;
        case "All Roles":
          //query: select * from roles
          //page breaks?
          break;
        case "Roles in a department":
          //include option for null
          //query: select * from roles where dept_id is (selected)
          break;
        case "All employees":
          //query: select * from employees
          //page breaks?
          break;
        case "Employees by department":
          //query: select * from employees where dept_id is (selected)
          //page breaks?
          break;
        case "Employees by manager":
          //include option for null!
          //query: select * from employees where manager_id is (selected)
          //page breaks?
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

function chooseEdit() {
  inquirer
    .prompt({
      name: "query",
      type: "list",
      message: "What would you like to edit?",
      choices: [
        "Update employee's manager",
        "Update employee's role",
        "Update salary of role",
        "Update department of role",
        new inquirer.Separator("OR:"),
        "Go back",
      ],
    })
    .then((ans) => {
      switch (ans.query) {
        case "Update employee's manager":
          //choose employee
          //query: update employees set manager_id=(selected) where id=(selected)
          break;
        case "Update employee's role":
          //choose employee
          //query: update employees set role_id=(selected) where id=(selected)
          break;
        case "Update salary of role":
          //choose role (also show emp in it?)
          //query: update roles set salary=(input) where id=(selected)
          break;
        case "Update department of role":
          //choose role (also show emp in it?)
          //query: update roles set dept_id=(input) where id=(selected)
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

function chooseAdd() {
  inquirer
    .prompt({
      name: "query",
      type: "list",
      message: "What would you like to add?",
      choices: [
        "New Employee",
        "New Role",
        "New Department",
        new inquirer.Separator("OR:"),
        "Go back",
      ],
    })
    .then((ans) => {
      switch (ans.query) {
        case "New Employee":
          //-> First Name
          //-> Last Name
          //-> Role (if more than 5, prompt which department first)
          //-> Manager
          //query: insert into employee (first_name, last_name, role_id, manager_id) value (prompt results)
          break;
        case "New Role":
          //-> Title
          //-> Salary
          //-> Department
          //query: insert into role (title, salary, department_id) value (prompt results)
          break;
        case "New Department":
          //-> Name
          //query: insert into department (name) value (input)
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

function chooseDelete() {
  inquirer
    .prompt({
      name: "query",
      type: "list",
      message: "What would you like to remove?",
      choices: [
        "Delete Employee",
        "Delete Role",
        "Delete Department",
        new inquirer.Separator("OR:"),
        "Go back",
      ],
    })
    .then((ans) => {
      switch (ans.query) {
        case "Delete Employee":
          //choose employee
          //CHECK if they're anyone's manager
          //**if yes, alert user and ask if reports should be deleted too
          //query: delete from employee where id=(selected)
          //followup, keep reports: update employees set manager_id=(null) where manager_id=(selected)
          //followup, deleting reports: delete from employee where manager_id=(selected)
          break;
        case "Delete Role":
          //choose role
          //CHECK if anyone's assigned to it
          //**if yes, alert user that assignees will be deleted too, confirm OK
          //query: delete from role where id=(selected)
          break;
        case "Delete Department":
          //choose department
          //CHECK if anyone's assigned to it
          //**if yes, alert user and ask if assignees should be deleted too
          //**if keep reports: update role set department_id=(null) where department_id=(selected)
          //query: delete from department where id=(selected)
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}
