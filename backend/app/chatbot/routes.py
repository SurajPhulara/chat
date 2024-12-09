from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask():
    data = request.json
    user_input = data.get('message')

    # Simulated chatbot response
    response = "This is a hardcoded response to your input: " + user_input
    return jsonify({"response": response}), 200
