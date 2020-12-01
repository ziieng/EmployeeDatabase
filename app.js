// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const Options = require("./queries");
require("dotenv").config();
const { Table } = require("console-table-printer");
// documentation: https://console-table.netlify.app/docs/

// Set the port of our application
const PORT = process.env.PORT || 8080;

//establish variables for tables
let p = new Table();
let call = "";

console.log(`\n\n\n
  ███████╗███╗   ███╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗███████╗    
  ██╔════╝████╗ ████║██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔════╝    
  █████╗  ██╔████╔██║██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  █████╗      
  ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══╝      
  ███████╗██║ ╚═╝ ██║██║     ███████╗╚██████╔╝   ██║   ███████╗███████╗    
  ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝    
                                                                          
          ██████╗  █████╗ ████████╗ █████╗ ██████╗  █████╗ ███████╗███████╗
          ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝
          ██║  ██║███████║   ██║   ███████║██████╔╝███████║███████╗█████╗  
          ██║  ██║██╔══██║   ██║   ██╔══██║██╔══██╗██╔══██║╚════██║██╔══╝  
          ██████╔╝██║  ██║   ██║   ██║  ██║██████╔╝██║  ██║███████║███████╗
          ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝`);

// MySQL DB Connection Information
const connection = mysql.createConnection({
  host: "localhost",
  port: process.env.MYSQL_PORT,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "empTrack_DB",
  multipleStatements: true,
});

let Lister = new Options(connection);

// Initiate MySQL Connection.
connection.connect(function (err) {
  if (err) throw err;
  console.log("\n\n");
  //start interface
  chooseRoute();
});

// MAIN MENU function
async function chooseRoute() {
  console.log("");
  inquirer
    .prompt({
      name: "next",
      type: "list",
      message: "What type of action would you like to take?",
      choices: ["View", "Edit", "Add", "Delete", "Exit"],
    })
    .then((ans) => {
      //split by subfunction
      switch (ans.next) {
        case "View":
          chooseView();
          break;
        case "Edit":
          chooseEdit();
          break;
        case "Add":
          chooseAdd();
          break;
        case "Delete":
          chooseDelete();
          break;
        case "Exit":
          console.log("See you later!");
          //close MySQL connection
          connection.end();
          break;
      }
    });
}

async function chooseView() {
  console.log("");
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
          //set up table instance
          p = new Table({
            title: "All Departments",
            columns: [{ name: "Department Name", alignment: "center" }],
          });
          //QUERY: department names; only time this call is used
          connection.query(
            `SELECT name AS 'Department Name' FROM department ORDER BY name`,
            (err, res) => {
              if (err) throw err;
              //feed query results directly into table, print table
              p.addRows(res);
              console.log("\n");
              p.printTable();
              //return to main menu
              chooseRoute();
            }
          );
          break;
        case "Utilized budget of a department":
          //QUERY: department list
          call = Lister.departmentList();
          connection.query(call, (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line,
              });
            }
            //ask user to choose department from list
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: deptList,
                  message: "Which department would you like to see?",
                },
              ])
              .then((ans) => {
                //set up table instance
                p = new Table({
                  title: `Utilized Budget`,
                  columns: [
                    { name: "Department", alignment: "center" },
                    { name: "Total Salary", alignment: "center" },
                  ],
                });
                //QUERY: utilized budget, only time this call is used
                connection.query(
                  `SELECT 
                    SUM(salary) AS 'Total Salary',
                    name AS 'Department'
                  FROM 
                    role 
                  LEFT JOIN 
                    department 
                  ON 
                    role.department_id = department.d_id
                  LEFT JOIN
                    employee
                  ON
                    employee.role_id=role.r_id
                  WHERE
                    department_id = "${ans.dept.d_id}"`,
                  (err, res) => {
                    if (err) throw err;
                    //feed query results directly into table, print table
                    p.addRows(res);
                    console.log("\n");
                    p.printTable();
                    //return to main menu
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "All Roles":
          //set up table instance
          p = new Table({
            title: "All Roles (sorted by Title)",
            columns: [
              { name: "Role", alignment: "center" },
              { name: "Department", alignment: "center" },
              { name: "Salary", alignment: "center" },
            ],
            disabledColumns: ["r_id"],
          });
          //QUERY: role table
          call = Lister.roleList("", "title ASC");
          connection.query(call, (err, res) => {
            if (err) throw err;
            //feed query results directly into table, print table
            p.addRows(res);
            console.log("\n");
            p.printTable();
            chooseRoute();
          });
          break;
        case "Roles in a department":
          //QUERY: department list
          call = Lister.departmentList();
          connection.query(call, (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line,
              });
            }
            //ask user to choose department from list
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: deptList,
                  message: "Which department would you like to see?",
                },
              ])
              .then((ans) => {
                //set up table instance
                p = new Table({
                  title: `All Roles in ${ans.dept.name}`,
                  columns: [
                    { name: "Role", alignment: "center" },
                    { name: "Salary", alignment: "center" },
                    { name: "Employees in Role", alignment: "center" },
                  ],
                });
                //QUERY: role count in department, only time this call is used
                connection.query(
                  `SELECT 
                    COUNT(role_id) AS 'Employees in Role',
                    title AS 'Role', 
                    salary AS 'Salary' 
                  FROM 
                    role 
                  LEFT JOIN 
                    department 
                  ON 
                    role.department_id = department.d_id
                  LEFT JOIN
                    employee
                  ON
                    employee.role_id=role.r_id
                  WHERE
                    department_id = "${ans.dept.d_id}"
                  GROUP BY 
                    role_id`,
                  (err, res) => {
                    if (err) throw err;
                    //feed query results directly into table, print table
                    p.addRows(res);
                    console.log("\n");
                    p.printTable();
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "All employees":
          //set up table instance
          p = new Table({
            title: `All Employees`,
            columns: [
              { name: "Name", alignment: "center" },
              { name: "Role", alignment: "center" },
              { name: "Department", alignment: "center" },
              { name: "Salary", alignment: "center" },
            ],
            disabledColumns: ["e_id"],
          });
          //QUERY: employees table
          call = Lister.employeeList("", "last_name ASC");
          connection.query(call, (err, res) => {
            if (err) throw err;
            //feed query results directly into table, print table
            p.addRows(res);
            console.log("\n");
            p.printTable();
            chooseRoute();
          });
          break;
        case "Employees in a department":
          //QUERY: department list
          call = Lister.departmentList();
          connection.query(call, (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line,
              });
            }
            //ask user to choose department from list
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: deptList,
                  message: "Which department would you like to see?",
                },
              ])
              .then((ans) => {
                //set up table instance
                p = new Table({
                  title: `Employees in ${ans.dept.name}`,
                  columns: [
                    { name: "Name", alignment: "center" },
                    { name: "Role", alignment: "center" },
                    { name: "Salary", alignment: "center" },
                  ],
                  disabledColumns: ["Department", "e_id"],
                });
                //QUERY: employee table in department
                call = Lister.employeeList(
                  `department_id = ${ans.dept.d_id}`,
                  "last_name ASC"
                );
                connection.query(call, (err, res) => {
                  if (err) throw err;
                  //feed query results directly into table, print table
                  p.addRows(res);
                  console.log("\n");
                  p.printTable();
                  chooseRoute();
                });
              });
          });
          break;
        case "Employees reporting to same manager":
          //QUERY: employees who have a direct report
          call = Lister.employeeList(
            `e_id IN (SELECT DISTINCT manager_id FROM employee)`,
            "'Department' ASC, last_name ASC"
          );
          connection.query(call, (err, res) => {
            //make result into an array for the inquirer prompt
            let mgrList = [
              {
                name: "(No manager assigned)",
                value: { Name: "(No manager assigned)", e_id: "NULL" },
              },
            ];
            for (let line of res) {
              mgrList.push({
                name: `${line.Name} (${line.Role} in ${line.Department})`,
                value: { Name: line.Name, e_id: line.e_id },
              });
            }
            mgrList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            //ask user which manager they want to see
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "mgr",
                  choices: mgrList,
                  message: "Which manager's team would you like to see?",
                },
              ])
              .then((ans) => {
                let mgr = ans.mgr;
                //set up table instance
                p = new Table({
                  title: `Employees reporting to ${mgr.Name}`,
                  columns: [
                    { name: "Name", alignment: "center" },
                    { name: "Role", alignment: "center" },
                    { name: "Department", alignment: "center" },
                  ],
                });
                //Adjust employee ID variable to reflect MySQL's syntax needs
                if (mgr.e_id == "NULL") {
                  mgr.e_id = "IS NULL";
                } else {
                  mgr.e_id = `= ${mgr.e_id}`;
                }
                connection.query(
                  `SELECT 
                      CONCAT(last_name, ", ", first_name) AS 'Name',
                      title AS 'Role',
                      name AS 'Department'
                    FROM 
                      role 
                    LEFT JOIN 
                      department 
                    ON 
                      role.department_id = department.d_id
                    LEFT JOIN
                      employee
                    ON
                      employee.role_id=role.r_id
                    WHERE
                      manager_id ${mgr.e_id}
                    ORDER BY 
                      last_name`,
                  (err, res) => {
                    if (err) throw err;
                    //feed query results directly into table, print table
                    p.addRows(res);
                    console.log("\n");
                    p.printTable();
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

async function chooseEdit() {
  console.log("");
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
      // let empID = 0;
      switch (ans.query) {
        case "Update employee's manager":
          //QUERY: employees list
          call = Lister.employeeList("", "name ASC, last_name ASC");
          connection.query(call, (err, res) => {
            let empList = [];
            for (let line of res) {
              empList.push({
                name: `${line.Name} (${line.Role} in ${line.Department})`,
                value: { Name: line.Name, e_id: line.e_id },
              });
            }
            empList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "emp",
                  choices: empList,
                  message: "Which employee would you like to edit?",
                },
                {
                  type: "list",
                  name: "mgr",
                  choices: empList,
                  message: "Which employee should be their new manager?",
                },
              ])
              .then((ans) => {
                let emp = ans.emp;
                let mgr = ans.mgr;
                if (emp == "CANCEL" || mgr == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseEdit();
                } else if (emp == mgr) {
                  console.log(
                    "\nAn employee can't be assigned as their own manager. Please try again.\n"
                  );
                  chooseEdit();
                } else {
                  //confirm
                  console.log("");
                  inquirer
                    .prompt([
                      {
                        type: "confirm",
                        name: "conf",
                        message: `Please confirm: \n ** ${mgr.Name} ** \n will be assigned as the NEW MANAGER FOR\n ** ${emp.Name} **\n`,
                      },
                    ])
                    .then((ans) => {
                      if (ans.conf == false) {
                        console.log("\nCancelling change.\n");
                        //cancel, go back
                        chooseEdit();
                      } else {
                        //QUERY: UPDATE: manager_id
                        connection.query(
                          `UPDATE 
                              employee
                            SET
                              manager_id = ${mgr.e_id}
                            WHERE
                              e_id = ${emp.e_id}`,
                          (err, res) => {
                            if (err) throw err;
                            console.log(
                              `\nUpdated ${emp.Name}'s manager to ${mgr.Name} successfully!\n`
                            );
                            chooseRoute();
                          }
                        );
                      }
                    });
                }
              });
          });
          break;
        case "Update employee's role":
          //QUERY: employee list AND role list
          call =
            Lister.employeeList("", "name ASC, last_name ASC") +
            " ; " +
            Lister.roleList("", "name ASC, title ASC");
          connection.query(call, (err, res) => {
            let empList = [];
            let roleList = [];
            for (let line of res[0]) {
              empList.push({
                name: `${line.Name} (${line.Role} in ${line.Department} - salary $${line.salary})`,
                value: { Name: line.Name, e_id: line.e_id },
              });
            }
            empList.push({ name: "(CANCEL)", value: "CANCEL" });
            for (let line of res[1]) {
              roleList.push({
                name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                value: line,
              });
            }
            roleList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "emp",
                  choices: empList,
                  message: "Which employee would you like to edit?",
                },
                {
                  type: "list",
                  name: "role",
                  choices: roleList,
                  message: "What should their new role be?",
                },
              ])
              .then((ans) => {
                let emp = ans.emp;
                let role = ans.role;
                if (emp == "CANCEL" || role == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseEdit();
                } else {
                  //confirm
                  console.log("");
                  inquirer
                    .prompt([
                      {
                        type: "confirm",
                        name: "conf",
                        message: `Please confirm: \n ** ${emp.Name} ** \n will be assigned to NEW ROLE \n ** ${role.Role} in ${role.Department} (salary $${role.salary}) **\n`,
                      },
                    ])
                    .then((ans) => {
                      if (ans.conf == false) {
                        console.log("\nCancelling change.\n");
                        //cancel, go back
                        chooseEdit();
                      } else {
                        //QUERY: UPDATE: role_id
                        connection.query(
                          `UPDATE 
                              employee
                            SET
                              role_id = ${role.r_id}
                            WHERE
                              e_id = ${emp.e_id}`,
                          (err, res) => {
                            if (err) throw err;
                            console.log(
                              `\nUpdated ${emp.Name}'s role to ${role.Role} (${role.Department}) successfully!\n`
                            );
                            chooseRoute();
                          }
                        );
                      }
                    });
                }
              });
          });
          break;
        case "Update salary of role":
          //QUERY: role list
          call = Lister.roleList("", "name ASC, title ASC");
          connection.query(call, (err, res) => {
            let roleList = [];
            for (let line of res) {
              roleList.push({
                name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                value: line,
              });
            }
            roleList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "role",
                  choices: roleList,
                  message: "Which role do you want to update the salary for?",
                },
                {
                  type: "number",
                  name: "sal",
                  message: "What should its new salary be?",
                },
              ])
              .then((ans) => {
                let role = ans.role;
                let sal = ans.sal;
                if (role == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseEdit();
                } else {
                  //set up table instance
                  p = new Table({
                    title: `\n\nEmployees assigned \n   to this role`,
                    columns: [{ name: "Name", alignment: "center" }],
                    enabledColumns: ["Name"],
                  });
                  //QUERY: employees in role
                  call = Lister.employeeList(
                    `role_id = ${role.r_id}`,
                    "last_name ASC"
                  );
                  connection.query(call, (err, res) => {
                    if (err) throw err;
                    //feed query results directly into table, print table
                    p.addRows(res);
                    console.log("\n");
                    p.printTable();
                    //confirm
                    console.log("");
                    inquirer
                      .prompt([
                        {
                          type: "confirm",
                          name: "conf",
                          message: `\n(NOTE: affected employees listed above)\nPlease confirm: \n ** ${role.Role} ** \n will be updated to reflect salary \n ** $${sal} **\n`,
                        },
                      ])
                      .then((ans) => {
                        if (ans.conf == false) {
                          console.log("\nCancelling change.\n");
                          //cancel, go back
                          chooseEdit();
                        } else {
                          //QUERY: UPDATE: salary by r_id
                          connection.query(
                            `UPDATE 
                                  role
                                SET
                                  salary = ${sal}
                                WHERE
                                  r_id = ${role.r_id}`,
                            (err, res) => {
                              if (err) throw err;
                              console.log(
                                `\nUpdated ${role.Role}'s salary to ${sal} successfully!\n`
                              );
                              chooseRoute();
                            }
                          );
                        }
                      });
                  });
                }
              });
          });
          break;
        case "Update department of role":
          //QUERY: role list AND department list
          call =
            Lister.roleList("", "name ASC, title ASC") +
            ";" +
            Lister.departmentList();
          connection.query(call, (err, res) => {
            let roleList = [];
            let deptList = [];
            for (let line of res[0]) {
              roleList.push({
                name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                value: line,
              });
            }
            roleList.push({ name: "(CANCEL)", value: "CANCEL" });
            for (let line of res[1]) {
              deptList.push({
                name: line.name,
                value: line,
              });
            }
            deptList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "role",
                  choices: roleList,
                  message:
                    "Which role do you want to move to another department?",
                },
                {
                  type: "list",
                  name: "dept",
                  choices: deptList,
                  message: "Which department should it be moved to?",
                },
              ])
              .then((ans) => {
                let role = ans.role;
                let dept = ans.dept;
                if (dept == "CANCEL" || role == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseEdit();
                } else {
                  //set up table instance
                  p = new Table({
                    title: `\n\nEmployees assigned \n   to this role`,
                    columns: [{ name: "Name", alignment: "center" }],
                    enabledColumns: ["Name"],
                  });
                  //QUERY: employees in role
                  call = Lister.employeeList(
                    `role_id = ${role.r_id}`,
                    "last_name ASC"
                  );
                  connection.query(call, (err, res) => {
                    if (err) throw err;
                    //feed query results directly into table, print table
                    p.addRows(res);
                    console.log("\n");
                    p.printTable();
                    //confirm
                    console.log("");
                    inquirer
                      .prompt([
                        {
                          type: "confirm",
                          name: "conf",
                          message: `\n(NOTE: affected employees listed above)\nPlease confirm: \n ** ${role.Role} ** \n will be assigned to NEW DEPARTMENT \n ** ${dept.name} **\n`,
                        },
                      ])
                      .then((ans) => {
                        if (ans.conf == false) {
                          console.log("\nCancelling change.\n");
                          //cancel, go back
                          chooseEdit();
                        } else {
                          //QUERY: UPDATE: department_id by r_id
                          connection.query(
                            `UPDATE 
                              role
                            SET
                              department_id = ${dept.d_id}
                            WHERE
                              r_id = ${role.r_id}`,
                            (err, res) => {
                              if (err) throw err;
                              console.log(
                                `\nUpdated ${role.Role}'s department to ${dept.name} successfully!\n`
                              );
                              chooseRoute();
                            }
                          );
                        }
                      });
                  });
                }
              });
          });
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

async function chooseAdd() {
  console.log("");
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
          console.log("\nNEW EMPLOYEE");
          let emp = {
            first_name: "",
            last_name: "",
            role_id: 0,
            manager_id: null,
          };
          //QUERY: employee list AND role list
          call =
            Lister.employeeList("", "name ASC, last_name ASC") +
            " ; " +
            Lister.roleList("", "name ASC, title ASC");
          connection.query(call, (err, res) => {
            let mgrList = [
              { name: "None", value: { name: "none", e_id: null } },
            ];
            let roleList = [];
            for (let line of res[0]) {
              mgrList.push({
                name: `${line.Name} (role: ${line.Role})`,
                value: { name: line.Name, e_id: line.e_id },
              });
            }
            mgrList.push({ name: "(CANCEL)", value: "CANCEL" });
            for (let line of res[1]) {
              roleList.push({
                name: `${line.Role} in ${line.Department} (salary: $${line.Salary})`,
                value: { name: line.Department, r_id: line.r_id },
              });
            }
            roleList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "first",
                  message: "What is the employee's first name?",
                  validate: (str) => str != "",
                },
                {
                  type: "input",
                  name: "last",
                  message: "What is the employee's last name?",
                  validate: (str) => str != "",
                },
                {
                  type: "list",
                  name: "role",
                  choices: roleList,
                  message: "Which role should employee be assigned to?",
                },
              ])
              .then((ans1) => {
                console.log(ans1);
                if (ans1.role != "CANCEL") {
                  emp.first_name = ans1.first;
                  emp.last_name = ans1.last;
                  emp.role_id = parseInt(ans1.role.r_id);
                  console.log("");
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "mgr",
                        choices: mgrList,
                        message:
                          "Who should be assigned as this employee's manager?",
                      },
                    ])
                    .then((ans2) => {
                      if (ans2 != "CANCEL") {
                        emp.manager_id = ans2.mgr.e_id;;;
                        connection.query(
                          "INSERT INTO employee SET ?",
                          emp,
                          function (err, res) {
                            if (err) throw err;
                            console.log("Employee added!");
                            chooseAdd();
                          }
                        );
                      } else {
                        chooseAdd();
                      }
                    });
                } else {
                  chooseAdd();
                }
              });
          });
          break;
        case "New Role":
          console.log("\nNEW ROLE");
          //QUERY: department list
          call = Lister.departmentList();
          connection.query(call, (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line.d_id,
              });
            }
            deptList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "title",
                  message: "What is the title for this role?",
                  validate: (str) => str != "",
                },
                {
                  type: "number",
                  name: "salary",
                  message: "What is the salary for this role?",
                },
                {
                  type: "list",
                  name: "department_id",
                  choices: deptList,
                  message: "Which department should this role be under?",
                },
              ])
              .then((ans) => {
                if (ans.department_id != "CANCEL") {
                  connection.query(
                    "INSERT INTO role SET ?",
                    ans,
                    function (err, res) {
                      if (err) throw err;
                      console.log("Role added!");
                      chooseAdd();
                    }
                  );
                } else {
                  chooseAdd();
                }
              });
          });
          break;
        case "New Department":
          console.log("\nNEW DEPARTMENT");
          console.log("");
          inquirer
            .prompt([
              {
                type: "input",
                name: "name",
                message: "What is the department's name?",
                validate: (str) => str != "",
              },
            ])
            .then((ans) =>
              connection.query(
                "INSERT INTO department SET ?",
                ans,
                function (err, res) {
                  if (err) throw err;
                  console.log("Department added!");
                  chooseAdd();
                }
              )
            );
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}

async function chooseDelete() {
  console.log("");
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
      // let empID = 0;
      switch (ans.query) {
        case "Delete Employee":
          //QUERY: employee list, sort by department then name
          call = Lister.employeeList("", "name ASC, last_name ASC");
          connection.query(call, (err, res) => {
            let empList = [];
            for (let line of res) {
              empList.push({
                name: `${line.Name} (${line.Role} in ${line.Department})`,
                value: line,
              });
            }
            empList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "emp",
                  choices: empList,
                  message: "Which employee do you want to delete?",
                },
              ])
              .then((ans) => {
                let emp = ans.emp;
                if (emp == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseDelete();
                } else {
                  //QUERY: employees by manager, sort on name
                  call = Lister.employeeList(
                    `manager_id = ${emp.e_id}`,
                    "last_name ASC"
                  );
                  connection.query(call, (err, res) => {
                    if (err) throw err;
                    if (res != "") {
                      //set up table instance
                      p = new Table({
                        title: `Employees managed by ${emp.Name}`,
                        columns: [
                          { name: "Name", alignment: "center" },
                          { name: "Role", alignment: "center" },
                          { name: "Department", alignment: "center" },
                        ],
                        enabledColumns: ["Name", "Role", "Department"],
                      });
                      //feed query results directly into table, print table
                      p.addRows(res);
                      console.log("\n");
                      p.printTable();
                      console.log(
                        "\nEmployees above have the chosen employee set as their manager. They must be reassigned or deleted before this change can be made.\nCancelling change.\n"
                      );
                      chooseRoute();
                    } else {
                      //confirm
                      console.log("");
                      inquirer
                        .prompt([
                          {
                            type: "confirm",
                            name: "conf",
                            message: `\nPlease confirm: \n ** ${emp.Name} (${emp.Role} in ${emp.Department}) ** \n will be DELETED.\n`,
                          },
                        ])
                        .then((ans) => {
                          if (ans.conf == false) {
                            console.log("\nCancelling change.\n");
                            //cancel, go back
                            chooseDelete();
                          } else {
                            connection.query(
                              `DELETE FROM 
                                  employee
                                WHERE
                                  e_id = ${emp.e_id}`,
                              (err, res) => {
                                if (err) throw err;
                                console.log(
                                  `\n${emp.Name} deleted successfully!\n`
                                );
                                chooseRoute();
                              }
                            );
                          }
                        });
                    }
                  });
                }
              });
          });
          break;
        case "Delete Role":
          //QUERY: role list
          call = Lister.roleList("", "name ASC, title ASC");
          connection.query(call, (err, res) => {
            let roleList = [];
            for (let line of res) {
              roleList.push({
                name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                value: line,
              });
            }
            roleList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "role",
                  choices: roleList,
                  message: "Which role do you want to delete?",
                },
              ])
              .then((ans) => {
                let role = ans.role;
                if (role == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseDelete();
                } else {
                  //QUERY: employee by role
                  call = Lister.employeeList(
                    `role_id = ${role.r_id}`,
                    "last_name ASC"
                  );
                  connection.query(call, (err, res) => {
                    if (err) throw err;
                    if (res != "") {
                      //set up table instance
                      p = new Table({
                        title: `\n\nEmployees assigned \n   to this role`,
                        columns: [{ name: "Name", alignment: "center" }],
                        enabledColumns: ["Name"],
                      });
                      //feed query results directly into table, print table
                      p.addRows(res);
                      console.log("\n");
                      p.printTable();
                      console.log(
                        "\nEmployees above are assigned to chosen role. They must be reassigned or deleted before this change can be made.\nCancelling change.\n"
                      );
                      chooseRoute();
                    } else {
                      //confirm
                      console.log("");
                      inquirer
                        .prompt([
                          {
                            type: "confirm",
                            name: "conf",
                            message: `\nPlease confirm: \n ** ${role.Role} in ${role.Department} ** \n will be DELETED.\n`,
                          },
                        ])
                        .then((ans) => {
                          if (ans.conf == false) {
                            console.log("\nCancelling change.\n");
                            //cancel, go back
                            chooseDelete();
                          } else {
                            connection.query(
                              `DELETE FROM 
                                  role
                                WHERE
                                  r_id = ${role.r_id}`,
                              (err, res) => {
                                if (err) throw err;
                                console.log(
                                  `\n${role.Role} in ${role.Department} deleted successfully!\n`
                                );
                                chooseRoute();
                              }
                            );
                          }
                        });
                    }
                  });
                }
              });
          });
          break;
        case "Delete Department":
          //QUERY: department list
          call = Lister.departmentList();
          connection.query(call, (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line,
              });
            }
            deptList.push({ name: "(CANCEL)", value: "CANCEL" });
            console.log("");
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: deptList,
                  message: "Which department do you want to delete?",
                },
              ])
              .then((ans) => {
                let dept = ans.dept;
                if (dept == "CANCEL") {
                  console.log("\nCancelling change.\n");
                  chooseDelete();
                } else {
                  //QUERY: roles by department
                  call = Lister.roleList(
                    `department_id = ${dept.d_id}`,
                    "title ASC"
                  );
                  connection.query(call, (err, res) => {
                    if (err) throw err;
                    if (res != "") {
                      //set up table instance
                      p = new Table({
                        title: `\n\n  Roles assigned \nto this department`,
                        columns: [{ name: "Title", alignment: "center" }],
                        enabledColumns: ["Title"],
                      });
                      //feed query results directly into table, print table
                      p.addRows(res);
                      console.log("\n");
                      p.printTable();
                      console.log(
                        "\nRoles above are assigned to chosen department. They must be reassigned or deleted before this change can be made.\nCancelling change.\n"
                      );
                      chooseRoute();
                    } else {
                      //confirm
                      console.log("");
                      inquirer
                        .prompt([
                          {
                            type: "confirm",
                            name: "conf",
                            message: `\nPlease confirm: \n ** ${dept.name} ** \n will be DELETED.\n`,
                          },
                        ])
                        .then((ans) => {
                          if (ans.conf == false) {
                            console.log("\nCancelling change.\n");
                            //cancel, go back
                            chooseDelete();
                          } else {
                            connection.query(
                              `DELETE FROM 
                                    department
                                  WHERE
                                    d_id = ${dept.d_id}`,
                              (err, res) => {
                                if (err) throw err;
                                console.log(
                                  `\n${dept.name} deleted successfully!\n`
                                );
                                chooseRoute();
                              }
                            );
                          }
                        });
                    }
                  });
                }
              });
          });
          break;
        case "Go back":
          chooseRoute();
          //close
          break;
      }
    });
}
