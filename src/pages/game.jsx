'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function Soccer3v3() {
  const scene = useRef(null);
  const engine = useRef(null);
  const ball = useRef(null);
  const blue = useRef([]);
  const red = useRef([]);
  const score = useRef({ blue: 0, red: 0 });
  const active = useRef(0);
  const aiActive = useRef(0);
  const keys = useRef({});
  const kickOffTeam = useRef('red');

  // These will track if A/X were pressed THIS frame
  const aPressed = useRef(false);
  const xPressed = useRef(false);

  useEffect(() => {
    engine.current = Matter.Engine.create();
    engine.current.gravity.y = 0;
    engine.current.timing.timeScale = 0.65;

    const render = Matter.Render.create({
      element: scene.current,
      engine: engine.current,
      options: { width: 800, height: 600, wireframes: false, background: '#2d5a3e' }
    });

    const walls = [
      Matter.Bodies.rectangle(400, 0,   800, 40, { isStatic: true, render: { fillStyle: '#fff' } }),
      Matter.Bodies.rectangle(400, 600, 800, 40, { isStatic: true, render: { fillStyle: '#fff' } }),
      Matter.Bodies.rectangle(0,   300,  40, 600, { isStatic: true, render: { fillStyle: '#fff' } }),
      Matter.Bodies.rectangle(800, 300,  40, 600, { isStatic: true, render: { fillStyle: '#fff' } })
    ];

    ball.current = Matter.Bodies.circle(400, 300, 12, {
      label: 'ball',
      restitution: 0.7,
      friction: 0.22,
      frictionAir: 0.04,
      density: 0.0006,
      render: { fillStyle: '#facc15', strokeStyle: '#92400e', lineWidth: 2 }
    });

    const make = (x, y, color, label) => Matter.Bodies.circle(x, y, 22, {
      label,
      density: 0.006,
      friction: 0.25,
      restitution: 0.3,
      render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 2 }
    });

    blue.current = [make(180,200,'#3b82f6','b0'), make(180,300,'#3b82f6','b1'), make(180,400,'#60a5fa','b2')];
    red.current  = [make(620,200,'#ef4444','r0'), make(620,300,'#f87171','r1'), make(620,400,'#dc2626','r2')];

    const goalL = Matter.Bodies.rectangle(20, 300, 20, 160, { isStatic: true, isSensor: true, label: 'goalL' });
    const goalR = Matter.Bodies.rectangle(780,300, 20, 160, { isStatic: true, isSensor: true, label: 'goalR' });

    Matter.World.add(engine.current.world, [...walls, ball.current, ...blue.current, ...red.current, goalL, goalR]);

    // COLLISIONS
    Matter.Events.on(engine.current, 'collisionStart', e => {
      e.pairs.forEach(p => {
        if (p.bodyA.label === 'ball' && p.bodyB.label === 'goalL') { 
          score.current.red++; kickOffTeam.current = 'blue'; reset(); 
        }
        if (p.bodyA.label === 'ball' && p.bodyB.label === 'goalR') { 
          score.current.blue++; kickOffTeam.current = 'red'; reset(); 
        }

        // DRIBBLE
        const player = p.bodyA.label?.match(/^[br]\d$/) ? p.bodyA : p.bodyB;
        const ballBody = player === p.bodyA ? p.bodyB : p.bodyA;
        if (player) {
          const dx = ballBody.position.x - player.position.x;
          const dy = ballBody.position.y - player.position.y;
          const dist = Math.hypot(dx, dy) || 1;
          Matter.Body.applyForce(ballBody, ballBody.position, {
            x: (dx/dist)*0.005,
            y: (dy/dist)*0.005
          });
        }
      });
    });

    // KEYBOARD
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;

      if (k === 'q') {
        active.current = (active.current + 1) % 3;
        updateIndicator();
      }
      // Mark A/X as pressed THIS frame
      if (k === 'a') aPressed.current = true;
      if (k === 'x') xPressed.current = true;
    });

    window.addEventListener('keyup', e => {
      keys.current[e.key.toLowerCase()] = false;
    });

    const updateIndicator = () => {
      document.getElementById('indicator').textContent = `PLAYER ${active.current + 1}`;
      blue.current.forEach((p,i) => p.render.fillStyle = i === active.current ? '#1e40af' : '#3b82f6');
    };

    const positionKickOff = () => {
      blue.current.forEach((p,i) => Matter.Body.setPosition(p, {x:180, y:200 + i*100}));
      red.current.forEach((p,i) => Matter.Body.setPosition(p, {x:620, y:200 + i*100}));
      Matter.Body.setPosition(ball.current, {x:400, y:300});
      Matter.Body.setVelocity(ball.current, {x:0, y:0});
      document.getElementById('kickoff').textContent = kickOffTeam.current.toUpperCase() + ' KICK-OFF';
    };

    // PLAYER LOOP
    const playerLoop = () => {
      const p = blue.current[active.current];
      const f = 0.010;

      if (keys.current['arrowup'])    Matter.Body.applyForce(p, p.position, {x:0, y:-f});
      if (keys.current['arrowdown'])  Matter.Body.applyForce(p, p.position, {x:0, y: f});
      if (keys.current['arrowleft'])  Matter.Body.applyForce(p, p.position, {x:-f, y:0});
      if (keys.current['arrowright']) Matter.Body.applyForce(p, p.position, {x: f, y:0});

      // A = SHOOT (only once per press)
      if (aPressed.current) {
        const dx = 750 - p.position.x;
        const dy = 300 - p.position.y;
        const d = Math.hypot(dx, dy) || 1;
        Matter.Body.applyForce(ball.current, ball.current.position, { x: dx/d*0.018, y: dy/d*0.018 });
        aPressed.current = false; // reset
      }

      // X = PASS (only once per press)
      if (xPressed.current) {
        const target = blue.current[(active.current + 1) % 3];
        const dx = target.position.x - p.position.x;
        const dy = target.position.y - p.position.y;
        const d = Math.hypot(dx, dy) || 1;
        Matter.Body.applyForce(ball.current, ball.current.position, { x: dx/d*0.009, y: dy/d*0.009 });
        xPressed.current = false;
      }

      requestAnimationFrame(playerLoop);
    };
    playerLoop();

    // AI LOOP
    let aiTimer = 0;
    const aiLoop = () => {
      aiTimer++;
      const p = red.current[aiActive.current];
      const dx = ball.current.position.x - p.position.x;
      const dy = ball.current.position.y - p.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 40)
        Matter.Body.applyForce(p, p.position, { x: dx*0.00006, y: dy*0.00006 });

      if (aiTimer % 240 === 0) {
        aiActive.current = (aiActive.current + 1) % 3;
        red.current.forEach((r,i) => r.render.fillStyle = i === aiActive.current ? '#991b1b' : '#ef4444');
      }

      if (dist < 60 && Math.random() < 0.03) {
        const towardGoal = { x: 50 - p.position.x, y: 300 - p.position.y };
        const d = Math.hypot(towardGoal.x, towardGoal.y);
        Matter.Body.applyForce(ball.current, ball.current.position, {
          x: towardGoal.x/d*0.015,
          y: towardGoal.y/d*0.015
        });
      }

      requestAnimationFrame(aiLoop);
    };
    aiLoop();

    const reset = () => {
      positionKickOff();
      document.getElementById('score').textContent = `${score.current.blue} - ${score.current.red}`;
    };

    positionKickOff();
    updateIndicator();
    Matter.Render.run(render);
    Matter.Runner.run(Matter.Runner.create(), engine.current);

    return () => {
      Matter.Render.stop(render);
      render.canvas?.remove();
    };
  }, []);

  return (
    <div style={{background:'linear-gradient(#0f5132,#198754)',minHeight:'100vh',color:'white',padding:20,fontFamily:'system-ui'}}>
      <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
        <h1 style={{fontSize:48,margin:'0 0 10px',background:'linear-gradient(45deg,#fff,#facc15)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          MINI 3v3
        </h1>

        <div id="score" style={{fontSize:64,fontWeight:'bold',margin:20,padding:'20px 40px',background:'rgba(255,255,255,0.15)',borderRadius:30,display:'inline-block'}}>
          0 - 0
        </div>

        <div style={{fontSize:22,margin:15}}>
          <span id="kickoff" style={{background:'rgba(255,255,255,0.25)',padding:'10px 25px',borderRadius:20}}>RED KICK-OFF</span>
        </div>

        <div style={{fontSize:22,margin:15}}>
          <span id="indicator" style={{background:'rgba(255,255,255,0.25)',padding:'10px 25px',borderRadius:20}}>PLAYER 1</span>
        </div>

        <p style={{fontSize:18,margin:10}}>
          Q = Switch  Arrows = Move  A = SHOOT  X = PASS
        </p>

        <div style={{position:'relative',margin:'40px auto',width:800,height:600,borderRadius:30,overflow:'hidden',boxShadow:'0 30px 60px rgba(0,0,0,0.5)',background:'#1e402f'}}>
          <div ref={scene} />
          <svg style={{position:'absolute',inset:0,pointerEvents:'none'}} viewBox="0 0 800 600">
            <line x1="400" y1="20" x2="400" y2="580" stroke="#fff6" strokeWidth="4"/>
            <circle cx="400" cy="300" r="60" fill="none" stroke="#fff6" strokeWidth="4" strokeDasharray="10,5"/>
            <rect x="10" y="170" width="30" height="260" rx="5" fill="none" stroke="#fff4" strokeWidth="3"/>
            <rect x="760" y="170" width="30" height="260" rx="5" fill="none" stroke="#fff4" strokeWidth="3"/>
          </svg>
        </div>

        <button onClick={()=>window.location.reload()} style={{padding:'15px 40px',fontSize:20,background:'white',color:'#15803d',border:'none',borderRadius:25,fontWeight:'bold',cursor:'pointer',boxShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>
          New Game
        </button>
      </div>
    </div>
  );
}