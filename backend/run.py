from app import create_app
from flask_cors import CORS

# Initialize the Flask application
app = create_app()

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app, resources={r"/*": {"origins": "*"}})

if __name__ == "__main__":
    # Run the Flask development server
    app.run(host="0.0.0.0", port=5000)
