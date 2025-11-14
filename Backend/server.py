from datetime import datetime
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TARGET_INTENSITY = 89.3368
ENERGY_PER_TONNE = 41000

routes_data = [
    {
        "routeId": "R001",
        "vesselType": "Container",
        "fuelType": "HFO",
        "year": 2024,
        "ghgIntensity": 91.0,
        "fuelConsumption": 5000.0,
        "distance": 12000,
        "totalEmissions": 4500,
        "isBaseline": False,
    },
    {
        "routeId": "R002",
        "vesselType": "BulkCarrier",
        "fuelType": "LNG",
        "year": 2024,
        "ghgIntensity": 88.0,
        "fuelConsumption": 4800.0,
        "distance": 11500,
        "totalEmissions": 4200,
        "isBaseline": True,
    },
    {
        "routeId": "R003",
        "vesselType": "Tanker",
        "fuelType": "MGO",
        "year": 2024,
        "ghgIntensity": 93.5,
        "fuelConsumption": 5100.0,
        "distance": 12500,
        "totalEmissions": 4700,
        "isBaseline": False,
    },
    {
        "routeId": "R004",
        "vesselType": "RoRo",
        "fuelType": "HFO",
        "year": 2025,
        "ghgIntensity": 89.2,
        "fuelConsumption": 4900.0,
        "distance": 11800,
        "totalEmissions": 4300,
        "isBaseline": False,
    },
    {
        "routeId": "R005",
        "vesselType": "Container",
        "fuelType": "LNG",
        "year": 2025,
        "ghgIntensity": 90.5,
        "fuelConsumption": 4950.0,
        "distance": 11900,
        "totalEmissions": 4400,
        "isBaseline": False,
    },
]

bank_entries = []
pool_history = []


def find_route(route_id, year=None):
    for route in routes_data:
        if route["routeId"] == route_id and (year is None or route["year"] == int(year)):
            return route
    return None


def current_baseline():
    return next((route for route in routes_data if route.get("isBaseline")), routes_data[0])


def compute_cb(route):
    energy = route["fuelConsumption"] * ENERGY_PER_TONNE
    cb_value = (TARGET_INTENSITY - route["ghgIntensity"]) * energy
    return {
        "shipId": route["routeId"],
        "year": route["year"],
        "cbGco2eq": cb_value,
        "actualIntensity": route["ghgIntensity"],
        "targetIntensity": TARGET_INTENSITY,
    }


def net_banked(ship_id, year):
    return sum(entry["amount"] for entry in bank_entries if entry["shipId"] == ship_id and entry["year"] == int(year))


def build_bank_entry(ship_id, year, amount):
    timestamp = datetime.utcnow().isoformat() + "Z"
    entry = {
        "id": str(uuid.uuid4()),
        "shipId": ship_id,
        "year": int(year),
        "amount": float(amount),
        "amountGco2eq": float(amount),
        "timestamp": timestamp,
        "createdAt": timestamp,
    }
    return entry


@app.route("/routes", methods=["GET"])
def get_routes():
    return jsonify(routes_data)


@app.route("/routes/<route_id>/baseline", methods=["POST"])
def set_baseline(route_id):
    updated = False
    for route in routes_data:
        route["isBaseline"] = route["routeId"] == route_id
        if route["routeId"] == route_id:
            updated = True
    if not updated:
        return jsonify({"error": "Route not found"}), 404
    return jsonify({"success": True, "routeId": route_id})


@app.route("/routes/comparison", methods=["GET"])
def comparison():
    baseline = current_baseline()
    base_intensity = baseline["ghgIntensity"]
    data = []
    for route in routes_data:
        diff = ((route["ghgIntensity"] - base_intensity) / base_intensity) * 100 if base_intensity else 0
        data.append({
            "route_id": route["routeId"],
            "ghg_intensity": route["ghgIntensity"],
            "baseline_intensity": base_intensity,
            "percent_diff": diff,
            "compliant": route["ghgIntensity"] <= base_intensity,
        })
    return jsonify(data)


@app.route("/compliance/cb", methods=["GET"])
def get_cb():
    ship_id = request.args.get("shipId")
    year = request.args.get("year")
    if not ship_id or not year:
        return jsonify({"error": "shipId and year are required"}), 400
    route = find_route(ship_id, year)
    if not route:
        return jsonify({"error": "Route not found"}), 404
    return jsonify(compute_cb(route))


@app.route("/compliance/adjusted-cb", methods=["GET"])
def adjusted_cb():
    year = request.args.get("year")
    if not year:
        return jsonify({"error": "year is required"}), 400
    ship_id = request.args.get("shipId")

    def build(route):
        cb = compute_cb(route)
        net = net_banked(route["routeId"], year)
        return {
            **cb,
            "netBanked": net,
            "adjustedCb": cb["cbGco2eq"] + net,
        }

    if ship_id:
        route = find_route(ship_id, year)
        if not route:
            return jsonify({"error": "Route not found"}), 404
        return jsonify(build(route))

    year_routes = [route for route in routes_data if route["year"] == int(year)]
    return jsonify([build(route) for route in year_routes])


@app.route("/banking/records")
def banking_records():
    ship_id = request.args.get("shipId")
    year = request.args.get("year")
    if not ship_id or not year:
        return jsonify({"error": "shipId and year are required"}), 400
    records = [entry for entry in bank_entries if entry["shipId"] == ship_id and entry["year"] == int(year)]
    records.sort(key=lambda e: e["timestamp"], reverse=True)
    return jsonify(records)


@app.route("/banking/bank", methods=["POST"])
def bank_surplus():
    data = request.get_json(force=True)
    ship_id = data.get("shipId")
    year = data.get("year")
    amount = float(data.get("amount", 0))
    if not ship_id or not year or amount <= 0:
        return jsonify({"error": "shipId, year and positive amount required"}), 400
    route = find_route(ship_id, year)
    if not route:
        return jsonify({"error": "Route not found"}), 404
    cb = compute_cb(route)["cbGco2eq"]
    if amount > cb:
        return jsonify({"error": "Amount exceeds available surplus"}), 400
    entry = build_bank_entry(ship_id, year, amount)
    bank_entries.append(entry)
    return jsonify(entry), 201


@app.route("/banking/apply", methods=["POST"])
def apply_banked():
    data = request.get_json(force=True)
    from_ship = data.get("fromShipId")
    to_ship = data.get("toShipId")
    year = data.get("year")
    amount = float(data.get("amount", 0))
    if not from_ship or not to_ship or not year or amount <= 0:
        return jsonify({"error": "fromShipId, toShipId, year and positive amount required"}), 400
    if from_ship == to_ship:
        return jsonify({"error": "fromShipId and toShipId must differ"}), 400
    if not find_route(from_ship, year) or not find_route(to_ship, year):
        return jsonify({"error": "Route not found"}), 404
    if net_banked(from_ship, year) < amount:
        return jsonify({"error": "Insufficient banked amount"}), 400

    from_entry = build_bank_entry(from_ship, year, -amount)
    to_entry = build_bank_entry(to_ship, year, amount)
    bank_entries.extend([from_entry, to_entry])
    return jsonify({"fromEntry": from_entry, "toEntry": to_entry}), 201


@app.route("/pools", methods=["POST"])
def create_pool():
    payload = request.get_json(force=True)
    year = payload.get("year")
    members = payload.get("members") or []
    if not year or not members:
        return jsonify({"error": "year and members array required"}), 400
    total_cb = sum(member.get("cbBefore", 0) for member in members)
    if total_cb < 0:
        return jsonify({"error": "Pool total CB must be non-negative"}), 400

    allocation = [
        {
            "shipId": member.get("shipId"),
            "cbBefore": float(member.get("cbBefore", 0)),
            "cbAfter": float(member.get("cbBefore", 0)),
        }
        for member in members
    ]

    surpluses = [member for member in allocation if member["cbBefore"] > 0]
    deficits = [member for member in allocation if member["cbBefore"] < 0]
    surplus_idx = 0
    deficit_idx = 0
    while surplus_idx < len(surpluses) and deficit_idx < len(deficits):
        surplus = surpluses[surplus_idx]
        deficit = deficits[deficit_idx]
        transfer = min(surplus["cbAfter"], -deficit["cbAfter"])
        surplus["cbAfter"] -= transfer
        deficit["cbAfter"] += transfer
        if surplus["cbAfter"] <= 0:
            surplus_idx += 1
        if deficit["cbAfter"] >= 0:
            deficit_idx += 1

    pool_result = {
        "id": str(uuid.uuid4()),
        "year": int(year),
        "totalCb": total_cb,
        "members": allocation,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    pool_history.append(pool_result)
    return jsonify(pool_result), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
