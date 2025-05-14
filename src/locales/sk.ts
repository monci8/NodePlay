export default {
    structures: {
        lists: "Zoznamy",
        singly: "Jednosmerne viazaný",
        doubly: "Dvojsmerne viazaný",
        circularSingly: "Kruhový jednosmerný",
        activeList: "Aktivita zoznamu:",

        singlyList: "Jednosmerne viazaný zoznam",
        doublyList: "Dvojsmerne viazaný zoznam",
        circularSinglyList: "Kruhový jednosmerný zoznam",

        stack: "Zásobník",
        queue: "Fronta",
        trees: "Stromové dátové štruktúry",
        bvs: "Binárny vyhľadávací strom",
        avl: "AVL strom",
        hashes: "Tabuľky s rozptýlenými položkami"
    },

    methodBar: {
        initSentence: "Zadaj počet prvkov, ktorý sa má inicializovať:",
        count: "Počet",
        key: "Kľúč",
        clear: "Zmazať",
        enter: "Potvrďiť"
    },

    errors: {
        emptyInput: "Vstup nemôže byť prázdny!",
        onlyDigits: "Vstup musí obsahovať iba číslice!",
        max3Digits: "Maximálne 3 cifry!",
        max3Chars: "Maximálne 3 znaky!",
        max4Chars: "Maximálne 4 znaky!",
        inputNumber: "Zadaj číslo!",
        biggerThanZero: "Číslo musí byť väčšie ako 0!",
        lessThanHundred: "Číslo musí byť menšie ako 100!",
    },

    warnings: {
        animation: "Animácia práve prebieha. Môžeš si ju kľudne zrýchliť. 🚀",
        mustClean: "Ak chceš vytvoriť vlastnú štruktúru, najprv vyčisti plochu.",
        stack: {
            mustInit: "Najskôr inicializuj štruktúru pomocou `InitStack(S)` alebo `Náhodne vygenerovať štruktúru`.",
        },
        queue: {
            mustInit: "Najskôr inicializuj štruktúru pomocou `InitQueue(Q)` alebo `Náhodne vygenerovať štruktúru`.",
        },
        lists: {
            mustInit: "Najskôr inicializuj štruktúru pomocou `InitList(L)` alebo `Náhodne vygenerovať štruktúru`.",
            singlyNotActive: "Najskôr aktivuj zoznam pomocou `First(L)`.",
            doublyNotActive: "Najskôr aktivuj zoznam pomocou `First(L)` alebo `Last(L)`.",
        },
        tables: {
            mustInit: "Najskôr inicializuj štruktúru pomocou `InitTable(T)` alebo `Náhodne vygenerovať štruktúru`.",
        },
    },

    status: {
        animation: "Prebieha animácia...",
        centering: "Prebieha centrovanie..."
    },

    home: {
        welcome: "Vitaj v NodePlay!",
        description: "Táto aplikácia ti umožní interaktívne preskúmať dátové štruktúry a algoritmy nad nimi.",
        tutorialButton: "Začať s tutoriálom"
    },

    tutorial: {
        title: "Ako používať aplikáciu",
        steps: [
            "V ľavom menu si vyber dátovú štruktúru (napr. Binárny vyhľadávací strom).",
            "V pravom menu inicializuj štruktúru (InitTable) a pridaj uzly pomocou operácie Insert. Prípadne si môžeš nechať štruktúru vygenerovať náhodne.",
            "Vstup môžeš použiť ten predgenerovaný, alebo si zadať vlastný.",
            "Stredná časť zobrazuje animáciu vykonanej operácie.",
            "Prepínačom môžeš zvoliť, či chceš štruktúru posúvať a približovať manuálne, alebo sa pred a po animácii vykoná automatické centrovanie.",
            "Pomocou posuvníka si nastav rýchlosť animácie.",
            "Ak sa ti štruktúra náhodou stratí na plátne, môžeš ju vycentrovať. Pre resetovanie štruktúry vyčisti plochu.",
            "Niektoré metódy vracajú výsledok – ten sa zobrazí vo výstupnom dialógu.",
            "V hlavičke môžeš prepnúť jazyk alebo otvoriť tento tutoriál."
        ]
    },
    header: {
        lang: "Jazyk:",
        tutorial: "Ako používať aplikáciu",
        center: "Centrovať graf"
    },

    slider: {
        title: "Rýchlosť animácie",
        slow: "Pomalšie",
        fast: "Rýchlejšie"
    },

    footer: {
        random: "Náhodne vygenerovať štruktúru",
        clear: "Vyčistiť plochu",
        automaticCenter: "Automatické centrovanie",
        manualCenter: "Manuálne posúvanie",
        speed: {
            slowest: "Najpomalšie",
            slower: "Pomalšie",
            medium: "Stredná",
            faster: "Rýchlejšie",
            fastest: "Najrýchlejšie",
            unknown: "Neznáma rýchlosť"
        }
    },

    outputDialog: {
        label: "Výstup"
    },

    list: {
        getFirstValue: "GetFirst(L): Hodnota prvého prvku je {value}.",
        getFirstError: "GetFirst(L): CHYBA – zoznam je prázdny!",
        getLastValue: "GetLast(L): Hodnota posledného prvku je {value}.",
        getLastError: "GetLast(L): CHYBA – zoznam je prázdny!",
        getActiveValue: "GetValue(L): Hodnota aktívneho prvku je {value}.",
        getActiveError: "GetValue(L): CHYBA – zoznam nie je aktívny!",
        notActive: "IsActive(L): False (zoznam nie je aktívny).",
        active: "IsActive(L): True (zoznam je aktívny).",

        deleteFirstEmpty: "DeleteFirst(L): Žiadna akcia - pokus o vymazanie prvého prvku v prázdnom zozname.",
        deleteAfterEmpty: "DeleteAfter(L): Žiadna akcia - pokus o vymazanie neexistujúceho prvku za aktívnym prvkom.",
        deleteLastEmpty: "DeleteLast(L): Žiadna akcia - pokus o vymazanie posledného prvku v prázdnom zozname.",
        deleteBeforeEmpty: "DeleteBefore(L): Žiadna akcia - pokus o vymazanie prvku pred aktívnym prvkom v prázdnom zozname.",
        firstEmpty: "First(L): Žiadna akcia - zoznam je prázdny.",
        lastEmpty: "Last(L): Žiadna akcia - zoznam je prázdny.",
        setActiveValue: "SetValue(L): Hodnota aktívneho prvku bola zmenená na hodnotu {value}.",
    },

    stack: {
        top: "Top(S): Hodnota prvku na vrchole zásobníka je {value}.",
        topError: "Top(S): CHYBA – zásobník je prázdny!",
        empty: "IsEmpty(S): True (zásobník je prázdny).",
        notEmpty: "IsEmpty(S): False (zásobník nie je prázdny).",
        full: "IsFull(S): True (zásobník je plný).",
        notFull: "IsFull(S): False (zásobník nie je plný).",
        addFull: "Push(S, El): Žiadna akcia - pokus o pridanie prvku do plného zásobníka.",
        removeEmpty: "Pop(S): Žiadna akcia - pokus o odstránenie prvku z prázdneho zásobníka.",
    },

    queue: {
        front: "Front(Q): Hodnota prvku na začiatku fronty je {value}.",
        frontError: "Front(Q): CHYBA – fronta je prázdna!",
        empty: "IsEmpty(Q): True (fronta je prázdna).",
        notEmpty: "IsEmpty(Q): False (fronta nie je prázdna).",
        full: "IsFull(Q): True (fronta je plná).",
        notFull: "IsFull(Q): False (fronta nie je plná).",
        addFull: "Add(Q, El): Žiadna akcia - pokus o pridanie prvku do plnej fronty.",
        removeEmpty: "Remove(Q): Žiadna akcia - pokus o odstránenie prvku z prázdnej fronty.",
    },

    tree: {
        searchFound: "Search(T, K): True (uzol s kľúčom {key} sa nachádza v strome).",
        searchNotFound: "Search(T, K): False (uzol s kľúčom {key} sa nenachádza v strome).",
        height: "Height(T): Strom má výšku {height}.",

        deleteEmpty: "Delete(T, K): Žiadna akcia - pokus o vymazanie uzla v prázdnom strome.",
    }
}
