"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function generateHeadPoints(count) {
    const positions = new Float32Array(count * 3);
    let i = 0;

    while (i < count) {
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;

        const jawTaper = y < -0.2 ? 1 - (Math.abs(y + 0.2) * 0.6) : 1;
        const ex = x / (0.78 * jawTaper);
        const ey = y / 1.05;
        const ez = z / (0.85 * jawTaper);
        const dist = ex * ex + ey * ey + ez * ez;

        if (dist <= 1 && dist > 0.55) {
            positions[i * 3] = x * 1.4;
            positions[i * 3 + 1] = y * 1.4 + 0.1;
            positions[i * 3 + 2] = z * 1.4;
            i++;
        }
    }

    return positions;
}

function generateEdgeIndices(positions, count, maxConnections = 2, maxDist = 0.45) {
    const edges = [];
    const sampleCount = Math.min(count, 160);

    for (let a = 0; a < sampleCount; a++) {
        let connections = 0;
        const ax = positions[a * 3];
        const ay = positions[a * 3 + 1];
        const az = positions[a * 3 + 2];

        for (let b = a + 1; b < sampleCount && connections < maxConnections; b++) {
            const bx = positions[b * 3];
            const by = positions[b * 3 + 1];
            const bz = positions[b * 3 + 2];
            const dx = ax - bx, dy = ay - by, dz = az - bz;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d < maxDist) {
                edges.push(ax, ay, az, bx, by, bz);
                connections++;
            }
        }
    }

    return new Float32Array(edges);
}

function HeadParticles({ mouse }) {
    const pointsRef = useRef(null);
    const linesRef = useRef(null);
    const groupRef = useRef(null);

    const COUNT = 2200;

    const positions = useMemo(() => generateHeadPoints(COUNT), []);
    const edgePositions = useMemo(
        () => generateEdgeIndices(positions, COUNT),
        [positions]
    );

    const pointsGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [positions]);

    const linesGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
        return geo;
    }, [edgePositions]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!groupRef.current) return;

        groupRef.current.rotation.y = t * 0.35;
      groupRef.current.position.y = Math.sin(t * 0.9) * 0.12;

        const targetX = mouse.current.y * 0.8;
        const targetY = mouse.current.x * 1.3 + t * 0.25;

        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.12;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.12;
    });

    return (
        <group ref={groupRef}>
            <points ref={pointsRef} geometry={pointsGeo}>
                <pointsMaterial
                    size={0.028}
                    color="#6C63FF"
                    transparent
                    opacity={0.85}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
            <lineSegments ref={linesRef} geometry={linesGeo}>
                <lineBasicMaterial
                    color="#00E5A0"
                    transparent
                    opacity={0.18}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[2, 2, 3]} intensity={1.2} color="#6C63FF" />
            <pointLight position={[-2, -1, 2]} intensity={50.5} color="#00E5A0" />
        </>
    );
}

function MouseTracker({ mouse }) {
    const { size } = useThree();
    useEffect(() => {
        const handleMove = (e) => {
            mouse.current.x = (e.clientX / size.width) * 2 - 1;
            mouse.current.y = -(e.clientY / size.height) * 2 + 1;
        };
        window.addEventListener("pointermove", handleMove);
        return () => window.removeEventListener("pointermove", handleMove);
    }, [mouse, size]);
    return null;
}

export default function ParticleHead({ className = "" }) {
    const mouse = useRef({ x: 0, y: 0 });
    const [supportsWebGL, setSupportsWebGL] = useState(true);

    useEffect(() => {
        try {
            const canvas = document.createElement("canvas");
            const gl =
                canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!gl) setSupportsWebGL(false);
        } catch {
            setSupportsWebGL(false);
        }
    }, []);

    if (!supportsWebGL) {
        return (
            <div
                className={`rounded-full bg-[radial-gradient(closest-side,rgba(108,99,255,0.35),transparent)] ${className}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <div className={className} aria-hidden="true">
            <Canvas
                camera={{ position: [0, 0, 4.2], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
                <Suspense fallback={null}>
                    <SceneLights />
                    <MouseTracker mouse={mouse} />
                    <HeadParticles mouse={mouse} />
                </Suspense>
            </Canvas>
        </div>
    );
}