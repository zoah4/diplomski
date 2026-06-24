import * as THREE from 'three';

let scene, camera, renderer, group, sphere, cube;
let mouse, raycaster, plane, v1, v2, normal, currentPlane, vertexPoints = [], orderOfPoints = new Array(8).fill(0), normalArrow, isChecked = false, planesList = [];;
let animationId, cubeMaterial;
let mouseDown, mouseUp, mouseMove, btnClick, windowClick, windowResize, createPlaneHandler, checkboxClick;

//funkcija za postavljanje pozadinske boje interaktivnog ekrana
export function setBackgroundColorK(color) {
    if (scene) {
        scene.background = new THREE.Color(color);
    }
}

//funkcija za postavljanje boje kocke
export function setCubeColor(color) {
    if (cubeMaterial) {
        cubeMaterial.color.setHex(color);
    } else {
        console.warn("cubeMaterial još nije inicijaliziran");
    }
}

export async function init(containerId = 'scene1') {
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
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    //geometrija kocke
    const geometry = new THREE.BoxGeometry(3, 3, 3);

    //materijal za kuglice (vrhove)
    const vertexMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    //geometrija kuglice
    const vertexGeometry = new THREE.SphereGeometry(0.12, 12, 12);

    //skup za pohranu jedinstvenih pozicija
    const uniquePositions = new Set();

    //grupa za roditeljsku kocku i kuglice
    group = new THREE.Group();

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
            sphere = new THREE.Mesh(vertexGeometry, vertexMaterial.clone());
            sphere.position.set(x, y, z);
            sphere.uuid = i + 1;

            //dodaj kuglicu u grupu (roditelj)
            group.add(sphere);

            //dodaj kuglicu u listu
            vertexPoints.push(sphere);
        }
    }
    //kreiramo kocku (samo wireframe, bez boje)
    cubeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff });
    cube = new THREE.Mesh(geometry, cubeMaterial);

    //dodajemo kocku u grupu
    group.add(cube);

    //dodajemo grupu u scenu
    scene.add(group);

    //postavljamo kameru
    camera.position.z = 5;

    //dodavanje popupa
    const popupDiv = document.createElement('div');
    popupDiv.id = 'popup';
    popupDiv.innerHTML = `
            <p id="popup-text"></p>
            <button id="btn">Ok</button>
    `;
    document.body.appendChild(popupDiv);

    //dodavanje gumbi
    const planeButton = document.createElement('div');
    planeButton.innerHTML = `
        <button id="planeButton">Prikaži ravninu</button>
    `;
    container.appendChild(planeButton);

    const clearPlanesButton = document.createElement('div');
    clearPlanesButton.innerHTML = `
        <button id="clearPlanesButton">
            <img src="/icons/reset.png" width="20" height="20" alt="Reset" title="Osvježi" style="transform: rotate(90deg);"/>
        </button>
    `;
    container.appendChild(clearPlanesButton);

    //dodavanje checkboxa
    const normalCheckbox = document.createElement('div');
    normalCheckbox.id = "normalDiv";
    normalCheckbox.innerHTML = `
        <input id="normalCheckbox" type="checkbox" name="normalCheckbox">
        <label id="normalLabel" for="normalCheckbox">Prikaži normalu</label>
    `;

    container.appendChild(normalCheckbox);

    //varijable za rotaciju kocke
    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    //praćenje dal imam prikazanu ravninu 
    currentPlane = null;

    //mousedown funkcija
    mouseDown = (e) => {
        isMouseDown = true;
        lastX = e.clientX;
        lastY = e.clientY;
    };

    //mouseup funkcija
    mouseUp = () => {
        isMouseDown = false;
    }

    //mousemove funkcija
    mouseMove = (e) => {
        if (isMouseDown) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            //rotacija cijele grupe (kocke + kuglica) prema pomicanju miša
            group.rotation.x += deltaY * 0.01;
            group.rotation.y += deltaX * 0.01;

            lastX = e.clientX;
            lastY = e.clientY;
        }
    }

    //event za početak draganja miša
    container.addEventListener('mousedown', mouseDown);

    //event za završetak draganja miša
    container.addEventListener('mouseup', mouseUp);

    //event za kretanje miša
    window.addEventListener('mousemove', mouseMove);

    let i = 1;
    //windowclick funkcija
    windowClick = (event) => {

        if (!camera || !renderer || !container) {
            return;
        }

        const rect = container.getBoundingClientRect();
        mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        //kreiranje raycaster objekta
        raycaster = new THREE.Raycaster();
        
        //postavljanje raycastera da uzima u obzir poziciju kamere i miša
        raycaster.setFromCamera(mouse, camera);

        //provjeri sve objekte u grupi (ne samo vertexPoints)
        const allObjects = [];
        group.children.forEach(child => {
            if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                allObjects.push(child);
            }
        });

        //provjera svih kuglica
        const intersects = raycaster.intersectObjects(allObjects);

        //ako je kliknuta neka kuglica, promijeniti boju samo te kuglice
        if (intersects.length > 0) {
            const clickedSphere = intersects[0].object;

            const currentColor = clickedSphere.material.color.getHex();
            const newColor = (currentColor === 0xff0000) ? 0x007FFF : 0xff0000;  //crvena <-> plava
            
            if(newColor === 0x007FFF) {
                orderOfPoints[clickedSphere.uuid - 1] = i;
                i++; 
            } else {
                orderOfPoints[clickedSphere.uuid - 1] = 0;
            }            
            //promijeniti boju samo kliknute kuglice
            clickedSphere.material.color.setHex(newColor);
        }
    }

    //funkcija za detekciju klika na vrh (kuglicu)
    window.addEventListener('click', windowClick);

    //funkcija za klik na checkbox
    checkboxClick = (e) => {
       if (e.target.id === 'normalCheckbox') {
            if (e.target.checked) {
                if(currentPlane) {
                    if (normalArrow) {
                        group.remove(normalArrow);
                        normalArrow = null;
                    }
                    drawNormal();
                }
                isChecked = true;                
            } else {
                isChecked = false;
                if (normalArrow) group.remove(normalArrow);
            }
        }
    }

    //event za klik na checkbox
    container.addEventListener('click', checkboxClick);

    //funkcija upozorenja da nije moguće stvoriti ravninu od 4 ili više točaka jer nisu na istoj ravnini
    function showError(text) {
        document.getElementById('popup-text').textContent = text;
        document.getElementById('popup').style.display = 'block';  
    }

    function drawNormal (origin) {
        origin = currentPlane.position.clone();
        normalArrow = new THREE.ArrowHelper(
                    normal,                          // smjer
                    origin,                          // početna točka
                    1,                               // duljina strelice
                    0xff00ff,                        // boja (crvena)
                    0.2,                             // duljina vrha strelice
                    0.1                              // širina vrha strelice
                    );
        normalArrow.scale.set(1.5, 1.5, 1.5);
        group.add(normalArrow);
    }

    //funkcija za klik na gumb za stvaranje ravnine od točaka
    createPlaneHandler = function createPlane() {
        //nađi sve označene sfere (plava boja)
        let checkedPoints = []
        vertexPoints.forEach((sphere) => {
            if(sphere.material.color.getHex() === 0x007FFF) {
                checkedPoints.push(sphere)
            }
        });
        //točke s kojima ćemo računati jednadžbu ravnine
        let planePoints = [] 
        //točke za koje ćemo provjeravati da li su dio zadane ravnine
        let belongingPoints = [] 
        
        if(checkedPoints.length < 3) { //ako imam označeno manje od 3 točke
            //poziv funkcije upozorenja
            showError("Nije moguće stvoriti ravninu s manje od 3 točke")
        } else { //ako imam označeno 3 ili više točaka
            let len = checkedPoints.length
            let first3 = checkedPoints.slice(0, 3)

            let first3Ordered = [...first3].sort((a, b) => {
                //ako uuid ne postoji, uzmi 0
                const valueA = orderOfPoints[a.uuid - 1] || 0;  
                const valueB = orderOfPoints[b.uuid - 1] || 0;
                return valueA - valueB; //silazno (od najvećeg prema najmanjem)
            });
            planePoints.push(...first3Ordered)
            //poziv funkcije za računanje ravnine pomoću formule
            const [normal, constant, plane] = calcPlane(planePoints)
            
            if(len > 3) { //ako imam više od 3 točke provjeri dal te ostale pripadaju ravnini
                belongingPoints.push(...checkedPoints)
                //poziv funkcije za provjeru dal točke iz liste belongingPoints su dio zadane ravnine
                if(isOnPlane(belongingPoints, normal, constant)) {//ako pripadaju ravnini nacrtaj ravninu
                    //dodaj ravninu u scenu
                    group.add(plane);
                    planesList.push(plane);
                    currentPlane = plane;
                }
            } else { //ako imam 3 točke odmah nacrtaj ravninu od te 3 točke
                //dodaj ravninu u scenu
                group.add(plane);
                planesList.push(plane);
                currentPlane = plane;

                if(isChecked) {
                     if (normalArrow) {
                        group.remove(normalArrow);
                        normalArrow = null;
                    }
                    drawNormal();
                }
            }
            return plane;
        }
    }
    
    //funkcija za računanje formule ravnine
    function calcPlane(planePoints) {
        v1 = new THREE.Vector3().subVectors(planePoints[1].position, planePoints[0].position); 
        v2 = new THREE.Vector3().subVectors(planePoints[2].position, planePoints[0].position); 

        normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        const constant = -normal.dot(planePoints[0].position);

        const planeGeometry = new THREE.PlaneGeometry(4, 4); //veličina ravnine
        const material = new THREE.MeshBasicMaterial({ color: 0x1CF978, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        plane = new THREE.Mesh(planeGeometry, material);

        plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        plane.position.copy(normal).multiplyScalar(-constant / normal.length());

        return [normal, constant, plane];
    }

    //funkcija za provjeru dal točka pripada ravnini
    function isOnPlane(belongingPoints, normal, constant) {
        for(let i = 0; i < belongingPoints.length; i++) {
            let res = belongingPoints[i].position.x*normal.x + belongingPoints[i].position.y*normal.y + belongingPoints[i].position.z*normal.z + constant;
            if(res != 0) {
                //poziv funkcije upozorenja
                showError("Nije moguće stvoriti ravninu od ovih točaka")
                return false;
            } 
        }
        return true;
    }

    function removeAllPlanes() {
        planesList.forEach(plane => {
            if (plane && plane.parent) {
                group.remove(plane);
                if (plane.geometry) plane.geometry.dispose();
                if (plane.material) plane.material.dispose();
            }
        });
        //isprazni listu
        planesList = [];  
        
        //obriši trenutnu ravninu ako postoji
        if (currentPlane && currentPlane.parent) {
            group.remove(currentPlane);
            if (currentPlane.geometry) currentPlane.geometry.dispose();
            if (currentPlane.material) currentPlane.material.dispose();
            currentPlane = null;
        }
        
        //obriši strelicu normale
        if (normalArrow && normalArrow.parent) {
            group.remove(normalArrow);
            normalArrow = null;
        }
    }

    document.getElementById('clearPlanesButton').addEventListener('click', () => {
        removeAllPlanes();
    });

    //btnclick funkcija
    btnClick = function() {
        document.getElementById('popup').style.display = 'none';
    }

    //nadovezivanje funkcije na gumb
    document.body.addEventListener('click', (event) => {
        if (event.target.id === 'planeButton') {
            createPlaneHandler();
        }
        if (event.target.id === 'btn') {
            btnClick();
        }
    });

    //animacija renderiranja
    function animate() {
        requestAnimationFrame(animate);
        //renderiranje scene
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    animate();
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
    sphere = null;
    cube = null;
    mouse = null;
    raycaster = null;
    plane = null;
    v1 = null;
    v2 = null;
    normal = null;
    //origin = null;
    currentPlane = null;
    vertexPoints = [];
    planesList = [];
    orderOfPoints = new Array(8).fill(0);
    normalArrow = null;
    isChecked = false;

    mouseDown = null;
    mouseUp = null;
    mouseMove = null;
    btnClick = null;
    windowClick = null;
    windowResize = null;
    createPlaneHandler = null;
    checkboxClick = null;

    cubeMaterial = null;

    //micanje event listenera
    const container = document.getElementById('scene1');
    
    if(container) {
        container.removeEventListener('mousedown', mouseDown);
        container.removeEventListener('mouseup', mouseUp);
    }

    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('click', windowClick);
    window.removeEventListener('resize', windowResize);

    const btn = document.getElementById('btn');
    if (btn) {
        btn.removeEventListener('click', btnClick);
    }

    const planeBtn = document.getElementById('planeButton');
    if (planeBtn) {
        planeBtn.removeEventListener('click', createPlaneHandler);
        planeBtn.remove();
    }

    const clearBtn = document.getElementById('clearPlanesButton');
    if (clearBtn) {
        clearBtn.remove();
    }

    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove();
    }
}

if (import.meta.url === window.location.href) {
    init('scene1');
}
