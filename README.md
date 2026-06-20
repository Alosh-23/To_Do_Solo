# 📝 ToDo-Solo App

A simple Todo application built with Django and Django REST Framework.

---

## 🚀 Features

* User Authentication (Login / Register)
* OTP Verification
* Add Tasks
* Edit Tasks
* Delete Tasks
* Mark Tasks as Completed
* API using Django REST Framework
* Each user sees only their own tasks

---

## 🛠️ Technologies Used

* Python
* Django
* Django REST Framework
* HTML / JavaScript

---

## ⚙️ How to Run

1. Clone the project:

```
git clone https://github.com/your-username/todo-solo-app.git
```

2. Go to project folder:

```
cd todo-solo-app
```

3. Install requirements:

```
pip install -r requirements.txt
```

4. Run migrations:

```
python manage.py migrate
```

5. Run server:

```
python manage.py runserver
```

6. Open in browser:

```
http://127.0.0.1:8000/
```

---

## 🔌 API Endpoints

### Get Tasks

```
GET /api/tasks/
```

### Create Task

```
POST /api/tasks/
```

### Update Task

```
PUT /api/tasks/<id>/
```

### Delete Task

```
DELETE /api/tasks/<id>/
```

---

## 🔐 Authentication

* Uses Django Authentication
* Protected with:

```
IsAuthenticated
```

---

## 📌 Notes

* Each user can only access their own tasks
* API is protected and requires login

---

## 👨‍💻 Author

Your Name
