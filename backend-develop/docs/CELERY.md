# Celery Integration Guide

This guide describes how to set up and run Celery in the **sport-achieve** project.

## Prerequisites

- **Redis**: Used as the default message broker and result backend.
  - Install Redis: `brew install redis` (macOS) or `sudo apt-get install redis-server` (Ubuntu).
  - Ensure Redis is running: `redis-server`

## Installation

Make sure you have the required dependencies installed:

```bash
pip install -r requirements.txt
```

The key dependencies are `celery` and `redis`.

## Configuration

The Celery configuration is located in `main/settings.py`. By default, it uses Redis running on `localhost`:

```python
# Celery Settings
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC' # Inherited from Django TIME_ZONE
```

## Project Structure

- `main/celery.py`: Celery app initialization and configuration.
- `main/__init__.py`: Ensures the Celery app is loaded when Django starts.
- `api/tasks.py`: Define your background tasks here using the `@shared_task` decorator.

## Running Celery

### 1. Start the Celery Worker

Run the following command from the project root to start a worker that will execute tasks:

```bash
celery -A main worker -l info
```

### 2. Start Celery Beat (Optional)

If you have periodic tasks defined, start the beat scheduler:

```bash
celery -A main beat -l info
```

### 3. Monitoring with Flower (Optional)

To monitor your tasks via a web interface, you can use Flower:

```bash
pip install flower
celery -A main flower
```
By default, it will be available at `http://localhost:5555`.

## Example Usage

In `api/tasks.py`, we have some sample tasks:

```python
from celery import shared_task

@shared_task
def add(x, y):
    return x + y
```

To call this task from your code (e.g., in a Django view):

```python
from api.tasks import add

# This will queue the task to be executed by a worker asynchronously
add.delay(4, 4)
```

## Troubleshooting

- **Redis Connection**: Ensure Redis is accessible at the URL specified in `CELERY_BROKER_URL`.
- **Worker not picking up tasks**: Restart the Celery worker after making changes to `tasks.py`.
- **Django Settings**: Celery automatically uses `main.settings` because of the `DJANGO_SETTINGS_MODULE` environment variable setup in `main/celery.py`.
