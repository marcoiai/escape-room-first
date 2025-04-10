import { Environment, OrbitControls, Text, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Fragment, useState, useRef, useEffect, Suspense } from "react";
import Model3D from "./Model3D";
import { Model3DAndTexture } from "./Model3DAndTexture";

const texture = new THREE.TextureLoader().load("/texture-wood.jpg");
const doorTexture = new THREE.TextureLoader().load("/door.jpg");

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

function EscapeRoomScene() {
  const [doorOpen, setDoorOpen] = useState(false);
  const doorRef = useRef(null);

  const handleDoorClick = (event) => {
    const intersects = getIntersects(event);
    if (intersects.length > 0) {
      setDoorOpen(true);
      alert("A porta se abriu! Parabéns por encontrar a saída!");
    }
  };

  const getIntersects = (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, event.camera);
    
    const intersects = raycaster.intersectObjects([doorRef.current]);
    return intersects;
  };

  useEffect(() => {
    window.addEventListener("click", handleDoorClick);
    return () => window.removeEventListener("click", handleDoorClick);
  }, []);

  return (
    <Fragment>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableZoom={false} />

      {/* Cubemap 360 */}
      <Environment
        files={["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]}
        path="/cube/DallasW/"
        background
      />

      {/* Título */}
      <mesh  position={[2, 1.5, 2]} rotation={[0, -45, 0]}>
      <Text color="black" fontSize={1}>
        Escape Room
      </Text>
      </mesh>

      {/* Porta */}
      {!doorOpen && (
        <mesh ref={doorRef} position={[10, 0.5, 100]}  onPointerOver={handleHover} onPointerOut={handleHoverOut}>
          <boxGeometry args={[15, 40, 0.1]} />
          <meshStandardMaterial map={doorTexture} />
        </mesh>
      )}

      {/* TV Model with Hover Interaction */}
      <mesh ref={doorRef} position={[130, -40, 180]} onPointerOver={handleHover} onPointerOut={handleHoverOut}>
        <Model3DAndTexture modelName="/objects/TV/SmartTv.fbx" rotation={[-0.5, -55, 90]} index={1} scale={1.4} texture="/objects/TV/textures/texture-tv-smart-mi.jpg" />
      </mesh>

    </Fragment>
  );
}

const handleHover = (event) => {
  const object = event.object;
  object.material.emissive.set(0x00ff00); // Change the emissive color to green when hovered
};

const handleHoverOut = (event) => {
  const object = event.object;
  object.material.emissive.set(0x000000); // Reset the emissive color when the mouse is no longer over the object
};

export default function App() {
  return (
    <div className="App h-screen">
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
        <Suspense fallback={<Loader />}>
          <EscapeRoomScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
