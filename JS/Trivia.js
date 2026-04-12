let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerTime = 15;
let timerInterval = null;
let isAnsweringDisabled = false;

const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');

const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');
const btnStartGame = document.getElementById('btnStartGame');

const questionCategory = document.getElementById('questionCategory');
const questionText = document.getElementById('questionText');
const answersGrid = document.getElementById('answersGrid');
const currentScoreElement = document.getElementById('currentScore');
const currentQuestionNum = document.getElementById('currentQuestionNum');
const timerBar = document.getElementById('timerBar');

const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const btnPlayAgain = document.getElementById('btnPlayAgain');

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function startGame() {
    btnStartGame.disabled = true;
    btnStartGame.innerText = "Loading Questions...";

    const category = categorySelect.value;
    const difficulty = difficultySelect.value;

    let url = 'https://opentdb.com/api.php?amount=10&type=multiple';
    if (category !== 'any') url += `&category=${category}`;
    if (difficulty !== 'any') url += `&difficulty=${difficulty}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            currentQuestions = data.results;
            currentQuestionIndex = 0;
            score = 0;
            updateScoreUI();
            
            showScreen(gameScreen);
            loadQuestion();
        } else {
            alert('Not enough questions available for those options! Try reducing filters.');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please check your internet connection.');
    } finally {
        btnStartGame.disabled = false;
        btnStartGame.innerText = "Start Game";
    }
}

function updateScoreUI() {
    currentScoreElement.innerText = score;
}

function loadQuestion() {
    isAnsweringDisabled = false;
    currentQuestionNum.innerText = currentQuestionIndex + 1;
    
    const data = currentQuestions[currentQuestionIndex];
    questionCategory.innerText = decodeHTML(data.category);
    questionText.innerText = decodeHTML(data.question);

    const allAnswers = [...data.incorrect_answers, data.correct_answer];
    shuffleArray(allAnswers);

    const labels = ['A', 'B', 'C', 'D'];

    answersGrid.innerHTML = '';
    
    allAnswers.forEach((answer, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'answer-wrapper';
        
        const cornerBl = document.createElement('div');
        cornerBl.className = 'corner-bl';
        const cornerTr = document.createElement('div');
        cornerTr.className = 'corner-tr';
        
        const btn = document.createElement('button');
        btn.classList.add('btn-answer');
        
        const btnContent = document.createElement('div');
        btnContent.className = 'btn-answer-content';
        
        const labelEl = document.createElement('span');
        labelEl.className = 'answer-label';
        labelEl.innerText = `${labels[index]}:`;
        
        const textEl = document.createElement('span');
        textEl.className = 'answer-text';
        textEl.innerText = decodeHTML(answer);
        
        btnContent.appendChild(labelEl);
        btnContent.appendChild(textEl);
        
        btn.appendChild(btnContent);
        
        wrapper.appendChild(cornerBl);
        wrapper.appendChild(cornerTr);
        wrapper.appendChild(btn);

        btn.onclick = () => handleAnswerSelected(btn, answer === data.correct_answer);
        answersGrid.appendChild(wrapper);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    
    void timerBar.offsetWidth;

    timerTime = 15;
    const totalTime = timerTime;
    
    timerBar.style.transition = `width 1s linear`;

    timerInterval = setInterval(() => {
        timerTime--;
        const percentage = (timerTime / totalTime) * 100;
        timerBar.style.width = `${percentage}%`;

        if (timerTime <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    const currentWidth = timerBar.style.width;
    timerBar.style.transition = 'none';
    timerBar.style.width = currentWidth;
}

function handleTimeOut() {
    if (isAnsweringDisabled) return;
    
    const buttons = answersGrid.querySelectorAll('.btn-answer');
    const correctAnswerText = decodeHTML(currentQuestions[currentQuestionIndex].correct_answer);

    buttons.forEach(btn => {
        btn.disabled = true;
        const answerText = btn.querySelector('.answer-text').innerText;
        if (answerText === correctAnswerText) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });

    isAnsweringDisabled = true;
    setTimeout(nextQuestion, 2000);
}

function handleAnswerSelected(selectedBtn, isCorrect) {
    if (isAnsweringDisabled) return;
    isAnsweringDisabled = true;
    stopTimer();

    const buttons = answersGrid.querySelectorAll('.btn-answer');
    const correctAnswerText = decodeHTML(currentQuestions[currentQuestionIndex].correct_answer);

    buttons.forEach(btn => {
        btn.disabled = true;
        const answerText = btn.querySelector('.answer-text').innerText;
        if (answerText === correctAnswerText) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        const timeBonus = timerTime * 10;
        score += (100 + timeBonus);
        updateScoreUI();
    }

    setTimeout(nextQuestion, 2000);
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    showScreen(resultsScreen);
    finalScoreDisplay.innerText = score;
    
    const highScore = localStorage.getItem('triviaHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('triviaHighScore', score);
    }
}

function showScreen(screenEl) {
    [setupScreen, gameScreen, resultsScreen].forEach(el => el.classList.remove('active'));
    [setupScreen, gameScreen, resultsScreen].forEach(el => el.classList.add('hidden'));

    screenEl.classList.remove('hidden');
    screenEl.classList.add('active');
}

btnStartGame.addEventListener('click', startGame);
btnPlayAgain.addEventListener('click', () => {
    showScreen(setupScreen);
});
