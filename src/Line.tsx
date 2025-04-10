import * as THREE from "three";

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
      </line>
    );
  }

export { Line };