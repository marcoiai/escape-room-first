import "./App.css";
import { BoxGeometry, MeshStandardMaterial } from "three";
import THREE from "three";

function Fretboard() {
    return (
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} key={new Date().getUTCMilliseconds() + Math.random()}>
            <BoxGeometry args={[3.5, 10, 0.2]} />
            <MeshStandardMaterial color="brown" />
        </mesh>
    )
}

export default Fretboard;