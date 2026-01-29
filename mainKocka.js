import * as THREE from 'three';

const container = document.getElementById('scene1');

//postavljanje scene, kamere i rendera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
//document.body.appendChild(renderer.domElement);
container.appendChild(renderer.domElement);
console.log("Canvas dodan:", renderer.domElement);

//geometrija kocke
const geometry = new THREE.BoxGeometry(2, 2, 2);

//materijal za kuglice (vrhove)
const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

//geometrija kuglice
const vertexGeometry = new THREE.SphereGeometry(0.07, 8, 8);

//skup za pohranu jedinstvenih pozicija
const uniquePositions = new Set();

//lista za pohranu kuglica koje predstavljaju vrhove
const vertexPoints = [];

//grupa za roditeljsku kocku i kuglice
const group = new THREE.Group();

//prolazak kroz sve vrhove kocke
const position = geometry.attributes.position.array;
for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = position[i * 3];
    const y = position[i * 3 + 1];
    const z = position[i * 3 + 2];
    const key = `${x},${y},${z}`;

    //ako koordinata nije vec dodana, dodaj kuglicu na tu poziciju
    if (!uniquePositions.has(key)) {
        uniquePositions.add(key);

        //kreiraj kuglicu
        const sphere = new THREE.Mesh(vertexGeometry, vertexMaterial.clone());
        sphere.position.set(x, y, z);

        //dodaj kuglicu u grupu (roditelj)
        group.add(sphere);

        //dodaj kuglicu u listu
        vertexPoints.push(sphere);
        console.log(`Sphere added at: (${x}, ${y}, ${z})`);
    }
}
console.log(vertexPoints)
//kreiramo kocku (samo wireframe, bez boje)
const cubeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff });
const cube = new THREE.Mesh(geometry, cubeMaterial);

//dodajemo kocku u grupu
group.add(cube);

//dodajemo grupu u scenu
scene.add(group);

//postavljamo kameru
camera.position.z = 5;

//varijable za rotaciju kocke
let isMouseDown = false;
let lastX = 0;
let lastY = 0;

//pracenje dal imam prikazanu ravninu 
let currentPlane = null;

//event za pocetak draganja misa
window.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

//event za zavrsetak draganja misa
window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

//event za kretanje misa
window.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        //rotacija cijele grupe (kocke + kuglica) prema pomicanju misa
        group.rotation.x += deltaY * 0.01;
        group.rotation.y += deltaX * 0.01;

        lastX = e.clientX;
        lastY = e.clientY;
    }
});

//funkcija za detekciju klika na vrh (kuglicu)
window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / container.clientWidth) * 2 - 1,
        -(event.clientY / container.clientHeight) * 2 + 1
    );

    //kreiranje raycaster objekta
    const raycaster = new THREE.Raycaster();
    
    //postavljanje raycastera da uzima u obzir poziciju kamere i misa
    raycaster.setFromCamera(mouse, camera);

    //provjera svih kuglica u arrayu
    const intersects = raycaster.intersectObjects(vertexPoints);
    //console.log("Kliknuto, broj pogodaka:", intersects.length); // 🛠️ Debug

    //ako je kliknuta neka kuglica, promijeniti boju samo te kuglice
    if (intersects.length > 0) {
        const clickedSphere = intersects[0].object;
        //console.log("Kliknuta kuglica:", clickedSphere); // 🛠️ Debug
        const currentColor = clickedSphere.material.color.getHex();
        const newColor = (currentColor === 0xff0000) ? 0x00ff00 : 0xff0000;  //crvena <-> zelena

        // Promijeniti boju samo kliknute kuglice
        clickedSphere.material.color.setHex(newColor);
        //console.log("Nova boja:", clickedSphere.material.color.getHexString()); // 🛠️ Debug
    }
});

//funkcija upozorenja da nije moguce stvoriti ravninu od 4 ili vise tocaka jer nisu na istoj ravnini
function showError(text) {
    document.getElementById('text').textContent = text;
    document.getElementById('popup').style.display = 'block';  
}

//funkcija za klik na gumb za stvaranje ravnine od tocaka
function createPlane() {
    //nadi sve oznacene sfere(zelena boja)
    let checkedPoints = []
    vertexPoints.forEach((sphere) => {
        if(sphere.material.color.getHex() === 0x00ff00) {
            checkedPoints.push(sphere)
        }
    });
    checkedPoints.forEach((p) => {
        console.log(p.position)
    })
    let planePoints = [] //tocke s kojima cemo racunati jednadzbu ravnine
    let belongingPoints = [] //tocke za koje cemo provjeravati da li su dio zadane ravnine
    
    if(checkedPoints.length < 3) {
        //poziv funkcije upozorenja
        showError("Nije moguće stvoriti ravninu s manje od 3 točke")
    } else {
        let len = checkedPoints.length
        let first3 = checkedPoints.slice(0, 3)
        planePoints.push(...first3)
        //poziv funkcije za racunanje ravnine pomocu formule
        const [normal, constant, plane] = calcPlane(planePoints)
        
        if(len > 3) {
            belongingPoints.push(...checkedPoints)
            //poziv funkcije za provjeru dal tocke iz liste belongingPoints su dio zadane ravnine
            if(isOnPlane(belongingPoints, normal, constant)) {
                //ako vec postoji ravnina, ukloni je
                /*if (currentPlane) {
                    group.remove(currentPlane);
                    currentPlane.geometry.dispose();
                    currentPlane.material.dispose();
                    currentPlane = null;
                }
                console.log(currentPlane)*/
                //dodaj ravninu u scenu
                group.add(plane);
                currentPlane = plane;
                console.log(currentPlane)
            }
        } else {
            //ako vec postoji ravnina, ukloni je
            /*if (currentPlane) {
                group.remove(currentPlane);
                currentPlane.geometry.dispose();
                currentPlane.material.dispose();
                currentPlane = null;
            }
            console.log(currentPlane)*/
            //dodaj ravninu u scenu
            group.add(plane);
            currentPlane = plane;
            console.log(currentPlane)
        }
        return plane;
    }
}


//funkcija za racunanje formule ravnine
function calcPlane(planePoints) {
    const v1 = new THREE.Vector3().subVectors(planePoints[1].position, planePoints[0].position); 
    const v2 = new THREE.Vector3().subVectors(planePoints[2].position, planePoints[0].position); 
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    const constant = -normal.dot(planePoints[0].position);

    const planeGeometry = new THREE.PlaneGeometry(4, 4); //velicina ravnine
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, material);

    plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    plane.position.copy(normal).multiplyScalar(-constant / normal.length());

    return [normal, constant, plane];
}

//funkcija za provjeru dal tocka pripada ravnini
function isOnPlane(belongingPoints, normal, constant) {
    for(let i = 0; i < belongingPoints.length; i++) {
        let res = belongingPoints[i].position.x*normal.x + belongingPoints[i].position.y*normal.y + belongingPoints[i].position.z*normal.z + constant;
        console.log(res);
        if(res != 0) {
            //poziv funkcije upozorenja
            showError("Nije moguće stvoriti ravninu od ovih točaka")
            return false;
        } else {
            console.log("Točak se nalazi na ravnini!!!")
        }
    }
    return true;
}

//nadovezivanje funkcije na gumb
document.getElementById('planeButton').addEventListener('click', createPlane);
document.getElementById('btn').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'none';
});

// Animacija renderiranja
function animate() {
    requestAnimationFrame(animate);
    //ovdje mozete pozvati funkciju za ispis boja
    //printSphereColors();
    //renderiranje scene
    renderer.render(scene, camera);
}

animate();

//azuriramo velicinu rendera ako se prozor promijeni
window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});