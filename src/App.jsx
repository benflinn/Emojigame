import './App.css';
import React, { useState, useEffect } from 'react';
import levels from './levels';

let savedLevelLS = localStorage.getItem("savedLevelLS");
let savedLevel;
if (savedLevelLS === null) { // if level has never been stored
  savedLevel = 1; // start at beginning for new users
} else {
  savedLevel = JSON.parse(savedLevelLS);
}

function App() {
  
  const [handLength, setHandLength] = useState(3);
  const [food, setFood] = useState(3);
  const [turnCount, setTurnCount] = useState(0);
  const [score, setScore] = useState(0);
  const [selectAnywhere, setSelectAnywhere] = useState(false);
  const [burn, setBurn] = useState(false);
  const [level, setLevel] = useState(savedLevel);
  let newStack = [];
  levels[savedLevel-1].initialStack.forEach(i=>{
    newStack.push(i);
  })
  const [stack, setStack] = useState(newStack);
  const [dwelling, setDwelling] = useState(0);
  const [deathReason, setDeathReason] = useState('');

  let levelFinished;
  if (levels[level-1].goalUnit === 'food') {
    levelFinished = food >= levels[level-1].goalAmount;
  } else {
    levelFinished = score >= levels[level-1].goalAmount;
  }

  function loadLevel(newLevel) {
    setLevel(newLevel);
    localStorage.setItem("savedLevelLS", newLevel);
    let newStack = [];
    console.log(levels[newLevel-1].initialStack);
    levels[newLevel-1].initialStack.forEach(i=>{
      newStack.push(i);
    })
    setStack(newStack);
    setBurn(false);
    setSelectAnywhere(false);
    setScore(0);
    setFood(3);
    setHandLength(3);
    setTurnCount(0);
    setDwelling(0);
    setDeathReason('');
  }

  function removeFromStack(i) {
    let newStack = stack;
    newStack.splice(i, 1);
    setStack(newStack);
  }

  function clickEmoji(e,i) {
    let newFood = food;
    let newScore = score;
    if (e === '🦍') {
      removeFromStack(i);
      let hand = stack.slice(0, handLength);
      let remainder = stack.slice(handLength);
      setStack([...remainder, ...hand]);
    } else if (e === '🏡') {
      setDwelling(1);
      removeFromStack(i);
    } else if (e === '🥓') {
      removeFromStack(i);
      newFood += 6;
    } else if (e === '❤️') {
      let newStack = stack;
      if (burn) {
        newStack[i] = '🥓';
      } else {
        newStack[i] = '💔';
        newFood += 2;
      }
      setStack(newStack);
    } else if (e === '💔') {
      let newStack = stack;
      if (burn) {
        newStack[i] = '🥓';
      } else {
        newStack.splice(i, 1);
        newFood += 2;
      }
      setStack(newStack);
    } else if (e === '🎉') {
      let newStack = stack;
      if (stack[i+1]) {
        newStack.splice(i, 1, stack[i+1]);
        newStack.splice(i, 0, stack[i+1]);
        newStack.splice(i, 0, stack[i+1]);
      } else {
        newStack.splice(i, 1, '🎉');
        newStack.splice(i, 0, '🎉');
        newStack.splice(i, 0, '🎉');
      }
      setStack(newStack);
    } else if (e === '🔥') {
      removeFromStack(i);
      setBurn(true);
    } else if (e === '💀') {
      setDeathReason('clicking on a skull kills you instantly. oops');
    } else if (e === '🥍') {
      removeFromStack(i);
      setSelectAnywhere(true);
    } else if (e === '✨') {
      newScore++;
      removeFromStack(i);
    } else if (e === '🍄') {
      removeFromStack(i);
      setHandLength(handLength + 1);
    }
    if (dwelling === 0) {
      newFood -= 1;
    } else if (dwelling === 1 && turnCount % 2 === 0) {
      newFood -= 1;
    }

    setFood(newFood);
    setScore(newScore);
    setTurnCount(turnCount + 1);
    
    if (selectAnywhere && e !== '🔥' && e !== '🥍') {
      setSelectAnywhere(false);
    }
    if (burn && e !== '🥍') {
      setBurn(false);
    }
  }
 
  let lives = stack.filter(x=>x === '❤️' || x === '💔').length;

  useEffect(() => {

    // check for death
    if (!deathReason) {
      stack.forEach((x,i)=>{
        if (i < handLength) {
          if (x === '☢️') {
            setDeathReason('You died from radiation poisoning.');
          }
        }
      })
      if (food < 1) {
        setDeathReason('You ran out of food.');
      }
      if (lives < 1) {
        setDeathReason('You need to keep at least one heart alive.');
      }
    }

  });

  return (
    <div style={{textAlign: 'center', border: '3px solid black', borderRadius: '5px', width: '360px', margin: '0 auto', backgroundColor: 'white'}}>
      <div style={{borderBottom: '2px solid black', paddingBottom: '10px', display: 'flex', justifyContent: 'space-around', paddingTop: '10px'}}>
        <span style={{fontSize: '30px', fontWeight: 'bold'}}>EmojiQuest</span>
        <span onClick={()=>{
          if (level > 1) {
            loadLevel(level-1);
          }}} style={{fontSize: '30px', cursor: 'pointer'}}>⬅️</span>
          <div style={{fontSize: '25px', paddingTop: '3px'}}>Level: {level}</div>
        <span onClick={()=>{
          if (levels.length > level) {
            loadLevel(level+1);
          }}} style={{fontSize: '30px', cursor: 'pointer'}}>➡️</span>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-around', borderBottom: '2px solid black', fontSize: '20px'}}>
        <div style={{fontSize: '30px'}}>Goal: {levels[level-1].goalAmount}{levels[level-1].goalUnit === 'food' ? '🍲':'✨'}</div>
        <div style={{fontSize: '30px'}}>Turn: {turnCount}</div>
      </div>     
      <div style={{fontSize: '16px', borderBottom: '2px solid black'}}>"{levels[level-1].title}"</div>
      {levelFinished ? 
        <div>
        <h1>Level complete.</h1>
        <span onClick={()=>{
        if (levels.length > level) {
          loadLevel(level+1);
        }}} style={{fontSize: '35px', cursor: 'pointer'}}>➡️</span>
        </div>:
        <div> {!deathReason ? 
          <div>
            <div style={{fontSize: '30px', display: 'flex', justifyContent: 'space-around', borderBottom: '2px solid black'}}>
              <span>{score}✨</span>
              <span>{lives}❤️</span>
              <span>{food}🍲</span>
              <span>{['⛺','🏡'][dwelling]}</span>
            </div>
            <div style={{textAlign: 'left', marginTop: '20px', padding: '10px 10px 10px 10px'}}>
              <span style={{backgroundColor: burn?'rgb(255,0,0)':'#59ADFA', border: '2px solid #4688C4', borderRadius: '15px', cursor: 'pointer', fontSize: '40px', padding: '8px 0px 0px 0px'}}>
                {stack.map((e,i)=>{
                  if (i < handLength || selectAnywhere){
                    return(<span style={{position: 'relative'}} onClick={()=>clickEmoji(e,i)}>{e}</span>)
                  }
                })}
              </span>
              <span>
                {stack.map((e,i)=>{
                  if (i >= handLength && selectAnywhere === false){
                    return(<span style={{fontSize: '40px', position: 'relative'}}>{e}</span>)
                  }
                })}
              </span>
            </div>
          </div>:<div>
            <div style={{fontSize: '35px', paddingTop: '30px'}}>👻</div>
            <p>{deathReason}</p>
            <p>Try again.</p>
          </div>
        }</div>}
        <div onClick={()=>loadLevel(level)} style={{fontSize: '30px', borderTop: '2px solid black', cursor: 'pointer'}}>⏪</div>
    </div>
  );
}

export default App;