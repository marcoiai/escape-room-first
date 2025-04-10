import { Environment, OrbitControls, Text, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Fragment, useState, useRef, useEffect, Suspense } from "react";
import Model3D from "./Model3D";
import { Model3DAndTexture } from "./Model3DAndTexture";
import { ObjectLoader } from "./ObjectLoader";

const texture = new THREE.TextureLoader().load("/texture-wood.jpg");
const doorTexture = new THREE.TextureLoader().load("/door.jpg");
let gameOver = true;

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

function EscapeRoomScene() {
  const [doorOpen, setDoorOpen] = useState(false);
  const [showInput, setShowInput] = useState(false); // Controle para mostrar o campo de input
  const [inputValue, setInputValue] = useState(""); // Armazena o valor do input
  const doorRef = useRef(null);
  const tvRef = useRef(null);
  const bedRef = useRef(null);

  const handleDoorClick = (event) => {
    const intersects = getIntersects(event);
    if (intersects.length > 0) {
      setDoorOpen(true);
      alert("A porta se abriu! Parabéns por encontrar a saída!");
    }
  };

  const handleHover = (event: any) => {
  const object = event.object;
  object.material.emissive.set(0x00ff00); // Change the emissive color to green when hovered
};

const handleHoverOut = (event: any) => {
  const object = event.object;
  object.material.emissive.set(0x000000); // Reset the emissive color when the mouse is no longer over the object
  
  setTimeout(function () { setShowInput(false); }, 50000);
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

  const handleTVClick = () => {
    setShowInput(true); // Exibe o campo de input ao clicar na TV
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.toLowerCase() === "wish") {
      setDoorOpen(true); // Abre a porta quando a palavra correta é digitada
      alert("Você resolveu o puzzle! A porta se abriu!");
    } else {
      alert("Palavra incorreta, tente novamente!");
    }
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
      <mesh position={[2, 1.5, 2]} rotation={[0, 0, 0]}>
        <Text color="black" fontSize={1}>
          Escape Room
        </Text>
      </mesh>

      {/* Porta */}
      {!doorOpen && (
        <mesh ref={doorRef} position={[10, 0.5, 170]} onPointerOver={handleHover} onPointerOut={handleHoverOut}>
          <boxGeometry args={[-25, 60, 2]} />
          <meshStandardMaterial map={doorTexture} />
        </mesh>
      )}

      <mesh ref={bedRef} position={[-10, -550, 420]} rotation={[0, 0, 0]} onPointerOver={handleHover} onPointerOut={handleHoverOut} onClick={handleTVClick}>
        <Model3DAndTexture modelName="/objects/Pillow/pillow-1.fbx" rotation={[-0.5, -55, 90]} index={2} scale={1} texture="/objects/Pillow/textures/texture-pillow.png" />
      </mesh>

      <mesh ref={tvRef} position={[130, -40, 180]} onPointerOver={handleHover} onPointerOut={handleHoverOut} onClick={handleTVClick}>
        <Model3DAndTexture modelName="/objects/TV/SmartTv.fbx" rotation={[-0.5, -55, 90]} index={1} scale={1.4} texture="/objects/TV/textures/texture-tv-smart-mi.jpg" />
      </mesh>

      {/* Campo de entrada para resolver o puzzle */}
      {showInput && !doorOpen && (
        <mesh position={[130, -40, 180]} rotation={[-0.5, -55, 90]}>
        <Html>
          <div style={{ color: "white", fontSize: "20px", fontFamily: "Arial", textShadow: "1px 1px black" }}>
            <p>Digite a palavra chave para abrir a porta:</p>
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={inputValue} 
                onChange={handleInputChange} 
                style={{ padding: "5px", fontSize: "16px" }}
              />
              <button type="submit" style={{ padding: "10px", fontSize: "16px", marginLeft: "10px" }}>
                Enviar
              </button>
            </form>
          </div>
        </Html>
        </mesh>
      )}
    </Fragment>
  );
}

export default function App() {
  return (
    <div className="App h-screen">
        {gameOver && (
          <>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => { gameOver = false } }>
            Iniciar Jogo
          </button>
          <h5>Este é apenas um conceito que usei para aprender React.js</h5>
          <h5>Use as teclas "A" "S" "D" "F" para atingir as notas.</h5>
          </>
        )}
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
        <Suspense fallback={<Loader />}>
          <EscapeRoomScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
