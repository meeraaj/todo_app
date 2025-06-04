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
# Increase the timeout for Werkzeug server
app.config['TIMEOUT'] = 300

# Update secret key from environment
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Update CORS configuration to allow requests from production domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://taskify.westus.cloudapp.azure.com/"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
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
    # Get token from header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'No token provided'}), 401
    
    try:
        # Verify token and get user_id
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
        
        # Connect to database
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get tasks for the specific user
        cur.execute('''
            SELECT id, name, status, start_time, end_time 
            FROM tasks 
            WHERE user_id = %s 
            ORDER BY start_time DESC NULLS LAST
        ''', (user_id,))
        
        tasks = [{
            "id": row[0],
            "name": row[1],
            "status": row[2],
            "start_time": row[3].isoformat() if row[3] else None,
            "end_time": row[4].isoformat() if row[4] else None
        } for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify(tasks)
        
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")  # Add logging
        return jsonify({'message': 'Failed to fetch tasks'}), 500

@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        # Get token and user_id
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'No token provided'}), 401

        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']

        data = request.json
        if not data or 'name' not in data:
            return jsonify({'message': 'Task name is required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO tasks (user_id, name, status, start_time, end_time) VALUES (%s, %s, %s, %s, %s) RETURNING id',
            (user_id, data['name'], data.get('status', 'pending'), 
             data.get('start_time'), data.get('end_time'))
        )
        task_id = cur.fetchone()[0]
        conn.commit()

        # Fetch the newly created task
        cur.execute('''
            SELECT id, name, status, start_time, end_time 
            FROM tasks 
            WHERE id = %s
        ''', (task_id,))
        
        task = cur.fetchone()
        return jsonify({
            "id": task[0],
            "name": task[1],
            "status": task[2],
            "start_time": task[3].isoformat() if task[3] else None,
            "end_time": task[4].isoformat() if task[4] else None
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        print(f"Error adding task: {str(e)}")
        return jsonify({'message': 'Failed to add task'}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/tasks/search', methods=['POST'])
def search_tasks():
    try:
        # Get token and validate
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'No token provided'}), 401

        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']

        # Get search query
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'message': 'Search query is required'}), 400
        
        query = data['query']

        # Search in database
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT id, name, status, start  _time, end_time 
            FROM tasks 
            WHERE user_id = %s AND name ILIKE %s
            ORDER BY start_time DESC NULLS LAST
        ''', (user_id, f'%{query}%'))
        
        tasks = [{
            "id": row[0],
            "name": row[1],
            "status": row[2],
            "start_time": row[3].isoformat() if row[3] else None,
            "end_time": row[4].isoformat() if row[4] else None
        } for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify(tasks)
        
    except Exception as e:
        print(f"Error searching tasks: {str(e)}")
        return jsonify({'message': 'Failed to search tasks'}), 500

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

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'mobile']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Check if email exists
            cur.execute('SELECT id FROM users WHERE email = %s', (data['email'],))
            if cur.fetchone():
                return jsonify({'message': 'Email already registered'}), 409

            # Insert new user with better error handling
            try:
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

            except psycopg2.IntegrityError as e:
                print(f"Integrity error: {str(e)}")
                conn.rollback()
                return jsonify({'message': 'Email already exists'}), 409
            
            except psycopg2.Error as e:
                print(f"PostgreSQL error: {e.pgcode} - {e.pgerror}")
                conn.rollback()
                return jsonify({'message': f'Database error: {e.diag.message_primary}'}), 500

        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed: ' + str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
            
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check user exists
        cur.execute('SELECT id, password FROM users WHERE email = %s', (data['email'],))
        user = cur.fetchone()
        
        if not user or not check_password_hash(user[1], data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
            
        # Generate token
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({'token': token})
        
    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the actual error
        return jsonify({'message': 'Login failed'}), 500
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM tasks WHERE id = %s', (task_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Test users table
        cur.execute('SELECT COUNT(*) FROM users')
        users_count = cur.fetchone()[0]
        
        # Test tasks table
        cur.execute('SELECT COUNT(*) FROM tasks')
        tasks_count = cur.fetchone()[0]
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'tables': {
                'users': users_count,
                'tasks': tasks_count
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Update all provided fields
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            update_values.append(data['name'])
        if 'status' in data:
            update_fields.append("status = %s")
            update_values.append(data['status'])
        if 'start_time' in data:
            update_fields.append("start_time = %s")
            update_values.append(data['start_time'])
        if 'end_time' in data:
            update_fields.append("end_time = %s")
            update_values.append(data['end_time'])
            
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
            
        # Add task_id to values
        update_values.append(task_id)
        
        # Construct and execute query
        query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = %s"
        cur.execute(query, update_values)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Task updated successfully'})
        
    except Exception as e:
        print(f"Error updating task: {str(e)}")
        return jsonify({'message': 'Failed to update task'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

