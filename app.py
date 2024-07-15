from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_bottle', methods=['POST'])
def select_bottle():
    data = request.get_json()
    bottle_id = data.get('id')
    return jsonify({"message": f"Bottle {bottle_id} selected"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)