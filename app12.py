from flask import Flask, render_template, jsonify
import sqlite3
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-quiz')
def get_quiz():
    conn = sqlite3.connect('quiz.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, question, option_a, option_b, option_c, option_d FROM questions")
    all_questions = cursor.fetchall()
    conn.close()

    selected = random.sample(all_questions, 20)
    questions = []
    for q in selected:
        questions.append({
            'id': q[0],
            'question': q[1],
            'options': {
                'A': q[2],
                'B': q[3],
                'C': q[4],
                'D': q[5]
            }
        })
    return jsonify(questions)

if __name__ == '__main__':
    app.run(debug=True)
