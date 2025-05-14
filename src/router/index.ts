import { createRouter, createWebHistory } from 'vue-router';

// Import components representing different data structures and pages
import SinglyLinkedList from "@/components/structures/singlyLinkedList/Visualization.vue";
import DoublyLinkedList from "@/components/structures/doublyLinkedList/Visualization.vue";
import CircularSinglyLinkedList from "@/components/structures/circularSinglyLinkedList/Visualization.vue";
import Stack from "@/components/structures/stack/Visualization.vue";
import Queue from "@/components/structures/queue/Visualization.vue";
import BinarySearchTree from "@/components/structures/binarySearchTree/Visualization.vue";
import Tutorial from "@/components/Tutorial.vue";
import Home from "@/components/Home.vue"

// Define application routes, mapping URLs to components
const routes = [
    {
        path: '/',   // Root path for the home page
        name: 'Home',
        component: Home,
    },
    {
        path: '/tutorial',
        name: 'How to use the application',
        component: Tutorial,
    },
    {
        path: '/singly-linked-list',
        name: 'Singly Linked List',
        component: SinglyLinkedList,
    },
    {
        path: '/doubly-linked-list',
        name: 'Doubly Linked List',
        component: DoublyLinkedList,
    },
    {
        path: '/circular-singly-linked-list',
        name: 'Circular Singly Linked List',
        component: CircularSinglyLinkedList,
    },
    {
        path: '/stack',
        name: 'Stack',
        component: Stack,
    },
    {
        path: '/queue',
        name: 'Queue',
        component: Queue,
    },
    {
        path: '/binary-search-tree',
        name: 'Binary Search Tree',
        component: BinarySearchTree,
    },
];

// Create the router instance with history mode for navigation
const router = createRouter({
    history: createWebHistory('/~xzahra33/'),   // Base URL for history mode
    routes,   // Register the defined routes
});

// Export the router instance to be used in the main application
export default router;
