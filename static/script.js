let REVIEW_FILTER = 'all'; // all | wrong | unanswered | bookmarked
let REVIEW_MODE = false;
let quizData = [];
let currentIndex = 0;
let QUESTION_LIMIT = 20;

// status: notVisited | visited | answered | marked | marked answered
let statusMap = {};
let answers = {};

/* ---------------- PAGE LOAD ---------------- */
document.addEventListener('DOMContentLoaded', () => {
   if (typeof BOOKMARKED_ONLY !== 'undefined' && BOOKMARKED_ONLY) {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('exam-container').style.display = 'flex';
        loadQuizData();
    }
});

/* ---------------- START TEST ---------------- */
function startTest() {

    const selected = document.querySelector('input[name="qcount"]:checked');
    QUESTION_LIMIT = parseInt(selected.value);

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('exam-container').style.display = 'flex';

    loadQuizData();
}

/* ---------------- LOAD QUIZ DATA ---------------- */
function loadQuizData() {

    let endpoint = '/get-quiz';

if (typeof BOOKMARKED_ONLY !== 'undefined' && BOOKMARKED_ONLY) {
    endpoint = '/get-bookmarked';
}


    fetch(`${endpoint}?limit=${QUESTION_LIMIT}`)
        .then(res => res.json())
        .then(data => {

            quizData = data;   // ✅ NO slicing here

            statusMap = {};
            answers = {};
            currentIndex = 0;

            quizData.forEach((_, i) => {
                statusMap[i] = 'notVisited';
            });

            buildPalette();
            loadQuestion(0);
        });
}

/* ---------------- LOAD QUESTION ---------------- */
function loadQuestion(index) {
    currentIndex = index;
    const q = quizData[index];

    if (statusMap[index] === 'notVisited') {
        statusMap[index] = 'visited';
    }

    document.getElementById('qno').innerText = index + 1;
    document.getElementById('question').innerHTML = q.question;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    for (const [key, value] of Object.entries(q.options)) {

    let className = '';
    let checked = '';

    const correctKey = q.correct; // already uppercase from backend
    const userAns = answers[q.id];

    if (REVIEW_MODE) {
           if (key === correctKey) 
            {
        className = 'option-correct';
            }
           else if (userAns === key) {
        className = 'option-wrong';
            } 
        

        checked = userAns === key ? 'checked' : '';
    } 
    else {
        checked = userAns === key ? 'checked' : '';
    }

    optionsDiv.innerHTML += `
        <label class="${className}">
            <input type="radio"
                   name="option"
                   value="${key}"
                   ${checked}
                   ${REVIEW_MODE ? 'disabled' : ''}>
            ${key}. ${value}
        </label>
    `;
}

    updatePalette();
    updateBookmarkUI();
}

/* ---------------- QUESTION PALETTE ---------------- */
function buildPalette() {
    const palette = document.getElementById('palette');
    palette.innerHTML = '';

    quizData.forEach((q, i) => {
        const btn = document.createElement('div');
        btn.id = `pal-${i}`;
        btn.classList.add('notVisited');
        btn.onclick = () => loadQuestion(i);

        btn.innerText = q.bookmarked ? `★ ${i + 1}` : i + 1;

        palette.appendChild(btn);
    });
}


function updatePalette() {
    
    if (REVIEW_MODE) {
    Object.keys(statusMap).forEach(i => {
        const btn = document.getElementById(`pal-${i}`);
        if (!btn) return;
        btn.className = '';                 // reset
        btn.classList.add(statusMap[i]);       // add review class
    });
    return;
}


    Object.keys(statusMap).forEach(i => {
        const btn = document.getElementById(`pal-${i}`);
        if (!btn) return;

        btn.classList.remove('notVisited', 'visited', 'answered', 'marked');

        const state = statusMap[i];

        if (state === 'answered') {
            btn.classList.add('answered');
        } else if (state === 'marked') {
            btn.classList.add('marked');
        } else if (state === 'marked answered') {
            btn.classList.add('marked', 'answered');
        } else if (state === 'visited') {
            btn.classList.add('visited');
        } else {
            btn.classList.add('notVisited');
        }
    });
}

/* ---------------- SAVE ANSWER ---------------- */
function saveAnswer() {
    const selected = document.querySelector('input[name="option"]:checked');

    if (selected) {
        answers[quizData[currentIndex].id] = selected.value;

        if (statusMap[currentIndex] === 'marked') {
            statusMap[currentIndex] = 'marked answered';
        } else {
            statusMap[currentIndex] = 'answered';
        }
    } else {
        statusMap[currentIndex] = 'visited';
    }

    updatePalette();
}

/* ---------------- BUTTON ACTIONS ---------------- */
function saveNext() {
    saveAnswer();
    nextQuestion();
}

function markReviewNext() {
    const selected = document.querySelector('input[name="option"]:checked');

    if (selected) {
        answers[quizData[currentIndex].id] = selected.value;
        statusMap[currentIndex] = 'marked answered';
    } else {
        statusMap[currentIndex] = 'marked';
    }

    updatePalette();
    nextQuestion();
}

function clearResponse() {
    delete answers[quizData[currentIndex].id];
    statusMap[currentIndex] = 'visited';
    updatePalette();
    loadQuestion(currentIndex);
}

function nextQuestion() {
    if (currentIndex < quizData.length - 1) {
        loadQuestion(currentIndex + 1);
    }
}

/* ---------------- SUBMIT TEST ---------------- */
function submitTest() {
    REVIEW_MODE = true;

    

        // Show review filters
    document.getElementById('review-filters').style.display = 'block';
    
    // Default to show all
    REVIEW_FILTER = 'all';

   


    let correct = 0, wrong = 0, unanswered = 0;

    quizData.forEach((q, i) => {
        const userAns = answers[q.id];

        if (!userAns) {
            unanswered++;
            statusMap[i] = 'review-unanswered';
        } else if (userAns === q.correct) {
            correct++;
            statusMap[i] = 'review-correct';
        } else {
            wrong++;
            statusMap[i] = 'review-wrong';
        }
    });

    updatePalette();
    
    document.getElementById('review-nav').style.display = 'block';

    document.getElementById('question').innerHTML =
        `<h3>Review Mode</h3>
         <p>
            ✅ Correct: ${correct} <br>
            ❌ Wrong: ${wrong} <br>
            ⚠️ Unanswered: ${unanswered}
         </p>
         <p>Click any question number on the right to review.</p>`;

    document.getElementById('options').innerHTML = '';

    // Disable exam buttons in review mode
document.querySelector('.save').disabled = true;
document.querySelector('.review').disabled = true;
document.querySelector('.clear').disabled = true;

applyReviewFilter();

}

//BOOKMARK TOGGLE FUNCTION

function toggleBookmark() {
    const qid = quizData[currentIndex].id;

    fetch(`/toggle-bookmark/${qid}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            quizData[currentIndex].bookmarked = data.bookmarked;
            updateBookmarkUI();
        });
}

// BOOKMARK UPDATE FUNCTION
function updateBookmarkUI() {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;

    if (quizData[currentIndex].bookmarked) {
        btn.classList.add('bookmarked');
        btn.innerText = '🔖 Bookmarked';
    } else {
        btn.classList.remove('bookmarked');
        btn.innerText = '🔖 Bookmark';
    }
}

function setReviewFilter(type) {
    REVIEW_FILTER = type;
    applyReviewFilter();
}

function applyReviewFilter() {

    quizData.forEach((q, i) => {
        const btn = document.getElementById(`pal-${i}`);
        if (!btn) return;

        let show = false;

        if (REVIEW_FILTER === 'all') {
            show = true;
        }
        else if (REVIEW_FILTER === 'wrong' && statusMap[i] === 'review-wrong') {
            show = true;
        }
        else if (REVIEW_FILTER === 'unanswered' && statusMap[i] === 'review-unanswered') {
            show = true;
        }
        else if (REVIEW_FILTER === 'bookmarked' && q.bookmarked) {
            show = true;
        }

        btn.style.display = show ? 'block' : 'none';
    });
}


function getVisibleIndexes() {
    const indexes = [];
    quizData.forEach((_, i) => {
        const btn = document.getElementById(`pal-${i}`);
        if (btn && btn.style.display !== 'none') {
            indexes.push(i);
        }
    });
    return indexes;
}

function nextReview() {
    const visible = getVisibleIndexes();
    const pos = visible.indexOf(currentIndex);
    if (pos !== -1 && pos < visible.length - 1) {
        loadQuestion(visible[pos + 1]);
    }
}

function prevReview() {
    const visible = getVisibleIndexes();
    const pos = visible.indexOf(currentIndex);
    if (pos > 0) {
        loadQuestion(visible[pos - 1]);
    }
}

document.addEventListener('keydown', (e) => {

    if (!REVIEW_MODE) return;

    // Ignore when typing somewhere else
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight') {
        nextReview();
        e.preventDefault();
    }

    if (e.key === 'ArrowLeft') {
        prevReview();
        e.preventDefault();
    }
});