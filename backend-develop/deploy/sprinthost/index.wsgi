import os, sys


base_path = os.path.dirname(os.path.abspath(__file__))
activate_this = f"{base_path}/../django_project/.venv/bin/activate_this.py"

with open(activate_this) as f:
    exec(f.read(), {"__file__": activate_this})

sys.path.insert(0, os.path.join(f"{base_path}/../django_project"))
os.environ['DJANGO_SETTINGS_MODULE'] = "main.settings"


from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
