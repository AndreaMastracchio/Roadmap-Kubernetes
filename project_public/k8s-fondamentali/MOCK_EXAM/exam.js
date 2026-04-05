// Exam State
let examState = {
    currentQuestion: 0,
    answers: {},
    flagged: new Set(),
    startTime: null,
    endTime: null,
    timerInterval: null,
    timeRemaining: 120 * 60 // 2 hours in seconds
};

// Initialize exam
function startExam() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('examScreen').classList.remove('hidden');
    
    examState.startTime = Date.now();
    examState.timeRemaining = 120 * 60;
    
    // Start timer
    startTimer();
    
    // Initialize question grid
    renderQuestionGrid();
    
    // Show first question
    showQuestion(0);
    
    // Update progress
    updateProgress();
}

function startTimer() {
    examState.timerInterval = setInterval(() => {
        examState.timeRemaining--;
        
        if (examState.timeRemaining <= 0) {
            clearInterval(examState.timerInterval);
            autoSubmitExam();
            return;
        }
        
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(examState.timeRemaining / 3600);
    const minutes = Math.floor((examState.timeRemaining % 3600) / 60);
    const seconds = examState.timeRemaining % 60;
    
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Warning color when < 15 minutes
    if (examState.timeRemaining < 15 * 60) {
        timerEl.classList.add('warning');
    } else {
        timerEl.classList.remove('warning');
    }
}

function renderQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = '';
    
    examQuestions.forEach((q, index) => {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = index + 1;
        btn.onclick = () => showQuestion(index);
        
        if (index === examState.currentQuestion) {
            btn.classList.add('current');
        }
        if (examState.answers[index]) {
            btn.classList.add('answered');
        }
        if (examState.flagged.has(index)) {
            btn.classList.add('flagged');
        }
        
        grid.appendChild(btn);
    });
}

function showQuestion(index) {
    examState.currentQuestion = index;
    const question = examQuestions[index];
    
    const card = document.getElementById('questionCard');
    card.innerHTML = `
        <div class="question-header">
            <span class="question-number">Domanda ${index + 1} di ${examQuestions.length}</span>
            <span class="question-weight">${question.weight}% dei punti</span>
        </div>
        <div class="question-text">${question.question}</div>
        <textarea 
            class="answer-area" 
            id="answerInput" 
            placeholder="Scrivi qui i tuoi comandi kubectl o YAML..."
            oninput="saveAnswer()"
        >${examState.answers[index] || ''}</textarea>
        <div class="question-hint">
            <strong>💡 Hint:</strong> ${question.hint}
        </div>
    `;
    
    // Update flag button
    const flagBtn = document.getElementById('flagBtn');
    if (examState.flagged.has(index)) {
        flagBtn.classList.add('flagged');
        flagBtn.textContent = '🚩 Flaggata';
    } else {
        flagBtn.classList.remove('flagged');
        flagBtn.textContent = '🚩 Flag';
    }
    
    // Update progress
    updateProgress();
    
    // Update grid
    renderQuestionGrid();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function saveAnswer() {
    const answer = document.getElementById('answerInput').value;
    examState.answers[examState.currentQuestion] = answer;
    updateProgress();
    renderQuestionGrid();
}

function toggleFlag() {
    const index = examState.currentQuestion;
    if (examState.flagged.has(index)) {
        examState.flagged.delete(index);
    } else {
        examState.flagged.add(index);
    }
    showQuestion(index);
}

function previousQuestion() {
    if (examState.currentQuestion > 0) {
        showQuestion(examState.currentQuestion - 1);
    }
}

function nextQuestion() {
    if (examState.currentQuestion < examQuestions.length - 1) {
        showQuestion(examState.currentQuestion + 1);
    }
}

function updateProgress() {
    const answeredCount = Object.keys(examState.answers).filter(k => examState.answers[k].trim()).length;
    const progress = (answeredCount / examQuestions.length) * 100;
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('currentQuestion').textContent = examState.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = examQuestions.length;
    document.getElementById('answeredCount').textContent = answeredCount;
}

function submitExam() {
    const answeredCount = Object.keys(examState.answers).filter(k => examState.answers[k].trim()).length;
    const unanswered = examQuestions.length - answeredCount;
    
    let message = `Sei sicuro di voler terminare l'esame?\n\n`;
    message += `Domande risposte: ${answeredCount}/${examQuestions.length}\n`;
    if (unanswered > 0) {
        message += `Domande non risposte: ${unanswered}\n`;
    }
    if (examState.flagged.size > 0) {
        message += `Domande flaggate: ${examState.flagged.size}\n`;
    }
    
    if (confirm(message)) {
        finishExam();
    }
}

function autoSubmitExam() {
    alert('⏰ Tempo scaduto! L\'esame verrà terminato automaticamente.');
    finishExam();
}

function finishExam() {
    clearInterval(examState.timerInterval);
    examState.endTime = Date.now();
    
    // Calculate results
    const results = calculateResults();
    
    // Show results screen
    document.getElementById('examScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    
    // Render results
    renderResults(results);
}

function calculateResults() {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    const questionResults = [];
    
    examQuestions.forEach((question, index) => {
        maxScore += question.weight;
        const userAnswer = (examState.answers[index] || '').trim();
        
        // Simple scoring: check if answer contains key commands/concepts
        let isCorrect = false;
        let score = 0;
        
        if (userAnswer) {
            // Check if answer contains any of the accepted answers
            const hasAcceptedAnswer = question.acceptedAnswers.some(accepted => 
                userAnswer.toLowerCase().includes(accepted.toLowerCase())
            );
            
            // Or check if it's a reasonable attempt (has kubectl, yaml keywords, etc)
            const hasKeywords = /kubectl|apiVersion|kind:|metadata:|spec:/.test(userAnswer);
            
            if (hasAcceptedAnswer || hasKeywords) {
                isCorrect = true;
                score = question.weight;
                correctCount++;
                totalScore += score;
            }
        }
        
        questionResults.push({
            question,
            userAnswer,
            isCorrect,
            score,
            index
        });
    });
    
    const percentage = (totalScore / maxScore) * 100;
    const passed = percentage >= 66;
    
    const timeSpent = Math.floor((examState.endTime - examState.startTime) / 1000);
    
    return {
        totalScore,
        maxScore,
        percentage,
        passed,
        correctCount,
        totalQuestions: examQuestions.length,
        timeSpent,
        questionResults
    };
}

function renderResults(results) {
    const resultsScreen = document.getElementById('resultsScreen');
    
    const passClass = results.passed ? 'pass' : 'fail';
    const passText = results.passed ? '✅ SUPERATO' : '❌ NON SUPERATO';
    
    const hours = Math.floor(results.timeSpent / 3600);
    const minutes = Math.floor((results.timeSpent % 3600) / 60);
    const seconds = results.timeSpent % 60;
    const timeText = `${hours}h ${minutes}m ${seconds}s`;
    
    let html = `
        <h1 style="color: #326ce5; margin-bottom: 20px;">📊 Risultati Esame</h1>
        
        <div class="results-summary">
            <div class="result-card">
                <h3>Risultato</h3>
                <div class="value ${passClass}">${passText}</div>
            </div>
            <div class="result-card">
                <h3>Punteggio</h3>
                <div class="value">${results.totalScore}/${results.maxScore}</div>
            </div>
            <div class="result-card">
                <h3>Percentuale</h3>
                <div class="value ${passClass}">${results.percentage.toFixed(1)}%</div>
            </div>
            <div class="result-card">
                <h3>Domande Corrette</h3>
                <div class="value">${results.correctCount}/${results.totalQuestions}</div>
            </div>
            <div class="result-card">
                <h3>Tempo Impiegato</h3>
                <div class="value">${timeText}</div>
            </div>
            <div class="result-card">
                <h3>Passing Score</h3>
                <div class="value">66%</div>
            </div>
        </div>
        
        <div style="background: ${results.passed ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${results.passed ? '#4CAF50' : '#ff6b6b'};">
            <h3 style="margin-bottom: 10px;">${results.passed ? '🎉 Congratulazioni!' : '💪 Continua a Studiare!'}</h3>
            <p>${results.passed ? 
                'Hai superato il mock exam! Sei pronto per affrontare l\'esame ufficiale CKA/CKAD. Continua a praticare con scenari reali.' : 
                'Non hai raggiunto il passing score. Rivedi le domande sbagliate, studia le soluzioni e riprova. La pratica è la chiave del successo!'
            }</p>
        </div>
        
        <h2 style="color: #326ce5; margin: 30px 0 20px 0;">📝 Review Domande</h2>
    `;
    
    results.questionResults.forEach((result, idx) => {
        const correctClass = result.isCorrect ? 'correct' : 'incorrect';
        const icon = result.isCorrect ? '✅' : '❌';
        
        html += `
            <div class="question-review ${correctClass}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>${icon} Domanda ${result.index + 1} (${result.question.weight}%)</h3>
                    <span style="font-weight: bold; color: ${result.isCorrect ? '#4CAF50' : '#ff6b6b'};">
                        ${result.score}/${result.question.weight} punti
                    </span>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <strong>Domanda:</strong>
                    <div style="margin-top: 10px;">${result.question.question}</div>
                </div>
                
                <div class="answer-comparison">
                    <div class="your-answer">
                        <h4>La Tua Risposta:</h4>
                        <pre>${result.userAnswer || '(Nessuna risposta)'}</pre>
                    </div>
                    <div class="correct-answer">
                        <h4>Soluzione Corretta:</h4>
                        <pre>${result.question.solution}</pre>
                    </div>
                </div>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin-top: 15px;">
                    <strong>💡 Spiegazione:</strong>
                    <p style="margin-top: 10px;">${result.question.explanation}</p>
                </div>
            </div>
        `;
    });
    
    html += `
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn btn-success" onclick="location.reload()">🔄 Riprova Esame</button>
            <button class="btn" onclick="window.print()">🖨️ Stampa Risultati</button>
        </div>
    `;
    
    resultsScreen.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial timer display
    updateTimerDisplay();
});

// Warn before leaving page during exam
window.addEventListener('beforeunload', (e) => {
    if (examState.startTime && !examState.endTime) {
        e.preventDefault();
        e.returnValue = 'Sei sicuro di voler uscire? Il progresso dell\'esame andrà perso.';
        return e.returnValue;
    }
});
