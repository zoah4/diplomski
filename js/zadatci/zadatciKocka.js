import * as THREE from 'three';
//1. tip zadatka -> generiram 3 točke
    //Odredite jednadžbu ravnine određenu s točkama A(), B() i C().

//2. tip zadatka -> generiram 4 točke
    //Pripadaju li točke A(), B(), C() i D() istoj ravnini?

//3. tip zadatka -> generiram 2 točke i jednadžbu ravnine
    //Zadana je ravnina Π: Ax + By + Cz = D. Pripadaju li obje točke A() i B() toj ravnini?

let coef1, coef2, coef3;
let answer2, answer3;
let checkHandler1, checkHandler2, checkHandler3;
//dohvati div zadataka 
function getExercise() {
    const zad1 = document.getElementById('1-a');
    const zad2 = document.getElementById('2-a');
    const zad3 = document.getElementById('3-a');

    let text, type;

    console.log(zad1)

    if(zad1) {
        console.log("zad1 postoji");
        type = 1;
        //text = "Odredite jednadžbu ravnine određenu s točkama A(), B() i C().";
        //pozovi funkciju -> primat će tekst zadatka i tip zadatka
        createExercise(1, zad1);
    }

    if(zad2) {
        console.log("zad2 postoji");
        type = 2;
        //text = "Pripadaju li točke A(), B(), C() i D() istoj ravnini?";
        //pozovi funkciju
        createExercise(2, zad2);
    }

    if(zad3) {
        console.log("zad3 postoji");
        type = 3;
        //text = "Zadana je ravnina Π: Ax + By + Cz = D. Pripadaju li obje točke A() i B() toj ravnini?";
        //pozovi funkciju
        createExercise(3, zad3);
    }
}

//zadavanje zadataka - tekst + točke + ravnina
function createExercise(type, zad) {
    let A = [], B = [], C = [], D = [], Π = [];
    let text;
    if(type == 1) {
        for(let i = 0; i < 9; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi -> myb ću promjenit raspon
            console.log(number);
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
        console.log(variables)

        //pozovi funkciju za rješavanje 1. zad
        solveExercise(type, variables);

        console.log("A: ", A);
        console.log("B: ", B);
        console.log("C: ", C);

        text = `Odredite jednadžbu ravnine određenu s točkama A(${A[0]}, ${A[1]}, ${A[2]}), B(${B[0]}, ${B[1]}, ${B[2]}) i C(${C[0]}, ${C[1]}, ${C[2]}).`;
        console.log(text);

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

         // Dodaj event listener nakon što je gumb kreiran
        const button = document.getElementById('checkButton1-a');
        const coefAInput = document.getElementById('coefA');
        const coefBInput = document.getElementById('coefB');
        const coefCInput = document.getElementById('coefC');
        const coefDInput = document.getElementById('coefD');

        function validateInputs() {
            if(coefAInput.value.trim() == "" || coefBInput.value.trim() == "" || coefCInput.value.trim() == "" || coefDInput.value.trim() == "") {
                console.log("Nesmiješ me kliknut")
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
        //button.disabled = true;

    } else if(type == 2) {
        let cases = Math.floor(Math.random() * 2); //za odabir 2 slučaja kad su sve na ravnini i kad 1 nije
        console.log("slučaj: ", cases)

        //stvaranje prve 3 točke - neovisno o slučaju
        for(let i = 0; i < 9; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi -> myb ću promjenit raspon
            console.log(number);
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
        console.log(variables)

        solveExercise(type, variables);

        console.log("A: ", A);
        console.log("B: ", B);
        console.log("C: ", C);
        console.log("D: ", D);

        text = `Pripadaju li točke A(${A[0]}, ${A[1]}, ${A[2]}), B(${B[0]}, ${B[1]}, ${B[2]}), C(${C[0]}, ${C[1]}, ${C[2]}) i D(${D[0]}, ${D[1]}, ${D[2]}) istoj ravnini?`;
        console.log(text);

        zad.innerHTML = `
            <div id="text">
                <p><b>2. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="yes" value="Da" name="answer2">
                <label for="yes">Da</label><br>
                <input type="radio" id="no" value="Ne" name="answer2">
                <label for="no">Ne</label><br>
            </div>   
            <p id="checkAnswer2-a"></p>
            <button id="checkButton2-a">Provjeri odgovor</button>
        `;

        /*const selectedRadio = document.querySelector('input[name="answer"]:checked');

        if(selectedRadio && ((selectedRadio.value == "Da" && answer2) || (selectedRadio.value == "Ne" && !answer2))) {
            console.log("Dobro rješen zadataaaak!!!");
        } else if(selectedRadio) {
            console.log("krivo si riješio zadatak...");
        }*/

        checkHandler2 = function() {
            checkAnswer(2, null, answer2);
        }

         // Dodaj event listener nakon što je gumb kreiran
        const button = document.getElementById('checkButton2-a');
        button.addEventListener('click', checkHandler2);
        //button.disabled = true;

    } else if(type == 3) { //ili samo else
        let cases = Math.floor(Math.random() * 3); //za odabir 3 slučaja kad obje pripadaju, kad 1 pripada i kad ne pripada ni jedna
        console.log("slučaj_: ", cases);

        //izgeneriraj koeficijente ravnine
        for(let i = 0; i < 4; i++) {
            let number = Math.floor(Math.random() * 21) - 10; //od -10 do 10 cijeli brojevi -> myb ću promjenit raspon
            console.log(number);
            Π.push(number);
        }

        console.log("Π: ", Π);

        let x, y, z;

        if(cases == 0) {
            //obje točke pripadaju ravnini
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

                console.log("x: ", x);
                console.log("y: ", y);
                console.log("z: ", z);
                
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

            console.log("A: ", A)
            console.log("B: ", B)
            
            

        } else if(cases == 1) {
            //jedna točka pripada ravnini
            let point = Math.floor(Math.random() * 2); 
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

                console.log("x: ", x);
                console.log("y: ", y);
                console.log("z: ", z);
                if(point == i) {
                    z++;
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

            console.log("A: ", A)
            console.log("B: ", B)

        } else if(cases == 2) {
            //ni jedna točka ne pripada ravnini
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

                console.log("x: ", x);
                console.log("y: ", y);
                console.log("z: ", z);
                
                if(i) {
                    B.push(x + 1);
                    B.push(y);
                    B.push(z);
                } else {
                    A.push(x);
                    A.push(y + 1);
                    A.push(z);
                }
                
            }

            console.log("A: ", A)
            console.log("B: ", B)
        }

        let variables = [Π, A, B];
        console.log(variables)

        solveExercise(type, variables);

        //Zadana je ravnina Π: Ax + By + Cz = D. Pripadaju li obje točke A() i B() toj ravnini?
        //promjenit format da nisu uvijek plus između x, y, z i D već da provjeravam predznak
        text = `Zadana je ravnina Π: ${Π[0]}x ${Π[1] >= 0 ? `+` : ``} ${Π[1]}y ${Π[2] >= 0 ? `+` : ``} ${Π[2]}z ${Π[3] >= 0 ? `+` : ``} ${Π[3]} = 0. Pripadaju li obje točke A(${A[0]}, ${A[1]}, ${formatNumber(A[2])}) i B(${B[0]}, ${B[1]}, ${formatNumber(B[2])}) toj ravnini?`;
        console.log(text);

        zad.innerHTML = `
            <div id="text">
                <p><b>3. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="yes" value="Da" name="answer3">
                <label for="yes">Da</label><br>
                <input type="radio" id="no" value="Ne" name="answer3">
                <label for="no">Ne</label><br>
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
    //console.log(type)
    if(type == 1) {
        //varijable izvuci i pretvori u vector3
        const vC = new THREE.Vector3(...variables.pop());
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());

        console.log("vA: ", vA);
        console.log("vB: ", vB);
        console.log("vC: ", vC);

        coef1 = solveExerciseGetPlaneEq(vA, vB, vC);
        console.log(coef1);
        
        //radi provjeru rješenja s odgovorom -> poziv funkcije kada je kliknut gumb
        //checkAnswer(1, coef);
        //console.log("normala: ", normal);
        //console.log("konstanta: ", constant);
        
    } else if(type == 2) {
        const vD = new THREE.Vector3(...variables.pop());
        const vC = new THREE.Vector3(...variables.pop());
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());

        console.log("vA: ", vA);
        console.log("vB: ", vB);
        console.log("vC: ", vC);
        console.log("vD: ", vD);

        coef2 = solveExerciseGetPlaneEq(vA, vB, vC);
        console.log(coef2);

        answer2 = solveExerciseIsOnPlane(coef2, vD);
        console.log("answer2: ", answer2);

    } else if(type == 3) { //ili samo else
        const vB = new THREE.Vector3(...variables.pop());
        const vA = new THREE.Vector3(...variables.pop());
        //const vΠ = new THREE.Vector3(...variables.pop());
        let temp = variables.pop();
        coef3 = {A: temp[0], B: temp[1], C: temp[2], D: temp[3]}
        console.log(coef3)

        let answerA = solveExerciseIsOnPlane(coef3, vA);
        let answerB = solveExerciseIsOnPlane(coef3, vB);

        answer3 = answerA && answerB;
        console.log("answer3: ", answer3)

        console.log("vA: ", vA);
        console.log("vB: ", vB);

        console.log("answerA: ", answerA);
        console.log("answerB: ", answerB);
    }
}

//rješavanje 1. zad -> dobivanje jednadžbe ravnine iz 3 točke
function solveExerciseGetPlaneEq(vA, vB, vC) {
    console.log("vA: ", vA);
    console.log("vB: ", vB);
    console.log("vC: ", vC);

    const v1 = new THREE.Vector3().subVectors(vB, vA); 
    const v2 = new THREE.Vector3().subVectors(vC, vA); 
    const normal = new THREE.Vector3().crossVectors(v1, v2);
    const constant = -normal.dot(vA);

    console.log("v1: ", v1);
    console.log("v2: ", v2);
    console.log("normala: ", normal);
    console.log("konstanta: ", constant);

    return {A: normal.x,
            B: normal.y,
            C: normal.z,
            D: constant};

}

//rješavanje 3. zad -> provjera dal točka leži na ravnini
function solveExerciseIsOnPlane(coef, D) {
    return coef.A*D.x + coef.B*D.y + coef.C*D.z + coef.D == 0;
}

//provjera odgovora na zadatke -> možda će mi trebat samo za 1. zad
function checkAnswer(type, solution, answer) {
    let checkedAnswer = document.getElementById('checkAnswer' + type + '-a');
    console.log(checkedAnswer)
    if(type == 1) {
        console.log("Tu sam!!!")
        //dohvati rješenje
        let A = parseInt(document.getElementById('coefA').value);
        let B = parseInt(document.getElementById('coefB').value);
        let C = parseInt(document.getElementById('coefC').value);
        let D = parseInt(document.getElementById('coefD').value);

        /*if(A && B && C && D) {
            button.disabled = false;
        }*/
        console.log("solution: ", solution)
        console.log("A: ", A);
        console.log("B: ", B);
        console.log("C: ", C);
        console.log("D: ", D);

        if(solution.A == A && solution.B == B && solution.C == C && solution.D == D) {
            checkedAnswer.textContent = "Točno!";
            checkedAnswer.style.color = "#059669";
            console.log("dobro je upisano rješenje! bravo!!!!");
        } else {
            checkedAnswer.textContent = "Krivo.";
            checkedAnswer.style.color = "#ff6969";
            console.log("krivooo!!!!");
        }

    } else if(type == 2 || type == 3) { 
        const selectedRadio = document.querySelector(`input[name="answer${type}"]:checked`);

        if(selectedRadio && ((selectedRadio.value == "Da" && answer) || (selectedRadio.value == "Ne" && !answer))) {
            checkedAnswer.textContent = "Točno!";
            checkedAnswer.style.color = "#059669";
            console.log("Dobro rješen zadataaaak!!!");
        } else if(selectedRadio) {
            checkedAnswer.textContent = "Krivo.";
            checkedAnswer.style.color = "#ff6969";
            console.log("krivo si riješio zadatak...");
        }
    }
}

function formatNumber(num) {
    // Ako je cijeli broj, ne prikazuj decimale
    if (Number.isInteger(num)) {
        return num.toString();
    }
    // Inače prikaži na 2 decimale
    return num.toFixed(2);
}

//getExercise();
export function initZadatci() {
    console.log("Pozivam initZadatci");
    getExercise();
}

export function cleanupZadatci() {
    console.log("Pozivam cleanupZadatci");
    coef1 = null; 
    coef2 = null; 
    coef3 = null;
    answer2 = null;
    answer3 = null;
    checkHandler1 = null;
    checkHandler2 = null;
    checkHandler3 = null;

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

}