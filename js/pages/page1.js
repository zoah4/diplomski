import { init, cleanup } from '../main/mainKocka.js';
import { initZadatci, cleanupZadatci } from '../zadatci/zadatciKocka.js';

export async function initPage1() {
    try {
        //inicijalizacija stranice
        if (typeof init === 'function') {
            init();
        } 

        //inicijalizacija zadataka
        if (typeof initZadatci === 'function') {
            initZadatci();
        } 
        
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
        console.error("Greška pri inicijalizaciji stranice 1:", error);
    }
}

export async function cleanupPage1() {
    //čišćenje stranice i zadataka
    try {
        cleanup();
        cleanupZadatci();
    } catch (error) {
        console.error("Greška pri čišćenju stranice 2:", error);
    }
}