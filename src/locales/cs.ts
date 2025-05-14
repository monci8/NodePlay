export default {
    structures: {
        lists: "Seznamy",

        singly: "Jednosměrně vázaný",
        doubly: "Dvousměrně vázaný",
        circularSingly: "Kruhový jednosměrný",
        activeList: "Aktivita seznamu:",

        singlyList: "Jednosměrně vázaný seznam",
        doublyList: "Dvousměrně vázaný seznam",
        circularSinglyList: "Kruhový jednosměrný seznam",
        stack: "Zásobník",
        queue: "Fronta",
        trees: "Stromové datové struktury",
        bvs: "Binární vyhledávací strom",
        avl: "AVL strom",
        hashes: "Hashovací tabulky"
    },

    methodBar: {
        initSentence: "Zadej počet prvků, který se má inicializovat:",
        count: "Počet",
        key: "Klíč",
        clear: "Smazat",
        enter: "Potvrdit"
    },

    errors: {
        emptyInput: "Vstup nesmí být prázdný!",
        onlyDigits: "Vstup smí obsahovat pouze číslice!",
        max3Digits: "Maximálně 3 číslice!",
        max3Chars: "Maximálně 3 znaky!",
        max4Chars: "Maximálně 4 znaky!",
        inputNumber: "Zadej číslo!",
        biggerThanZero: "Číslo musí být větší než 0!",
        lessThanHundred: "Číslo musí být menší než 100!",
    },

    warnings: {
        mustClean: "Jestli chceš vytvořit vlastní strukturu, nejprve vyčisti plochu.",
        animation: "Animace je v procesu. Můžeš si ji klidně zrychlit. 🚀",
        stack: {
            mustInit: "Nejdříve inicializuj strukturu pomocí `InitStack(S)` nebo `Náhodně vygenerovat strukturu`.",
        },
        queue: {
            mustInit: "Nejdříve inicializuj strukturu pomocí `InitQueue(Q)` nebo `Náhodně vygenerovat strukturu`.",
        },
        lists: {
            mustInit: "Nejdříve inicializuj strukturu pomocí `InitList(L)` nebo `Náhodně vygenerovat strukturu`.",
            singlyNotActive: "Nejdříve aktivuj seznam pomocí `First(L)`.",
            doublyNotActive: "Nejdříve aktivuj seznam pomocí `First(L)` nebo `Last(L)`.",
        },
        tables: {
            mustInit: "Nejdříve inicializuj strukturu pomocí `InitTable(T)` nebo `Náhodně vygenerovat strukturu`.",
        },
    },

    status: {
        animation: "Probíhá animace...",
        centering: "Probíhá centrování..."
    },

    home: {
        welcome: "Vítej v NodePlay!",
        description: "Tato aplikace ti umožní interaktivně prozkoumat datové struktury a algoritmy nad nimi.",
        tutorialButton: "Začít s tutoriálem"
    },

    tutorial: {
        title: "Jak používat aplikaci",
        steps: [
            "V levém menu si vyber datovou strukturu (např. Binární vyhledávací strom).",
            "V pravém menu inicializuj strukturu (InitTable) a přidej uzly pomocí operace Insert. Případně si můžeš nechat strukturu vygenerovat náhodně.",
            "Vstup můžeš použít ten předgenerovaný, nebo si zadat vlastní.",
            "Střední část zobrazuje animaci provedené operace.",
            "Pomocí přepínače můžeš určit, zda chceš strukturu posouvat a přibližovat manuálně, nebo se před a po animaci provede automatické centrování.",
            "Pomocí posuvníku si nastav rychlost animace.",
            "Pokud se ti struktura náhodou ztratí na plátně, můžeš ji vycentrovat. Pro resetování struktury vyčisti plochu.",
            "Některé metody vrací výsledek – ten se zobrazí ve výstupním dialogu.",
            "V horní liště můžeš přepnout jazyk nebo otevřít tento tutoriál."
        ]
    },

    header: {
        lang: "Jazyk:",
        tutorial: "Jak používat aplikaci",
        center: "Centrovat graf"
    },

    slider: {
        title: "Rychlost animace",
        slow: "Pomaleji",
        fast: "Rychleji",
    },

    footer: {
        random: "Náhodně vygenerovat strukturu",
        clear: "Vyčistit plochu",
        automaticCenter: "Automatické centrování",
        manualCenter: "Manuální posouvání",
        speed: {
            slowest: "Nejpomalejší",
            slower: "Pomalejší",
            medium: "Střední",
            faster: "Rychlejší",
            fastest: "Nejrychlejší",
            unknown: "Neznámá rychlost"
        }
    },

    outputDialog: {
        label: "Výstup"
    },

    list: {
        getFirstValue: "GetFirst(L): Hodnota prvního prvku je {value}.",
        getFirstError: "GetFirst(L): CHYBA – seznam je prázdný!",
        getLastValue: "GetLast(L): Hodnota posledního prvku je {value}.",
        getLastError: "GetLast(L): CHYBA – seznam je prázdný!",
        getActiveValue: "GetValue(L): Hodnota aktivního prvku je {value}.",
        getActiveError: "GetValue(L): CHYBA – seznam není aktivní!",
        notActive: "IsActive(L): False (seznam není aktivní).",
        active: "IsActive(L): True (seznam je aktivní).",

        deleteFirstEmpty: "DeleteFirst(L): Žádná akce - pokus o smazání prvního prvku v prázdném seznamu.",
        deleteAfterEmpty: "DeleteAfter(L): Žádná akce - pokus o smazání neexistujícího prvku za aktivním prvkem.",
        deleteLastEmpty: "DeleteLast(L): Žádná akce - pokus o smazání posledního prvku v prázdném seznamu.",
        deleteBeforeEmpty: "DeleteBefore(L): Žádná akce - pokus o smazání prvku před aktivním prvkem v prázdném seznamu.",
        firstEmpty: "First(L): Žádná akce - seznam je prázdný.",
        lastEmpty: "Last(L): Žádná akce - seznam je prázdný.",
        setActiveValue: "SetValue(L): Hodnota aktivního prvku byla změněna na hodnotu {value}.",
    },
    stack: {
        top: "Top(S): Hodnota prvku na vrcholu zásobníku je {value}.",
        topError: "Top(S): CHYBA – zásobník je prázdný!",
        empty: "IsEmpty(S): True (zásobník je prázdný).",
        notEmpty: "IsEmpty(S): False (zásobník není prázdný).",
        full: "IsFull(S): True (zásobník je plný).",
        notFull: "IsFull(S): False (zásobník není plný).",
        addFull: "Push(S, El): Žádná akce - pokus o přidání prvku do plného zásobníku.",
        removeEmpty: "Pop(S): Žádná akce - pokus o odstranění prvku z prázdného zásobníku.",
    },

    queue: {
        front: "Front(Q): Hodnota prvního prvku ve frontě je {value}.",
        frontError: "Front(Q): CHYBA – fronta je prázdná!",
        empty: "IsEmpty(Q): True (fronta je prázdná).",
        notEmpty: "IsEmpty(Q): False (fronta není prázdná).",
        full: "IsFull(Q): True (fronta je plná).",
        notFull: "IsFull(Q): False (fronta není plná).",
        addFull: "Add(Q, El): Žádná akce - pokus o přidání prvku do plné fronty.",
        removeEmpty: "Remove(Q): Žádná akce - pokus o odstranění prvku z prázdné fronty.",
    },

    tree: {
        searchFound: "Search(T, K): True (uzel s klíčem {key} se nachází ve stromu).",
        searchNotFound: "Search(T, K): False (uzel s klíčem {key} se nenachází ve stromu).",
        height: "Height(T): Strom má výšku {height}.",

        deleteEmpty: "Delete(T, K): Žádná akce - pokus o smazání uzlu v prázdném stromu.",
    }
}