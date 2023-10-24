-- CREATE DATABASE IF NOT EXISTS `billete`;
SELECT 'CREATE DATABASE billete'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'billete')\gexec