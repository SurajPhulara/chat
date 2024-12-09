from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth
from .config import Config
import psycopg2.pool

bcrypt = Bcrypt()
jwt = JWTManager()
oauth = OAuth()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    bcrypt.init_app(app)
    jwt.init_app(app)
    oauth.init_app(app)

    # Set up database connection pooling
    app.db_pool = psycopg2.pool.SimpleConnectionPool(
        1, 10,
        user=app.config["DB_USER"],
        password=app.config["DB_PASSWORD"],
        host=app.config["DB_HOST"],
        port=app.config["DB_PORT"],
        database=app.config["DB_NAME"]
    )

    # Register blueprints
    from .auth.routes import auth_bp
    from .chatbot.routes import chatbot_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(chatbot_bp, url_prefix='/chatbot')

    return app
