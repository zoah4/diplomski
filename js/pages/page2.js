import { init, cleanup } from '../main/mainStozac.js';
import { initZadatci, cleanupZadatci } from '../zadatci/zadatciStozac.js';

export async function initPage2() {
    try {
        //inicijalizacija stranice
        if (typeof init === 'function') {
            await init('scene2');
        } 

        //inicijalizacija zadataka
        if (typeof initZadatci === 'function') {
            initZadatci();
        } 
        
    } catch (error) {
        console.error("Greška pri učitavanju stranice 2:", error);
        
        //ako se scena ne uspije učitati
        const container = document.getElementById('scene2');
        if (container) {
            container.innerHTML = '<p style="color: #ff6969; padding: 20px;">Došlo je do greške pri učitavanju vizualizacije. Provjerite konzolu za više detalja.</p>';
        }
    }
}

export async function cleanupPage2() {
    //čišćenje stranice i zadataka
    try {
        cleanup();
        cleanupZadatci();
    } catch (error) {
        console.error("Greška pri čišćenju stranice 2:", error);
    }
}