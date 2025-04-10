import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export function People3D({ modelName, scale }: { modelName:string, scale:number }) {
    const fbx = useLoader(FBXLoader, `${modelName}`);
  
    return(
      <>
        <primitive object={fbx} key={"people3d_" + new Date().getUTCMilliseconds() + Math.random()} scale={scale} />
      </>
    );
}

