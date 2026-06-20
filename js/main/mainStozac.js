import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

let scene, camera, renderer, group, group2, cone1w, cone1m, cone1, cone2w, cone2m, cone2;
let mouse, curves = [], meshes = [], coneRadius = 1, coneHeight = 2, coneSegments = 32, plane, planePosition;
let cone1Position, cone2Position, normal, origin, curveColor, isHyperbola, worldPoint, worldPoint1, worldPoint2;
let curve, curve1, curve2, fillMesh, fillMesh1, fillMesh2, shape, shape1, shape2, materialM, materialW;
let mouseDown, mouseUp, mouseMove, inputX, inputY, inputRotation, inputCone, windowResize;
let planeC, circleC, ellipseC, parabolaC, hyperbolaC;
let inputCPlane, inputCCircle, inputCEllipse, inputCParabola, inputCHyperbola;
let animationId;

export function setBackgroundColorS(color) {
    if (scene) {
        scene.background = new THREE.Color(color);
    }
}

export function setConeColor(color) {
    /*if (materialM) {
        materialM.color.setHex(color);
        console.log("Boja kocke promijenjena u:", color.toString(16));
    } else {
        console.warn("cubeMaterial još nije inicijaliziran");
    }*/
    if (materialW) {
        materialW.color.setHex(color);
        console.log("Boja kocke promijenjena u:", color.toString(16));
    } else {
        console.warn("cubeMaterial još nije inicijaliziran");
    }
}

export async function init(containerId = 'scene2') {

    const container = document.getElementById(containerId);

    if (!container) {
        console.error("Container nije pronađen:", containerId);
        return;
    }

    // Očisti container ako već ima sadržaj
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    //postavljanje scene, kamere i rendera
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({antialias: true, stencil: true});

    container.appendChild(renderer.domElement);

    renderer.setSize(container.clientWidth, container.clientHeight);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

    //geometrija stošca (radijus 1, visina 2, 32 segmenta) -> globalne varijable
    coneRadius = 1;
    coneHeight = 2;
    coneSegments = 32;
    let geometry = new THREE.ConeGeometry(coneRadius, coneHeight, coneSegments);
    geometry.computeBoundingSphere();

    //materijal stošca koji koristi vertex boje
    materialM = new THREE.MeshBasicMaterial({ 
        stencilWrite: false, 
        stencilFunc: THREE.EqualStencilFunc, 
        stencilRef: 1,
        transparent: true,
        opacity: 0.6,
        color: 0xffffff 
    });

    materialW = new THREE.MeshBasicMaterial({ 
        color: 0xfefefe,
        wireframe: true 
    });

    //kreiramo stožac
    cone1w = new THREE.Mesh(geometry, materialW);
    cone1m = new THREE.Mesh(geometry, materialM);
    cone1 = new THREE.Group();
    cone1.add(cone1w);
    cone1.add(cone1m);

    cone2w = new THREE.Mesh(geometry, materialW);
    cone2m = new THREE.Mesh(geometry, materialM);
    cone2 = new THREE.Group();
    cone2.add(cone2m);
    cone2.add(cone2w);
    cone2.position.y = geometry.parameters.height;
    cone2.scale.y = -1;

    group = new THREE.Group();
    group.position.y -= coneHeight/2; //pomakni grupu 2 jedinice prema dolje

    group.add(cone1);
    group.add(cone2);

    //dodajemo stožac u scenu
    scene.add(group);

    //dohvati world pozicije
    cone1.updateMatrixWorld();
    cone2.updateMatrixWorld();

    cone1Position = new THREE.Vector3();
    cone2Position = new THREE.Vector3();

    cone1.getWorldPosition(cone1Position);
    cone2.getWorldPosition(cone2Position);

    //console.log("Pozicija cone1:", cone1Position);
    //console.log("Pozicija cone2:", cone2Position);

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
    //sve boje ravnina i krivulja
    planeC = 0x00ff00;
    circleC = 0x0000ff;
    ellipseC = 0xff00ff;
    parabolaC = 0xff9100;
    hyperbolaC = 0xf72585; //zamjeni di koristim te boje s varijablama

    // 1️⃣ Kreiranje ravnine (početna pozicija ispod stošca)
    const planeGeometry = new THREE.PlaneGeometry(8, 8);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
        color: planeC,
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.75,  
        stencilWrite: true,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilRef: 1,
        stencilZPass: THREE.ReplaceStencilOp
    });

    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -0.49 * coneHeight, 0); //postavi ravninu kod donjeg stošca
    plane.rotation.x = Math.PI / 2;

    // Normalna strelica
    //let arrowHelper = null;

    group2 = new THREE.Group();
    group2.add(group);
    group2.add(plane);

    scene.add(group2);

    plane.updateMatrixWorld();

    planePosition = new THREE.Vector3();

    plane.getWorldPosition(planePosition);

    let curveMaterial = new LineMaterial({ 
        color: curveColor,
        linewidth: 4, //debljina krivulje
        transparent: false
    });

    let fillMaterial = new THREE.MeshBasicMaterial({
        color: curveColor,
        side: THREE.DoubleSide
    });

    //console.log("Pozicija plane:", planePosition);

    function getPlaneEquation() {
        plane.updateMatrixWorld(true);

        // 1. Dobij world poziciju (točku na ravnini)
        origin = new THREE.Vector3();
        plane.getWorldPosition(origin);
        
        // 2. Dobij world normalu
        normal = new THREE.Vector3(0, 0, 1);

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

    //console.log("A: ", equation.A);
    //console.log("B: ", equation.B);
    //console.log("C: ", equation.C);
    //console.log("D: ", equation.D);

    function getDoubleConeEquation() { //vrati "jednadžbe" za x, y i z 
        const height = cone1.children[1].geometry.parameters.height;
        const radius = cone1.children[1].geometry.parameters.radius;

        //nagib stošca
        const k = radius/height; //tg(alfa)

        //console.log("height: ", height);
        //console.log("radius: ", radius);
        //console.log("k: ", k);

        //k = 0.5, a k^2 = 0.25

        //jednadžba stošca -> x^2 + z^2 = k*y^2 = x^2 + z^2 = 0.25*y^2

        //jednadžba ravnine -> Ax + By + Cz + D = 0 -> z = -(Ax + By + D)/C
        
        return k;

    }

    //treba mi funkcija za crtanje koja dobiva jednadžbe od x, y i z i s 
    // for petljom crtam točke koje onda crtaju krivulju
    //možda da imam funkciju za stvaranje točaka i spremanje u polje 
    // i funkcija koja crta pomoću točaka spremljenih u to polje
    curveColor = 0x0000ff;

    isHyperbola = false;

    function createPoints(k) {
        const points = [];
        let line1 = [];
        let line2 = [];
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
        //console.log("\nDebug vrijednosti:");

        isHyperbola = (Math.abs(sliderRotation.value) >= 0.52 && Math.abs(sliderRotation.value) <= 1) ? true : false;

        /*for (let testPhi = 0; testPhi <= Math.PI*2; testPhi += Math.PI/2) {
            const denominator = A * k * Math.cos(testPhi) + C * k * Math.sin(testPhi) + B;
            console.log(`Phi=${testPhi.toFixed(2)}: denominator=${denominator.toFixed(4)}`);
        }*/

        for (let phi = 0; phi <= 2 * Math.PI; phi += 0.002) {
            const denom = A * k * Math.cos(phi) + B + C * k * Math.sin(phi);
            if (Math.abs(denom) < 1e-8) continue; 

            const y = -D / denom;
            const x = k * y * Math.cos(phi);
            const z = k * y * Math.sin(phi);

            if(y >= -coneHeight && y <= coneHeight) {   //onemogućava čudno ponašanje parabole, ali provjeri zašto ponekad linija ide ispod ruba stošca umjesto od ruba stošca
                worldPoint = new THREE.Vector3(x, y, z);
                //if(Math.abs(y) > 1.8) {console.log("world: ", worldPoint);}
                
                const localPoint = plane.worldToLocal(worldPoint.clone()); 
                //console.log("local: ", localPoint);

                if(isHyperbola) {
                    if(denom > 0) {
                        line1.push(localPoint);
                    } else {
                        line2.push(localPoint);
                    }
                } else {
                    points.push(localPoint);
                } 
            }       
        }

        /*if(isHyperbola) {
            //TEST!!!
            let {localPoint1, localPoint2, localPoint3, localPoint4} = clacEndPoints(A, B, C, D, k);
            if(localPoint1 && localPoint2) {
                line1.push(localPoint1);
                line1.push(localPoint2);
            }

            if(localPoint3 && localPoint4) {
                line2.push(localPoint3);
                line2.push(localPoint4);
            }
        }*/

        //ovaj dio je za hiperbolu kad na 1 ili 2 djela sjeće ravnina stožac
        if(line1.length > 0 && line2.length > 0) {
            points.push(line1, line2);
        } else if(line1.length > 0 && !line2.length > 0) {
            points.push(line1);
        } else if(!line1.length > 0 && line2.length > 0) {
            points.push(line2);
        }

        //ovaj dio za ostale krivulje
        if (points.length > 0 && (!line1.length > 0 && !line2.length > 0)) {
            points.push(points[0].clone());
        }

        //console.log("line1: ", line1);
        //console.log("line2: ", line2);

        //line1 = [];
        //line2 = [];

        const type = curveType(k);
        if(type == "K") {
            curveColor = circleC;
        } else if(type == "E") {
            curveColor = ellipseC;
        } else if(type == "P") {
            curveColor = parabolaC;
        } else if(type == "H") {
            curveColor = hyperbolaC;
        }

        createCurveFromPoints(points, curveColor);
    }

    function createCurveFromPoints(points, color) {
        removeExistingCurves();
        //console.log("curves 1: ", curves);
        removeExistingMesh();
        //console.log("points from points: ", points);
        
        curveMaterial = new LineMaterial({ 
            color: color,
            linewidth: 4, //debljina krivulje
            transparent: false
        });

        curveMaterial.resolution.set(
            container.clientWidth,
            container.clientHeight
        );

        //prije postavljanja curvegeometry provjery dal mi je krivulja hiperbola ili ne
        //ako je razdvoji tako da crtam 2 krivulje umjesto 1 i obje dodaj u curves inače radi ko i do sad
        if(isHyperbola) {
            const pointslength = points[0].length;
            //console.log("***HIPERBOLA***");
            
            const points1 = points.pop().sort((a, b) => a.y - b.y);
            points1.push(points1[0].clone());

            //console.log("points1: ", points1);

            const curveGeometry1 = new LineGeometry().setFromPoints(points1);

            curve1 = new Line2(curveGeometry1, curveMaterial);

            curve1.computeLineDistances();

            plane.add(curve1);
            curves.push(curve1);

            //console.log("points1 len: ", points1.length)
            //console.log("points len: ", pointslength)

            //console.log("jesu mi iste 1. i zadnja točka kod points1: ", points1[0], points1[points1.length - 1]);
            //pretvori sve točke iz vector3 u vector2

            const shapePoints1 = points1.map(p =>
                new THREE.Vector2(p.x, p.y)
            );

            shape1 = new THREE.Shape(shapePoints1);

            const shapeGeometry1 = new THREE.ShapeGeometry(shape1);

            fillMaterial = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            fillMesh1 = new THREE.Mesh(shapeGeometry1, fillMaterial);

            plane.add(fillMesh1);
            meshes.push(fillMesh1);

            if((points1.length -1) != pointslength) {
                const points2 = points.pop().sort((a, b) => a.y - b.y);
                points2.push(points2[0].clone());
                //console.log("points2: ", points2);
            
                const curveGeometry2 = new LineGeometry().setFromPoints(points2);

                curve2 = new Line2(curveGeometry2, curveMaterial);
                
                curve2.computeLineDistances();
                
                plane.add(curve2);
                curves.push(curve2);
                //console.log("jesu mi iste 1. i zadnja točka kod points2: ", points2[0], points2[points2.length - 1]);

                //pretvori sve točke iz vector3 u vector2
                const shapePoints2 = points2.map(p =>
                    new THREE.Vector2(p.x, p.y)
                );

                shape2 = new THREE.Shape(shapePoints2);

                const shapeGeometry2 = new THREE.ShapeGeometry(shape2);

                fillMesh2 = new THREE.Mesh(shapeGeometry2, fillMaterial);

                plane.add(fillMesh2);
                meshes.push(fillMesh2);
            } 
        } else {
            //console.log("points from points else: ", points);
            const curveGeometry = new LineGeometry().setFromPoints(points);
        
            curve = new Line2(curveGeometry, curveMaterial);
            //curve.computeLineDistances();
            plane.add(curve);
        
            curves.push(curve);

            //pretvori sve točke iz vector3 u vector2
            const shapePoints = points.map(p =>
                    new THREE.Vector2(p.x, p.y)
            );

            shape = new THREE.Shape(shapePoints);

            const shapeGeometry = new THREE.ShapeGeometry(shape);

            fillMaterial = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            fillMesh = new THREE.Mesh(shapeGeometry, fillMaterial);

            plane.add(fillMesh);
            meshes.push(fillMesh);
        }
        
        //console.log("Krivulja dodana kao dijete ravnine");
        //console.log("Broj točaka:", points.length);
        //console.log("Prva točka (lokalno na ravnini):", points[0]);
        
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

    // Uklanjanje postojećih krivulja
    function removeExistingMesh() {
        // Uklanjanje svih linija i točaka iz scene
        meshes.forEach(mesh => {
            // Krivulja je sada dijete ravnine
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        
        meshes = [];
    }

    //provjera tipa krivulje
    function curveType(k) {
        //uvrsti jednadžbu ravnine u jednadžbu stošca ili obrnuto da dobim jednadžbu oblika Ax^2 + By^2 + Cx + Dy + Exy + F = 0
        //jednadžba stošca mi je x^2 + z^2 = k^2y^2 
        //jednadžba ravnine mi je A'x + B'y + C'z + D' = 0 -> y = -(A'/B')x -(C'/B')z -(D'/B')
        //x^2 + z^2 = k*(-(A'/B')x -(C'/B')z -(D'/B'))^2
        //x^2 + z^2 = k*((A'/B')^2*x^2 + (C'/B')^2*z^2 + (D'/B')^2 + 2*(A'/B')*(C'/B')*xz + 2*(A'/B')*(D'/B')*x + 2*(C'/B')*(D'/B')*z)
        //(k*(A'/B')^2 - 1)*x^2 + (k*(C'/B')^2 - 1)*z^2 + 2*(A'/B')*(D'/B')*x + 2*(C'/B')*(D'/B')*z + 2*(A'/B')*(C'/B')*xz + (D'/B')^2 = 0
        //A = k*(A'/B')^2 - 1   x^2
        //B = k*(C'/B')^2 - 1   z^2
        //E = 2*(A'/B')*(C'/B') xz
        const planeEquation = getPlaneEquation();
        
        const A_ = planeEquation.A;
        const B_ = planeEquation.B;
        const C_ = planeEquation.C;
        //const D_ = planeEquation.D;
        console.log("A_: ", A_);
        console.log("B_: ", B_);
        console.log("C_: ", C_);

        const A = Math.pow((k), 2)*Math.pow((A_/B_), 2) - 1;
        const B = Math.pow((k), 2)*Math.pow((C_/B_), 2) - 1;
        const C = Math.pow((k), 2)*(A_/B_)*(C_/B_);

        console.log("A: ", A);
        console.log("B: ", B);
        console.log("C: ", C);

        const det = A*B - C*C;
        console.log("det: ", det);

        if(Math.abs(det) < 0.0001) {
            return "P"; //parabola
        } else if(det > 0) {
            if(A == B && Math.abs(C) < 0.0001) {
                return "K" //kružnica
            }
            return "E"; //elipsa
        } else {
            return "H"; //hiperbola
        }
    }

    //pretvaranje vrijednosti slidera kako sam definirala u kuteve(radijani)
    function calcAngle(t) {
        //console.log("U funkciji calcAngle sam!!!");
        //console.log("t: ", t);
        //t = t/sliderRotation.max;
        let parabolaAngleRad = coneHeight/coneRadius;
        //console.log("parabolaAngleRad: ", parabolaAngleRad)
        let deg = 180/Math.PI;
        console.log("parabola kut: ", (Math.atan(parabolaAngleRad))*deg);
        console.log("t: ", t);
        if((Math.abs(t) > 0.5)) {
            console.log("HIPERBOLA");
            curveColor = hyperbolaC;
            //hiperbola
            if(t < 0) { //za slučaj (t => -1 && t <= -0.52)
                //kut od 63.435° do 90° ali isključujući 63.435°
                const angleRad = -(Math.PI/2 - (Math.PI/2 - Math.atan(parabolaAngleRad)) * ((t+1)/(0.5)));
                console.log("angleRad H -: ", angleRad*deg);
                return angleRad;
                //console.log(Math.PI/2) 
            } else { //za slučaj (t => 0.52 && t <= 1)
                //kut od -90° do -63.435° ali isključujući -63.435° 
                const angleRad =  Math.atan(parabolaAngleRad) - (Math.atan(parabolaAngleRad) - Math.PI/2) * ((t-0.5)/(1 - 0.5));
                console.log("angleRad H +: ", angleRad*deg);
                return angleRad;
            }
        } else if((Math.abs(t) == 0.5)) {
            console.log("PARABOLA");
            curveColor = parabolaC;
            //parabola
            if(t < 0) { //za slučaj (t == -0.5)
                const angleRad = -Math.atan(parabolaAngleRad);
                console.log("angleRad P -: ", angleRad*deg);
                return angleRad;        
            } else { //za slučaj (t == 0.5)
                const angleRad = Math.atan(parabolaAngleRad);
                console.log("angleRad P +: ", angleRad*deg);
                return angleRad;
            }
        } else if((Math.abs(t) <= 0.5 && Math.abs(t) > 0)) {
            console.log("ELIPSA");
            curveColor = ellipseC;
            //elipsa
            if(t < 0) { //za slučaj (t => -0.48 && t <= -0.02)
                //kut od 0° do 63.435° ali isključujući 0°      
                const angleRad = -(Math.atan(parabolaAngleRad) - (Math.atan(parabolaAngleRad) - 0) * ((t+0.5)/(0.5)));
                console.log("angleRad E -: ", angleRad*deg);
                return angleRad;   
            } else { //za slučaj ((t => 0.02 && t <= 0.48)
                //kut od -63.435° do 0° ali isključujući 0°
                const angleRad =  0 - (0 - Math.atan(parabolaAngleRad)) * ((t)/(0.5));
                console.log("angleRad E +: ", angleRad*deg);
                return angleRad;
            }
        } else if(t == 0) {
            curveColor = circleC;
            console.log("KRUŽNICA");
            //kružnica
            const angleRad = 0;
            console.log("angleRad C: ", angleRad*deg);
            return angleRad;
        } else {
            console.log("PROBLEM!!!!!!")
        }
    }

    function updateCone(newRadius, newHeight, newSegmentsNumber) {

        coneRadius = newRadius;
        coneHeight = newHeight;
        coneSegments = Math.pow(2, 4 + newSegmentsNumber);

        //console.log("VISINA: ", coneHeight);
        //console.log("RADIJUS: ", coneRadius);
        console.log("SEGMENTIIII: ", coneSegments);

        // obriši staru geometriju
        geometry.dispose();

        geometry = new THREE.ConeGeometry(coneRadius, coneHeight, coneSegments);

        // postavi novu geometriju na sve mesh-eve
        cone1w.geometry = geometry;
        cone1m.geometry = geometry;
        cone2w.geometry = geometry;
        cone2m.geometry = geometry;

        // popravi pozicije
        cone2.position.y = coneHeight;
        group.position.y = -coneHeight / 2;

        sliderY.min = -coneHeight*0.995;
        sliderY.max = coneHeight*0.995;
        sliderY.step = coneHeight - sliderY.max;

        // ako je trenutna vrijednost van raspona – popravi je
        const current = parseFloat(sliderY.value);

        if (current > coneHeight) sliderY.value = coneHeight;
        if (current < -coneHeight) sliderY.value = -coneHeight;

        plane.rotation.y = calcAngle(parseFloat(sliderRotation.value));

        updatePlane(planeC);
    }

    function updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC) {
        const k = getDoubleConeEquation();
        const type = curveType(k);
        if(type == "K") {
            curveMaterial.color.set(circleC);
            fillMaterial.color.set(circleC);
        } else if(type == "E") {
            curveMaterial.color.set(ellipseC);
            fillMaterial.color.set(ellipseC);
        } else if(type == "P") {
            curveMaterial.color.set(parabolaC);
            fillMaterial.color.set(parabolaC);
        } else if(type == "H") {
            curveMaterial.color.set(hyperbolaC);
            fillMaterial.color.set(hyperbolaC);
        }
    }


    //const res = kanonskiOblikElipse(5, 5, 4, 2, -6, -3);
    //console.log(res);

    //const res2 = kanonskiOblikElipse(2, 3, 0, 8, 12, 16);
    //console.log(res2);

    // Pozovi funkciju nakon svake promjene ravnine
    function updatePlane(newColor) {
        //checkSimple();
        //updateCurveColor();
        planeMaterial.color.set(newColor);
        const k = getDoubleConeEquation();
        console.log("k: ", k);
        console.log(curveType(k));

        createPoints(k);
    }
    
    // Dohvati slidere
    const sliderY = document.getElementById("sliderY");
    const sliderX = document.getElementById("sliderX");
    const sliderRotation = document.getElementById("sliderRotation");
    const sliderHeight = document.getElementById("sliderHeight");
    const sliderRadius = document.getElementById("sliderRadius");
    const sliderSegment = document.getElementById("sliderSegment");
    //console.log(sliderSegment)
    //console.log(sliderRadius)
    //console.log(sliderSegment.value)

    //dohvati colorpickere
    const planeColorPicker = document.getElementById("planeColorPicker");
    const circleColorPicker = document.getElementById("circleColorPicker");
    const ellipseColorPicker = document.getElementById("ellipseColorPicker");
    const parabolaColorPicker = document.getElementById("parabolaColorPicker");
    const hyperbolaColorPicker = document.getElementById("hyperbolaColorPicker");

    // Postavljamo kameru
    camera.position.z = 5;

    // Varijable za rotaciju stošca
    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    //mousedown funkcija
    mouseDown = (e) => {
        isMouseDown = true;
        lastX = 0;
        lastY = 0; 
    }

    container.addEventListener('mousedown', mouseDown);

    //mouseup funkcija
    mouseUp = () => {
        isMouseDown = false;
    }

    container.addEventListener('mouseup', mouseUp);

    //mousemove funkcija
    mouseMove = (e) => {
        if (isMouseDown) {
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
    }

    // Event za kretanje miša
    window.addEventListener('mousemove', mouseMove);

    //inputy funkcija
    inputY = () => {
        plane.position.y = parseFloat(sliderY.value);
        updatePlane(planeC);
    }

    // Event listeneri za promjenu vrijednosti slidera
    sliderY.addEventListener("input", inputY);

    //inputx funkcija
    inputX = () => {
        plane.position.x = parseFloat(sliderX.value);
        updatePlane(planeC);
    }

    sliderX.addEventListener("input", inputX);

    //inputrotation funkcija
    inputRotation = () => {
        plane.rotation.y = calcAngle(parseFloat(sliderRotation.value));
        updatePlane(planeC);
    }

    sliderRotation.addEventListener("input", inputRotation);

    //inputheight funkcija
    inputCone = () => {
        updateCone(
            parseFloat(sliderRadius.value),
            parseFloat(sliderHeight.value),
            parseFloat(sliderSegment.value)
        );
    }

    sliderHeight.addEventListener("input", inputCone);

    sliderRadius.addEventListener("input", inputCone);

    sliderSegment.addEventListener("input", inputCone);

    //inputCPlane funkcija
    inputCPlane = () => {
        planeC = planeColorPicker.value;
        updatePlane(planeC);
    }

    planeColorPicker.addEventListener("input", inputCPlane);

    //inputCCircle funkcija
    inputCCircle = () => {
        circleC = circleColorPicker.value;
        updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);
    }

    circleColorPicker.addEventListener("input", inputCCircle);

    //inputCEllipse funkcija
    inputCEllipse = () => {
        ellipseC = ellipseColorPicker.value;
        updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);
    }

    ellipseColorPicker.addEventListener("input", inputCEllipse);

    //inputCParabola funkcija
    inputCParabola = () => {
        parabolaC = parabolaColorPicker.value;
        updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);
    }

    parabolaColorPicker.addEventListener("input", inputCParabola);

    //inputCHyperbola funkcija
    inputCHyperbola = () => {
        hyperbolaC = hyperbolaColorPicker.value;
        updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);
    }

    hyperbolaColorPicker.addEventListener("input", inputCHyperbola);

    // Inicijalno ažuriranje
    updatePlane(planeC);
    updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);
    //calcAngle(parseFloat(sliderRotation.value))

    // Animacija renderiranja
    function animate() {
        requestAnimationFrame(animate);

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    animate();

    //windowresize funkcija -> dal mi ovo treba
        windowResize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
    }

    // Ažuriramo veličinu rendera ako se prozor promijeni
    window.addEventListener('resize', windowResize);
}

export function cleanup() {
   console.log("Čistim stranicu 2");
    
    // Zaustavi animaciju
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Očisti Three.js resurse
    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.remove();
        }
    }
    
    if (scene) {
        // Očisti sve iz scene
        while (scene.children.length > 0) {
            const child = scene.children[0];
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
            scene.remove(child);
        }
    }
    /*
let mouseDown, mouseUp, mouseMove, inputX, inputY, inputRotation, inputCone, windowResize;
let animationId; */
    
    // Resetiraj reference
    scene = null;
    camera = null;
    renderer = null;
    group = null;
    group2 = null;
    cone1w = null;
    cone1m = null;
    cone1 = null;
    cone2w = null;
    cone2m = null;
    cone2 = null;
    mouse = null;
    curves = [];
    meshes = [];
    coneRadius = null;
    coneHeight = null;
    coneSegments = null;
    plane = null;
    planePosition = null;
    cone1Position = null;
    cone2Position = null;
    normal = null;
    origin = null;
    curveColor = null;
    planeC = null;
    circleC = null;
    ellipseC = null;
    parabolaC = null;
    hyperbolaC = null;
    isHyperbola = null;
    worldPoint = null;
    worldPoint1 = null;
    worldPoint2 = null;
    curve = null;
    curve1 = null;
    curve2 = null;
    fillMesh = null;
    fillMesh1 = null;
    fillMesh2 = null;
    shape = null;
    shape1 = null;
    shape2 = null;

    //micanje event listenera
    const container = document.getElementById('scene2');
    
    if(container) {
        container.removeEventListener('mousedown', mouseDown);
        container.removeEventListener('mouseup', mouseUp);
    }

    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('resize', windowResize);

    const sliderY = document.getElementById("sliderY");
    const sliderX = document.getElementById("sliderX");
    const sliderRotation = document.getElementById("sliderRotation");
    const sliderHeight = document.getElementById("sliderHeight");
    const sliderRadius = document.getElementById("sliderRadius");
    const sliderSegment = document.getElementById("sliderSegment");

    const planeColorPicker = document.getElementById("planeColorPicker");
    const circleColorPicker = document.getElementById("circleColorPicker");
    const ellipseColorPicker = document.getElementById("ellipseColorPicker");
    const parabolaColorPicker = document.getElementById("parabolaColorPicker");
    const hyperbolaColorPicker = document.getElementById("hyperbolaColorPicker");

    if (sliderY) {
        sliderY.removeEventListener('input', inputY);
        sliderY.remove();
    }

    if (sliderX) {
        sliderX.removeEventListener('input', inputX);
        sliderX.remove();
    }

    if (sliderRotation) {
        sliderRotation.removeEventListener('input', inputRotation);
        sliderRotation.remove();
    }

    if (sliderHeight) {
        sliderHeight.removeEventListener('input', inputCone);
        sliderHeight.remove();
    }

    if (sliderRadius) {
        sliderRadius.removeEventListener('input', inputCone);
        sliderRadius.remove();
    }

    if (sliderSegment) {
        sliderSegment.removeEventListener('input', inputCone);
        sliderSegment.remove();
    }

    if (planeColorPicker) {
        planeColorPicker.removeEventListener('input', inputCPlane);
        planeColorPicker.remove();
    }

    if (circleColorPicker) {
        circleColorPicker.removeEventListener('input', inputCCircle);
        circleColorPicker.remove();
    }

    if (ellipseColorPicker) {
        ellipseColorPicker.removeEventListener('input', inputCEllipse);
        ellipseColorPicker.remove();
    }

    if (parabolaColorPicker) {
        parabolaColorPicker.removeEventListener('input', inputCParabola);
        parabolaColorPicker.remove();
    }

    if (hyperbolaColorPicker) {
        hyperbolaColorPicker.removeEventListener('input', inputCHyperbola);
        hyperbolaColorPicker.remove();
    }
}

// Ako se učitava kao samostalna stranica
if (import.meta.url === window.location.href) {
    init('scene2');
}