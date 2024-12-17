# app/chatbot/routes.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import Chat, Message, User
from flask_jwt_extended import jwt_required, get_jwt_identity

chatbot_bp = Blueprint('chatbot', __name__)

# Route to ask a query to the chatbot
@chatbot_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_chatbot():
    data = request.get_json()
    
    chat_id = data.get('chat_id')
    message = data.get('message')

    if not chat_id or not message:
        return jsonify({"msg": "Chat ID and message are required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Fetch or create chat for user
    chat = Chat.query.filter_by(chat_id=chat_id, user_id=user.id).first()
    if not chat:
        chat = Chat(chat_id=chat_id, user_id=user.id, name=f"{message}")
        db.session.add(chat)
        db.session.commit()

    # Add user message
    user_message = Message(chat_id=chat.id, sender='user', content=message)
    db.session.add(user_message)
    db.session.commit()

    # Fetch all chat history
    chat_history = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp).all()
    print(f"Chat History for {chat.chat_id}:")
    for msg in chat_history:
        print(f"{msg.sender}: {msg.content} ({msg.timestamp})")

    # Hardcoded chatbot response
    chatbot_response = "This is a hardcoded response to your input: " + message
    bot_message = Message(chat_id=chat.id, sender='bot', content=chatbot_response)
    db.session.add(bot_message)
    db.session.commit()

    return jsonify({"response": chatbot_response}), 200

# Route to get the latest chats for a user
@chatbot_bp.route('/latest-chats', methods=['GET'])
@jwt_required()
def get_latest_chats():
    x = request.args.get('x', default=5, type=int)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    latest_chats = Chat.query.filter_by(user_id=user.id).order_by(Chat.created_at.desc()).limit(x).all()
    chats_data = [{"chat_id": chat.chat_id, "name": chat.name} for chat in latest_chats]
    
    return jsonify({"latest_chats": chats_data}), 200

# Route to get the entire chat history for a specific chat ID
@chatbot_bp.route('/chat-history', methods=['GET'])
@jwt_required()
def get_chat_history():
    chat_id = request.args.get('chat_id')
    
    if not chat_id:
        return jsonify({"msg": "Chat ID is required"}), 400
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    chat = Chat.query.filter_by(chat_id=chat_id, user_id=user.id).first()
    if not chat:
        return jsonify({"msg": "Chat not found for this user"}), 404

    # Fetch all chat history for the given chat ID
    chat_history = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp).all()
    history_data = [
        {"sender": msg.sender, "content": msg.content, "timestamp": msg.timestamp}
        for msg in chat_history
    ]
    
    return jsonify({"chat_history": history_data}), 200
