import os
from pathlib import Path
import dotenv

from .celery import app as celery_app


def empty_list(value: str) -> list[str]:
	return [url for url in value.replace(" ", "").split(",") if url != ""]

def load_dotenv(base_dir):
	env_file = Path(base_dir / ".env")
	if env_file.exists():
		with open(env_file, "r") as reader:
			for line in reader.read().split("\n"):
				if line.startswith("#"):
					continue
				if line:
					env_key, env_val = line.split("=")
					os.environ[env_key] = env_val
	else:
		print(f"ENV file don't found. Skipping loading env vars. Searched: {env_file.absolute()}")
		dotenv.load_dotenv()
		print("Using python-dotenv lib")

__all__ = ('celery_app', "load_dotenv", "empty_list")
