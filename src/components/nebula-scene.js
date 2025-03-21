"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

export function NebulaScene() {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />

        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

