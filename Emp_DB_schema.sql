DROP DATABASE IF EXISTS empTrack_DB;
CREATE DATABASE empTrack_DB;

USE empTrack_DB;

CREATE TABLE department(
  d_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (d_id)
);

CREATE TABLE role(
  r_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  department_id INT,
  PRIMARY KEY (r_id),
  FOREIGN KEY (department_id) REFERENCES department(d_id) ON DELETE CASCADE
);

CREATE TABLE employee(
  e_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (e_id),
  FOREIGN KEY (role_id) REFERENCES role(r_id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES employee(e_id)
);