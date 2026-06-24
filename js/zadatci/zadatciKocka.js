import * as THREE from 'three';

let coef1, coef2, coef3, answer2, answer3, checkHandler1, checkHandler2, checkHandler3;

//dohvati div zadataka 
function getExercise() {
    const zad1 = document.getElementById('1-a');
    const zad2 = document.getElementById('2-a');
    const zad3 = document.getElementById('3-a');

    if(zad1) {
        createExercise(1, zad1);
    }

    if(zad2) {
        createExercise(2, zad2);
    }

    if(zad3) {
        createExercise(3, zad3);
    }
}

//zadavanje zadataka - tekst + točke + ravnina
function createExercise(type, zad) {
    let A = [], B = [], C = [], D = [], Π = [];
    let text;
    if(type == 1) {
        for(let i = 0; i < 9; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi
            if(i < 3) {
                A.push(number);
            } else if (i > 2 && i < 6) {
                B.push(number);
            } else {
                C.push(number);
            }
        }

        //slaganje varijabli
        let variables = [A, B, C];

        //pozovi funkciju za rješavanje 1. zad
        solveExercise(type, variables);

        text = `Odredite jednadžbu ravnine određenu s točkama A(${A[0]}, ${A[1]}, ${A[2]}), B(${B[0]}, ${B[1]}, ${B[2]}) i C(${C[0]}, ${C[1]}, ${C[2]}).`;

        zad.innerHTML = `
            <div id="text">
                <p><b>1. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="number" id="coefA"> x + 
                <input type="number" id="coefB"> y +
                <input type="number" id="coefC"> z + 
                <input type="number" id="coefD">  = 0
            </div>   
            <p id="checkAnswer1-a"></p>
            <button id="checkButton1-a">Provjeri odgovor</button>
        `;

        checkHandler1 = function() {
            checkAnswer(1, coef1, null);
        };

        //dodaj event listener nakon što je gumb kreiran
        const button = document.getElementById('checkButton1-a');
        const coefAInput = document.getElementById('coefA');
        const coefBInput = document.getElementById('coefB');
        const coefCInput = document.getElementById('coefC');
        const coefDInput = document.getElementById('coefD');

        //validacija da na gumb možemo kliknut tek nakon što su sve vrijednosti unesene
        function validateInputs() {
            if(coefAInput.value.trim() == "" || coefBInput.value.trim() == "" || coefCInput.value.trim() == "" || coefDInput.value.trim() == "") {
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        }
        
        button.disabled = true;

        coefAInput.addEventListener("input", validateInputs);
        coefBInput.addEventListener("input", validateInputs);
        coefCInput.addEventListener("input", validateInputs);
        coefDInput.addEventListener("input", validateInputs);

        button.addEventListener('click', checkHandler1);
    } else if(type == 2) {
        let cases = Math.floor(Math.random() * 2); //za odabir 2 slučaja kad su sve na ravnini ili kad 1 nije

        //stvaranje prve 3 točke - neovisno o slučaju
        for(let i = 0; i < 9; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi -> myb ću promjenit raspon
            if(i < 3) {
                A.push(number);
            } else if (i > 2 && i < 6) {
                B.push(number);
            } else {
                C.push(number);
            }
        }

        if(cases == 0) {
            //sve pripadaju ravnini -> generiram točku koja pripada ravnini
            D.push(B[0] + C[0] - A[0]);
            D.push(B[1] + C[1] - A[1]);
            D.push(B[2] + C[2] - A[2]);

        } else if(cases == 1) {
            //jedna ne pripada ravnini -> generiram točku koja ne pripada ravnini
            D.push(B[0] + C[0] - A[0]);
            D.push(B[1] + C[1] - A[1] + 1);
            D.push(B[2] + C[2] - A[2]);
        }

        let variables = [A, B, C, D];

        solveExercise(type, variables);

        text = `Pripadaju li točke A(${A[0]}, ${A[1]}, ${A[2]}), B(${B[0]}, ${B[1]}, ${B[2]}), C(${C[0]}, ${C[1]}, ${C[2]}) i D(${D[0]}, ${D[1]}, ${D[2]}) istoj ravnini?`;

        zad.innerHTML = `
            <div id="text">
                <p><b>2. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="yes1" value="Da" name="answer2">
                <label for="yes1">Da</label><br>
                <input type="radio" id="no1" value="Ne" name="answer2">
                <label for="no1">Ne</label><br>
            </div>   
            <p id="checkAnswer2-a"></p>
            <button id="checkButton2-a">Provjeri odgovor</button>
        `;

        checkHandler2 = function() {
            checkAnswer(2, null, answer2);
        }

        //dodaj event listener nakon što je gumb kreiran
        const button = document.getElementById('checkButton2-a');
        button.addEventListener('click', checkHandler2);

    } else if(type == 3) {
        let cases = Math.floor(Math.random() * 3); //za odabir 3 slučaja kad obje pripadaju, kad 1 pripada ili kad ne pripada ni jedna

        //izgeneriraj koeficijente ravnine
        for(let i = 0; i < 4; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi
            Π.push(number);
        }

        let x, y, z;

        //ovo pokriva case == 0
        for(let i = 0; i < 2; i++) {
            if(Math.abs(Π[2]) > 0) { //C
                x = Math.floor(Math.random() * 21) - 10;
                y = Math.floor(Math.random() * 21) - 10;
                z = -(Π[0] * x + Π[1] * y + Π[3]) / Π[2];
            } else if(Math.abs(Π[1]) > 0) { //B
                x = Math.floor(Math.random() * 21) - 10;
                z = Math.floor(Math.random() * 21) - 10;
                y = -(Π[0] * x + Π[2] * z + Π[3]) / Π[1];
            } else { //A
                y = Math.floor(Math.random() * 21) - 10;
                z = Math.floor(Math.random() * 21) - 10;
                x = -(Π[1] * y + Π[2] * z + Π[3]) / Π[0];
            }

            if(i) {
                B.push(x);
                B.push(y);
                B.push(z);
            } else {
                A.push(x);
                A.push(y);
                A.push(z);
            }
        }

        //služi za odabir točke koju mijenjam
        let point = Math.floor(Math.random() * 2); 
        
        if(cases == 1) {
            //jedna točka pripada ravnini
            if(point) {
                B[2] = z + 1;
            } else {
                A[2] = z + 1;
            }
        } else if(cases == 2) {
            //ni jedna točka ne pripada ravnini        
            B[0] = x + 1;
            A[1] = y + 1;
    
        }


        let variables = [Π, A, B];

        solveExercise(type, variables); 

        text = `Zadana je ravnina Π: ${Π[0]}x ${Π[1] >= 0 ? `+` : ``} ${Π[1]}y ${Π[2] >= 0 ? `+` : ``} ${Π[2]}z ${Π[3] >= 0 ? `+` : ``} ${Π[3]} = 0. Pripadaju li obje točke A(${A[0]}, ${A[1]}, ${formatNumber(A[2])}) i B(${B[0]}, ${B[1]}, ${formatNumber(B[2])}) toj ravnini?`;

        zad.innerHTML = `
            <div id="text">
                <p><b>3. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="yes2" value="Da" name="answer3">
                <label for="yes2">Da</label><br>
                <input type="radio" id="no2" value="Ne" name="answer3">
                <label for="no2">Ne</label><br>
            </div>   
            <p id="checkAnswer3-a"></p>
            <button id="checkButton3-a">Provjeri odgovor</button>
        `;

        checkHandler3 = function() {
            checkAnswer(3, null, answer3);
        };

        const button = document.getElementById('checkButton3-a');
        button.addEventListener('click', checkHandler3);
    }

}

//rješavanje zadataka
function solveExercise(type, variables) {
    if(type == 1) {
        //varijable izvuci i pretvori u vector3
        const vC = new THREE.Vector3(...variables.pop());
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());

        coef1 = solveExerciseGetPlaneEq(vA, vB, vC);        
    } else if(type == 2) {
        const vD = new THREE.Vector3(...variables.pop());
        const vC = new THREE.Vector3(...variables.pop());
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());

        coef2 = solveExerciseGetPlaneEq(vA, vB, vC);
        answer2 = solveExerciseIsOnPlane(coef2, vD);
    } else if(type == 3) { 
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());

        let temp = variables.pop();
        coef3 = {A: temp[0], B: temp[1], C: temp[2], D: temp[3]}

        let answerA = solveExerciseIsOnPlane(coef3, vA);
        let answerB = solveExerciseIsOnPlane(coef3, vB);

        answer3 = answerA && answerB;
    }
}

//rješavanje 1. zad -> dobivanje jednadžbe ravnine iz 3 točke
function solveExerciseGetPlaneEq(vA, vB, vC) {
    const v1 = new THREE.Vector3().subVectors(vB, vA); 
    const v2 = new THREE.Vector3().subVectors(vC, vA); 
    const normal = new THREE.Vector3().crossVectors(v1, v2);
    const constant = -normal.dot(vA);

    return {A: normal.x,
            B: normal.y,
            C: normal.z,
            D: constant};

}

//rješavanje 3. zad -> provjera dal točka leži na ravnini
function solveExerciseIsOnPlane(coef, D) {
    return coef.A*D.x + coef.B*D.y + coef.C*D.z + coef.D == 0;
}

//provjera odgovora na zadatke
function checkAnswer(type, solution, answer) {
    let checkedAnswer = document.getElementById('checkAnswer' + type + '-a');

    if(type == 1) {
        //dohvati rješenje
        let A = parseInt(document.getElementById('coefA').value);
        let B = parseInt(document.getElementById('coefB').value);
        let C = parseInt(document.getElementById('coefC').value);
        let D = parseInt(document.getElementById('coefD').value);

        if(solution.A == A && solution.B == B && solution.C == C && solution.D == D) {
            checkedAnswer.textContent = "Točno!";
            checkedAnswer.style.color = "#059669";
        } else {
            checkedAnswer.textContent = "Krivo.";
            checkedAnswer.style.color = "#ff6969";
        }

    } else if(type == 2 || type == 3) { 
        const selectedRadio = document.querySelector(`input[name="answer${type}"]:checked`);

        if(selectedRadio && ((selectedRadio.value == "Da" && answer) || (selectedRadio.value == "Ne" && !answer))) {
            checkedAnswer.textContent = "Točno!";
            checkedAnswer.style.color = "#059669";
        } else if(selectedRadio) {
            checkedAnswer.textContent = "Krivo.";
            checkedAnswer.style.color = "#ff6969";
        }
    }
}

function formatNumber(num) {
    //ako je cijeli broj, ne prikazuj decimale
    if (Number.isInteger(num)) {
        return num.toString();
    }
    //inače prikaži na 2 decimale
    return num.toFixed(2);
}

//inicijalizacija zadataka
export function initZadatci() {
    getExercise();
}

//očisti zadatke
export function cleanupZadatci() {
    const button1 = document.getElementById('checkButton1-a');
    const button2 = document.getElementById('checkButton2-a');
    const button3 = document.getElementById('checkButton3-a');

    if(button1) {
        button1.removeEventListener('click', checkHandler1);
    }

    if(button2) {
        button2.removeEventListener('click', checkHandler2);
    }

    if(button3) {
        button3.removeEventListener('click', checkHandler3);
    }

    const zad1 = document.getElementById('1-a');
    const zad2 = document.getElementById('2-a');
    const zad3 = document.getElementById('3-a');
    
    if (zad1) {
        zad1.innerHTML = '';
    }

    if (zad2) {
        zad2.innerHTML = '';
    }

    if (zad3) {
        zad3.innerHTML = '';
    }

    coef1 = null; 
    coef2 = null; 
    coef3 = null;
    answer2 = null;
    answer3 = null;
    checkHandler1 = null;
    checkHandler2 = null;
    checkHandler3 = null;

}