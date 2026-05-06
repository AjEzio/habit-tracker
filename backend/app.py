from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sqlite3

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('habits.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS habits 
    (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS habits_log 
    (id INTEGER PRIMARY KEY AUTOINCREMENT,habit_id INTEGER, date TEXT NOT NULL, FOREIGN KEY (habit_id) REFERENCES habits(id))''')
    conn.commit()
    conn.close()

init_db()

@app.route('/habits', methods=['GET'])
def get_habits():
    conn = sqlite3.connect('habits.db')
    cursor = conn.cursor()
    habits = cursor.execute('SELECT * FROM habits').fetchall()
    conn.close()
    return jsonify([{'id': h[0], 'name': h[1]} for h in habits]), 200

@app.route('/habits', methods=['POST'])
def add_habits():
    data = request.json
    name = data.get('name')
    conn = sqlite3.connect('habits.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO habits (name) VALUES (?)', (name,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Habit added successfully'}), 201

@app.route('/completions', methods=["POST"])
def add_completion():
    data = request.get_json()
    habit_id = data['habit_id']
    date = data['date']
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    c.execute('INSERT INTO habits_log (habit_id, date) VALUES (?,?)',(habit_id,date))
    conn.commit()
    conn.close()
    return jsonify({'message':'Completion Added'}), 201

@app.route('/completions', methods=["GET"])
def get_completion():
    conn = sqlite3.connect('habits.db')
    c = conn.cursor()
    habit_log = c.execute('SELECT * FROM habits_log').fetchall()
    conn.close()
    return jsonify([{"habit_id":h[1], "date":h[2]} for h in habit_log]), 200

@app.route('/analytics', methods=['GET'])
def get_analytics():
    conn = sqlite3.connect('habits.db')
    habits_df = pd.read_sql_query('SELECT * FROM habits',conn)
    completions_df = pd.read_sql_query('SELECT * FROM habits_log',conn)
    conn.close()

    counts = completions_df.groupby('habit_id').size().reset_index(name='completions')

    merged = habits_df.merge(counts, left_on='id', right_on='habit_id', how='left')
    merged['completions'] = merged['completions'].fillna(0)

    result = merged[['name', 'completions']].to_dict(orient='records')
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)

