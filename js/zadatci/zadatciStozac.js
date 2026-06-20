//1. tip zadatka -> generiram 3 broja (radijus, visinu i kut)
    //Stožac ima radijus baze () i visinu (). Ravnina prolazi kroz stožac i nagnuta je pod kutom ()° u odnosu na bazu stošca. Koji presjek nastaje?

//2. tip zadatka -> generira koji slučaju ću imat pa o tome ovisi što je ostatak teksta     
    //Ravnina presijeca stožac i (paralelna je s jednom njegovom izvodnicom). Koji presjek nastaje?

let answer1, answer2;
let checkHandler1, checkHandler2;
//dohvati div zadataka     
function getExercise() {
    const zad1 = document.getElementById('1-b');
    const zad2 = document.getElementById('2-b');

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
}

//zadavanje zadataka - tekst + točke + ravnina
function createExercise(type, zad) {
    let r, h, angle, cases;
    let text;
    if(type == 1) {
        r = Math.floor(Math.random() * 5) + 1; //od 1 do 5
        h = Math.floor(Math.random() * 5) + 1; //od 1 do 5
        cases = Math.floor(Math.random() * 4); //od 0 do 3
        console.log("cases: ", cases);

        console.log("r: ", r);
        console.log("h: ", h);

        let parabolaAngle = (h/r)*(180/Math.PI);
        console.log("parabolaAngle: ", parabolaAngle);

        //u ovim case-evima naznačavam točan odgovor al još ne znam kako?!
        if(cases == 0) {
            //kružnica
            angle = 90;
            console.log("angle1: ", angle);
            answer1 = "Kružnica";
        } else if(cases == 1) {
            //elipsa
            //generiram broj između parabolaAngle i 90 ne uključujući te granice
            angle = Math.random() * (90 - parabolaAngle) + parabolaAngle;
            console.log("angle2: ", angle);
            answer1 = "Elipsa";
        } else if(cases == 2) {
            //parabola
            angle = parabolaAngle;
            console.log("angle3: ", angle);
            answer1 = "Parabola";
        } else if(cases == 3) {
            //hiperbola
            angle = Math.random() * parabolaAngle;
            console.log("angle4: ", angle);
            answer1 = "Hiperbola";
        } 

        //solveExercise(r, h, angle);

        text = `Stožac ima radijus baze ${r} i visinu ${h}. Ravnina prolazi kroz stožac i nagnuta je pod kutom ${formatNumber(angle)}° u odnosu na bazu stošca. Koji presjek nastaje?`;
        console.log(text);

        //ovaj dio namjestit s 4 radio buttona di se nude 4 vrste konika
        zad.innerHTML = `
            <div id="text">
                <p><b>1. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="circle" value="Kružnica" name="answer1">
                <label for="circle">Kružnica</label><br>
                <input type="radio" id="ellipse" value="Elipsa" name="answer1">
                <label for="ellipse">Elipsa</label><br>
                <input type="radio" id="parabola" value="Parabola" name="answer1">
                <label for="parabola">Parabola</label><br>
                <input type="radio" id="hyperbola" value="Hiperbola" name="answer1">
                <label for="hyperbola">Hiperbola</label><br>
            </div>   
            <p id="checkAnswer1-b"></p>
            <button id="checkButton1-b">Provjeri odgovor</button>
        `;

        checkHandler1 = function() {
            checkAnswer(1, answer1);
        }

        const button = document.getElementById('checkButton1-b');
        button.addEventListener('click', checkHandler1);

    } else if(type == 2) {
        cases = Math.floor(Math.random() * 4); //od 0 do 3
        console.log("cases: ", cases);
        //u ovim case-evima naznačavam točan odgovor al još ne znam kako?!
        if(cases == 0) {
            //kružnica
            text = `Ravnina presijeca stožac i paralelna je s bazom stošca. Koji presjek nastaje?`;
            answer2 = "Kružnica";
        } else if(cases == 1) {
            //elipsa
            //generiram broj između parabolaAngle i 90 ne uključujući te granice
            text = `Ravnina presijeca stožac pod kutom većim od kuta izvodnice, ali manjim od 90°. Koji presjek nastaje?`;
            answer2 = "Elipsa";
        } else if(cases == 2) {
            //parabola
            text = `Ravnina presijeca stožac i paralelna je s jednom njegovom izvodnicom. Koji presjek nastaje?`;
            answer2 = "Parabola";
        } else if(cases == 3) {
            //hiperbola
            text = `Ravnina presijeca stožac pod kutom manjim od kuta izvodnice, ali većim od 0°. Koji presjek nastaje?`;
            answer2 = "Hiperbola";
        } 

        //solveExercise(r, h, angle);
        console.log(text);

        //ovaj dio namjestit s 4 radio buttona di se nude 4 vrste konika
        zad.innerHTML = `
            <div id="text">
                <p><b>2. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="circle" value="Kružnica" name="answer2">
                <label for="circle">Kružnica</label><br>
                <input type="radio" id="ellipse" value="Elipsa" name="answer2">
                <label for="ellipse">Elipsa</label><br>
                <input type="radio" id="parabola" value="Parabola" name="answer2">
                <label for="parabola">Parabola</label><br>
                <input type="radio" id="hyperbola" value="Hiperbola" name="answer2">
                <label for="hyperbola">Hiperbola</label><br>
            </div>   
            <p id="checkAnswer2-b"></p>
            <button id="checkButton2-b">Provjeri odgovor</button>
        `;

        checkHandler2 = function() {
            checkAnswer(2, answer2);
        }

        const button = document.getElementById('checkButton2-b');
        button.addEventListener('click', checkHandler2);
    }

}

//provjera odgovora na zadatke 
function checkAnswer(type, answer) {
    let checkedAnswer = document.getElementById('checkAnswer' + type + '-b');
    console.log(checkedAnswer);

    const selectedRadio = document.querySelector(`input[name="answer${type}"]:checked`);

    //prepravi logiku!!!
    if(selectedRadio && (selectedRadio.value == answer)) {
        checkedAnswer.textContent = "Točno!";
        checkedAnswer.style.color = "#059669";
        console.log("Dobro rješen zadataaaak!!!");
    } else if(selectedRadio) {
        checkedAnswer.textContent = "Krivo.";
        checkedAnswer.style.color = "#ff6969";
        console.log("krivo si riješio zadatak...");
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

//getExercise()
export function initZadatci() {
    console.log("Pozivam initZadatci");
    getExercise();
}

export function cleanupZadatci() {
    console.log("Pozivam cleanupZadatci");
    answer1 = null;
    answer2 = null;
    checkHandler1 = null;
    checkHandler2 = null;

    const button1 = document.getElementById('checkButton1-b');
    const button2 = document.getElementById('checkButton2-b');

    if(button1) {
        button1.removeEventListener('click', checkHandler1);
    }

    if(button2) {
        button2.removeEventListener('click', checkHandler2);
    }

    const zad1 = document.getElementById('1-b');
    const zad2 = document.getElementById('2-b');
    
    if (zad1) {
        zad1.innerHTML = '';
    }

    if (zad2) {
        zad2.innerHTML = '';
    }
}