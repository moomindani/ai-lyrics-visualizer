import {Background} from './background'
import * as THREE from 'three';


// BackgroundFuture class
export class BackgroundFuture extends Background {

    constructor() {
        super();
        this.scene;
        this.camera;
        this.renderer;
        this.particles;
        this.lightBeams;
        this.particleCount = 500;
        this.beamCount = 20;
        this.frame = 0;
    }

    draw() {
        // Implementation for drawing future background
        console.log('Drawing future background');
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const background = document.querySelector("#background");
        background.appendChild(this.renderer.domElement);
        background.classList.add("bg_future");

        this.createBackground();
        this.createParticles();
        this.createLightBeams();
        this.animate();
    }

    createBackground() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 256;

        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#0066cc');  // より濃い青
        gradient.addColorStop(1, '#00aa88');  // より濃いエメラルドグリーン

        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 256);

        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        const brightColors = [
            [1, 1, 0.8],    // 薄い黄色
            [1, 0.9, 0.6],  // 薄いオレンジ
            [1, 0.8, 1],    // 薄いマゼンタ
            [0.8, 1, 1],    // 薄いシアン
            [1, 1, 1]       // 白
        ];

        for (let i = 0; i < this.particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;

            const color = brightColors[Math.floor(Math.random() * brightColors.length)];
            colors[i] = color[0];
            colors[i + 1] = color[1];
            colors[i + 2] = color[2];
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.7
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createLightBeams() {
        this.lightBeams = new THREE.Group();

        for (let i = 0; i < this.beamCount; i++) {
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 100, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const beam = new THREE.Mesh(geometry, material);

            beam.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                Math.random() * 100
            );

            // ビームを z 軸に沿って配置
            beam.rotation.x = Math.PI / 2;

            this.lightBeams.add(beam);
        }

        this.scene.add(this.lightBeams);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.frame++;
        if (this.isAnimating) {
            this.animateParticles();
            this.animateLightBeams();

            // カメラの揺れ（疾走感の強調）
            this.camera.position.x = Math.sin(this.frame * 0.02) * 2;
            this.camera.position.y = Math.cos(this.frame * 0.02) * 2;
        }

        this.renderer.render(this.scene, this.camera);
    }

    animateParticles() {
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;

        for (let i = 0; i < this.particleCount * 3; i += 3) {
            // パーティクルの移動（疾走感の演出）
            positions[i + 2] -= 0.3;

            // 画面外に出たパーティクルを再配置
            if (positions[i + 2] < -50) {
                positions[i + 2] = 50;
                positions[i] = (Math.random() - 0.5) * 100;
                positions[i + 1] = (Math.random() - 0.5) * 100;
            }

            // 色の変化（メリハリの演出）
            const t = (Math.sin(this.frame * 0.01 + i * 0.1) + 1) / 2;
            colors[i] = t;
            colors[i + 1] = 1 - t;
            colors[i + 2] = 0.5;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
    }

    animateLightBeams() {
        this.lightBeams.children.forEach((beam, index) => {
            // ビームの移動（パーティクルと同じ方向）
            beam.position.z -= 0.3;

            // 画面外に出たビームを再配置
            if (beam.position.z < -50) {
                beam.position.set(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    50
                );
            }

            // ビームの不透明度を変化させる
            beam.material.opacity = 0.3 + 0.2 * Math.sin(this.frame * 0.05 + index);
        });
    }
}
