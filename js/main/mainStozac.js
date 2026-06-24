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

//funkcija za postavljanje pozadinske boje interaktivnog ekrana
export function setBackgroundColorS(color) {
    if (scene) {
        scene.background = new THREE.Color(color);
    }
}

//funkcija za postavljanje boje stošca
export function setConeColor(color) {
    if (materialW) {
        materialW.color.setHex(color);
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

    //očisti container ako već ima sadržaj
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

    //materijal stošca 
    materialM = new THREE.MeshBasicMaterial({ 
        stencilWrite: false, 
        stencilFunc: THREE.EqualStencilFunc, 
        stencilRef: 1,
        transparent: true,
        opacity: 0.6,
        color: 0xffffff 
    });

    //materijal žičanog djela stošca
    materialW = new THREE.MeshBasicMaterial({ 
        color: 0xfefefe,
        wireframe: true 
    });

    //kreiramo 1. stožac
    cone1w = new THREE.Mesh(geometry, materialW);
    cone1m = new THREE.Mesh(geometry, materialM);
    cone1 = new THREE.Group();
    cone1.add(cone1w);
    cone1.add(cone1m);

    //kreiramo 2. stožac + spajamo 2 stošca
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

    //sve boje ravnina i krivulja
    planeC = 0x00ff00;
    circleC = 0x0000ff;
    ellipseC = 0xff00ff;
    parabolaC = 0xff9100;
    hyperbolaC = 0xf72585; 

    //geometrija ravnine
    const planeGeometry = new THREE.PlaneGeometry(8, 8);

    //materijal ravnine
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

    //kreiramo ravninu
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -0.49 * coneHeight, 0); //postavi ravninu kod donjeg stošca
    plane.rotation.x = Math.PI / 2;

    //dodajemo stožac i ravninu u grupu
    group2 = new THREE.Group();
    group2.add(group);
    group2.add(plane);

    //dodajemo grupu u scenu
    scene.add(group2);

    plane.updateMatrixWorld();

    planePosition = new THREE.Vector3();

    plane.getWorldPosition(planePosition);

    //materijal konike
    let curveMaterial = new LineMaterial({ 
        color: curveColor,
        linewidth: 4, //debljina krivulje
        transparent: false
    });

    //ispuna konike
    let fillMaterial = new THREE.MeshBasicMaterial({
        color: curveColor,
        side: THREE.DoubleSide
    });

    //funkcija za računanje jednadžbe ravnine
    function getPlaneEquation() {
        plane.updateMatrixWorld(true);

        //world pozicija (točka na ravnini (x, y, z))
        origin = new THREE.Vector3();
        plane.getWorldPosition(origin);
        
        //world normalu n(A, B, C)
        normal = new THREE.Vector3(0, 0, 1);
        //rotacija normale s rotacijom ravnine
        normal.applyQuaternion(plane.quaternion); 
        normal.normalize();
        
        //računam D za jednadžbu ravnine Ax + By + Cz + D = 0
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

    //funkcija za računanje nagiba stošca
    function getDoubleConeEquation() { 
        const height = cone1.children[1].geometry.parameters.height;
        const radius = cone1.children[1].geometry.parameters.radius;

        //nagib stošca
        const k = radius/height; //tg(alfa)
        
        return k;
    }

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

        isHyperbola = (curveType(k) == "H") ? true : false;

        //generiranje točaka za koniku
        for (let phi = 0; phi <= 2 * Math.PI; phi += 0.002) {
            //provjera da li je nazivnik jednak 0, ako je idi na sljedeći phi
            const denom = A * k * Math.cos(phi) + B + C * k * Math.sin(phi);
            if (Math.abs(denom) < 1e-8) continue; 

            const y = -D / denom;
            const x = k * y * Math.cos(phi);
            const z = k * y * Math.sin(phi);

            if(y >= -coneHeight && y <= coneHeight) {
                worldPoint = new THREE.Vector3(x, y, z);

                //pretvorba iz world u lokalnu točku na ravnini
                const localPoint = plane.worldToLocal(worldPoint.clone()); 

                //ako je hiperbola onda imam 2 dijela, inače 1
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

        //o kojoj krivulji je riječ postavi njenu boju
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

        //kreiranje krivulje iz točaka uz određenu boju
        createCurveFromPoints(points, curveColor);
    }

    //funkcija za kreiranje konika iz točaka uz određenu boju
    function createCurveFromPoints(points, color) {
        //izbriši postojeće krivulje i ispune
        removeExistingCurves();
        removeExistingMesh();
        
        //materijal krivulje
        curveMaterial = new LineMaterial({ 
            color: color,
            linewidth: 4, //debljina krivulje
            transparent: false
        });

        curveMaterial.resolution.set(
            container.clientWidth,
            container.clientHeight
        );

        //ako je krivulja hiperbola razdvoji tako da crtam 2 krivulje umjesto 1 i obje dodam u curves, inače radim s 1 krivuljom
        if(isHyperbola) {
            const pointslength = points[0].length;
            
            //sortiranje točaka
            const points1 = points.pop().sort((a, b) => a.y - b.y);
            //krivulja je kontinuirana linija pa 1. točku dodajem i na kraj niza
            points1.push(points1[0].clone());

            //geometrija 1. krivulje
            const curveGeometry1 = new LineGeometry().setFromPoints(points1);

            //kreiranje krivulje
            curve1 = new Line2(curveGeometry1, curveMaterial);

            curve1.computeLineDistances();

            //dodavanje krivulje na ravninu
            plane.add(curve1);
            curves.push(curve1);

            //pretvori sve točke iz vector3 u vector2
            const shapePoints1 = points1.map(p =>
                new THREE.Vector2(p.x, p.y)
            );

            shape1 = new THREE.Shape(shapePoints1);

            //geometrija 1. ispune
            const shapeGeometry1 = new THREE.ShapeGeometry(shape1);

            //materijal ispune
            fillMaterial = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            //kreiranje 1. ispune
            fillMesh1 = new THREE.Mesh(shapeGeometry1, fillMaterial);

            //dodavanje ispune na ravninu
            plane.add(fillMesh1);
            meshes.push(fillMesh1);

            //provjera dal postoji i 2. dio hiperbole
            if((points1.length - 1) != pointslength) {
                //sortiranje točaka
                const points2 = points.pop().sort((a, b) => a.y - b.y);
                //krivulja je kontinuirana linija pa 1. točku dodajem i na kraj niza
                points2.push(points2[0].clone());
            
                //geometrija 2. krivulje
                const curveGeometry2 = new LineGeometry().setFromPoints(points2);

                //kreiranje krivulje
                curve2 = new Line2(curveGeometry2, curveMaterial);
                
                curve2.computeLineDistances();
                
                //dodavanje krivulje na ravninu
                plane.add(curve2);
                curves.push(curve2);

                //pretvori sve točke iz vector3 u vector2
                const shapePoints2 = points2.map(p =>
                    new THREE.Vector2(p.x, p.y)
                );

                shape2 = new THREE.Shape(shapePoints2);

                //geometrija 2. ispune
                const shapeGeometry2 = new THREE.ShapeGeometry(shape2);

                //kreiranje 2. ispune
                fillMesh2 = new THREE.Mesh(shapeGeometry2, fillMaterial);

                //dodavanje ispune na ravninu
                plane.add(fillMesh2);
                meshes.push(fillMesh2);
            } 
        } else {
            //geometrija krivulje
            const curveGeometry = new LineGeometry().setFromPoints(points);
        
            //kreiranje krivulje
            curve = new Line2(curveGeometry, curveMaterial);

            //dodavanje krivulje na ravninu
            plane.add(curve);
            curves.push(curve);

            //pretvori sve točke iz vector3 u vector2
            const shapePoints = points.map(p =>
                    new THREE.Vector2(p.x, p.y)
            );

            shape = new THREE.Shape(shapePoints);

            //geometrija ispune
            const shapeGeometry = new THREE.ShapeGeometry(shape);


            //materijal ispune
            fillMaterial = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });

            //kreiranje ispune
            fillMesh = new THREE.Mesh(shapeGeometry, fillMaterial);

            //dodavanje ispune na ravninu
            plane.add(fillMesh);
            meshes.push(fillMesh);
        }
    }

    //funkcija za uklanjanje postojećih krivulja
    function removeExistingCurves() {
        //uklanjanje svih linija i točaka iz scene
        curves.forEach(curve => {
            //krivulja je dijete ravnine
            if (curve.parent) {
                curve.parent.remove(curve);
            }
            if (curve.geometry) curve.geometry.dispose();
            if (curve.material) curve.material.dispose();
        });
        curves = [];
    }

    //funkcija za uklanjanje postojećih ispuna
    function removeExistingMesh() {
        //uklanjanje svih ispuna iz scene
        meshes.forEach(mesh => {
            //ispuna je dijete ravnine
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
        //uvrštavanje jednadžbe ravnine u jednadžbu stošca da dobim jednadžbu oblika Ax^2 + By^2 + Cx + Dy + Exy + F = 0
        //jednadžba stošca -> x^2 + z^2 = k^2y^2 
        //jednadžba ravnine -> A'x + B'y + C'z + D' = 0 -> y = -(A'/B')x -(C'/B')z -(D'/B')
        //x^2 + z^2 = k*(-(A'/B')x -(C'/B')z -(D'/B'))^2
        //(k*(A'/B')^2 - 1)*x^2 + (k*(C'/B')^2 - 1)*z^2 + 2*(A'/B')*(D'/B')*x + 2*(C'/B')*(D'/B')*z + 2*(A'/B')*(C'/B')*xz + (D'/B')^2 = 0
        //A = k*(A'/B')^2 - 1    x^2
        //B = k*(C'/B')^2 - 1    z^2
        //E = 2*(A'/B')*(C'/B')  xz
        const planeEquation = getPlaneEquation();
        
        const A_ = planeEquation.A;
        const B_ = planeEquation.B;
        const C_ = planeEquation.C;

        const A = Math.pow((k), 2)*Math.pow((A_/B_), 2) - 1;
        const B = Math.pow((k), 2)*Math.pow((C_/B_), 2) - 1;
        const C = Math.pow((k), 2)*(A_/B_)*(C_/B_);

        const det = A*B - C*C;

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

    //pretvaranje vrijednosti slidera u kuteve(radijani)
    function calcAngle(t) {
        //računanje nagiba stošca
        let parabolaAngleRad = coneHeight/coneRadius;
        
        if((Math.abs(t) > 0.5)) { //hiperbola
            curveColor = hyperbolaC;
            if(t < 0) { //za slučaj (t => -1 && t <= -0.52)
                //kut od parabolaAngle° do 90°, ali isključujući parabolaAngle°
                const angleRad = -(Math.PI/2 - (Math.PI/2 - Math.atan(parabolaAngleRad)) * ((t+1)/(0.5)));
                return angleRad;
            } else { //za slučaj (t => 0.52 && t <= 1)
                //kut od -90° do -parabolaAngle° ali isključujući -parabolaAngle°
                const angleRad =  Math.atan(parabolaAngleRad) - (Math.atan(parabolaAngleRad) - Math.PI/2) * ((t-0.5)/(1 - 0.5));
                return angleRad;
            }
        } else if((Math.abs(t) == 0.5)) { //parabola
            curveColor = parabolaC;
            if(t < 0) { //za slučaj (t == -0.5)
                const angleRad = -Math.atan(parabolaAngleRad);
                return angleRad;        
            } else { //za slučaj (t == 0.5)
                const angleRad = Math.atan(parabolaAngleRad);
                return angleRad;
            }
        } else if((Math.abs(t) <= 0.5 && Math.abs(t) > 0)) { //elipsa
            curveColor = ellipseC;
            if(t < 0) { //za slučaj (t => -0.48 && t <= -0.02)
                //kut od 0° do parabolaAngle° ali isključujući 0°      
                const angleRad = -(Math.atan(parabolaAngleRad) - (Math.atan(parabolaAngleRad) - 0) * ((t+0.5)/(0.5)));
                return angleRad;   
            } else { //za slučaj ((t => 0.02 && t <= 0.48)
                //kut od -parabolaAngle° do 0° ali isključujući 0°
                const angleRad =  0 - (0 - Math.atan(parabolaAngleRad)) * ((t)/(0.5));
                return angleRad;
            }
        } else if(t == 0) { //kružnica
            curveColor = circleC;
            const angleRad = 0;
            return angleRad;
        } 
    }

    //funkcija za update stošca
    function updateCone(newRadius, newHeight, newSegmentsNumber) {
        coneRadius = newRadius;
        coneHeight = newHeight;
        coneSegments = Math.pow(2, 4 + newSegmentsNumber);

        //obriši staru geometriju
        geometry.dispose();

        //nova geometrija stošca
        geometry = new THREE.ConeGeometry(coneRadius, coneHeight, coneSegments);

        //postavi novu geometriju na sve mesh-eve
        cone1w.geometry = geometry;
        cone1m.geometry = geometry;
        cone2w.geometry = geometry;
        cone2m.geometry = geometry;

        //popravi pozicije
        cone2.position.y = coneHeight;
        group.position.y = -coneHeight / 2;

        //update slidera za ravninu kada ide gore-dolje kod promjene visne stošca
        sliderY.min = -coneHeight*0.995;
        sliderY.max = coneHeight*0.995;
        sliderY.step = coneHeight - sliderY.max;

        //ako je trenutna vrijednost van raspona – popravi je
        const current = parseFloat(sliderY.value);

        if (current > coneHeight) sliderY.value = coneHeight;
        if (current < -coneHeight) sliderY.value = -coneHeight;

        plane.rotation.y = calcAngle(parseFloat(sliderRotation.value));

        updatePlane(planeC);
    }

    //funkcija za update boje krivulje
    function updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC) {
        //dohvati nagib
        const k = getDoubleConeEquation();
        //saznaj tip krivulje
        const type = curveType(k);
        //ovisno o tipu namjesti novu boju za taj tip
        if(type == "K") { //kružnica
            curveMaterial.color.set(circleC);
            fillMaterial.color.set(circleC);
        } else if(type == "E") { //elipsa
            curveMaterial.color.set(ellipseC);
            fillMaterial.color.set(ellipseC);
        } else if(type == "P") { //parabola
            curveMaterial.color.set(parabolaC);
            fillMaterial.color.set(parabolaC);
        } else if(type == "H") { //hiperbola
            curveMaterial.color.set(hyperbolaC);
            fillMaterial.color.set(hyperbolaC);
        }
    }

    //funkcija za update ravnine nakon svake promjene
    function updatePlane(newColor) {
        //postavljanje nove boje ravnine
        planeMaterial.color.set(newColor);
        //računanje nagiba stošca
        const k = getDoubleConeEquation();

        //kreiranje točaka
        createPoints(k);
    }
    
    //dohvati slidere
    const sliderY = document.getElementById("sliderY");
    const sliderX = document.getElementById("sliderX");
    const sliderRotation = document.getElementById("sliderRotation");
    const sliderHeight = document.getElementById("sliderHeight");
    const sliderRadius = document.getElementById("sliderRadius");
    const sliderSegment = document.getElementById("sliderSegment");

    //dohvati colorpickere
    const planeColorPicker = document.getElementById("planeColorPicker");
    const circleColorPicker = document.getElementById("circleColorPicker");
    const ellipseColorPicker = document.getElementById("ellipseColorPicker");
    const parabolaColorPicker = document.getElementById("parabolaColorPicker");
    const hyperbolaColorPicker = document.getElementById("hyperbolaColorPicker");

    //postavljamo kameru
    camera.position.z = 5;

    //varijable za rotaciju stošca
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
                //postavi početne vrijednosti kada prvi put pomakneš miš
                lastX = e.clientX;
                lastY = e.clientY;
                return;
            }
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            //normalizirani vektori za rotaciju kamere
            const axisY = new THREE.Vector3(0, 1, 0); // vertikalna rotacija
            const axisX = new THREE.Vector3(1, 0, 0); // horizontalna rotacija

            //rotacija kamere oko centra scene (0,0,0)
            camera.position.applyAxisAngle(axisY, deltaX * 0.01);
            camera.position.applyAxisAngle(axisX, deltaY * 0.01);

            //kamera uvijek gleda prema centru scene
            camera.lookAt(scene.position);
            lastX = e.clientX;
            lastY = e.clientY;
        }
    }

    window.addEventListener('mousemove', mouseMove);

    //inputy funkcija
    inputY = () => {
        plane.position.y = parseFloat(sliderY.value);
        updatePlane(planeC);
    }

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

    //inicijalno ažuriranje
    updatePlane(planeC);
    updateCurveColor(circleC, ellipseC, parabolaC, hyperbolaC);

    //animacija renderiranja
    function animate() {
        requestAnimationFrame(animate);
        //renderiranje scene
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    animate();

    //windowresize funkcija
        windowResize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
    }

    //ažuriramo veličinu rendera ako se prozor promijeni
    window.addEventListener('resize', windowResize);
}

export function cleanup() {    
    //zaustavi animaciju
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    //očisti Three.js resurse
    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.remove();
        }
    }
    
    if (scene) {
        //očisti sve iz scene
        while (scene.children.length > 0) {
            const child = scene.children[0];
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
            scene.remove(child);
        }
    }
    
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

if (import.meta.url === window.location.href) {
    init('scene2');
}