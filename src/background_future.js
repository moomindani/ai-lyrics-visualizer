import {Background} from './background'
import * as THREE from 'three';


// BackgroundFuture class
export class BackgroundFuture extends Background {

    constructor() {
        super();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.particles;
        this.lightBeams = new THREE.Group();
        this.flares = new THREE.Group();
        this.particleCount = 500;
        this.beamCount = 20;
        this.maxFlares = 50;
        this.frame = 0;

        const textureLoader = new THREE.TextureLoader();
        this.textureFlare = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
    }

    draw() {
        // Implementation for drawing future background
        console.log('Drawing future background');
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.camera.position.z = 50;

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
        for (let i = 0; i < this.beamCount; i++) {
            const beam = this.createLightBeam();
            this.lightBeams.add(beam);
        }

        this.scene.add(this.lightBeams);
    }

    createLightBeam() {
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

        // ビームの生存期間を設定
        beam.userData.lifetime = 100;

        return beam;
    }

    createFlares() {
        // 初期フレアの作成
        for (let i = 0; i < this.maxFlares; i++) {
            const flare = this.createFlare(this.textureFlare);
            this.flares.add(flare);
        }
        this.scene.add(this.flares);
    }

    createFlare(texture) {
        // シェーダーマテリアルの作成
        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: {value: texture},
                color: {value: new THREE.Color(1, 1, 0.8)}, // 黄白色
                opacity: {value: 0}
            },
            vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
            fragmentShader: `
                    uniform sampler2D map;
                    uniform vec3 color;
                    uniform float opacity;
                    varying vec2 vUv;
                    void main() {
                        vec4 texColor = texture2D(map, vUv);
                        float brightness = (texColor.r + texColor.g + texColor.b) / 3.0;
                        gl_FragColor = vec4(color, 1.0) * vec4(brightness, brightness, brightness, brightness * opacity);
                    }
                `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const flare = new THREE.Sprite(material);

        // ランダムな位置の設定
        flare.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            Math.random() * 10 + 30
        );

        // フレアのサイズを画面の1/5程度に設定
        const screenSize = Math.min(window.innerWidth, window.innerHeight);
        const flareSize = screenSize / 5 * (Math.random() * 0.5 + 0.75);
        flare.scale.set(flareSize / 100, flareSize / 100, 1);

        // アニメーションのための追加プロパティ
        flare.userData = {
            maxOpacity: Math.random() * 0.5 + 0.5,
            fadeInSpeed: (Math.random() * 0.05 + 0.02) * 10,
            fadeOutSpeed: (Math.random() * 0.03 + 0.01) * 10,
            state: 'fadeIn'
        };

        return flare;
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.frame++;
        if (this.isAnimating) {
            this.animateParticles();
            this.animateLightBeams();
            this.animateFlares();

            // カメラの揺れ（疾走感の強調）
            // this.camera.position.x = Math.sin(this.frame * 0.02) * 2;
            // this.camera.position.y = Math.cos(this.frame * 0.02) * 2;
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

    beatAnimation() {
        console.log('Animating with beats');
        if (this.isAnimating) {
            // ビームを追加
            let beamPlus = 2;

            // サビならものすごく追加
            if (this.isChorus) {
                beamPlus = 100;
            }
            this.beamCount += beamPlus;
            for (let i = 0; i < beamPlus; i++) {
                const beam = this.createLightBeam();
                this.lightBeams.add(beam);
            }

            console.log("Beam count:" + this.lightBeams.children.length);

            // ビームの不透明度を変化させる
            this.lightBeams.children.forEach((beam, index) => {
                beam.material.opacity = 0.3 + 0.2 * Math.sin(this.frame * 0.05 + index);
            });
            this.renderer.render(this.scene, this.camera);
        }
    }

    preChorusAnimation() {
        console.log('Animating before chorus');
        if (this.isAnimating) {
            this.createFlares();
        }
    }

    postChorusAnimation() {
        console.log('Animating after chorus');
        this.removeAllFlares();
    }

    animateLightBeams() {
        // 削除する光線を格納する配列
        const beamsToRemove = [];

        this.lightBeams.children.forEach((beam, index) => {
            // ビームの移動（パーティクルと同じ方向）
            beam.position.z -= 0.3;

            // 画面外に出たビームを削除
            if (beam.position.z < -50) {
                beamsToRemove.push(beam);
            }

            if (beam.userData.lifetime !== undefined) {
                beam.userData.lifetime -= 1;
                if (beam.userData.lifetime <= 0) {
                    beamsToRemove.push(beam);
                }
            }
        });

        // マークされた光線を削除
        beamsToRemove.forEach(beam => {
            this.removeLightBeam(beam);
        });
    }

    // 特定の光線を削除するメソッド
    removeLightBeam(beam) {
        this.lightBeams.remove(beam);
        // メモリリークを防ぐためにジオメトリとマテリアルを破棄
        beam.geometry.dispose();
        beam.material.dispose();
    }

    animateFlares() {
        // フレアのアニメーション
        this.flares.children.forEach((flare, index) => {
            if (flare.userData.state === 'fadeIn') {
                flare.material.uniforms.opacity.value += flare.userData.fadeInSpeed;
                if (flare.material.uniforms.opacity.value >= flare.userData.maxOpacity) {
                    flare.userData.state = 'fadeOut';
                }
            } else { // fadeOut
                flare.material.uniforms.opacity.value -= flare.userData.fadeOutSpeed;
                if (flare.material.uniforms.opacity.value <= 0) {
                    this.flares.remove(flare);

                    // サビ中でなければ再利用
                    if (!this.isChorus) {
                        const newFlare = this.createFlare(flare.material.uniforms.map.value);
                        this.flares.add(newFlare);
                    }
                }
            }
        });
    }

    removeAllFlares() {
        // フレアを徐々にフェードアウトさせる
        this.flares.children.forEach((flare) => {
            flare.userData.state = 'fadeOut';
            flare.userData.fadeOutSpeed *= 2; // フェードアウトを速める
        });

        // 完全に透明になったフレアを削除
        this.flares.children = this.flares.children.filter((flare) => {
            if (flare.material.uniforms.opacity.value <= 0) {
                flare.material.dispose();
                return false; // このフレアを削除
            }
            return true; // このフレアを保持
        });

        // すべてのフレアが消えたら、flares グループを空にする
        if (this.flares.children.length === 0) {
            this.flares.clear();
        }
    }
}
