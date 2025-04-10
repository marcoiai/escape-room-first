import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function Model3DAndTexture({
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
  
    // Aplique a textura em todos os materiais do modelo
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ map: loadedTexture, roughness: 0.9 });
      }
    });
  
    return (
      <primitive
        key={index + new Date().getUTCMilliseconds() + Math.random()}
        object={fbx.clone()}
        scale={scale}
        rotation={rotation}
        roughness={1}
        material={loadedTexture}
      />
    );
  }

export { Model3DAndTexture };