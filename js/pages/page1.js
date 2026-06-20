// Importiraj tvoj postojeći kod iz zadatciKocka.js
import { init, cleanup } from '../main/mainKocka.js';
import { initZadatci, cleanupZadatci } from '../zadatci/zadatciKocka.js';

export async function initPage1() {
    console.log("Inicijaliziram stranicu 1 - Zadatci za kocku");
    
    try {
        // Pozovi inicijalizaciju zadataka
        if (typeof init === 'function') {
            init();
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
        
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("Stranica 1 inicijalizirana");
    } catch (error) {
        console.error("Greška pri inicijalizaciji stranice 1:", error);
    }
}

export async function cleanupPage1() {
    console.log("Čistim stranicu 1");
    try {
        // Pozovi cleanup funkciju iz mainPovrsina.js
        cleanup();
        cleanupZadatci();
    } catch (error) {
        console.error("Greška pri čišćenju stranice 2:", error);
    }
}