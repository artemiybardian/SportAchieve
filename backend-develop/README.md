# 🏆 Sport Achieve Backend

[![Python](https://img.shields.io/badge/python-3.10+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/django-5.2+-green.svg?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django Ninja](https://img.shields.io/badge/Django_Ninja-1.5.3-orange.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://django-ninja.rest-framework.com/)
[![Celery](https://img.shields.io/badge/celery-5.6-green.svg?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/redis-7.3-red.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A robust backend for a sports achievement platform, featuring exercise tracking, trainer management, subscription-based access, and seamless Telegram integration.

## ✨ Features

- 🏋️ **Exercise Management**: Detailed instructions (video/text), muscle group mapping, and QR code access.
- 👨‍🏫 **Trainer Portal**: Relationship management between trainers and exercises.
- 💳 **Subscriptions & Payments**: Integrated with **YooKassa** for invoice generation and automated subscription handling via webhooks.
- 🤖 **Telegram Integration**: Secure authentication using Telegram init data and custom bot integration.
- ⚙️ **Asynchronous Tasks**: Powered by **Celery** for background processing and periodic tasks.
- 📊 **Logging & Monitoring**: Integrated with **Graylog** (GELF) for centralized logging.
- 📄 **Modern API**: High-performance API built with **Django Ninja** (OpenAPI/Swagger ready).

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Django 5.2
- **API**: Django Ninja (Type-safe, high-performance REST)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Task Queue**: Celery with Redis broker
- **Authentication**: JWT & Telegram WebApp Auth
- **Payments**: YooKassa SDK
- **Media**: Pillow (Image processing), QR Code generation

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- Redis (for Celery & Caching)
- PostgreSQL (optional, can use SQLite for local dev)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sport-achieve.git
   cd sport-achieve
   ```

2. **Set up a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Copy the example environment file and fill in your credentials:
   ```bash
   cp example.env .env
   ```
   *Required variables: `SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `JWT_SECRET`.*

5. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

### 🕒 Running Background Tasks (Celery)

To start the Celery worker and beat (scheduler):

```bash
# Start Worker
celery -A main worker --loglevel=info

# Start Beat
celery -A main beat --loglevel=info
```

## 📂 Project Structure

- `api/`: Core business logic, models, schemas, and API views.
- `main/`: Project configuration (settings, URLs, WSGI/ASGI).
- `telegram/`: Telegram-specific utilities and validation.
- `yookasa/`: Integration with YooKassa payment gateway.
- `logs/`: Custom logging handlers (Graylog/GELF).
- `deploy/`: Dockerfiles and deployment scripts for different environments.

## 📜 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/api/docs`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with ❤️ for athletes and trainers.*
