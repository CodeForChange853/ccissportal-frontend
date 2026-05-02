import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function AISystemOverseer({ systemStatus = 'good' }) {
    const mountRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // This simulates getting the system status from your backend.
    // For testing, you can change the default prop to 'warning' or 'critical'.
    const statusColors = {
        good: 0x16a34a, // Green
        warning: 0xd97706, // Orange
        critical: 0xdc2626 // Red
    };

    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 4.5);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(300, 300);
        mountRef.current.appendChild(renderer.domElement);

        // 2. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(2, 5, 3);
        scene.add(dirLight);

        // 3. Build the Head Model
        const headGroup = new THREE.Group();

        // Head Shell
        const matHead = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
        const headGeo = new THREE.BoxGeometry(1.8, 1.6, 1.8);
        const headMesh = new THREE.Mesh(headGeo, matHead);

        // Eyes
        const eyeGeo = new THREE.CapsuleGeometry(0.15, 0.2, 4, 8);
        const eyeMat = new THREE.MeshStandardMaterial({
            color: statusColors[systemStatus],
            emissive: statusColors[systemStatus],
            emissiveIntensity: 0.8
        });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.4, 0.1, 0.95);
        leftEye.rotation.z = Math.PI / 2; // Flat horizontal

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.4, 0.1, 0.95);
        rightEye.rotation.z = Math.PI / 2;

        headGroup.add(headMesh);
        headGroup.add(leftEye);
        headGroup.add(rightEye);
        scene.add(headGroup);

        // 4. Expressions & Animation Variables
        let targetRotationX = 0;
        let targetRotationY = 0;

        // Apply Expressions based on status
        if (systemStatus === 'good') {
            // Smile curve (curve the capsules)
            leftEye.rotation.z = Math.PI / 2.2;
            rightEye.rotation.z = -Math.PI / 2.2;
            leftEye.scale.set(1, 1, 1);
            rightEye.scale.set(1, 1, 1);
        } else if (systemStatus === 'critical') {
            // Angry angle
            leftEye.rotation.z = Math.PI / 3;
            rightEye.rotation.z = -Math.PI / 3;
            leftEye.scale.set(1.2, 1.2, 1.2);
            rightEye.scale.set(1.2, 1.2, 1.2);
        } else {
            // Neutral/Warning
            leftEye.rotation.z = Math.PI / 2;
            rightEye.rotation.z = Math.PI / 2;
        }

        // 5. Render Loop
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Smooth mouse tracking interpolation
            if (isHovering) {
                targetRotationY = (mousePos.x / 150 - 1) * 0.5;
                targetRotationX = (mousePos.y / 150 - 1) * 0.5;
            } else {
                // Gentle idle sway
                const time = Date.now() * 0.001;
                targetRotationY = Math.sin(time) * 0.15;
                targetRotationX = Math.cos(time * 0.8) * 0.1;
            }

            headGroup.rotation.y += (targetRotationY - headGroup.rotation.y) * 0.1;
            headGroup.rotation.x += (targetRotationX - headGroup.rotation.x) * 0.1;

            // Optional pulse effect on eyes for critical
            if (systemStatus === 'critical') {
                eyeMat.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.5;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [mousePos, isHovering, systemStatus]);

    return (
        <>
            {/* ── Critical Screen Pulse Overlay ── */}
            {systemStatus === 'critical' && (
                <div className="fixed inset-0 pointer-events-none z-50 bg-red-600/20 animate-pulse flex items-center justify-center">
                    <h1 className="text-red-600 font-bold text-6xl drop-shadow-lg opacity-50">CRITICAL WARNING</h1>
                </div>
            )}

            <div
                className="relative flex items-center justify-center w-[300px] h-[300px]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* 3D Canvas Mount */}
                <div ref={mountRef} />

                {/* HTML Overlays for Warning/Critical States */}
                {systemStatus === 'warning' && (
                    <div className="absolute bottom-4 bg-orange-500/20 text-orange-500 border border-orange-500 px-4 py-1 rounded-full animate-pulse text-sm font-bold shadow-[0_0_15px_rgba(217,119,6,0.6)]">
                        ⚠ SYSTEM WARNING
                    </div>
                )}
            </div>
        </>
    );
}