FROM python:3.11-bookworm
LABEL AUTHOR="<Никоноров Николай> nnv@bitt.moe"
RUN apt-get update && apt-get -y install libpq-dev gcc sqlite3 nano gettext
ARG HOME_DIR="app"
WORKDIR /$HOME_DIR
COPY . .
RUN pip install --no-cache-dir --upgrade -r requirements.txt
RUN mkdir -p files/static
EXPOSE 8000
RUN chmod +x deploy/dev/entrypoint.sh
ENTRYPOINT ["deploy/dev/entrypoint.sh"]
CMD ["runserver", "0.0.0.0:8000"]
