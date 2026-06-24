let answer1, answer2, checkHandler1, checkHandler2;

//dohvati div zadataka     
function getExercise() {
    const zad1 = document.getElementById('1-b');
    const zad2 = document.getElementById('2-b');

    if(zad1) {
        createExercise(1, zad1);
    }

    if(zad2) {
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

        //kut kada je ravnina paralelna sa izvodnicom stošca
        let parabolaAngle = (h/r)*(180/Math.PI);

        if(cases == 0) {
            //kružnica
            angle = 90;
            answer1 = "Kružnica";
        } else if(cases == 1) {
            //elipsa
            //generiram broj između parabolaAngle i 90 ne uključujući te granice
            angle = Math.random() * (90 - parabolaAngle) + parabolaAngle;
            answer1 = "Elipsa";
        } else if(cases == 2) {
            //parabola
            angle = parabolaAngle;
            answer1 = "Parabola";
        } else if(cases == 3) {
            //hiperbola
            angle = Math.random() * parabolaAngle;
            answer1 = "Hiperbola";
        } 

        text = `Stožac ima radijus baze ${r} i visinu ${h}. Ravnina prolazi kroz stožac i nagnuta je pod kutom ${formatNumber(angle)}° u odnosu na bazu stošca. Koji presjek nastaje?`;

        zad.innerHTML = `
            <div id="text">
                <p><b>1. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="circle1" value="Kružnica" name="answer1">
                <label for="circle1">Kružnica</label><br>
                <input type="radio" id="ellipse1" value="Elipsa" name="answer1">
                <label for="ellipse1">Elipsa</label><br>
                <input type="radio" id="parabola1" value="Parabola" name="answer1">
                <label for="parabola1">Parabola</label><br>
                <input type="radio" id="hyperbola1" value="Hiperbola" name="answer1">
                <label for="hyperbola1">Hiperbola</label><br>
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

        if(cases == 0) {
            //kružnica
            text = `Ravnina presijeca stožac i paralelna je s bazom stošca. Koji presjek nastaje?`;
            answer2 = "Kružnica";
        } else if(cases == 1) {
            //elipsa
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

        zad.innerHTML = `
            <div id="text">
                <p><b>2. Zadatak </b></p>
                <p>${text}</p>
            </div>
            <div id="answer">
                <input type="radio" id="circle2" value="Kružnica" name="answer2">
                <label for="circle2">Kružnica</label><br>
                <input type="radio" id="ellipse2" value="Elipsa" name="answer2">
                <label for="ellipse2">Elipsa</label><br>
                <input type="radio" id="parabola2" value="Parabola" name="answer2">
                <label for="parabola2">Parabola</label><br>
                <input type="radio" id="hyperbola2" value="Hiperbola" name="answer2">
                <label for="hyperbola2">Hiperbola</label><br>
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

    const selectedRadio = document.querySelector(`input[name="answer${type}"]:checked`);

    if(selectedRadio && (selectedRadio.value == answer)) {
        checkedAnswer.textContent = "Točno!";
        checkedAnswer.style.color = "#059669";
    } else if(selectedRadio) {
        checkedAnswer.textContent = "Krivo.";
        checkedAnswer.style.color = "#ff6969";
    }
}

//formatiranje brojeva
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

    answer1 = null;
    answer2 = null;
    checkHandler1 = null;
    checkHandler2 = null;
}