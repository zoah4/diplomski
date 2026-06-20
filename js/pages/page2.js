// Importiraj iz mainPovrsina.js
import { init, cleanup } from '../main/mainStozac.js';
import { initZadatci, cleanupZadatci } from '../zadatci/zadatciStozac.js';

export async function initPage2() {
    console.log("Inicijaliziram stranicu 2 - Bojanje površine");
    
    try {
        if (typeof init === 'function') {
            // Pozovi init funkciju iz mainStozac.js
            await init('scene2');
            console.log("Stranica 2 uspješno inicijalizirana");
        } else {
            // Ako nema exportane funkcije, direktno pozovi getExercise
            console.log("init nije funkcija, pokušavam getExercise");
        }

        if (typeof initZadatci === 'function') {
            initZadatci();
        } else {
            // Ako nema exportane funkcije, direktno pozovi getExercise
            console.log("initZadatci nije funkcija, pokušavam getExercise");
        }
        
    } catch (error) {
        console.error("Greška pri učitavanju stranice 2:", error);
        
        // Fallback poruka ako ne uspije
        const container = document.getElementById('scene2');
        if (container) {
            container.innerHTML = '<p style="color: #ff6969; padding: 20px;">Došlo je do greške pri učitavanju vizualizacije. Provjerite konzolu za više detalja.</p>';
        }
    }
}

export async function cleanupPage2() {
    console.log("Čistim stranicu 2");
    
    try {
        // Pozovi cleanup funkciju iz mainPovrsina.js
        cleanup();
        cleanupZadatci();
    } catch (error) {
        console.error("Greška pri čišćenju stranice 2:", error);
    }
}