import {
    useEnvironment,
  } from "@react-three/drei";
  import { useFrame } from "@react-three/fiber";
  import { useRef } from "react";
  import { CubeTexture, Mesh, Texture } from "three";
  import "./App.css";

export function Note({
    id,
    lane,
    onHit,
    environmentTexture,
  }: {
    id: number;
    lane: number;
    onHit: (id: number) => void;
    environmentTexture: Texture|CubeTexture;
  }) {
    const noteRef = useRef<Mesh>(null!);
  
    useFrame(() => {
      if (noteRef.current) {
        noteRef.current.position.z += 0.1;
        if (noteRef.current.position.z > 6.5) {
          onHit(id);
        }
      }
    });
  
    return (
      <mesh ref={noteRef} position={[lane, -1.5, -6]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshBasicMaterial envMap={environmentTexture} />
      </mesh>
    );
  }
