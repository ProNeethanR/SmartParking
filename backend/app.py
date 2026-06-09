from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_db_connection():
    try:
        return mysql.connector.connect(
            host='switchyard.proxy.rlwy.net',
            user='root',
            password='bgQrMwxAbuVqFCdWKisSbTVyaYjBpxeK',
            database='railway',
            port=11862
        )
    except Error as e:
        print(f"DB Error: {e}")
        return None

@app.route('/api/state', methods=['GET'])
def get_state():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Parking_Zones")
        db_zones = cursor.fetchall()
        zones = [{"zone_id": str(z['zone_id']), "zone_name": z['zone_name'], "vehicle_type": z['vehicle_type'].lower()} for z in db_zones]

        cursor.execute("SELECT * FROM Parking_Slots")
        db_slots = cursor.fetchall()
        slots = []
        for s in db_slots:
            st = s['status'].lower()
            cat = s['slot_category'].lower()
            if cat == 'regular':
                z = next((x for x in db_zones if x['zone_id'] == s['zone_id']), None)
                cat = z['vehicle_type'].lower() if z else '4-wheeler'
            slots.append({"slot_id": str(s['slot_id']), "zone_id": str(s['zone_id']), "slot_number": int(s['slot_number'].split('-')[-1]) if '-' in str(s['slot_number']) else s['slot_number'], "slot_category": cat, "status": st})

        cursor.execute("SELECT * FROM Owners")
        db_owners = cursor.fetchall()
        owners = [{"owner_id": str(o['owner_id']), "owner_name": o['owner_name'], "special_category": o['special_category']} for o in db_owners]

        cursor.execute("SELECT * FROM Vehicles")
        db_vehicles = cursor.fetchall()
        vehicles = [{"vehicle_id": str(v['vehicle_id']), "plate_number": v['plate_number'], "vehicle_type": v['vehicle_type'].lower(), "owner_id": str(v['owner_id'])} for v in db_vehicles]

        cursor.execute("SELECT * FROM Parking_Sessions")
        db_sessions = cursor.fetchall()
        sessions = [{"session_id": str(s['session_id']), "vehicle_id": str(s['vehicle_id']), "slot_id": str(s['slot_id']), "entry_time": s['entry_time'].isoformat() if s['entry_time'] else None, "leaving_time": s['leaving_time'].isoformat() if s['leaving_time'] else None, "status": s['status'].lower()} for s in db_sessions]

        cursor.execute("SELECT * FROM Payments")
        db_payments = cursor.fetchall()
        payments = [{"payment_id": str(p['payment_id']), "session_id": str(p['session_id']), "amount": float(p['amount']), "payment_method": p['payment_method'], "payment_status": "done" if p['payment_status'] == 'Paid' else "waiting"} for p in db_payments]

        cursor.execute("SELECT * FROM Parking_Rates")
        db_rates = cursor.fetchall()
        rates = [{"rate_id": str(r['rate_id']), "vehicle_type": r['vehicle_type'].lower(), "hourly_rate": float(r['hourly_rate']), "label": "Two Wheeler" if r['vehicle_type'] == '2-wheeler' else "Four Wheeler"} for r in db_rates]

        cursor.execute("SELECT * FROM Notifications")
        db_notifs = cursor.fetchall()
        notifications = [{"notification_id": str(n['notification_id']), "vehicle_id": str(n['vehicle_id']), "message": n['message'], "sent_time": n['sent_time'].isoformat() if n['sent_time'] else None, "read": False} for n in db_notifs]

        cursor.execute("SELECT * FROM Parking_History")
        db_history = cursor.fetchall()
        history = [{"history_id": str(h['history_id']), "vehicle_id": str(h['vehicle_id']), "slot_id": str(h['slot_id']), "entry_time": h['entry_time'].isoformat() if h['entry_time'] else None, "exit_time": h['exit_time'].isoformat() if h['exit_time'] else None, "total_cost": float(h['total_cost'])} for h in db_history]

        return jsonify({
            "owners": owners, "vehicles": vehicles, "zones": zones, "slots": slots,
            "sessions": sessions, "payments": payments, "rates": rates,
            "notifications": notifications, "history": history
        })
    finally:
        cursor.close()
        conn.close()

@app.route('/api/register_and_allot', methods=['POST'])
def register_and_allot():
    data = request.json
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        # Find a slot
        cursor.execute("SELECT * FROM Parking_Slots WHERE status = 'Available'")
        available = cursor.fetchall()
        slot = None
        target_cat = data.get('vehicle_type', '4-wheeler')
        for s in available:
            cat = s['slot_category'].lower()
            if cat == 'regular':
                cursor.execute("SELECT vehicle_type FROM Parking_Zones WHERE zone_id = %s", (s['zone_id'],))
                z = cursor.fetchone()
                cat = z['vehicle_type'].lower() if z else '4-wheeler'
            if cat == target_cat:
                slot = s
                break
        
        if not slot: return jsonify({"error": "No slots available in the requested zone."})

        # Insert Owner
        cursor.execute("INSERT INTO Owners (owner_name, special_category) VALUES (%s, %s)", (data.get('owner_name'), data.get('special_category', 'None')))
        owner_id = cursor.lastrowid
        
        # Insert Vehicle
        cursor.execute("INSERT INTO Vehicles (plate_number, vehicle_type, owner_id) VALUES (%s, %s, %s)", (data.get('plate_number'), '2-wheeler' if target_cat == '2-wheeler' else '4-wheeler', owner_id))
        vehicle_id = cursor.lastrowid

        # Occupy Slot
        cursor.execute("UPDATE Parking_Slots SET status = 'Occupied' WHERE slot_id = %s", (slot['slot_id'],))
        
        # Session
        cursor.execute("INSERT INTO Parking_Sessions (vehicle_id, slot_id, status) VALUES (%s, %s, 'Active')", (vehicle_id, slot['slot_id']))
        session_id = cursor.lastrowid
        
        # Payment waiting
        cursor.execute("SELECT hourly_rate FROM Parking_Rates WHERE vehicle_type = %s", (target_cat,))
        rate = cursor.fetchone()
        amount = rate['hourly_rate'] if rate else 20
        cursor.execute("INSERT INTO Payments (session_id, amount, payment_method, payment_status) VALUES (%s, %s, 'Pending', 'Pending')", (session_id, amount))
        payment_id = cursor.lastrowid

        # Notification
        cursor.execute("INSERT INTO Notifications (vehicle_id, message) VALUES (%s, %s)", (vehicle_id, f"Slot {slot['slot_id']} allotted."))

        conn.commit()
        return jsonify({
            "slot": {"slot_id": str(slot['slot_id'])},
            "vehicle": {"vehicle_id": str(vehicle_id)},
            "session": {"session_id": str(session_id)},
            "payment": {"payment_id": str(payment_id)}
        })
    finally:
        cursor.close()
        conn.close()

@app.route('/api/end_session', methods=['POST'])
def end_session():
    data = request.json
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Parking_Sessions WHERE session_id = %s", (data.get('session_id'),))
        sess = cursor.fetchone()
        if not sess: return jsonify({"error": "Session not found"}), 404

        cursor.execute("UPDATE Parking_Slots SET status = 'Available' WHERE slot_id = %s", (sess['slot_id'],))
        cursor.execute("UPDATE Parking_Sessions SET status = 'Completed', leaving_time = CURRENT_TIMESTAMP WHERE session_id = %s", (sess['session_id'],))
        
        cursor.execute("SELECT * FROM Payments WHERE session_id = %s", (sess['session_id'],))
        payment = cursor.fetchone()
        total = payment['amount'] if payment else 0
        cursor.execute("INSERT INTO Parking_History (vehicle_id, slot_id, entry_time, exit_time, total_cost) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s)", (sess['vehicle_id'], sess['slot_id'], sess['entry_time'], total))
        
        conn.commit()
        return jsonify({"success": True})
    finally:
        cursor.close()
        conn.close()

@app.route('/api/pay', methods=['POST'])
def pay():
    data = request.json
    conn = get_db_connection()
    if not conn: return jsonify({"error": "DB failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE Payments SET payment_method = %s, payment_status = 'Paid' WHERE payment_id = %s", (data.get('method'), data.get('payment_id')))
        conn.commit()
        return jsonify({"success": True})
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
