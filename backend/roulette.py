# backend/roulette.py
import random

RED_NUMBERS = {
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
}

WHEEL = ["0", "00"] + [str(number) for number in range(1, 37)]

def spin_wheel():
    return random.choice(WHEEL)

def resolve_bet(bet_type, amount, result, number=None):
    if result in ["0", "00"]:
        result_number = None
    else:
        result_number = int(result)

    if bet_type == "straight":
        return amount * 35 if result == str(number) else -amount

    if bet_type == "red":
        return amount if result_number in RED_NUMBERS else -amount

    if bet_type == "black":
        return amount if result_number is not None and result_number not in RED_NUMBERS else -amount

    if bet_type == "odd":
        return amount if result_number is not None and result_number % 2 == 1 else -amount

    if bet_type == "even":
        return amount if result_number is not None and result_number % 2 == 0 else -amount

    return -amount
