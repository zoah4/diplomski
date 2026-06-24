import { initPage1, cleanupPage1 } from './pages/page1.js';
import { initPage2, cleanupPage2} from './pages/page2.js';
import { setBackgroundColorK, setCubeColor } from './main/mainKocka.js';
import { setBackgroundColorS, setConeColor } from './main/mainStozac.js';

let currentPage = 'page1';

//prikaz stranice Kocka
async function showPage1() {    
    //očisti prethodnu stranicu
    if (currentPage === 'page2') {
        await cleanupPage2();
    }
    
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div>
            <div id="info-text">
                <p>Ravnina u prostoru</p>
                    <li>Ravninu određuju 3 nekolinearne točke A, B i C</li>
                    <li>Vektori u ravnini: v₁ = r<span style="font-size:10px; vertical-align:sub;">B</span> − r<span style="font-size:10px; vertical-align:sub;">A</span>, v₂ = r<span style="font-size:10px; vertical-align:sub;">C</span> − r<span style="font-size:10px; vertical-align:sub;">A</span></li>
                    <li>Normala ravnine: n = v₁ × v₂</li>
                    <li>Normalni vektor: n = (A, B, C)</li>
                    <li>Jednadžba ravnine: Ax + By + Cz + D = 0</li>
                    <li>Točka T(x,y,z) pripada ravnini ako: Ax + By + Cz + D = 0</li>
            </div>
            <div id="scene1" class="scene-container">
            </div>
            <div class="exercise-container">
                <div id="1-a" class="exercise">

                </div>
                <div id="2-a" class="exercise">

                </div>
                <div id="3-a" class="exercise">

                </div>
            </div>
        </div>
    `;
    
    //inicijaliziraj 1. stranicu
    await initPage1();
    currentPage = 'page1';

    await applyCurrentThemeToPage();
    
    //update aktivnog gumba na headeru
    document.getElementById('page1Btn').classList.add('active');
    document.getElementById('page2Btn').classList.remove('active');
}

//prikaz stranice Stožac
async function showPage2() {
    //očisti prethodnu stranicu
    if (currentPage === 'page1') {
        await cleanupPage1();
    }
    
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div id="pageHolder">
            <div id="info-text">
                <p>Presjek ravnine i stošca</p>
                    <li>Kut nagiba ravnine (α) u odnosu na izvodnicu određuje presjek</li>
                    <li>α < kut izvodnice → ELIPSA (zatvorena krivulja)</li>
                    <li>α = kut izvodnice → PARABOLA (otvorena krivulja)</li>
                    <li>α > kut izvodnice → HIPERBOLA (dvije grane)</li>
                    <li>Ravnina kroz vrh stošca → degenerirani presjek</li>
                    <li>Jednadžba stošca: x² + y² = (r/h)²·z²</li>
            </div>
            <div id="visualization1">
                
                <div id="controls">
                    <label>Gore-Dolje: <input type="range" id="sliderY" min="-1.99" max="1.99" step="0.01" value="0"></label>
                    <label>Lijevo-Desno: <input type="range" id="sliderX" min="-2" max="2" step="0.1" value="0"></label>
                    <label>Nagib: <input type="range" id="sliderRotation" min="-1" max="1" step="0.02" value="0"></label>
                    <label>Visina: <input type="range" id="sliderHeight" min="1" max="2.5" step="0.5" value="2"></label>
                    <label>Radijus: <input type="range" id="sliderRadius" min="1" max="2.5" step="0.5" value="1"></label>
                    <label>Segmenti: <input type="range" id="sliderSegment" min="1" max="3" step="1" value="1"></label> <!-- Myb promjeni naziv slidera-->
                </div>
                <div id="scene2" class="scene-container"></div>
                <div id="legend">
                    <div id="colorPickers">
                        <input type="color" id="planeColorPicker" value="#00ff00">
                        <label for="planeColorPicker">Ravnina</label>
                    </div>
                    <div id="colorPickers">
                        <input type="color" id="circleColorPicker" value="#0000ff">
                        <label for="circleColorPicker">Kružnica</label>
                    </div>
                    <div id="colorPickers">
                        <input type="color" id="ellipseColorPicker" value="#ff00ff">
                        <label for="ellipseColorPicker">Elipsa</label>
                    </div>
                    <div id="colorPickers">
                        <input type="color" id="parabolaColorPicker" value="#ff9100">
                        <label for="parabolaColorPicker">Parabola</label>
                    </div>
                    <div id="colorPickers">
                        <input type="color" id="hyperbolaColorPicker" value="#f72585">
                        <label for="hyperbolaColorPicker">Hiperbola</label>
                    </div>
                </div>
            </div>       
        </div>
        <div class="exercise-container">
            <div id="1-b" class="exercise">

            </div>
            <div id="2-b" class="exercise">

            </div>
        </div>
    `;
    
    //inicijaliziraj 2. stranicu
    await initPage2();
    currentPage = 'page2';

    await applyCurrentThemeToPage();
    
    //update aktivnog gumba na headeru
    document.getElementById('page2Btn').classList.add('active');
    document.getElementById('page1Btn').classList.remove('active');
}

//funkcija za promjenu veličine fonta
function fontSizeFunction() {
    document.body.classList.toggle('large-text');
}

//funkcija za promjenu stila fonta
function fontStyleFunction() {
    document.body.classList.toggle('dyslexic-text');
}

//funkcija za promjenu teme aplikacije
function changePagesTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    if (isDark) {
        //svijetla pozadina, tamni objekt
        setBackgroundColorK(0xf3f4f6); 
        setBackgroundColorS(0xf3f4f6); 
        setCubeColor(0x000000);
        setConeColor(0x000000);
    } else {
        //tamna pozadina, svijetli objekt
        setBackgroundColorK(0x000000); 
        setBackgroundColorS(0x000000); 
        setCubeColor(0xf3f4f6);
        setConeColor(0xf3f4f6);
    }    
}

//funkcija za primjenu teme na trenutnu stranicu
async function applyCurrentThemeToPage() {
    const isDark = document.body.classList.contains('dark-theme');
    const color = isDark ? 0xf3f4f6 : 0x000000;
    const colorElement = isDark ? 0x000000 : 0xf3f4f6;
    
    if (currentPage === 'page1') {
        if (typeof setBackgroundColorK === 'function') {
            setBackgroundColorK(color);
            setCubeColor(colorElement);
        }
    } else if (currentPage === 'page2') {
        if (typeof setBackgroundColorS === 'function') {
            setBackgroundColorS(color);
            setConeColor(colorElement);
        }
    }
}

//event listeneri za promjenu stranica
document.getElementById('page1Btn').addEventListener('click', showPage1);
document.getElementById('page2Btn').addEventListener('click', showPage2);

//event listeneri za inkluzivni dizajn
document.getElementById('fontSizeBtn').addEventListener('click', fontSizeFunction);
document.getElementById('fontStyleBtn').addEventListener('click', fontStyleFunction);
document.getElementById('darkModeBtn').addEventListener('click', changePagesTheme);

//početna stranica je 1. stranica
showPage1();