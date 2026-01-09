from flask import Flask, render_template, jsonify, request
import mysql.connector
import random

app = Flask(__name__)

#Connect to the mysql

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="mysql123",
        database="quizdb"
    )

@app.route('/get-quiz')
def get_quiz():
    limit = int(request.args.get('limit', 20))  # 👈 THIS IS THE KEY LINE

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, question, option_a, option_b, option_c, option_d,
               `key` AS answer, bookmarked
        FROM questions
    """)
    all_questions = cursor.fetchall()
    conn.close()

    selected = random.sample(
        all_questions,
        min(limit, len(all_questions))
    )

    questions = []
    for q in selected:
        questions.append({
            'id': q['id'],
            'question': q['question'],
            'options': {
                'A': q['option_a'],
                'B': q['option_b'],
                'C': q['option_c'],
                'D': q['option_d']
            },
            'correct': q['answer'].strip().upper(),
            'bookmarked': bool(q['bookmarked'])
        })

    return jsonify(questions)


#------------------------TOGGLE /UNTOGGLE BOOKMARK---------------------------

@app.route('/toggle-bookmark/<qid>', methods=['POST'])
def toggle_bookmark(qid):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE questions
        SET bookmarked = NOT bookmarked
        WHERE id = %s
    """, (qid,))

    conn.commit()

    cursor.execute(
        "SELECT bookmarked FROM questions WHERE id = %s",
        (qid,)
    )
    bookmarked = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "status": "success",
        "bookmarked": bool(bookmarked)
    })


# ---------------- GET BOOKMARKED QUESTIONS ----------------
@app.route('/get-bookmarked')
def get_bookmarked():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, question, option_a, option_b, option_c, option_d,
               `key` AS answer
        FROM questions
        WHERE bookmarked = 1
    """)

    rows = cursor.fetchall()
    conn.close()

    questions = []
    for q in rows:
        questions.append({
            'id': q['id'],
            'question': q['question'],
            'options': {
                'A': q['option_a'],
                'B': q['option_b'],
                'C': q['option_c'],
                'D': q['option_d']
            },
            'correct': q['answer'].strip().upper(),
            'bookmarked': True
        })

    return jsonify(questions)

# ---------------- PAGES ----------------
@app.route('/')
def index():
    return render_template('index.html', bookmarked_mode=False)

@app.route('/bookmarked')
def bookmarked_page():
    return render_template('index.html', bookmarked_mode=True)


@app.route('/bookmarked-quiz')
def bookmarked_quiz():
    return render_template(
        'index.html',
        bookmarked_mode=True,
        bookmarked_only=True
    )



#############################THIS LINE OF CODE SHOULD BE KEPT IN LAST LINE########################################
# ---------------- RUN APP ----------------
if __name__ == '__main__':
    app.run(debug=True)

