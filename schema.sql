-- PUSKODAL KOPASSUS Database Schema
-- Database: kpsdata

CREATE DATABASE IF NOT EXISTS kpsdata;
USE kpsdata;

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('ADMIN', 'COMMANDER', 'OPERATIVE') DEFAULT 'OPERATIVE',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Units Table
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL,
    unit_type VARCHAR(50), -- e.g., Grup 1, Sat-81
    location VARCHAR(100),
    status ENUM('ACTIVE', 'STANDBY', 'DEPLOYED') DEFAULT 'STANDBY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Personnel Table
CREATE TABLE IF NOT EXISTS personnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nrp VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    rank VARCHAR(50),
    unit_id INT,
    specialization VARCHAR(100),
    status ENUM('ACTIVE', 'ON_MISSION', 'OFF_DUTY', 'RETIRED') DEFAULT 'ACTIVE',
    photo_url VARCHAR(255),
    joined_date DATE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- 4. Operations Table
CREATE TABLE IF NOT EXISTS operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50), -- e.g., Counter-Terrorism, Intel, Rescue
    status ENUM('PLANNING', 'ONGOING', 'COMPLETED', 'ABORTED') DEFAULT 'PLANNING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    start_date DATETIME,
    end_date DATETIME,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Intelligence Reports Table
CREATE TABLE IF NOT EXISTS intel_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    threat_level ENUM('STABLE', 'GUARDED', 'ELEVATED', 'HIGH', 'SEVERE') DEFAULT 'STABLE',
    content TEXT,
    location_tag VARCHAR(100),
    reporter_id INT,
    is_classified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Logistics Table
CREATE TABLE IF NOT EXISTS logistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g., Weaponry, Ammunition, Medical, Transport
    quantity INT DEFAULT 0,
    unit VARCHAR(20), -- e.g., pcs, units, boxes
    min_stock_level INT DEFAULT 10,
    condition_status ENUM('GOOD', 'MAINTENANCE', 'REPAIR', 'BROKEN') DEFAULT 'GOOD',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('ALERT', 'INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

