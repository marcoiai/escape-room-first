import {
    Box,
    Environment,
    OrbitControls,
    Text,
    useEnvironment,
  } from "@react-three/drei";
  import { Canvas, useFrame } from "@react-three/fiber";
  import { Fragment, useState, useEffect, useRef, ReactNode } from "react";
  import { Mesh } from "three";
  import * as THREE from "three";
  import "./App.css";
  import Model3D from "./Model3D"
  import { MeshReflectorMaterial } from "@react-three/drei/materials/MeshReflectorMaterial";
  import "./Line"
  import { Lanes } from "./Lanes"
  import "./Note"

function ThreeScene() {
    const lanes = [-1.5, -0.5, 0.5, 1.5];
    let sp = new URLSearchParams(window.location.search)

    const envMap = useEnvironment({
      files: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
      //path: '/cube/pisa/' 
      //path: 'modern buildings/' 
      //path: '/cube/Bridge2/'
      path: `/${sp.get('place')}/`
  });
  
    const [notes, setNotes] = useState<Array<{ id: number; lane: number }>>([]);
    const [score, setScore] = useState<number>(0);
  
    useEffect(() => {
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();

        // create a global audio source
        const sound = new THREE.Audio( listener );
        const sound2 = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( '/songs/defy/song.ogg', function( buffer ) {
            sound.setBuffer( buffer );
            sound.onEnded = () => { alert('acabou de tocar') }
            sound.setLoop( false );
            sound.setVolume( 0.7 );
            //sound.play();
        });

        // load a sound and set it as the Audio object's buffer
        const audioLoaderGuitar = new THREE.AudioLoader();
        audioLoaderGuitar.load( '/songs/defy/guitar.ogg', function( buffer ) {
            sound2.setBuffer( buffer );
            sound2.onEnded = () => { alert('acabou de tocar') }
            sound2.setLoop( false );
            sound2.setVolume( 0.7 );
            sound2.play();
        });

        //sound.play();
        //sound2.play();

      const interval = setInterval(() => {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        setNotes((prev) => [...prev, { id: Date.now(), lane }]);
      }, 1500);
      return () => clearInterval(interval);
    }, []);
  
    function handleKeyPress(event: KeyboardEvent) {
      const keyMap: { [key: string]: number } = { a: -1.5, s: -0.5, d: 0.5, f: 1.5 };
  
      if (keyMap[event.key]) {
        setNotes((prev) => {
          let hit = false;
          return prev.filter((note) => {
            if (!hit && Math.abs(note.lane - keyMap[event.key]) < 0.2) {
              setScore((prev) => prev + 100);
              new Audio(`/sounds/crunch${["a", "s", "d", "f"].indexOf(event.key) + 1}.ogg`).play();
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
      <Fragment key={"scene_fragment_" + new Date().getUTCMilliseconds() + (Math.random() % 2 == 0)}>
        <ambientLight />
        <pointLight position={[5, 5, 5]} />

        <OrbitControls />

        <Environment map={envMap} background />

        <Text position={[-2, 0, -4.5]} fontSize={1}>Score: {score}</Text>
  
        {/* JSX comment
        <Rotator>
          <Box position={[0, 0, 5]}>
            <meshStandardMaterial color="red" />
          </Box>
  
          <Box position={[-1, 3, 2]}>
            <meshStandardMaterial color="purple" />
          </Box>
        </Rotator>
        {/* JSX end comment*/}
  
        {/* Fretboard */}
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[3.5, 10, 0.2]} />
          <meshStandardMaterial color="brown" />
        </mesh>

        {/* Modelo 3D carregado */}
        
            <Model3D key="star1" position={[2, 5, -4.5]} fileName={"/star"} />

            <Model3D key="star2" position={[6, 5, -4.5]} fileName={"/star2"} />

            <Model3D key="star3" position={[10, 5, -4.5]} fileName={"/star1"} />

            <Model3D key="speaker" position={[-6, 5, -4.5]} fileName={"/sound-box"} />
  
        {/* Notas */}
        {notes.map((note) => (
        <mesh>
          <Note key={note.id} id={note.id} lane={note.lane} onHit={(id) => {
            setNotes((prev) => prev.filter((note) => note.id !== id));
          }} />
          </mesh>
        ))}
  
        {/* Linhas das lanes */}
        {lanes.map((lane) => (
          <Line key={lane} x={lane} />
        ))}
      </Fragment>
    );
  }

  export { ThreeScene };