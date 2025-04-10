import { useEnvironment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Model3D({ position, fileName }: { position: [number, number, number], fileName:String }) {
    let sp = new URLSearchParams(window.location.search);
    const gltf = useLoader(GLTFLoader, `${fileName}`);
    const envMap = useEnvironment({
            files: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
            path: `/${sp.get('place')}/`
        });
  
    return (
    <mesh position={position} key={"glbtf_" + new Date().getUTCMilliseconds() + Math.random()}>
      <primitive object={gltf.scene} scale={1} key={new Date().getUTCMilliseconds() + Math.random()} />
      <meshBasicMaterial envMap={envMap}  />
    </mesh>
    );
  }
 
export default Model3D;