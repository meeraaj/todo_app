from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        user="rajesh",
        password="xp",
        database="basic_todo"
    )
    return conn

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, name, description, status, start_time, end_time FROM tasks')
    tasks = [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "status": row[3],
            "start_time": row[4].isoformat() if row[4] else None,
            "end_time": row[5].isoformat() if row[5] else None
        }
        for row in cur.fetchall()
    ]
    cur.close()
    conn.close()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO tasks (name, description, status, start_time, end_time) VALUES (%s, %s, %s, %s, %s) RETURNING id',
        (data['name'], data['description'], data['status'], data.get('start_time'), data.get('end_time'))
    )
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"id": task_id}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def modify_task(task_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'UPDATE tasks SET name = %s, description = %s, status = %s, start_time = %s, end_time = %s WHERE id = %s',
        (data['name'], data['description'], data['status'], data.get('start_time'), data.get('end_time'), task_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM tasks WHERE id = %s', (task_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)

