import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';


const container = document.getElementById('scene2');

//postavljanje scene, kamere i rendera
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias: true, stencil: true});

container.appendChild(renderer.domElement);

renderer.setSize(container.clientWidth, container.clientHeight);

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

let curves = [];

//geometrija stošca (radijus 1, visina 2, 32 segmenta)
const coneRadius = 1;
const coneHeight = 2;
const geometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
geometry.computeBoundingSphere();

//materijal stošca koji koristi vertex boje
const materialM = new THREE.MeshBasicMaterial({ 
    stencilWrite: false, 
    stencilFunc: THREE.EqualStencilFunc, 
    stencilRef: 1,
    transparent: true,
    opacity: 0.4,
    color: 0xffffff 
});

const materialW = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    wireframe: true 
});

//kreiramo stožac
const cone1w = new THREE.Mesh(geometry, materialW);
const cone1m = new THREE.Mesh(geometry, materialM);
const cone1 = new THREE.Group();
cone1.add(cone1m);
cone1.add(cone1w);

const cone2w = new THREE.Mesh(geometry, materialW);
const cone2m = new THREE.Mesh(geometry, materialM);
const cone2 = new THREE.Group();
cone2.add(cone2m);
cone2.add(cone2w);
cone2.position.y = geometry.parameters.height;
cone2.scale.y = -1;

const group = new THREE.Group();
group.position.y -= 1; //pomakni grupu 2 jedinice prema dolje

group.add(cone1);
group.add(cone2);

//dodajemo stožac u scenu
scene.add(group);

//dohvati world pozicije
cone1.updateMatrixWorld();
cone2.updateMatrixWorld();

const cone1Position = new THREE.Vector3();
const cone2Position = new THREE.Vector3();

cone1.getWorldPosition(cone1Position);
cone2.getWorldPosition(cone2Position);

console.log("Pozicija cone1:", cone1Position);
console.log("Pozicija cone2:", cone2Position);

/*function getConnectionPoint() {
    const midPoint = new THREE.Vector3();
    midPoint.addVectors(cone1Position, cone2Position).multiplyScalar(0.5);
    
    return midPoint;
}

console.log("pozicija spojne točke 2 stošca: ", getConnectionPoint());

// Funkcija za crtanje spojne točke
function drawConnectionPoint() {
    // Stvori sferu za vizualizaciju
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    
    // Postavi na spojnu točku
    sphere.position.copy(getConnectionPoint());
    
    // Oznaci da znamo što je ovo
    sphere.name = "connectionPoint";
    
    // Dodaj u scenu
    scene.add(sphere);
    
    return sphere; // Vrati referencu ako želiš upravljati njome kasnije
}

// I odmah pozovi da se nacrta
drawConnectionPoint();*/ //ovo mi ne treba(OMNT)

// 1️⃣ Kreiranje ravnine (početna pozicija ispod stošca)
const planeGeometry = new THREE.PlaneGeometry(5, 5);
const planeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    side: THREE.DoubleSide, 
    transparent: true, 
    opacity: 0.75,  
    stencilWrite: true,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilRef: 1,
    stencilZPass: THREE.ReplaceStencilOp
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, -1.5, 0); // Postavi ravninu ispod stošca
plane.rotation.x = Math.PI / 2;

// Normalna strelica
//let arrowHelper = null;

const group2 = new THREE.Group();
group2.add(group);
group2.add(plane);

scene.add(group2);

plane.updateMatrixWorld();

const planePosition = new THREE.Vector3();

plane.getWorldPosition(planePosition);

console.log("Pozicija plane:", planePosition);

function getPlaneEquation() {
    plane.updateMatrixWorld(true);

    // 1. Dobij world poziciju (točku na ravnini)
    const origin = new THREE.Vector3();
    plane.getWorldPosition(origin);
    
    // 2. Dobij world normalu
    const normal = new THREE.Vector3(0, 0, 1);

    /*const normalArrow = new THREE.ArrowHelper(
       normal.clone().normalize(), // smjer
       origin,                          // početna točka
       1,                               // duljina strelice
       0xff0000,                        // boja (crvena)
       0.2,                             // duljina vrha strelice
       0.1                              // širina vrha strelice
    );

// 4️⃣ Dodamo strelicu kao dijete ravnine
    plane.add(normalArrow);*/
    normal.applyQuaternion(plane.quaternion); // Rotiraj normalu s rotacijom ravnine
    normal.normalize();
    
    // 3. Izračunaj D (constant) za jednadžbu ravnine Ax + By + Cz + D = 0
    // Formula: D = -(Ax₀ + By₀ + Cz₀) gdje je (x₀, y₀, z₀) točka na ravnini
    const D = -(normal.x * origin.x + normal.y * origin.y + normal.z * origin.z);

    return {
        A: normal.x,
        B: normal.y,
        C: normal.z,
        D: D,
        origin,
        normal,
        toString: function() {
            const signD = D >= 0 ? '+' : '-';
            return `${this.A.toFixed(3)}x ${this.B >= 0 ? '+' : '-'} ${Math.abs(this.B).toFixed(3)}y ${this.C >= 0 ? '+' : '-'} ${Math.abs(this.C).toFixed(3)}z ${signD} ${Math.abs(D).toFixed(3)} = 0`;
        }
    }
    
}

const equation = getPlaneEquation();

console.log("A: ", equation.A);
console.log("B: ", equation.B);
console.log("C: ", equation.C);
console.log("D: ", equation.D);

function getDoubleConeEquation() { //vrati "jednadžbe" za x, y i z 
    const height = cone1.children[1].geometry.parameters.height;
    const radius = cone1.children[1].geometry.parameters.radius;

    //nagib stošca
    const k = radius/height; //tg(alfa)

    console.log("height: ", height);
    console.log("radius: ", radius);
    console.log("k: ", k);

    //k = 0.5, a k^2 = 0.25

    //jednadžba stošca -> x^2 + z^2 = k*y^2 = x^2 + z^2 = 0.25*y^2

    //jednadžba ravnine -> Ax + By + Cz + D = 0 -> z = -(Ax + By + D)/C
    
    return k;

}

//treba mi funkcija za crtanje koja dobiva jednadžbe od x, y i z i s 
// for petljom crtam točke koje onda crtaju krivulju
//možda da imam funkciju za stvaranje točaka i spremanje u polje 
// i funkcija koja crta pomoću točaka spremljenih u to polje
let curveColor = 0x0000ff;

function createPoints(k) {
    const points = [];
    const planeEquation = getPlaneEquation();
    
    const A = planeEquation.A;
    const B = planeEquation.B;
    const C = planeEquation.C;
    const D = planeEquation.D;

    console.log("Jednadžba ravnine je ...")
    console.log("A: ", A);
    console.log("B: ", B);
    console.log("C: ", C);
    console.log("D: ", D);
    console.log("\nDebug vrijednosti:");
    for (let testPhi = 0; testPhi <= Math.PI*2; testPhi += Math.PI/2) {
        const denominator = A * k * Math.cos(testPhi) + C * k * Math.sin(testPhi) + B;
        console.log(`Phi=${testPhi.toFixed(2)}: denominator=${denominator.toFixed(4)}`);
    }

    for (let phi = 0; phi <= 2 * Math.PI; phi += 0.02) {
        const denom = A * k * Math.cos(phi) + B + C * k * Math.sin(phi);
        if (Math.abs(denom) < 1e-6) continue; 

        const y = -D / denom;
        const x = k * y * Math.cos(phi);
        const z = k * y * Math.sin(phi);

        const worldPoint = new THREE.Vector3(x, y, z);
        const localPoint = plane.worldToLocal(worldPoint.clone()); 

        points.push(localPoint);
    }
    console.log("points: ", points);

    if (points.length > 0) {
        points.push(points[0].clone());
    }

    createCurveFromPoints(points, curveColor);
}

function createCurveFromPoints(points, color) {
    removeExistingCurves();
    console.log(points)
    const curveGeometry = new LineGeometry().setFromPoints(points);
    
    const curveMaterial = new LineMaterial({ 
        color: color,
        linewidth: 2.5,
        transparent: false
    });

    curveMaterial.resolution.set(
        container.clientWidth,
        container.clientHeight
    );
    
    const curve = new Line2(curveGeometry, curveMaterial);
    curve.computeLineDistances();
  
    plane.add(curve);
    curves.push(curve);
    
    console.log("Krivulja dodana kao dijete ravnine");
    console.log("Broj točaka:", points.length);
    console.log("Prva točka (lokalno na ravnini):", points[0]);
    
    /*// Dodaj i točku u sredini ravnine za referencu
    const centerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    // Centar ravnine je u (0,0,0) lokalno
    centerSphere.position.set(0, 0, 0);
    plane.add(centerSphere);
    curves.push(centerSphere);*/
}

// Uklanjanje postojećih krivulja
function removeExistingCurves() {
    // Uklanjanje svih linija i točaka iz scene
    curves.forEach(curve => {
        // Krivulja je sada dijete ravnine
        if (curve.parent) {
            curve.parent.remove(curve);
        }
        if (curve.geometry) curve.geometry.dispose();
        if (curve.material) curve.material.dispose();
    });
    
    curves = [];
}

//pretvaranje vrijednosti slidera kako sam definirala u kuteve(radijani)
function calcAngle(t) {
    console.log("U funkciji calcAngle sam!!!");
    console.log("t: ", t);
    if((Math.abs(t) >= 0.52 && Math.abs(t) <= 1)) {
        console.log("HIPERBOLA");
        curveColor = 0xf72585;
        //hiperbola
        if(t < 0) { //za slučaj (t => -1 && t <= -0.52)
            //kut od 63.435° do 90° ali isključujući 63.435°
            const angleRad = Math.PI/2 - (Math.PI/2 - Math.atan(2)) * ((t+1)/(1 - 0.52));
            return angleRad;
            //console.log(Math.PI/2) 
        } else { //za slučaj (t => 0.52 && t <= 1)
            //kut od -90° do -63.435° ali isključujući -63.435° 
            const angleRad =  Math.atan(2) - (Math.atan(2) - Math.PI/2) * ((t-0.52)/(1 - 0.52));
            return angleRad;
        }
    } else if((Math.abs(t) == 0.5)) {
        console.log("PARABOLA");
        curveColor = 0xff9100;
        //parabola
        if(t < 0) { //za slučaj (t == -0.5)
            const angleRad = -Math.atan(2);
            console.log("angleRad: ", angleRad);
            return angleRad;        
        } else { //za slučaj (t == 0.5)
            const angleRad = Math.atan(2);
            console.log("angleRad: ", angleRad);
            return angleRad;
        }
    } else if((Math.abs(t) >= 0.02 && Math.abs(t) <= 0.48)) {
        console.log("ELIPSA");
        curveColor = 0xff00ff;
        //elipsa
        if(t < 0) { //za slučaj (t => -0.48 && t <= -0.02)
            //kut od 0° do 63.435° ali isključujući 0°      
            const angleRad = Math.atan(2) - (Math.atan(2) - 0) * ((t+0.48)/(0.48 - 0.02));
            return angleRad;   
        } else { //za slučaj ((t => 0.02 && t <= 0.48)
            //kut od -63.435° do 0° ali isključujući 0°
            const angleRad =  0 - (0 - Math.atan(2)) * ((t-0.02)/(0.48 - 0.02));
            return angleRad;
        }
    } else if(t == 0) {
        curveColor = 0x0000ff;
        console.log("KRUŽNICA");
        //kružnica
        const angleRad = 0;
        console.log("angleRad: ", angleRad);
        return angleRad;
    } else {
        console.log("PROBLEM!!!!!!")
    }
}


//const res = kanonskiOblikElipse(5, 5, 4, 2, -6, -3);
//console.log(res);

//const res2 = kanonskiOblikElipse(2, 3, 0, 8, 12, 16);
//console.log(res2);

// Pozovi funkciju nakon svake promjene ravnine
function updatePlane() {
    //checkSimple();
    const k = getDoubleConeEquation();
    console.log("k: ", k);

    createPoints(k);
}

// Dohvati slidere
const sliderY = document.getElementById("sliderY");
const sliderX = document.getElementById("sliderX");
const sliderRotation = document.getElementById("sliderRotation");

// Postavljamo kameru
camera.position.z = 5;

// Varijable za rotaciju stošca
const ROTATE_KEY = "r";
const STOP_KEY = "s";
let isKeyDown = false;
let lastX = 0;
let lastY = 0;

// Event za početak draganja miša
window.addEventListener('keydown', (e) => {
    if (e.key === ROTATE_KEY) {
        isKeyDown = true;
        lastX = 0;
        lastY = 0;
    } else if(e.key === STOP_KEY) {
        isKeyDown = false;
    }
});

// Event za završetak draganja miša
/*window.addEventListener('keyup', (e) => {
    if (e.key === ROTATE_KEY) {
        isKeyDown = false;
    }
});*/

// Event za kretanje miša
window.addEventListener('mousemove', (e) => {
    if (isKeyDown) {
        if (lastX === 0 && lastY === 0) { 
            // Postavi početne vrijednosti kada prvi put pomakneš miš
            lastX = e.clientX;
            lastY = e.clientY;
            return;
        }
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        // Rotacija stošca prema pomicanju miša
        /*group2.rotation.x += deltaY * 0.01;
        group2.rotation.y += deltaX * 0.01;
        group2.rotation.z += (deltaY+deltaX)/2 * 0.01;*/

        // Normalizirani vektori za rotaciju kamere
        const axisY = new THREE.Vector3(0, 1, 0); // vertikalna rotacija
        const axisX = new THREE.Vector3(1, 0, 0); // horizontalna rotacija

        // Rotiraj kameru oko centra scene (0,0,0)
        camera.position.applyAxisAngle(axisY, deltaX * 0.01);
        camera.position.applyAxisAngle(axisX, deltaY * 0.01);

        // Kamera uvijek gleda prema centru scene
        camera.lookAt(scene.position);
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

// Event listeneri za promjenu vrijednosti slidera
sliderY.addEventListener("input", () => {
    //plane.position.y = calcAngle(parseFloat(sliderY.value));
    plane.position.y = parseFloat(sliderY.value);
    
    updatePlane();
});

sliderX.addEventListener("input", () => {
    plane.position.x = parseFloat(sliderX.value);
    updatePlane();
});

sliderRotation.addEventListener("input", () => {
    //plane.rotation.y = parseFloat(sliderRotation.value) * Math.PI; // Pretvori u radijane
    plane.rotation.y = calcAngle(parseFloat(sliderRotation.value));
    updatePlane();
});

// Inicijalno ažuriranje
updatePlane();

// Animacija renderiranja
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Ažuriramo veličinu rendera ako se prozor promijeni
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});