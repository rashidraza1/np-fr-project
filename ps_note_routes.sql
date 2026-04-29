CREATE TABLE IF NOT EXISTS ps_note_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    KioskID INT NOT NULL,
    route INT NOT NULL,
    denomination INT,
    NoteValue INT,
    RecycleCount INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_kiosk_route (KioskID, route)
);
