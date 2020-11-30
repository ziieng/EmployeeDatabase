// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const { Table } = require("console-table-printer");
// documentation: https://console-table.netlify.app/docs/

// Set the port of our application
const PORT = process.env.PORT || 8080;

let p = new Table();

// MySQL DB Connection Information
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "empTrack_DB",
  multipleStatements: true,
});

// Initiate MySQL Connection.
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  chooseRoute();
});

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
          break;
        case "Add":
          chooseAdd();
          break;
        case "Delete":
          chooseDelete();
          break;
        case "Exit":
          console.log("See you later!");
          connection.end();
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
          p = new Table({
            title: "\n\nAll Departments",
            columns: [{ name: "Department Name", alignment: "center" }],
          });
          connection.query(
            `SELECT name AS 'Department Name' FROM department`,
            (err, res) => {
              if (err) throw err;
              p.addRows(res);
              p.printTable();
              chooseRoute();
            }
          );
          break;
        case "Utilized budget of a department":
          connection.query("SELECT * FROM department", (err, res) => {
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: () => {
                    const deptList = [];
                    for (let line of res) {
                      deptList.push(line.name);
                    }
                    return deptList;
                  },
                  message: "Which department would you like to see?",
                },
              ])
              .then((res) => {
                p = new Table({
                  title: `\n\nUtilized Budget`,
                  columns: [
                    { name: "Department", alignment: "center" },
                    { name: "Total Salary", alignment: "center" },
                  ],
                });
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
                    name = "${res.dept}"`,
                  (err, res) => {
                    if (err) throw err;
                    p.addRows(res);
                    p.printTable();
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "All Roles":
          p = new Table({
            title: "\n\nAll Roles (sorted by Title)",
            columns: [
              { name: "Role", alignment: "center" },
              { name: "Department", alignment: "center" },
              { name: "Salary", alignment: "center" },
            ],
          });
          connection.query(
            `SELECT 
              title AS 'Role', 
              name AS 'Department', 
              salary AS 'Salary' 
            FROM 
              role 
            LEFT JOIN 
              department 
            ON role.department_id = department.d_id 
            ORDER BY 
              title`,
            (err, res) => {
              if (err) throw err;
              p.addRows(res);
              p.printTable();
              chooseRoute();
            }
          );
          break;
        case "Roles in a department":
          connection.query("SELECT * FROM department", (err, res) => {
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: () => {
                    const deptList = [];
                    for (let line of res) {
                      deptList.push(line.name);
                    }
                    return deptList;
                  },
                  message: "Which department would you like to see?",
                },
              ])
              .then((res) => {
                p = new Table({
                  title: `\n\nAll Roles in ${res.dept}`,
                  columns: [
                    { name: "Role", alignment: "center" },
                    { name: "Salary", alignment: "center" },
                    { name: "Employees in Role", alignment: "center" },
                  ],
                });
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
                    name = "${res.dept}"
                  GROUP BY 
                    role_id`,
                  (err, res) => {
                    if (err) throw err;
                    p.addRows(res);
                    p.printTable();
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "All employees":
          p = new Table({
            title: `\n\nAll Employees`,
            columns: [
              { name: "Name", alignment: "center" },
              { name: "Role", alignment: "center" },
              { name: "Department", alignment: "center" },
              { name: "Salary", alignment: "center" },
            ],
          });
          connection.query(
            `SELECT 
              CONCAT(last_name, ", ", first_name) AS 'Name',
              title AS 'Role',
              name AS 'Department',
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
            ORDER BY 
              last_name`,
            (err, res) => {
              if (err) throw err;
              p.addRows(res);
              p.printTable();
              chooseRoute();
            }
          );
          break;
        case "Employees in a department":
          connection.query("SELECT * FROM department", (err, res) => {
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "dept",
                  choices: () => {
                    const deptList = [];
                    for (let line of res) {
                      deptList.push(line.name);
                    }
                    return deptList;
                  },
                  message: "Which department would you like to see?",
                },
              ])
              .then((res) => {
                p = new Table({
                  title: `\n\nEmployees in ${res.dept}`,
                  columns: [
                    { name: "Name", alignment: "center" },
                    { name: "Role", alignment: "center" },
                    { name: "Salary", alignment: "center" },
                  ],
                });
                connection.query(
                  `SELECT 
                    CONCAT(last_name, ", ", first_name) AS 'Name',
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
                      name = "${res.dept}"
                  ORDER BY 
                    last_name`,
                  (err, res) => {
                    if (err) throw err;
                    p.addRows(res);
                    p.printTable();
                    chooseRoute();
                  }
                );
              });
          });
          break;
        case "Employees reporting to same manager":
          connection.query(
            `SELECT 
              CONCAT(last_name, ", ", first_name) AS full_name,
              title AS 'Role',
              name AS 'Department',
              e_id
            FROM 
              employee 
            LEFT JOIN
              role
            ON
              employee.role_id=role.r_id
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id
            WHERE
              e_id
            IN
              (SELECT DISTINCT manager_id FROM employee)
            ORDER BY
              name ASC`,
            (err, res) => {
              let mgrList = [
                {
                  name: "(No manager assigned)",
                  value: { full_name: "(No manager assigned)", e_id: "NULL" },
                },
              ];
              for (let line of res) {
                mgrList.push({
                  name: `${line.full_name} (${line.Role} in ${line.Department})`,
                  value: { full_name: line.full_name, e_id: line.e_id },
                });
              }
              mgrList.push({ full_name: "(CANCEL)", value: "CANCEL" });
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
                  p = new Table({
                    title: `\n\nEmployees reporting to ${mgr.full_name}`,
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
                      p.addRows(res);
                      p.printTable();
                      chooseRoute();
                    }
                  );
                });
            }
          );
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
      // let empID = 0;
      switch (ans.query) {
        case "Update employee's manager":
          connection.query(
            `SELECT 
              CONCAT(last_name, ", ", first_name) AS full_name,
              title AS 'Role',
              name AS 'Department',
              e_id
            FROM 
              employee 
            LEFT JOIN
              role
            ON
              employee.role_id=role.r_id
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id
            ORDER BY
              name ASC,
              last_name ASC`,
            (err, res) => {
              let empList = [];
              for (let line of res) {
                empList.push({
                  name: `${line.full_name} (${line.Role} in ${line.Department})`,
                  value: { full_name: line.full_name, e_id: line.e_id },
                });
              }
              empList.push({ full_name: "(CANCEL)", value: "CANCEL" });
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
                    inquirer
                      .prompt([
                        {
                          type: "confirm",
                          name: "conf",
                          message: `Please confirm: \n ** ${mgr.full_name} ** \n will be assigned as the NEW MANAGER FOR\n ** ${emp.full_name} **\n`,
                        },
                      ])
                      .then((ans) => {
                        if (ans.conf == false) {
                          console.log("\nCancelling change.\n");
                          //cancel, go back
                          chooseEdit();
                        } else {
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
                                `\nUpdated ${emp.full_name}'s manager to ${mgr.full_name} successfully!\n`
                              );
                              chooseRoute();
                            }
                          );
                        }
                      });
                  }
                });
            }
          );
          break;
        case "Update employee's role":
          connection.query(
            `SELECT 
              CONCAT(last_name, ", ", first_name) AS full_name,
              title AS 'Role',
              name AS 'Department',
              salary,
              e_id
            FROM 
              employee 
            LEFT JOIN
              role
            ON
              employee.role_id=role.r_id
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id
            ORDER BY
              name ASC,
              last_name ASC
            ;
            SELECT 
              title AS 'Role', 
              name AS 'Department', 
              salary,
              r_id 
            FROM 
              role 
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id 
            ORDER BY 
              name ASC, 
              title ASC`,
            (err, res) => {
              let empList = [];
              let roleList = [];
              for (let line of res[0]) {
                empList.push({
                  name: `${line.full_name} (${line.Role} in ${line.Department} - salary $${line.salary})`,
                  value: { full_name: line.full_name, e_id: line.e_id },
                });
              }
              empList.push({ full_name: "(CANCEL)", value: "CANCEL" });
              for (let line of res[1]) {
                roleList.push({
                  name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                  value: line,
                });
              }
              roleList.push({ full_name: "(CANCEL)", value: "CANCEL" });
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
                    inquirer
                      .prompt([
                        {
                          type: "confirm",
                          name: "conf",
                          message: `Please confirm: \n ** ${emp.full_name} ** \n will be assigned to NEW ROLE \n ** ${role.Role} in ${role.Department} (salary $${role.salary}) **\n`,
                        },
                      ])
                      .then((ans) => {
                        if (ans.conf == false) {
                          console.log("\nCancelling change.\n");
                          //cancel, go back
                          chooseEdit();
                        } else {
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
                                `\nUpdated ${emp.full_name}'s role to ${role.Role} (${role.Department}) successfully!\n`
                              );
                              chooseRoute();
                            }
                          );
                        }
                      });
                  }
                });
            }
          );
          break;
        case "Update salary of role":
          connection.query(
            `SELECT 
              title AS 'Role', 
              name AS 'Department', 
              salary,
              r_id 
            FROM 
              role 
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id 
            ORDER BY 
              name ASC, 
              title ASC`,
            (err, res) => {
              let roleList = [];
              for (let line of res) {
                roleList.push({
                  name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                  value: line,
                });
              }
              roleList.push({ full_name: "(CANCEL)", value: "CANCEL" });
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
                    p = new Table({
                      title: `\n\nEmployees assigned \n   to this role`,
                      columns: [{ name: "Name", alignment: "center" }, ,],
                    });
                    connection.query(
                      `SELECT 
                      CONCAT(last_name, ", ", first_name) AS 'Name'
                    FROM 
                      role 
                    LEFT JOIN
                      employee
                    ON
                      employee.role_id=role.r_id
                    WHERE
                      role_id = "${role.r_id}"
                    ORDER BY 
                      last_name`,
                      (err, res) => {
                        if (err) throw err;
                        p.addRows(res);
                        p.printTable();
                        //confirm
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
                      }
                    );
                  }
                });
            }
          );
          break;
        case "Update department of role":
          connection.query(
            `SELECT 
              title AS 'Role', 
              name AS 'Department', 
              salary,
              r_id 
            FROM 
              role 
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id 
            ORDER BY 
              name ASC, 
              title ASC
            ;
            SELECT
              *
            FROM
              department`,
            (err, res) => {
              let roleList = [];
              let deptList = [];
              for (let line of res[0]) {
                roleList.push({
                  name: `${line.Role} in ${line.Department} - salary $${line.salary}`,
                  value: line,
                });
              }
              roleList.push({ full_name: "(CANCEL)", value: "CANCEL" });
              for (let line of res[1]) {
                deptList.push({
                  name: line.name,
                  value: line,
                });
              }
              deptList.push({ name: "(CANCEL)", value: "CANCEL" });
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
                    p = new Table({
                      title: `\n\nEmployees assigned \n   to this role`,
                      columns: [{ name: "Name", alignment: "center" }, ,],
                    });
                    connection.query(
                      `SELECT 
                      CONCAT(last_name, ", ", first_name) AS 'Name'
                    FROM 
                      role 
                    LEFT JOIN
                      employee
                    ON
                      employee.role_id=role.r_id
                    WHERE
                      role_id = "${role.r_id}"
                    ORDER BY 
                      last_name`,
                      (err, res) => {
                        if (err) throw err;
                        p.addRows(res);
                        p.printTable();
                        //confirm
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
                      }
                    );
                  }
                });
            }
          );
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
          console.log("NEW EMPLOYEE");
          let emp = {
            first_name: "",
            last_name: "",
            role_id: 0,
            manager_id: null,
          };
          connection.query(
            `SELECT 
              name, r_id, title, salary 
            FROM 
              role 
            LEFT JOIN 
              department 
            ON 
              role.department_id = department.d_id
            ; 
            SELECT
              e_id, 
              CONCAT(last_name, ", ", first_name) AS full_name,
              title 
            FROM 
              employee 
            LEFT JOIN 
              role 
            ON 
              employee.role_id=role.r_id`,
            (err, res) => {
              let roleList = [];
              let mgrList = [
                { name: "None", value: { name: "none", e_id: null } },
              ];
              for (let line of res[0]) {
                roleList.push({
                  name: `${line.title} in ${line.name} (salary: $${line.salary}`,
                  value: { name: line.name, r_id: line.r_id },
                });
              }
              roleList.push({ name: "(CANCEL)", value: "CANCEL" });
              for (let line of res[1]) {
                mgrList.push({
                  name: `${line.full_name} (title: $${line.title}`,
                  value: { name: line.full_name, e_id: line.e_id },
                });
              }
              mgrList.push({ name: "(CANCEL)", value: "CANCEL" });

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
            }
          );
          break;
        case "New Role":
          console.log("NEW ROLE");
          connection.query("SELECT * FROM department", (err, res) => {
            let deptList = [];
            for (let line of res) {
              deptList.push({
                name: line.name,
                value: line.d_id,
              });
            }
            deptList.push({ name: "(CANCEL)", value: "CANCEL" });
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
          console.log("NEW DEPARTMENT");
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
      // let empID = 0;
      switch (ans.query) {
        case "Delete Employee":
          // selectEmployee();
          // deleteEmployee(empID);
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
