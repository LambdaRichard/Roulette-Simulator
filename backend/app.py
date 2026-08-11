# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from roulette import spin_wheel, resolve_bet
import time

app = Flask(__name__)

# This enables CORS for ALL routes from ALL origins (good for development)
CORS(app)

balance = 1000

@app.route("/spin", methods=["POST"])
def spin():
    global balance

    #time.sleep(10)
    data = request.json
    bet_type = data["betType"]
    amount = int(data["amount"])
    number = data.get("number")

    result = spin_wheel()
    profit = resolve_bet(bet_type, amount, result, number)

    balance += profit

    return jsonify({
        "result": result,
        "profit": profit,
        "balance": balance
    })

@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.json

    bet_type = data["betType"]
    amount = int(data["amount"])
    number = data.get("number")
    spins = int(data["spins"])

    simulation_balance = 1000
    history = [simulation_balance]
    wins = 0
    losses = 0

    for _ in range(spins):
        result = spin_wheel()
        profit = resolve_bet(bet_type, amount, result, number)

        simulation_balance += profit
        history.append(simulation_balance)

        if profit > 0:
            wins += 1
        else:
            losses += 1

    return jsonify({
        "finalBalance": simulation_balance,
        "history": history,
        "wins": wins,
        "losses": losses,
        "spins": spins
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
