import {Background} from './background'
import * as THREE from 'three';

const DATETIME_NOT_SET = -1;

// BackgroundFuture class
export class BackgroundRain extends Background {
    constructor() {
        super();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222244);
        this.scene.fog = new THREE.FogExp2(0x222244, 0.005);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 0);
        this.camera.lookAt(0, 0, -20);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.position = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.matrix = new THREE.Matrix4();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.rainDirection = new THREE.Vector3(0, -1, 0.1).normalize();

        this.rainCount = 200;
        this.raindrops = null;
        this.lastBeamTime = 0;
        this.windBeams = [];
        this.maxWindBeams = 5;
        this.ripples = [];

        this.frame = 0;
        this.startTime = DATETIME_NOT_SET;
    }

    draw() {
        // Implementation for drawing rainy background
        console.log('Drawing rainy background');
        window.addEventListener('resize', () => {
            this.onWindowResize()
        });

        const background = document.querySelector("#background");
        background.appendChild(this.renderer.domElement);
        background.classList.add("bg_rain");

        this.createGround();
        this.createRaindrops();
        this.createAmbientLight();
        this.animate();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5;
        this.scene.add(ground);
    }


    createRaindrop() {
        const points = [];
        for (let i = 0; i <= 1; i += 0.01) {
            const x = 0.04 * Math.pow(1 - i, 2) * Math.sin(Math.PI * i);
            const y = -i * 0.5;
            points.push(new THREE.Vector2(x, y));
        }
        const geometry = new THREE.LatheGeometry(points, 16);
        geometry.translate(0, 0.25, 0);
        return geometry;
    }

    createRaindrops() {
        const raindropGeometry = this.createRaindrop();
        const rainMaterial = new THREE.MeshPhongMaterial({
            color: 0xaaccff,
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });
        this.raindrops = new THREE.InstancedMesh(raindropGeometry, rainMaterial, this.rainCount);
        this.scene.add(this.raindrops);
    }

    resetRaindrop(index) {
        this.position.set(
            Math.random() * 60 - 30,
            Math.random() * 20 + 10,
            Math.random() * 60 - 70
        );
        this.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.rainDirection);
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.raindrops.setMatrixAt(index, this.matrix);
    }

    resetRaindrops() {
        for (let i = 0; i < this.rainCount; i++) {
            this.resetRaindrop(i);
        }
    }

    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.frame++;
        if (this.isAnimating) {
            let elapsedTime = 0;
            if (this.startTime !== DATETIME_NOT_SET) {
                elapsedTime = Date.now() - this.startTime;
            }

            this.animateRaindrops();
            this.animateWindBeams(elapsedTime);

            this.renderer.render(this.scene, this.camera);
        }

    }

    animateRaindrops() {
        this.raindrops.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < this.rainCount; i++) {
            this.raindrops.getMatrixAt(i, this.matrix);
            this.matrix.decompose(this.position, this.quaternion, this.scale);
            this.position.y += this.rainDirection.y * (0.3 + Math.random() * 0.1);
            this.position.z += this.rainDirection.z * (0.3 + Math.random() * 0.1);

            if (this.position.y < -5) {
                this.resetRaindrop(i);
                if (Math.random() < 0.2) { // 波紋生成確率を上げる
                    this.ripples.push(new Ripple(this.position.x, this.position.z, this.scene));
                }
            }

            this.matrix.compose(this.position, this.quaternion, this.scale);
            this.raindrops.setMatrixAt(i, this.matrix);
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            if (this.ripples[i].update()) {
                this.scene.remove(this.ripples[i].mesh);
                this.ripples.splice(i, 1);
            }
        }
    }

    animateWindBeams(elapsedTime) {
        if (elapsedTime - this.lastBeamTime > 0.5 + Math.random()) {
            if (this.windBeams.length < this.maxWindBeams) {
                this.windBeams.push(new WindBeam(this.scene));
            }
            this.lastBeamTime = Date.now();
        }

        for (let i = this.windBeams.length - 1; i >= 0; i--) {
            if (this.windBeams[i].update(Date.now())) {
                this.scene.remove(this.windBeams[i].mesh);
                this.windBeams.splice(i, 1);
            }
        }
    }

    beatAnimation() {
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

class WindBeam {
    constructor(scene) {
        const curvePoints = [];
        for (let i = 0; i < 10; i++) {
            curvePoints.push(new THREE.Vector3(0, 0, i * 10 - 100));
        }
        this.curve = new THREE.CatmullRomCurve3(curvePoints);
        this.geometry = new THREE.TubeGeometry(this.curve, 100, 0.1, 8, false);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x00ffa0,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(Math.random() * 60 - 30, Math.random() * 10 - 5, 0);
        this.speed = Math.random() * 0.2 + 0.1;
        this.waveSpeed = Math.random() * 0.05 + 0.02;
        this.waveAmplitude = Math.random() * 5 + 2;
        scene.add(this.mesh);
    }

    update(time) {
        this.mesh.position.z += this.speed;
        for (let i = 0; i < this.curve.points.length; i++) {
            const t = (time * this.waveSpeed + i / this.curve.points.length) % 1;
            this.curve.points[i].x = Math.sin(t * Math.PI * 2) * this.waveAmplitude;
        }
        this.geometry.dispose();
        this.geometry = new THREE.TubeGeometry(this.curve, 100, 0.1, 8, false);
        this.mesh.geometry = this.geometry;

        if (this.mesh.position.z > 30) {
            return true;
        }
        return false;
    }
}


// 波紋エフェクトの設定を変更
class Ripple {
    constructor(x, z, scene) {
        const geometry = new THREE.CircleGeometry(0.1, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x3399ff,
            transparent: true,
            opacity: 0.7
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, -4.9, z);
        this.mesh.rotation.x = -Math.PI / 2;
        this.scale = 0.1;
        this.opacity = 0.7;
        this.growthRate = 0.05; // 成長速度を遅くする
        this.maxScale = 10; // 最大サイズを大きくする
        scene.add(this.mesh);
    }

    update() {
        if (this.scale < this.maxScale) {
            this.scale += this.growthRate;
            this.opacity = 0.7 * (1 - this.scale / this.maxScale);
            this.mesh.scale.set(this.scale, this.scale, 1);
            this.mesh.material.opacity = this.opacity;
        } else {
            return true; // 削除のフラグ
        }
        return false;
    }
}