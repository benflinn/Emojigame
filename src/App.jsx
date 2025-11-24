import { useState, useEffect } from 'react';
import levels from './levels';
import { motion, AnimatePresence } from 'motion/react';

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
  const [gorillaActive, setGorillaActive] = useState(false);
  const [level, setLevel] = useState(savedLevel);
  let newStack = [];
  levels[savedLevel-1].initialStack.forEach(e=>{
    newStack.push({
      emoji: e,
      key: Math.random()
    });
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
    setStack([]);
    setLevel(newLevel);
    localStorage.setItem("savedLevelLS", newLevel);
    let newStack = [];
    levels[newLevel-1].initialStack.forEach(e=>{
      newStack.push({
      emoji: e,
      key: Math.random()
    });
    })
    setStack(newStack);
    setBurn(false);
    setGorillaActive(false);
    setSelectAnywhere(false);
    setScore(0);
    setFood(3);
    setHandLength(3);
    setTurnCount(0);
    setDwelling(0);
    setDeathReason('');
  }

  function removeFromStack(i) {
    const newStack = [...stack];
    newStack.splice(i, 1);
    setStack(newStack);
  }

  function clickEmoji(e,i) {
    let newFood = food;
    let newScore = score;
    if (gorillaActive) {
      setSelectAnywhere(false);
      setGorillaActive(false);
      let newStack = [...stack];
      let removed = newStack.splice(i, 1);
      setStack([...newStack, ...removed]);
    } else if (e.emoji === '🦍') {
      removeFromStack(i);
      setGorillaActive(true);
      setSelectAnywhere(true);
    } else if (e.emoji === '🏡') {
      setDwelling(1);
      removeFromStack(i);
    } else if (e.emoji === '🥓') {
      removeFromStack(i);
      newFood += 6;
    } else if (e.emoji === '❤️') {
      let newStack = [...stack];
      if (burn) {
        newStack[i].emoji = '🥓';
      } else {
        newStack[i].emoji = '💔';
        newFood += 2;
      }
      setStack(newStack);
    } else if (e.emoji === '💔') {
      let newStack = [...stack];
      if (burn) {
        newStack[i].emoji = '🥓';
      } else {
        newStack.splice(i, 1);
        newFood += 2;
      }
      setStack(newStack);
    } else if (e.emoji === '🎉') {
      let newStack = [...stack];
      if (stack[i+1]) {
        newStack.splice(i, 1, {emoji: stack[i+1].emoji, key: Math.random()});
        newStack.splice(i, 0, {emoji: stack[i+1].emoji, key: Math.random()});
        newStack.splice(i, 0, {emoji: stack[i+1].emoji, key: Math.random()});
      } else {
        newStack.splice(i, 1, {emoji: '🎉', key: Math.random()});
        newStack.splice(i, 0, {emoji: '🎉', key: Math.random()});
        newStack.splice(i, 0, {emoji: '🎉', key: Math.random()});
      }
      setStack(newStack);
    } else if (e.emoji === '🔥') {
      removeFromStack(i);
      setBurn(true);
    } else if (e.emoji === '💀') {
      setDeathReason('Clicking on a skull kills you instantly!');
    } else if (e.emoji === '🥍') {
      removeFromStack(i);
      setSelectAnywhere(true);
    } else if (e.emoji === '✨') {
      newScore++;
      removeFromStack(i);
    } else if (e.emoji === '🍄') {
      removeFromStack(i);
      setHandLength(handLength + 1);
    }
    if (dwelling === 0) {
      newFood -= 1;
    } else if (dwelling === 1) {
      newFood -= 0.5;
    }

    setFood(newFood);
    setScore(newScore);
    setTurnCount(turnCount + 1);
    
    if (selectAnywhere && e.emoji !== '🔥' && e.emoji !== '🥍') {
      setSelectAnywhere(false);
    }
    if (burn && e.emoji !== '🥍') {
      setBurn(false);
    }
  }
 
  let lives = stack.filter(x=>x.emoji === '❤️' || x.emoji === '💔').length;

  useEffect(() => {

    // check for death
    if (!deathReason) {
      stack.forEach((x,i)=>{
        if (i < handLength && x.emoji === '☢️') {
          setDeathReason('You died from radiation poisoning.');
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
        <span style={{fontSize: '30px', fontWeight: 'bold'}}>EmojiGame</span>
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
              <span><span style={{backgroundColor: `${lives === 1 ? 'red':''}`, borderRadius: '15px', padding: '0px 5px 0px 5px'}}>{lives}</span>❤️</span>
              <span><span style={{backgroundColor: `${food === 1 ? 'red':''}`, borderRadius: '15px', padding: '0px 5px 0px 5px'}}>{food}</span>🍲</span>
              <span>{['⛺','🏡'][dwelling]}</span>
            </div>
            <div style={{textAlign: 'left', margin: '5px 0px 0px 0px', height: '300px'}}>
              <span style={{backgroundColor: burn ? 'rgb(255,0,0)' : gorillaActive ? 'black' : '#59ADFA', border: '2px solid #4688C4', borderRadius: '15px', cursor: 'pointer', fontSize: '40px', minHeight: '56px'}}>
                <AnimatePresence initial={false} mode="sync">
                  {stack.map((e,i)=>{
                    if (i < handLength || selectAnywhere){
                      return (
                        <motion.span
                          key={e.key}
                          layout
                          whileHover={{ scale: 1.3 }}
                          initial={{ opacity: 1, scale: 0.1, y: 0 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 1000, damping: 100 }}
                          style={{position: 'relative', display: 'inline-block', margin: '0 6px', fontSize: '35px'}}
                          onClick={()=>clickEmoji(e,i)}
                        >
                          {e.emoji}
                        </motion.span>
                      )
                    }
                    return null;
                  })}
                </AnimatePresence>
              </span>
              <span style={{marginTop: '12px'}}>
                <AnimatePresence initial={false} mode="sync">
                  {stack.map((e,i)=>{
                    if (i >= handLength && selectAnywhere === false){
                      return (
                        <motion.span
                          key={e.key}
                          layout
                          initial={{ opacity: 0, scale: 0.1, y: 0 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 1000, damping: 100 }}
                          style={{fontSize: '40px', position: 'relative', margin: '0 6px', display: 'inline-block'}}
                        >
                          {e.emoji}
                        </motion.span>
                      )
                    }
                    return null;
                  })}
                </AnimatePresence>
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