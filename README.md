# Civic Pulse

## About The Project

Civic Pulse is a comprehensive platform designed to bridge the gap between citizens and their local government. The application provides a user-friendly interface for community members to report, track, and collaborate on local issues. Simultaneously, it offers a dedicated dashboard for government officials and municipal bodies to review, adopt, and resolve these community reports effectively.

## Project Structure

This project is structured as a monorepo containing both the frontend and backend applications.

- /backend: A Django-based backend application that handles data management, user authentication, and business logic.
- /frontend: A React application providing the user interface for both citizens and government users.

## Features

- User and Government Portals: Distinct interfaces and functionality based on user roles.
- Issue Reporting: Citizens can submit detailed reports including conditions, location, and descriptions.
- Community Hub: View unresolved issues, solved problems, and ongoing petitions in the local area.
- Issue Tracking: Updates on the status of reported issues (Unresolved, Adopted, Solved).
- Government Dashboard: A centralized view for officials to manage reports within their jurisdiction, view metrics, and update issue statuses.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- Node.js
- npm or Yarn
- Python
- pip (Python package installer)

## Installation and Setup

Follow these steps to set up the development environment locally.

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On macOS/Linux
```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

Apply database migrations:
```bash
python manage.py migrate
```

### 2. Create a Superuser (Optional)

To access the Django admin panel or test various roles, you can create a superuser account. From the backend directory with your virtual environment activated, run:
```bash
python manage.py createsuperuser
```
Follow the prompts to set your username, email, and password.

Once your backend server is running, you can access the admin panel in your browser by navigating to **(http://127.0.0.1:8000/admin)** and logging in with the credentials you entered while creating a superuser.

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install the required Node.js dependencies:
```bash
npm install
```

## Running the Application

To run the application locally, you will need to start both the backend and frontend development servers.

### Start the Backend Server

From the backend directory, with your virtual environment activated, run:
```bash
python manage.py runserver
```

The backend API will be available at http://127.0.0.1:8000/

### Start the Frontend Server

From the frontend directory, run:
```bash
npm start
```

The React application will launch in your default web browser at http://localhost:3000/
