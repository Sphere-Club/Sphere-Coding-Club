import sqlite3
import os
from datetime import datetime
import bcrypt

def safe_password_truncate(password: str) -> str:
    """Safely truncate password to 72 characters for bcrypt compatibility"""
    if len(password) > 72:
        truncated = password[:72]
        print(f"🔧 Password truncated from {len(password)} to {len(truncated)} characters")
        return truncated
    return password

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_safe = safe_password_truncate(password)
    # Convert to bytes and hash
    password_bytes = password_safe.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    password_safe = safe_password_truncate(password)
    password_bytes = password_safe.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

class UserDatabase:
    def __init__(self, db_path="users.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database and create users table if it doesn't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                city TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print(f"✅ Database initialized: {self.db_path}")
    
    def create_user(self, full_name: str, city: str, email: str, password: str):
        """Create a new user account"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Check if user already exists
            cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                return False, "Email already registered"
            
            # Truncate password to 72 characters for bcrypt compatibility
            password_safe = safe_password_truncate(password)
            
            # Hash password and create user
            hashed_password = hash_password(password)
            cursor.execute('''
                INSERT INTO users (full_name, city, email, hashed_password)
                VALUES (?, ?, ?, ?)
            ''', (full_name, city, email, hashed_password))
            
            conn.commit()
            conn.close()
            print(f"✅ User created: {email}")
            return True, "User created successfully"
            
        except sqlite3.IntegrityError:
            conn.close()
            return False, "Email already registered"
        except Exception as e:
            conn.close()
            return False, f"Database error: {str(e)}"
    
    def verify_user(self, email: str, password: str):
        """Verify user credentials for login"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (email,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return False, "Invalid email or password"
            
            hashed_password = result[0]
            
            # Truncate password to 72 characters for bcrypt compatibility
            password_safe = safe_password_truncate(password)
            
            # Verify password
            if verify_password(password, hashed_password):
                # Update last login time
                cursor.execute(
                    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?",
                    (email,)
                )
                conn.commit()
                conn.close()
                print(f"✅ User logged in: {email}")
                return True, "Login successful"
            else:
                conn.close()
                return False, "Invalid email or password"
                
        except Exception as e:
            conn.close()
            return False, f"Database error: {str(e)}"
    
    def get_user(self, email: str):
        """Get user information by email"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, full_name, city, email, created_at, last_login
                FROM users WHERE email = ?
            ''', (email,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return {
                    "id": result[0],
                    "full_name": result[1],
                    "city": result[2],
                    "email": result[3],
                    "created_at": result[4],
                    "last_login": result[5]
                }
            return None
            
        except Exception as e:
            conn.close()
            print(f"❌ Database error: {e}")
            return None
    
    def get_all_users(self):
        """Get all users (for admin purposes)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, full_name, city, email, created_at, last_login
                FROM users ORDER BY created_at DESC
            ''')
            
            results = cursor.fetchall()
            conn.close()
            
            users = []
            for result in results:
                users.append({
                    "id": result[0],
                    "full_name": result[1],
                    "city": result[2],
                    "email": result[3],
                    "created_at": result[4],
                    "last_login": result[5]
                })
            
            return users
            
        except Exception as e:
            conn.close()
            print(f"❌ Database error: {e}")
            return []
    
    def delete_user(self, email: str):
        """Delete a user account"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("DELETE FROM users WHERE email = ?", (email,))
            deleted_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            if deleted_rows > 0:
                print(f"✅ User deleted: {email}")
                return True, "User deleted successfully"
            else:
                return False, "User not found"
                
        except Exception as e:
            conn.close()
            return False, f"Database error: {str(e)}"

# Global database instance
user_db = UserDatabase()