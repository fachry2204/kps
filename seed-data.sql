-- SEED DATA FOR PUSKODAL KOPASUS
USE kpsdata;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE intel_reports;
TRUNCATE TABLE logistics;
TRUNCATE TABLE operations;
TRUNCATE TABLE personnel;
TRUNCATE TABLE units;
SET FOREIGN_KEY_CHECKS = 1;

-- 0. Admin User
INSERT INTO users (username, password, full_name, role) 
VALUES ('admin', 'admin123', 'Administrator Puskodal', 'ADMIN');

-- 1. Units
INSERT INTO units (unit_name, unit_type, location, status) VALUES 
('Grup 1 Para Komando', 'PARA_KOMANDO', 'Serang', 'ACTIVE'),
('Grup 2 Para Komando', 'PARA_KOMANDO', 'Kartasura', 'ACTIVE'),
('Grup 3 Sandhi Yudha', 'INTEL', 'Cijantung', 'ACTIVE'),
('Satuan 81 Gultor', 'SPECIAL_FORCE', 'Cijantung', 'ACTIVE'),
('Pusdiklatpassus', 'TRAINING', 'Batujajar', 'ACTIVE');

-- 2. Personnel
INSERT INTO personnel (nrp, name, rank, unit_id, specialization, status, joined_date) VALUES 
('1109001234', 'Agus Setiawan', 'Mayor Inf', 4, 'Penanggulangan Teror', 'ACTIVE', '2015-06-10'),
('1112005678', 'Budi Santoso', 'Lettu Inf', 1, 'Para Komando', 'ON_MISSION', '2018-03-22'),
('1115009012', 'Dedi Kurniawan', 'Serka', 4, 'Sniper', 'ACTIVE', '2020-11-05'),
('1118003456', 'Eko Prasetyo', 'Sertu', 3, 'Intelijen Tempur', 'ACTIVE', '2021-02-15'),
('1120007890', 'Fajar Ramadhan', 'Pratu', 2, 'Komunikasi', 'ON_MISSION', '2023-08-01');

-- 3. Logistics
INSERT INTO logistics (item_name, category, quantity, unit, min_stock_level, condition_status) VALUES 
('SS2-V1 Assault Rifle', 'Weaponry', 450, 'pcs', 50, 'GOOD'),
('Glock 17 Pistol', 'Weaponry', 120, 'pcs', 20, 'GOOD'),
('Munisi 5.56mm', 'Ammunition', 25000, 'rounds', 5000, 'GOOD'),
('Body Armor Level IV', 'Protection', 300, 'pcs', 30, 'GOOD'),
('Tactical Radio PRC-77', 'Communications', 45, 'units', 10, 'MAINTENANCE'),
('Night Vision Goggles', 'Optics', 85, 'units', 15, 'GOOD'),
('First Aid Kit XL', 'Medical', 150, 'boxes', 40, 'GOOD');

-- 4. Operations
INSERT INTO operations (operation_name, operation_type, status, priority, location, start_date, description) VALUES 
('Operasi Trisula Perkasa', 'Counter-Terrorism', 'ONGOING', 'CRITICAL', 'Papua', '2024-05-01', 'Pengejaran kelompok separatis di wilayah pegunungan tengah.'),
('Misi Elang Hitam', 'Intelligence', 'ONGOING', 'HIGH', 'Perbatasan Kalimantan', '2024-05-05', 'Pemantauan aktivitas lintas batas ilegal.'),
('Satgas Aman Nusa', 'Security', 'PLANNING', 'MEDIUM', 'Jakarta', '2024-06-15', 'Pengamanan event kenegaraan internasional.'),
('Operasi Wibawa 24', 'Rescue', 'COMPLETED', 'HIGH', 'Laut Natuna', '2024-04-10', 'Operasi penyelamatan sandera di kapal niaga.');

-- 5. Intel Reports
INSERT INTO intel_reports (title, threat_level, content, location_tag, is_classified) VALUES 
('Deteksi Pergerakan Kelompok Radikal', 'HIGH', 'Terpantau adanya konsentrasi massa tidak dikenal di sektor B-12.', 'Sektor B-12', 1),
('Ancaman Serangan Siber Infrastruktur', 'ELEVATED', 'Peningkatan upaya scanning pada jaringan komunikasi internal.', 'Cyber Command', 1),
('Analisis Penyelundupan Senjata Api', 'GUARDED', 'Laporan intelijen mengenai jalur distribusi baru di pesisir timur.', 'Pesisir Timur', 1);
