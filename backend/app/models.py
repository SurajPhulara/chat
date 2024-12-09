from flask import current_app

def get_user_by_email(email):
    conn = current_app.db_pool.getconn()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    current_app.db_pool.putconn(conn)
    if user:
        return {"id": user[0], "email": user[1], "password": user[2]}
    return None

def create_user(email, password):
    conn = current_app.db_pool.getconn()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, password))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        current_app.db_pool.putconn(conn)
