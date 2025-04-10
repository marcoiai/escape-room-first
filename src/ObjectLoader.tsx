import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/ObjLoader";

export function ObjectLoader({ modelName, scale, textureName }: { modelName:string, scale:number, textureName:string }) {
    const objLoaded = useLoader(OBJLoader, `${modelName}`);
    const loadedTexture = useLoader(THREE.TextureLoader, textureName);

    const childMesh = new THREE.MeshStandardMaterial({ map: loadedTexture, roughness: 1, metalness: 0.7 });

    objLoaded.traverse((child) => {
        if (child.isMesh) {
        child.material = childMesh;
        }
    });
  
    return(
      <>
        <primitive object={objLoaded.clone()} material={loadedTexture} key={"object3d_" + new Date().getUTCMilliseconds() + Math.random()} scale={scale} />
      </>
    );
}

