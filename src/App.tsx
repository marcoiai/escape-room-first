import {
    Environment,
    OrbitControls,
    Text,
    useEnvironment,
    Float,
    Html, 
    useProgress,
  } from "@react-three/drei";
  import * as THREE from "three";
  import { Canvas } from "@react-three/fiber";
  import { Fragment, useState, useEffect, Suspense } from "react";
  import { People3D } from "./People3D";
  import { Note } from "./Note";
  import { ObjectLoader } from "./ObjectLoader";
  import "./App.css";

  const lanes = [-1.5, -0.5, 0.5, 1.5];
  let gameOver = true;
  let paramaters = new URLSearchParams(window.location.search);
  let selectedScene = "";
  
  const texture = new THREE.TextureLoader().load("/texture-wood.jpg");
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const textureSpeaker = new THREE.TextureLoader().load('/texture-neon.png');
  const materialSpeaker = new THREE.MeshBasicMaterial({ map: textureSpeaker });

  const listener = new THREE.AudioListener();

  const sound = new THREE.Audio( listener );
  const sound2 = new THREE.Audio( listener );

  function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress} % loaded</Html>;
  }

  function restartGame():void {
    gameOver = !gameOver;
    
    if (gameOver) {
        sound.pause();
        sound2.pause();
    } else {
        if (!sound.isPlaying) {
            sound.play();
            sound2.play();
        }
    }
  }

  if (paramaters.get("place") == undefined || paramaters.get("place") === null) {
    console.log(paramaters.get('place'));
    paramaters.set('place', 'cube/pisa');
    selectedScene = "Pisa";
  }
  
  function Line({ x }: { x: number }) {
    return (
      <line> 
        <bufferGeometry
          attach="geometry"
          attributes-position={new THREE.Float32BufferAttribute(
            [x, -1.39, -6, x, -1.39, 6],
            3
          )}
        />
        <meshBasicMaterial color="white" />
      </line>
    );
  }

  function setSelectedScene(aValue:string) {
    console.log('setSelectedScene');
    selectedScene = aValue;

    //window.location.href = window.location.pathname + window.location.href.concat(`/?place=${aValue}`);
    window.location.search = `place=${aValue}`;
  }
  
  function ThreeScene() {
    const envMap = useEnvironment({
      files: ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
      path: `/${paramaters.get("place")}/`,
    });
  
    const [notes, setNotes] = useState<Array<{ id: number; lane: number, environmentTexture: THREE.Texture }>>([]);
    const [score, setScore] = useState<number>(0);
  
    useEffect(() => {
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( '/songs/defy/song.ogg', function( buffer ) {
            sound.setBuffer( buffer );
            sound.onEnded = () => { gameOver = true }
            sound.setLoop( false );
            sound.setVolume( 0.7 );
        });
        
        const audioLoaderGuitar = new THREE.AudioLoader();
        audioLoaderGuitar.load( '/songs/defy/guitar.ogg', function( buffer ) {
            sound2.setBuffer( buffer );
            sound2.onEnded = () => { gameOver = true }
            sound2.setLoop( false );
            sound2.setVolume( 0.7 );
        });
        
        const interval = setInterval(() => {
            if (!gameOver) {
                const lane = lanes[Math.floor(Math.random() * lanes.length)];
                setNotes((prev) => [...prev, { id: Date.now(), lane, environmentTexture: envMap }]);
                
                if (!sound.isPlaying) {
                    sound2.play();
                    sound.play();
                }
        }

      }, 1500);
      return () => clearInterval(interval);
    }, []);
  
    function handleKeyPress(event: KeyboardEvent) {
      const keyMap: { [key: string]: number } = {
        a: -1.5,
        s: -0.5,
        d: 0.5,
        f: 1.5,
      };
  
      if (keyMap[event.key]) {
        setNotes((prev) => {
          let hit = false;
          return prev.filter((note) => {
            if (!hit && Math.abs(note.lane - keyMap[event.key]) < 0.2) {
              setScore((prev) => prev + 100);
              new Audio(
                `/sounds/crunch${["a", "s", "d", "f"].indexOf(event.key) + 1}.ogg`
              ).play();
              hit = true;
              return false;
            }
            return true;
          });
        });
      }
    }
  
    useEffect(() => {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);
  
    return (
      <Fragment>
        <ambientLight key={new Date().getUTCMilliseconds() + Math.random()} />
        <pointLight key={new Date().getUTCMilliseconds() + Math.random()} position={[5, 5, 5]} />

        
        <OrbitControls key={new Date().getUTCMilliseconds() + Math.random()} />
        
        
        {/*
        <OrbitControls 
            minZoom={0}
            maxZoom={0}
            minDistance={1.5}
            maxDistance={7.8}
            enableZoom={true}
            enablePan={false} 
            enableRotate={false} 
        />
        */}

        <Environment map={envMap} background />
  
        <Text position={[-2, 6, -5]} fontSize={2}>
          Score: {score}
        </Text>
        
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[3.5, 12, 0.2]} />
          <meshBasicMaterial map={texture} /> 
        </mesh>

        {notes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            lane={note.lane}
            environmentTexture={envMap}
            onHit={(id) => {
              setNotes((prev) => prev.filter((note) => note.id !== id));
            }}
          />
        ))}
   
        {lanes.map((lane) => (
          <Line key={lane} x={lane} />
        ))}

        <mesh position={[30, -40, -120]}>
            <People3D modelName="/fbx/populate.fbx" scale={0.28} />
        </mesh>

        <Float>
        <mesh position={[3, 2, -6.9]} rotation={[0, -20, 0]}>
            <ObjectLoader modelName="/objects/speaker.obj" scale={1} textureName="/texture-wood2.png" />
            <meshNormalMaterial />
        </mesh>
        </Float>

        <Float>
        <mesh position={[-3, 2, -6.9]} rotation={[0, -20, 0]}>
            <ObjectLoader modelName="/objects/speaker.obj" scale={1} textureName="/texture-wood2.png" />
            <meshNormalMaterial />
        </mesh>
        </Float>

      </Fragment>
    );
  }
  
  function App() {
    return (
      <div className="App h-screen">
        <Suspense fallback={<Loader />}>
            TESTE
        </Suspense>
        {gameOver && (
          <>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => { restartGame() } }>
            Iniciar Jogo
          </button>
          <h5>Este é apenas um conceito que usei para aprender React.js</h5>
          <h5>Use as teclas "A" "S" "D" "F" para atingir as notas.</h5>
          </>
        )}
        <Canvas gl={{ antialias: true }} camera={{ position: [0, 1, 8.5] }}>
          <ThreeScene />
        </Canvas>

        <div className="suspendedSelect">
            <select
            defaultValue={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value)}
            >
            <option value="cube/pisa">Pisa Tower</option>
            <option value="modern buildings">Modern Building</option>
            <option value="cube/Bridge2">Bridge</option>
            <option value="cube/Colosseum">Colosseum</option>
            </select>
        </div>
      </div>
    );
  }
  
  export default App;
  