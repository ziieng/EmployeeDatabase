const mysql = require("mysql");
require("dotenv").config();

class Options {
  //never got the queries to work from here
  constructor(connection) {
    this.connection = connection;
  }

  departmentList() {
    //list of departments
    let query = `SELECT 
    *
  FROM 
    department 
  ORDER BY 
    name ASC`;
    return query;
  }

  shrinkDept(list) {
    //compress list into inquirer choices
    let deptList = [];
    for (let line of list) {
      deptList.push({
        name: line.name,
        value: line,
      });
    }
    return deptList;
  }

  roleList(constraint, sort) {
    //list of roles
    if (constraint != "") {
      constraint = `
      WHERE 
        ${constraint}`;
    }
    let query = `SELECT 
        title AS 'Role',
        name AS 'Department',
        FORMAT(salary,2) AS 'Salary',
        r_id
      FROM 
        role
      LEFT JOIN 
        department 
      ON 
        role.department_id = department.d_id
      ${constraint}
      ORDER BY
        ${sort}`;

    return query;
  }

  employeeList(constraint, sort) {
    //list of employees
    if (constraint != "") {
      constraint = `
      WHERE 
        ${constraint}`;
    }
    let query = `SELECT 
        CONCAT(last_name, ", ", first_name) AS 'Name',
        title AS 'Role',
        name AS 'Department',
        FORMAT(salary,2) AS 'Salary',
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
      ${constraint}
      ORDER BY
        ${sort}`;

    return query;
  }
}

  module.exports = Options;