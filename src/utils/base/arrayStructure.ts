import BaseStructure, {NodeData} from "@/utils/base/baseStructure";
import cytoscape, {StylesheetJson} from "cytoscape";

const nodeHeight: number = 50
const nodeWidth: number = 50
const indexHeight: number = 20
const initX: number = 450
const initY: number = 300

/**
 * Abstract class representing an array-based structure using Cytoscape.js.
 * This class extends BaseStructure and provides common methods for managing nodes in an array-like structure.
 */
export default abstract class ArrayStructure extends BaseStructure {
    protected initNumber: number;           // Number of initialized array elements
    protected structureNodeArray: NodeData[]; // Array of nodes used in animation
    protected tempNodeArray: NodeData[];    // Temporary nodes for visualization

    /**
     * Constructor to initialize the array structure.
     * @param containerId - The ID of the HTML element where the structure is displayed.
     */
    constructor(containerId: string) {
        super(containerId);
        this.initNumber = 0;
        this.structureNodeArray = [];
        this.tempNodeArray = [];
    }

    /**
     * Updates the graph with the current nodes.
     * Combines the structure and temporary nodes and updates the visualization.
     */
    protected setAndUpdateGraph(): void {
        this.nodes = [...this.structureNodeArray, ...this.tempNodeArray];
        this.updateGraph();
    }

    /**
     * Finds the index of a given node in the temporary node array.
     * @param node - The node to find.
     * @returns The index of the node, or -1 if not found.
     */
    protected findIndexOfNodeInArray(node: NodeData): number {
        return this.tempNodeArray.findIndex(n => n.id === node.id);
    }

    /**
     * Adds a temporary node with an animation effect.
     * @param newNode - The temporary node to add.
     * Updates the graph and visually animates the addition.
     */
    protected async addTempNodeWithAnimation(newNode: NodeData): Promise<void> {
        this.tempNodeArray.push(newNode);
        this.setAndUpdateGraph();

        const node = this.findNodeInGraph(newNode);
        this.animateAddingElement(node);
        await this.wait();

        const index = this.findIndexOfNodeInArray(newNode);
        this.tempNodeArray[index].opacity = 1;
    }

    /**
     * Deletes a node from the temporary node array.
     * @param nodeIndex - The index of the node to be deleted.
     */
    protected deleteNodeFromArray(nodeIndex: number): void {
        if (nodeIndex > -1) {
            this.tempNodeArray.splice(nodeIndex, 1); // Removes the node from the array
        }
    }

    /**
     * Deletes a temporary node with an animation effect.
     * @param nodeToDelete - The temporary node to delete.
     * Animates the deletion and updates the graph.
     */
    protected async deleteTempNodeWithAnimation(nodeToDelete: NodeData): Promise<void> {
        const node = this.findNodeInGraph(nodeToDelete);
        this.animateDeletingElement(node);

        await this.wait();

        const index: number = this.findIndexOfNodeInArray(nodeToDelete);
        this.deleteNodeFromArray(index);

        this.setAndUpdateGraph();
    }

    /**
     * Initializes the structure with a specified number of nodes.
     * @param init - The number of nodes to initialize.
     *
     * Creates an array structure and index nodes for visualization.
     * Each element and its index are placed horizontally with a fixed distance.
     */
    public initStructure(init: number): void {
        if (this.isInit) return;

        // Initialize the graph
        this.initGraph();
        this.initNumber = init;

        // Create array nodes for the data structure
        for (let i = 0; i < this.initNumber; i++) {
            const initNode: NodeData = {
                id: "node " + i,
                value: "",
                x: initX + nodeWidth * i,
                y: initY,
                class: "arrayNode"
            };
            this.structureNodeArray.push(initNode);
        }

        // Create index nodes below each data node
        for (let i = 0; i < this.initNumber; i++) {
            const indexNode: NodeData = {
                id: "index " + i,
                value: i,
                x: initX + nodeWidth * i,
                y: initY + 40,
                class: "indexNode"
            };
            this.tempNodeArray.push(indexNode);
        }

        this.setAndUpdateGraph();
        this.centerCanvas(true);
        this.isInit = true;
    }

    /**
     * Initializes the graphical representation of the array structure.
     * Sets up the styles for array nodes and index nodes using Cytoscape.js.
     */
    protected initGraph(): void {
        const graphStyles: StylesheetJson = [
            {
                selector: ".arrayNode",
                style: {
                    "width": nodeWidth,
                    "height": nodeHeight,
                    "shape": "rectangle",
                    "border-color": "black",
                    "border-width": 1,
                    "background-width": "100%",
                    "background-height": "100%",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI1OSIgaGVpZ2h0PSI1OSIgZmlsbD0iI0U4RTdFNyIgc3Ryb2tlPSJibGFjayIvPgo8L3N2Zz4K",
                    "label": "data(value)",
                    "text-valign": "center",
                    "text-halign": "center",
                    "color": "black",
                    "font-size": 16
                }
            },
            {
                selector: ".indexNode",
                style: {
                    "width": nodeWidth,
                    "height": indexHeight,
                    "shape": "rectangle",
                    "background-width": "100%",
                    "background-height": "100%",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA2MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
                    "label": "data(value)",
                    "text-valign": "center",
                    "text-halign": "center",
                    "color": "black",
                    "font-style": "italic",
                    "font-size": 14,
                }
            },
            {
                selector: "node, edge",
                style: {
                    "events": "no",
                    "overlay-padding": 0,
                }
            }
        ];

        this.graph = cytoscape({
            container: document.getElementById(this.containerId),
            style: graphStyles,
            autolock: true,
            autounselectify: true,
            autoungrabify: true,
            maxZoom: 2,
            wheelSensitivity: 0.2
        });
    }

    /**
     * Resets the array structure to its initial state.
     * Clears the data and temporary nodes.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;

        // Call the parent class reset to maintain the base structure's state.
        super.resetStructure();

        this.structureNodeArray = [];
        this.tempNodeArray = [];
    }

    /**
     * Adds a new element to the array structure.
     * Must be implemented in the child class.
     * @param element - The value to be added.
     */
    public abstract addElement(element: string): void;

    /**
     * Removes an element from the array structure.
     * Must be implemented in the child class.
     */
    public abstract removeElement(): void;

    /**
     * Checks whether the array structure is empty.
     * Must be implemented in the child class.
     */
    public abstract isEmpty(): void;

    /**
     * Checks whether the array structure is full.
     * Must be implemented in the child class.
     */
    public abstract isFull(): void;

    /**
     * Retrieves the foremost element from the array structure.
     * Must be implemented in the child class.
     */
    public abstract foremostElement(): Promise<void>;

    /**
     * Inserts a new element into the array.
     * Must be implemented in the child class.
     * @param element - The value to be inserted.
     */
    protected abstract insertToArray(element: string): void;

    /**
     * Generates a random structure with a random number of elements.
     * Uses the parent method to initialize the structure, then fills it with random elements.
     */
    public randomStructure(): void {
        // Call the parent class method to initialize the basic structure
        super.randomStructure();

        // Generate a random number of initial elements (between 5 and 10)
        const initNum = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        this.initStructure(initNum);

        // Generate a random number of filled elements (between 2 and initNum - 3)
        const numOfElements = Math.floor(Math.random() * (initNum - 3 + 1)) + 2;

        // Fill the array with random numbers
        for (let i: number = 0; i < numOfElements; i++) {
            const element: number = Math.floor(Math.random() * 100);
            this.insertToArray(String(element));
        }

        this.setAndUpdateGraph();
    }
}