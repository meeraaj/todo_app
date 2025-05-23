from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Update secret key from environment
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Update CORS configuration to allow requests from production domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3001",
            "http://localhost:3000",
            "http://todoapp.westus.cloudapp.azure.com",
            "https://todoapp.westus.cloudapp.azure.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600,
        "send_wildcard": False
    }
})

# Add error handler for timeouts
@app.errorhandler(504)
def gateway_timeout(e):
    return make_response(jsonify({'message': 'Request timed out'}), 504)

# Add error handler for CORS preflight
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get('Origin')
        if origin in [
            "http://localhost:3001",
            "http://localhost:3000",
            "http://todoapp.westus.cloudapp.azure.com",
            "https://todoapp.westus.cloudapp.azure.com"
        ]:
            response.headers.add("Access-Control-Allow-Origin", origin)
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

# Database configuration
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    return conn

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, status, start_time, end_time FROM tasks')
        tasks = [
            {
                "id": row[0],
                "name": row[1],
                "status": row[2],
                "start_time": row[3].isoformat() if row[3] else None,
                "end_time": row[4].isoformat() if row[4] else None
            }
            for row in cur.fetchall()
        ]
        return jsonify(tasks)

    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return jsonify({'message': 'Failed to fetch tasks'}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'message': 'Task name is required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO tasks (name, status, start_time, end_time) VALUES (%s, %s, %s, %s) RETURNING id',
            (data['name'], data.get('status', 'pending'), 
             data.get('start_time'), data.get('end_time'))
        )
        task_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"id": task_id}), 201

    except Exception as e:
        print(f"Error adding task: {str(e)}")
        return jsonify({'message': 'Failed to add task'}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()


@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'No token provided'}), 401
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT name, email, mobile FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user:
            return jsonify({
                'name': user[0],
                'email': user[1],
                'mobile': user[2],
                'profilePicUrl': '/default-avatar.png'  # Always use default avatar
            })
        return jsonify({'message': 'User not found'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

@app.route('/api/components/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'mobile']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if email exists
        cur.execute('SELECT id FROM users WHERE email = %s', (data['email'],))
        if cur.fetchone():
            return jsonify({'message': 'Email already registered'}), 409

        # Insert new user with default avatar
        cur.execute('''
            INSERT INTO users (name, email, password, mobile)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (
            data['name'],
            data['email'],
            generate_password_hash(data['password']),
            data['mobile']
        ))
        
        user_id = cur.fetchone()[0]
        conn.commit()

        token = jwt.encode(
            {
                'user_id': user_id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return jsonify({
            'message': 'Registration successful',
            'token': token
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed'}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    # Get JSON data instead of Basic Auth
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 401

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, password FROM users WHERE email = %s', (data['email'],))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and check_password_hash(user[1], data['password']):
            token = jwt.encode(
                {
                    'user_id': user[0],
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
                },
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            return jsonify({'token': token}), 200

        return jsonify({'message': 'Invalid email or password'}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed'}), 500


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
    app.run(debug=True, host='0.0.0.0', port=5000)

