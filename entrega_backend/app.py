from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from bson.json_util import dumps
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
import os
import threading
import time
import random
import requests


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"], "supports_credentials": True}})

mongo_uri = os.getenv('MONGODB_URI', 'mongodb+srv://fallbackuri')
client = MongoClient(mongo_uri)
db = client['user_db']
users = db['users']

@app.route('/auth', methods=['POST'])
def auth():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    action = data.get('action') 

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users.find_one({"username": username})

    if action == 'register':
        if user:
            return jsonify({"error": "User already exists"}), 409
        hashed_password = generate_password_hash(password)
        user_id = users.insert_one({"username": username, "password": hashed_password}).inserted_id
        return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201

    elif action == 'login':
        if not user:
            return jsonify({"error": "User does not exist"}), 404
        if check_password_hash(user['password'], password):
            return jsonify({"message": "Login successful", "user": dumps(user)}), 200
        else:
            return jsonify({"error": "Invalid password"}), 401

    else:
        return jsonify({"error": "Invalid action"}), 400
    


def mine_bitcoin(user_id):
    while True:
        time.sleep(10)
        mined = random.uniform(0.0000001, 0.05)
        users.update_one(
            {"_id": user_id},
            {"$inc": {"total_mined": mined}, "$set": {"mining_instance_active": True}}
        )

@app.route('/start_mining', methods=['GET'])
def start_mining():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"error": "Invalid user_id"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.get('mining_instance_active', False):
        return jsonify({"error": "Mining instance already active"}), 409

    thread = threading.Thread(target=mine_bitcoin, args=(user['_id'],))
    thread.start()

    return jsonify({"message": "Mining started for user"}), 200

@app.route('/user_info', methods=['GET'])
def user_info():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"error": "Invalid user_id"}), 400

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user_id": str(user['_id']),
        "total_mined": user.get('total_mined', 0),
        "mining_instance_active": user.get('mining_instance_active', False)
    }), 200



@app.route('/restart_mining_instances', methods=['GET'])
def restart_mining_instances():
    active_users = users.find({"mining_instance_active": True})
    count = 0
    for user in active_users:
        thread = threading.Thread(target=mine_bitcoin, args=(user['_id'],))
        thread.start()
        count += 1
    return jsonify({"message": f"Restarted mining for {count} active users"}), 200

@app.route('/get_btc_values', methods=['GET'])
def get_btc_values():
    try:
        response = requests.get('https://economia.awesomeapi.com.br/last/BTC-BRL,BTC-USD')
        data = response.json()
        btc_brl_bid = float(data['BTCBRL']['bid'])
        btc_usd_bid = float(data['BTCUSD']['bid'])
        return jsonify({"BTC_BRL": btc_brl_bid, "BTC_USD": btc_usd_bid}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
