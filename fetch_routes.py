import requests

url = "http://localhost:5000/routes"

try:
    response = requests.get(url)
    data = response.json()
    print("Routes data:")
    for route in data:
        print(route)
except Exception as e:
    print("Error fetching data:", e)
