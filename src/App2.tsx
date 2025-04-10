import {
    Box,
    Environment,
    OrbitControls,
    Text,
    useEnvironment,
    Float,
    PointerLockControls
  } from "@react-three/drei";
  import { Canvas, useLoader } from "@react-three/fiber";
  import { Fragment, useState, useEffect, ReactNode, Children } from "react";
  import * as THREE from "three";
  import "./App.css";
  import Model3D from "./Model3D";
  import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
  import People3D from "./People3D";
  //import { RoughnessMipmapper } from 'https://cdn.jsdelivr.net/npm/three@0.116.1/examples/jsm/utils/RoughnessMipmapper.js';
  import { Note } from "./Note.1";
  
  const lanes = [-1.5, -0.5, 0.5, 1.5];
  let gameOver = false;
  export let sp = new URLSearchParams(window.location.search);

  const loadedTextures = new Array();
  const loadedObjects = new Array();
  
  function addTextureAndMaterial({ 
    textureName}: { 
        textureName:string}):{[ texture:THREE.Texture, material:THREE.Material ]} {
    
    const texture = new THREE.TextureLoader().load(textureName);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    loadedTextures.push(textureName);
    loadedObjects.push([ textureName, texture, material ]);

    return [ texture, material ];
  }

  addTextureAndMaterial({ textureName: '/texture-wood.jpg' });

  const textureSpeaker = new THREE.TextureLoader().load('/texture-neon.png');
  const materialSpeaker = new THREE.MeshBasicMaterial({ map: textureSpeaker });

  addTextureAndMaterial({ textureName: '', texture: texture, material: material });

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

  function FBXWithTexture({
    modelName,
    rotation,
    index,
    texture,
    scale,
  }: {
    modelName: string;
    rotation: [x: number, y: number, z: number];
    index: number;
    texture: string;
    scale: number;
  }) {
    const fbx = useLoader(FBXLoader, modelName);
    const loadedTexture = useLoader(THREE.TextureLoader, texture);
        
    fbx.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ map: loadedTexture, roughness: 0.9 });
        }
    });

    loadedTextures.push({ "`${texture}`": [ loadedTexture, fbx ] });

    console.log("### Loaded Textures ###");
    console.log(loadedTextures);
        
    return (
      <primitive
        key={index + new Date().getUTCMilliseconds() + Math.random()}
        object={fbx.clone()}
        scale={scale}
        rotation={rotation}
        roughness={1}
        material={loadedTexture || false}
      />
    );
  }
   
  function ThreeScene() {
    const envMap = useEnvironment({
      files: ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
      path: `/${sp.get("place")}/`,
    });
  
    const [notes, setNotes] = useState<Array<{ id: number; lane: number }>>([]);
    const [score, setScore] = useState<number>(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        setNotes((prev) => [...prev, { id: Date.now(), lane }]);
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
        <pointLight key={new Date().getUTCMilliseconds() + Math.random()} position={[5, 5, -10]} />

        <OrbitControls key={new Date().getUTCMilliseconds() + Math.random()} />

        {/*<PointerLockControls maxPolarAngle={45} />*/}
        <Environment map={envMap} background />
  
        <Text position={[-2, 2, -5]} fontSize={1}>
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
        <mesh position={[3, 2, -6.9]}>
            <FBXWithTexture scale={1} modelName="/fbx/audio-box.fbx" rotation={[0, 0, 0]} index={1} texture="/texture-speaker.jpg" />
            <meshNormalMaterial />
        </mesh>

        <mesh position={[-3, 2, -6.9]}>
            <FBXWithTexture scale={1} modelName="/fbx/audio-box.fbx" rotation={[0, 0, 0]} index={2} texture={false} />
            <meshNormalMaterial />
        </mesh>
        </Float>

      </Fragment>
    );
  }
  
  function App() {
    return (
      <div className="App h-screen">
        <Canvas gl={{ antialias: true }} camera={{ position: [0, 1, 5.5] }}>
          <ThreeScene />
        </Canvas>
      </div>
    );
  }
  
  export default App2;
  