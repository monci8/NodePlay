export default {
    structures: {
        lists: "Lists",
        singly: "Singly Linked",
        doubly: "Doubly Linked",
        circularSingly: "Circular Singly Linked",
        activeList: "List activity:",

        singlyList: "Singly Linked List",
        doublyList: "Doubly Linked List",
        circularSinglyList: "Circular Singly Linked List",

        stack: "Stack",
        queue: "Queue",
        trees: "Tree Data Structures",
        bvs: "Binary Search Tree",
        avl: "AVL Tree",
        hashes: "Hash Tables"
    },

    methodBar: {
        initSentence: "Enter the number of elements to initialize:",
        count: "Count",
        key: "Key",
        clear: "Clear",
        enter: "Submit"
    },

    errors: {
        emptyInput: "Input cannot be empty!",
        onlyDigits: "Input must contain digits only!",
        max3Digits: "Maximum 3 digits!",
        max3Chars: "Maximum 3 characters!",
        max4Chars: "Maximum 4 characters!",
        inputNumber: "Enter a number!",
        biggerThanZero: "Number must be greater than 0!",
        lessThanHundred: "Number must be smaller than 100!",
    },

    warnings: {
        mustClean: "If you want to create your own structure, clear the area first.",
        animation: "An animation is in progress. You can speed it up. 🚀",
        stack: {
            mustInit: "First, initialize the structure using `InitStack(S)` or `Randomly generate structure`.",
        },
        queue: {
            mustInit: "First, initialize the structure using `InitQueue(Q)` or `Randomly generate structure`.",
        },
        lists: {
            mustInit: "First, initialize the structure using `InitList(L)` or `Randomly generate structure`.",
            singlyNotActive: "First, activate the list using `First(L)`.",
            doublyNotActive: "First, activate the list using `First(L)` or `Last(L)`.",
        },
        tables: {
            mustInit: "First, initialize the structure using `InitTable(T)` or `Randomly generate structure`.",
        },
    },

    status: {
        animation: "Animation in progress...",
        centering: "Centering in progress..."
    },

    home: {
        welcome: "Welcome to NodePlay!",
        description: "This application allows you to interactively explore data structures and the algorithms behind them.",
        tutorialButton: "Start the tutorial"
    },

    tutorial: {
        title: "How to use the application",
        steps: [
            "Select a data structure from the left menu (e.g., Binary Search Tree).",
            "Initialize the structure in the right menu (InitTable) and add nodes using the Insert operation. Alternatively, you can generate the structure randomly.",
            "You can use the pre-generated input or enter your own.",
            "The central area displays the animation of the performed operation.",
            "Use the toggle to choose whether you want to manually move and zoom the structure or have it automatically centered before and after the animation.",
            "Adjust the animation speed using the slider.",
            "If the structure accidentally disappears from the canvas, you can recenter it. To reset the structure, clear the canvas.",
            "Some methods return a result – it will be displayed in the output dialog.",
            "In the header, you can switch the language or open this tutorial."
        ]
    },

    header: {
        lang: "Language:",
        tutorial: "How to use the application",
        center: "Center graph"
    },

    slider: {
        title: "Animation speed",
        slow: "Slower",
        fast: "Faster"
    },

    footer: {
        random: "Randomly generate structure",
        clear: "Clear canvas",
        automaticCenter: "Auto centering",
        manualCenter: "Manual panning",
        speed: {
            slowest: "Slowest",
            slower: "Slower",
            medium: "Medium",
            faster: "Faster",
            fastest: "Fastest",
            unknown: "Unknown speed"
        }
    },

    outputDialog: {
        label: "Output"
    },

    list: {
        getFirstValue: "GetFirst(L): Value of the first node is {value}.",
        getFirstError: "GetFirst(L): ERROR – the list is empty!",
        getLastValue: "GetLast(L): Value of the last node is {value}.",
        getLastError: "GetLast(L): ERROR – the list is empty!",
        getActiveValue: "GetValue(L): Value of the active node is {value}.",
        getActiveError: "GetValue(L): ERROR – the list is not active!",
        notActive: "IsActive(L): False (the list is not active).",
        active: "IsActive(L): True (the list is active).",

        deleteFirstEmpty: "DeleteFirst(L): No action - attempting to delete the first element from an empty list.",
        deleteAfterEmpty: "DeleteAfter(L): No action - attempt to delete a non-existent element after the active element.",
        deleteLastEmpty: "DeleteLast(L): No action - attempting to delete the last element from an empty list.",
        deleteBeforeEmpty: "DeleteBefore(L): No action - attempting to delete the element before the active one from an empty list.",
        firstEmpty: "First(L): No action - the list is empty.",
        lastEmpty: "Last(L): No action - the list is empty.",
        setActiveValue: "SetValue(L): The value of the active element has been changed to {value}.",
    },

    stack: {
        top: "Top(S): The value of the top element of the stack is {value}.",
        topError: "Top(S): ERROR – the stack is empty!",
        empty: "IsEmpty(S): True (the stack is empty).",
        notEmpty: "IsEmpty(S): False (the stack is not empty).",
        full: "IsFull(S): True (the stack is full).",
        notFull: "IsFull(S): False (the stack is not full).",
        addFull: "Push(S, El): No action - attempting to add an element to a full stack.",
        removeEmpty: "Pop(S): No action - attempting to remove an element from an empty stack.",
    },

    queue: {
        front: "Front(Q): Value of the first element in the queue is {value}.",
        frontError: "Front(Q): ERROR – the queue is empty!",
        empty: "IsEmpty(Q): True (the queue is empty).",
        notEmpty: "IsEmpty(Q): False (the queue is not empty).",
        full: "IsFull(Q): True (the queue is full).",
        notFull: "IsFull(Q): False (the queue is not full).",
        addFull: "Add(Q, El): No action - attempting to add an element to a full queue.",
        removeEmpty: "Remove(Q): No action - attempting to remove an element from an empty queue.",
    },

    tree: {
        searchFound: "Search(T, K): True (a node with key {key} exists in the tree).",
        searchNotFound: "Search(T, K): False (a node with key {key} does not exist in the tree).",
        height: "Height(T): The height of the tree is {height}.",

        deleteEmpty: "Delete(T, K): No action - attempting to delete a node from an empty tree.",
    },
}
