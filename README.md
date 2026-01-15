# SurgeryMCQ
Practicing surgery MCQ for competitive exams

# 📘 MCQ Web Application (Python + MySQL)

This project is a **Python-based MCQ (Multiple Choice Question) web application** using a **MySQL database** as backend.  
It is designed for creating, storing, reviewing, and navigating MCQs efficiently.

This README explains the **complete setup from scratch**:
- Installing MySQL  
- Importing the `.sql` dump file  
- Installing VS Code and Python  
- Running the MCQ application  

---

## 🛠 System Requirements

- Python **3.9 or higher**
- MySQL **8.0 or higher**
- VS Code
- Any OS (Ubuntu / Windows / macOS)

---

## 1️⃣ Installing MySQL

### 🔹 Ubuntu / Linux
Check installation:

mysql --version


Start MySQL:

sudo systemctl start mysql
sudo systemctl enable mysql


(Optional but recommended)

sudo mysql_secure_installation

🔹 Windows / macOS

Download MySQL from:
https://dev.mysql.com/downloads/mysql/

Install MySQL Server

Note down:

Username

Password

Port (default: 3306)

##2️⃣ Creating Database & Importing SQL Dump
#🔹 Login to MySQL
mysql -u root -p

#🔹 Create Database
CREATE DATABASE quizdb;
USE quizdb;


Exit MySQL:

exit

#🔹 Import SQL Dump
mysql -u root -p quizdb < quizdb_dump.sql


✔️ This creates all tables and imports MCQs automatically.

#🔹 Verify Import
mysql -u root -p
USE quizdb;
SHOW TABLES;
SELECT * FROM questions LIMIT 5;

##3️⃣ Installing VS Code

#Download VS Code:
👉 https://code.visualstudio.com/

Recommended Extensions

Python

MySQL

Pylance

##4️⃣ Installing Python & Virtual Environment

Check Python:

python3 --version


Create virtual environment:

python3 -m venv venv


Activate it:

Linux / macOS

source venv/bin/activate


Windows

venv\Scripts\activate

##5️⃣ Installing Python Dependencies
pip install flask mysql-connector-python


Or using requirements file:

pip install -r requirements.txt

##6️⃣ Project Structure
mcq_app/
│
├── app.py
├── db_config.py
├── templates/
│   ├── index.html
│   ├── quiz.html
│   └── review.html
├── static/
│   ├── style.css
│   └── script.js
├── quizdb_dump.sql
├── requirements.txt
└── README.md

##7️⃣ Database Configuration

Edit db_config.py:

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "your_mysql_password",
    "database": "quizdb"
}


⚠️ Ensure credentials match your MySQL setup.

##8️⃣ Running the MCQ Application

From project folder:

python app.py


Terminal output:

Running on http://127.0.0.1:5000/


Open browser:

http://127.0.0.1:5000

##9️⃣ Common Errors & Fixes
❌ MySQL connection error

✔️ Check:

MySQL service is running

Username/password correct

Database name correct

❌ mysql-connector error
pip install mysql-connector-python

❌ Port already in use

Change port in app.py:

app.run(port=5001)

##🔟 Features

MCQs stored in MySQL database

Review mode with Next / Previous navigation

Keyboard navigation support

Clean and modular codebase

Easy SQL-based data import

🚀 Future Enhancements

User authentication

Bookmark questions

Performance analytics

AI-based question recommendations

👨‍⚕️ Author

Basith Sulaiman
ENT & Head–Neck Oncosurgeon
Developer – Medical Education Tools


