#!/usr/bin/env bash
# Установка зависимостей
pip install -r requirements.txt

# Миграции базы данных
python manage.py migrate

# Сбор статических файлов
python manage.py collectstatic --no-input