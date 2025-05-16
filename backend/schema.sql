-- backend/schema.sql

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  from_location    VARCHAR(100) NOT NULL,
  to_location      VARCHAR(100) NOT NULL,
  size_category    ENUM('gabarit','negabarit') NOT NULL,
  section_type     ENUM('cold','warm') NOT NULL,
  length_cm        DECIMAL(10,2) NOT NULL,
  width_cm         DECIMAL(10,2) NOT NULL,
  height_cm        DECIMAL(10,2) NOT NULL,
  weight_kg        DECIMAL(10,2) NOT NULL,
  volume_m3        DECIMAL(10,4) NOT NULL,
  rate             DECIMAL(10,2) NOT NULL,
  cost             DECIMAL(12,2) NOT NULL,
  description      MEDIUMTEXT,
  quantity         INT DEFAULT 1,
  recipient_name   VARCHAR(200),
  recipient_phone  VARCHAR(50),
  address          VARCHAR(500),
  status           ENUM('created','in_transit','delivered','archived') NOT NULL DEFAULT 'created',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
