# app/auth/routes.py
from flask import Blueprint, request, jsonify, redirect, url_for, session, current_app
from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')

        if not email or not password:
            return jsonify({"message": "Email and password are required."}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "User already exists."}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password_hash=hashed_password, username=username)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully."}), 201
    except Exception as e:
        current_app.logger.error(f"Error occurred: {str(e)}")
        return jsonify({"message": "Internal server error."}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Invalid credentials"}), 401
    
    user_info = {
        "email": user.email,
        "username": user.username
    }
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token, user=user_info), 200


@auth_bp.route('/current', methods=['GET'])
@jwt_required()
def current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(email=user.email, username=user.username), 200


@auth_bp.route('/google_login')
def google_login():
    redirect_uri = url_for('auth.google_authorized', _external=True)
    return current_app.extensions['oauth'].google.authorize_redirect(redirect_uri)


@auth_bp.route('/google_login/authorized')
def google_authorized():
    try:
        oauth = current_app.extensions['oauth']
        token = oauth.google.authorize_access_token()
        if not token:
            return jsonify({"message": "Authorization failed"}), 400

        user_info = oauth.google.get('userinfo').json()
        email = user_info.get('email')
        username = user_info.get('name') or email

        if not email:
            return jsonify({"message": "Failed to retrieve email from Google"}), 400

        existing_user = User.query.filter_by(email=email).first()
        if not existing_user:
            new_user = User(email=email, username=username, password_hash="oauth_login")
            db.session.add(new_user)
            db.session.commit()
            return jsonify({"message": "User created via OAuth", "email": email, "username": username}), 201

        return jsonify({"message": "User logged in via OAuth", "email": email, "username": username}), 200

    except Exception as e:
        current_app.logger.error(f"Error during OAuth process: {str(e)}")
        return jsonify({"message": "Internal server error during OAuth"}), 500
