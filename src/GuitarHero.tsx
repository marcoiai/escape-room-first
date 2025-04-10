import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useCubeTexture } from "@react-three/drei";
import * as THREE from "three";

// Define types
type NoteProps = {
  lane: number;
  onHit: (lane: number) => void;
};

type LineProps = {
  start: [number, number, number];
  end: [number, number, number];
};

const lanes = [-1.5, -0.5, 0.5, 1.5];

const envMap = useCubeTexture(
  ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
  { path: '/cube/pisa/' }
);

const Line: React.FC<LineProps> = ({ start, end }) => {
  const ref = useRef<THREE.Line>(null!);
  useLayoutEffect(() => {
    ref.current.geometry.setFromPoints(
      [start, end].map((point) => new THREE.Vector3(...point))
    );
  }, [start, end]);

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="white" linewidth={4} />
    </line>
  );
};

const Note: React.FC<NoteProps> = ({ lane, onHit }) => {
  const noteRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (noteRef.current) {
      noteRef.current.position.y -= 0.05;
      noteRef.current.position.z += 0.1;

      if (noteRef.current.position.y < -2 && noteRef.current.position.y < -6) {
        onHit(noteRef.current.position.x);
      }
    }
  });

  return (
    <mesh ref={noteRef} position={[lane, 2, -5]}>
      <boxGeometry args={[0.3, 0.3, 0.2]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const GuitarHero: React.FC = () => {
  const [notes, setNotes] = useState<{ id: number; lane: number }[]>([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      setNotes((prev) => [...prev, { id: Date.now(), lane }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (event: KeyboardEvent) => {
    const keyMap: Record<string, number> = { a: -1.5, s: -0.5, d: 0.5, f: 1.5 };
    if (keyMap[event.key]) {
      setNotes((prev) =>
        prev.filter((note) => {
          if (Math.abs(note.lane - keyMap[event.key]) < 0.2) {
            setScore((prev) => prev + 100);
            let sounds = [{ lane: `${note.lane}`, fileName: "/sounds/crunch1.ogg" }];
            let soundFret = new Audio(sounds[0].fileName);
            soundFret.play();

            return false;
          }
          return true;
        })
      );
    }
  };

  const startGame = () => {
    let soundFret = new Audio('/songs/defy/song.ogg');
    let soundGuitar = new Audio('/songs/defy/guitar.ogg');
    soundGuitar.play();
    soundFret.play();

    soundFret.onended = () => {
      alert("Game Over");
    };
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div>
      <h1>Web Frets</h1>
      <h2>Score: {score}</h2>
      <button onClick={startGame}>Start</button>
      <Canvas camera={{ position: [0, 2, 5], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[5, 5, 5]} angle={0.2} />

        {notes.map((note) => (
          <Note key={note.id} lane={note.lane} onHit={() => {}} />
        ))}

        <mesh position={[0, -1, -5]} rotation={[1.8, 0, 0]}>
          <boxGeometry args={[7, 50, 0.2]} />
          <meshStandardMaterial color="brown" />
        </mesh>

        {lanes.map((lane) => (
          <Line key={lane} start={[lane, 2, -5]} end={[lane, -1, 5]} />
        ))}
      </Canvas>
    </div>
  );
};

export default GuitarHero;
