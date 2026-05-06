#!/bin/bash

DEPLOY_DIR=$1

# shellcheck disable=SC2164
cd "$DEPLOY_DIR"
pip3.10 install virtualenv
python3.10 -m virtualenv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install mysqlclient

python manage.py migrate
