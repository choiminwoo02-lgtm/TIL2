import React, { useState, useEffect } from 'react';
import './App.css';
import questionsData from './questions.json';

const SCREEN = {
  MAIN: 'MAIN',
  CATEGORY: 'CATEGORY',
  QUIZ: 'QUIZ',
  RESULT: 'RESULT',
  RANKING: 'RANKING'
};

function App() {
  // --- Game State ---
  const [screen, setScreen] = useState(SCREEN.MAIN);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // --- Quiz Logic State ---
  const [timeLeft, setTimeLeft] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [hintActive, setHintActive] = useState(false);

  // --- Item State ---
  const [items, setItems] = useState({
    half: true,
    time: true,
    hint: true
  });

  // --- Effects ---
  useEffect(() => {
    let timer = null;
    if (screen === SCREEN.QUIZ && isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && screen === SCREEN.QUIZ && !showFeedback) {
      handleAnswer(-1);
    }
    return () => clearInterval(timer);
  }, [screen, isActive, timeLeft, showFeedback]);

  // Prevent accidental reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (screen === SCREEN.QUIZ) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen]);

  // --- Functions ---
  const playSound = (type) => {
    console.log(`Playing sound: ${type}`); // Placeholder for SFX
  };

  const startCategorySelection = () => setScreen(SCREEN.CATEGORY);
  const showRanking = () => setScreen(SCREEN.RANKING);
  const goHome = () => {
    setScreen(SCREEN.MAIN);
    resetGameState();
  };

  const resetGameState = () => {
    setScore(0);
    setHearts(3);
    setCombo(0);
    setMaxCombo(0);
    setItems({ half: true, time: true, hint: true });
    setCurrentIndex(0);
  };

  const selectCategory = (category) => {
    let filtered;
    if (category === 'random') {
      filtered = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 10);
    } else {
      filtered = questionsData.filter(q => q.category === category);
    }
    setCurrentQuestions(filtered);
    setSelectedCategory(category);
    setCurrentIndex(0);
    setScreen(SCREEN.QUIZ);
    startNewQuestion();
  };

  const startNewQuestion = () => {
    setTimeLeft(15);
    setIsActive(true);
    setShowFeedback(false);
    setHiddenOptions([]);
    setHintActive(false);
  };

  const handleAnswer = (index) => {
    setIsActive(false);
    const correct = currentQuestions[currentIndex].correct_answer_index === index;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playSound('correct');
      const timeBonus = timeLeft * 10;
      const comboBonus = combo * 20;
      setScore(prev => prev + 100 + timeBonus + comboBonus);
      setCombo(prev => {
        const newCombo = prev + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
    } else {
      playSound('wrong');
      setHearts(prev => prev - 1);
      setCombo(0);
    }
  };

  const nextQuestion = () => {
    if (hearts <= 1 && !isCorrect) { // Game Over condition
      setScreen(SCREEN.RESULT);
    } else if (currentIndex >= 9) { // Game Clear condition
      setScreen(SCREEN.RESULT);
    } else {
      setCurrentIndex(prev => prev + 1);
      startNewQuestion();
    }
  };

  const useHalfItem = () => {
    if (!items.half) return;
    const correctIdx = currentQuestions[currentIndex].correct_answer_index;
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toHide);
    setItems(prev => ({ ...prev, half: false }));
  };

  const useTimeItem = () => {
    if (!items.time) return;
    setTimeLeft(prev => prev + 10);
    setItems(prev => ({ ...prev, time: false }));
  };

  const useHintItem = () => {
    if (!items.hint) return;
    setHintActive(true);
    setItems(prev => ({ ...prev, hint: false }));
  };

  // --- Render Functions ---
  const renderMain = () => (
    <div className="game-container">
      <h1 className="blinking">TRIVIA ARCADE</h1>
      <p>Retro Trivia Challenge</p>
      <button className="pixel-button primary" onClick={startCategorySelection}>Start Game</button>
      <button className="pixel-button" onClick={showRanking}>Ranking</button>
    </div>
  );

  const renderCategorySelection = () => (
    <div className="game-container">
      <h2>Select Category</h2>
      <div className="category-grid">
        <button className="pixel-button" onClick={() => selectCategory('history')}>History</button>
        <button className="pixel-button" onClick={() => selectCategory('science')}>Science</button>
        <button className="pixel-button" onClick={() => selectCategory('geography')}>Geography</button>
        <button className="pixel-button" onClick={() => selectCategory('general')}>General</button>
      </div>
      <button className="pixel-button primary" style={{marginTop: '20px'}} onClick={() => selectCategory('random')}>Random Mode</button>
      <button className="pixel-button" onClick={goHome}>Back</button>
    </div>
  );

  const renderQuiz = () => {
    const currentQ = currentQuestions[currentIndex];
    if (!currentQ) return null;

    if (showFeedback) {
      return (
        <div className="game-container">
          <h2 style={{color: isCorrect ? 'var(--correct-color)' : 'var(--wrong-color)'}}>
            {isCorrect ? 'CORRECT!' : 'WRONG!'}
          </h2>
          <p>Answer: {currentQ.options[currentQ.correct_answer_index]}</p>
          <div style={{background: '#222', padding: '10px', margin: '15px 0', fontSize: '0.6rem'}}>
            {currentQ.explanation}
          </div>
          <button className="pixel-button primary" onClick={nextQuestion}>NEXT</button>
        </div>
      );
    }

    return (
      <div className="game-container">
        <div className="hud">
          <span className="heart">LIFE: {Array(hearts > 0 ? hearts : 0).fill('♥').join('')}</span>
          <span className="score">PTS: {score}</span>
          <span className="combo">COMBO: {combo}</span>
        </div>
        <div className="timer-container">
          <div className="timer-bar" style={{width: `${(timeLeft / 15) * 100}%`, transition: 'width 1s linear'}}></div>
        </div>
        <p style={{fontSize: '0.5rem'}}>CATEGORY: {selectedCategory} | {currentIndex + 1}/10</p>
        <h2 style={{minHeight: '80px'}}>{currentQ.question_text}</h2>
        {hintActive && <p style={{color: 'var(--secondary-color)', fontSize: '0.5rem', marginBottom: '10px'}}>HINT: Look closely!</p>}
        <div className="options-container">
          {currentQ.options.map((opt, idx) => (
            <button key={idx} className="pixel-button" onClick={() => handleAnswer(idx)} style={{ visibility: hiddenOptions.includes(idx) ? 'hidden' : 'visible' }}>{opt}</button>
          ))}
        </div>
        <div className="item-container" style={{display: 'flex', gap: '5px', marginTop: '20px'}}>
          <button className="pixel-button" style={{fontSize: '0.4rem'}} onClick={useHalfItem} disabled={!items.half}>50:50</button>
          <button className="pixel-button" style={{fontSize: '0.4rem'}} onClick={useTimeItem} disabled={!items.time}>+TIME</button>
          <button className="pixel-button" style={{fontSize: '0.4rem'}} onClick={useHintItem} disabled={!items.hint}>HINT</button>
        </div>
      </div>
    );
  };

  const [userName, setUserName] = useState('');
  const [rankings, setRankings] = useState([]);

  // --- Effects ---
  useEffect(() => {
    const savedRankings = JSON.parse(localStorage.getItem('quiz_ranking')) || [];
    setRankings(savedRankings);
  }, []);

  // --- Functions ---
  const saveRanking = () => {
    if (!userName.trim()) {
      alert("Please enter your name!");
      return;
    }
    const newEntry = {
      id: Date.now(),
      user_name: userName,
      score: score,
      category: selectedCategory,
      date: new Date().toLocaleDateString()
    };
    const updated = [...rankings, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setRankings(updated);
    localStorage.setItem('quiz_ranking', JSON.stringify(updated));
    setScreen(SCREEN.RANKING);
  };

  // --- Render Functions ---
  const renderResult = () => {
    const isGameOver = hearts <= 0 && !isCorrect;
    return (
      <div className="game-container">
        <h1 className={isGameOver ? '' : 'blinking'}>
          {isGameOver ? 'GAME OVER' : 'MISSION CLEAR'}
        </h1>
        <div style={{margin: '20px 0', textAlign: 'left', fontSize: '0.7rem'}}>
          <p>CATEGORY: {selectedCategory}</p>
          <p className="score">FINAL SCORE: {score}</p>
          <p className="combo">MAX COMBO: {maxCombo}</p>
          <p>LIVES LEFT: {hearts > 0 ? hearts : 0}</p>
        </div>
        
        {!isGameOver && (
          <div style={{marginTop: '20px'}}>
            <p style={{fontSize: '0.5rem'}}>Enter your name for Ranking:</p>
            <input 
              type="text" 
              className="pixel-button" 
              style={{cursor: 'text', textAlign: 'center', marginBottom: '10px'}}
              value={userName}
              onChange={(e) => setUserName(e.target.value.slice(0, 10))}
              placeholder="YOUR NAME"
            />
            <button className="pixel-button primary" onClick={saveRanking}>SAVE & VIEW RANKING</button>
          </div>
        )}
        
        <button className="pixel-button" style={{marginTop: '10px'}} onClick={goHome}>HOME</button>
      </div>
    );
  };

  const renderRanking = () => (
    <div className="game-container">
      <h1>TOP 10 RANKING</h1>
      <div style={{maxHeight: '300px', overflowY: 'auto', margin: '20px 0'}}>
        {rankings.length === 0 ? (
          <p style={{fontSize: '0.6rem'}}>No records yet!</p>
        ) : (
          <table style={{width: '100%', fontSize: '0.5rem', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '2px solid var(--primary-color)'}}>
                <th style={{padding: '5px'}}>NAME</th>
                <th style={{padding: '5px'}}>SCORE</th>
                <th style={{padding: '5px'}}>CAT</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank) => (
                <tr key={rank.id} style={{borderBottom: '1px solid #222'}}>
                  <td style={{padding: '5px'}}>{rank.user_name}</td>
                  <td style={{padding: '5px', color: 'var(--secondary-color)'}}>{rank.score}</td>
                  <td style={{padding: '5px'}}>{rank.category.slice(0, 3).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button className="pixel-button primary" onClick={goHome}>BACK TO HOME</button>
    </div>
  );

  return (
    <div className="App">
      {screen === SCREEN.MAIN && renderMain()}
      {screen === SCREEN.CATEGORY && renderCategorySelection()}
      {screen === SCREEN.QUIZ && renderQuiz()}
      {screen === SCREEN.RESULT && renderResult()}
      {screen === SCREEN.RANKING && renderRanking()}
    </div>
  );
}

export default App;
