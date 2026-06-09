import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
      connection = mysql.connector.connect(
    host='switchyard.proxy.rlwy.net',
    user='root',
    password='bgQrMwxAbuVqFCdWKisSbTVyaYjBpxeK',
    database='railway',
    port=11862
)
      return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

def setup_database():
    connection = create_connection()
    if not connection:
        return
    
    cursor = connection.cursor()

    try:
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS smart_parking;")
        cursor.execute("USE smart_parking;")

        # Drop tables if they exist to start fresh
        tables = [
            "Parking_History", "Notifications", "Payments", "Parking_Sessions", 
            "Parking_Slots", "Parking_Rates", "Admins", "Vehicles", "Parking_Zones", "Owners"
        ]
        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS {table};")

        # 1. Owners
        cursor.execute("""
        CREATE TABLE Owners (
            owner_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_name VARCHAR(255) NOT NULL,
            special_category ENUM('None', 'Disabled', 'Elderly') DEFAULT 'None'
        );
        """)

        # 2. Vehicles
        cursor.execute("""
        CREATE TABLE Vehicles (
            vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
            plate_number VARCHAR(20) NOT NULL UNIQUE,
            vehicle_type ENUM('2-wheeler', '4-wheeler') NOT NULL,
            owner_id INT,
            FOREIGN KEY (owner_id) REFERENCES Owners(owner_id) ON DELETE CASCADE
        );
        """)

        # 3. Parking_Zones
        cursor.execute("""
        CREATE TABLE Parking_Zones (
            zone_id INT AUTO_INCREMENT PRIMARY KEY,
            zone_name VARCHAR(100) NOT NULL,
            vehicle_type ENUM('2-wheeler', '4-wheeler') NOT NULL
        );
        """)

        # 4. Parking_Slots
        cursor.execute("""
        CREATE TABLE Parking_Slots (
            slot_id INT AUTO_INCREMENT PRIMARY KEY,
            zone_id INT,
            slot_number VARCHAR(20) NOT NULL,
            slot_category ENUM('Regular', 'Disabled', 'Elderly') DEFAULT 'Regular',
            status ENUM('Available', 'Booked', 'Occupied') DEFAULT 'Available',
            FOREIGN KEY (zone_id) REFERENCES Parking_Zones(zone_id) ON DELETE CASCADE
        );
        """)

        # 5. Parking_Sessions
        cursor.execute("""
        CREATE TABLE Parking_Sessions (
            session_id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_id INT,
            slot_id INT,
            entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            leaving_time DATETIME NULL,
            status ENUM('Active', 'Completed') DEFAULT 'Active',
            FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE,
            FOREIGN KEY (slot_id) REFERENCES Parking_Slots(slot_id) ON DELETE CASCADE
        );
        """)

        # 6. Admins
        cursor.execute("""
        CREATE TABLE Admins (
            admin_id INT AUTO_INCREMENT PRIMARY KEY,
            admin_name VARCHAR(255) NOT NULL,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );
        """)

        # 7. Payments
        cursor.execute("""
        CREATE TABLE Payments (
            payment_id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method ENUM('Cash', 'Card', 'UPI') NOT NULL,
            payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
            FOREIGN KEY (session_id) REFERENCES Parking_Sessions(session_id) ON DELETE CASCADE
        );
        """)

        # 8. Parking_Rates
        cursor.execute("""
        CREATE TABLE Parking_Rates (
            rate_id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_type ENUM('2-wheeler', '4-wheeler') NOT NULL,
            hourly_rate DECIMAL(10, 2) NOT NULL
        );
        """)

        # 9. Notifications
        cursor.execute("""
        CREATE TABLE Notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_id INT,
            message TEXT NOT NULL,
            sent_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE
        );
        """)

        # 10. Parking_History
        cursor.execute("""
        CREATE TABLE Parking_History (
            history_id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_id INT,
            slot_id INT,
            entry_time DATETIME NOT NULL,
            exit_time DATETIME NOT NULL,
            total_cost DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE,
            FOREIGN KEY (slot_id) REFERENCES Parking_Slots(slot_id) ON DELETE CASCADE
        );
        """)

        print("Tables created successfully.")

        # Insert Dummy Data
        # Owners
        cursor.execute("INSERT INTO Owners (owner_name, special_category) VALUES ('John Doe', 'None'), ('Jane Smith', 'Disabled'), ('Bob Johnson', 'Elderly');")
        
        # Vehicles
        cursor.execute("INSERT INTO Vehicles (plate_number, vehicle_type, owner_id) VALUES ('KA01AB1234', '4-wheeler', 1), ('MH12CD5678', '4-wheeler', 2), ('DL03EF9012', '2-wheeler', 3);")
        
        # Parking Zones
        cursor.execute("INSERT INTO Parking_Zones (zone_name, vehicle_type) VALUES ('Zone A (Cars)', '4-wheeler'), ('Zone B (Bikes)', '2-wheeler');")

        # Parking Slots (generate a grid)
        # Zone A (4-wheeler): 20 slots
        slots_data = []
        for i in range(1, 21):
            category = 'Regular'
            status = 'Available'
            if i in [1, 2]: category = 'Disabled'
            elif i in [3, 4]: category = 'Elderly'
            
            if i == 5: status = 'Occupied'
            if i == 6: status = 'Booked'

            slots_data.append((1, f"A-{i:02d}", category, status))

        # Zone B (2-wheeler): 20 slots
        for i in range(1, 21):
            category = 'Regular'
            status = 'Available'
            if i == 1: status = 'Occupied'
            
            slots_data.append((2, f"B-{i:02d}", category, status))

        cursor.executemany("INSERT INTO Parking_Slots (zone_id, slot_number, slot_category, status) VALUES (%s, %s, %s, %s)", slots_data)

        # Parking Rates
        cursor.execute("INSERT INTO Parking_Rates (vehicle_type, hourly_rate) VALUES ('2-wheeler', 10.00), ('4-wheeler', 40.00);")

        # Admins
        cursor.execute("INSERT INTO Admins (admin_name, username, password) VALUES ('System Admin', 'admin', 'password123');")

        connection.commit()
        print("Dummy data inserted successfully.")

    except Error as e:
        print(f"Error executing queries: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed.")

if __name__ == "__main__":
    setup_database()
