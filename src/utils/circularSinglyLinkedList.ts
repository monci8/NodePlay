import SinglyLinkedList from "@/utils/singlyLinkedList";
import { StylesheetJsonBlock } from "cytoscape";
import { EdgeData, NodeData } from "@/utils/base/baseStructure";

/**
 * CircularSinglyLinkedList - Represents a visualized circular singly linked list.
 * This class inherits from SinglyLinkedList and adds circular linking functionality.
 */
export default class CircularSinglyLinkedList extends SinglyLinkedList {
    protected lastNode: NodeData | null;   // Stores the last node that has a circular edge.
    protected firstNode: NodeData | null;  // Stores the first node that the circular edge points to.
    protected addingInProcees: boolean;  // Indicates whether a new node is currently being added.

    /**
     * Constructor for initializing a circular singly linked list.
     * @param containerId - The ID of the HTML element where the list will be displayed.
     */
    constructor(containerId: string) {
        super(containerId);
        this.lastNode = null;
        this.firstNode = null;
        this.addingInProcees = false;

        // Adjust padding to center the circular list.
        this.paddingForCentering = 200;
    }

    /**
     * Finds the index of the circular edge in the edge array.
     * Circular edges are identified by having a class of either "circleEdge" or "singleNodeCircleEdge".
     * @returns The index of the circular edge, or -1 if not found.
     */
    protected findIndexOfCircleEdgeInArray(): number {
        return this.edges.findIndex(e => e.class === "circleEdge" || e.class === "singleNodeCircleEdge");
    }

    /**
     * Finds the index of a non-circular edge in the edge array.
     * Excludes edges with classes "circleEdge" and "singleNodeCircleEdge".
     * @param edge - The edge to find.
     * @returns The index of the specified edge, or -1 if not found.
     */
    protected findIndexOfEdgeInArray(edge: EdgeData): number {
        return this.edges.findIndex(
            e =>
                e.source === edge.source &&
                e.target === edge.target &&
                e.class !== "circleEdge" &&
                e.class !== "singleNodeCircleEdge");
    }

    /**
     * Finds an edge connecting the given source and target nodes.
     * Excludes circular edges with classes "circleEdge" and "singleNodeCircleEdge".
     * @param sourceNode - The starting node of the edge.
     * @param targetNode - The ending node of the edge.
     * @returns The found edge or undefined if no matching edge is found.
     */
    protected findEdgeInArray(sourceNode: NodeData|null, targetNode: NodeData|null): EdgeData|undefined {
        if (sourceNode === null && targetNode === null) return undefined;

        if (targetNode === null) {
            // Find an edge where the source matches, ignoring circular edges.
            return this.edges.find(edge =>
                edge.source === sourceNode!.id &&
                edge.class !== "circleEdge" &&
                edge.class !== "singleNodeCircleEdge");
        }
        else if (sourceNode === null) {
            // Find an edge where the target matches, ignoring circular edges.
            return this.edges.find(edge =>
                edge.target === targetNode.id &&
                edge.class !== "circleEdge" &&
                edge.class !== "singleNodeCircleEdge");
        }
        else {
            // Find an edge that matches both source and target, excluding circular edges.
            return this.edges.find(edge =>
                edge.source === sourceNode.id &&
                edge.target === targetNode.id &&
                edge.class !== "circleEdge" &&
                edge.class !== "singleNodeCircleEdge");
        }
    }

    /**
     * Normalizes the graph structure to maintain consistency.
     * Calls the parent class method to normalize,
     * then adds the circular edge to maintain the circular property of the list.
     */
    protected normalizeGraph(): void {
        super.normalizeGraph();
        this.addCircularEdge();
    }

    /**
     * Adds or updates the circular edge in the circular singly linked list.
     * Maintains the circular connection between the last and first nodes.
     * Handles two cases:
     * 1. Initial circular edge creation.
     * 2. Updating the circular edge after node addition.
     */
    protected addCircularEdge(): void {
        if (this.nodes.length < 2) return;

        // Case 1: Initial circular edge creation
        if (this.lastNode === null && this.firstNode === null) {
            // Set the last and first nodes for the first time
            this.lastNode = this.nodes[this.nodes.length - 1];
            this.firstNode = this.nodes[1];

            // Create the initial circular edge connecting the last node to the first node
            const circleEdge: EdgeData = {
                source: this.lastNode.id,
                target: this.firstNode.id,
                class: "singleNodeCircleEdge",
                opacity: 1
            };

            // Add the circular edge to the list of edges and update the node classes
            this.edges.push(circleEdge);
            this.setClassToNodes();
        }

        // Case 2: Update the circular edge after a node addition
        else if (!this.addingInProcees) {
            // If no node addition animation is in progress, update the circular edge

            // Find the current circular edge index in the edges array
            const circleEdgeIndex: number = this.findIndexOfCircleEdgeInArray();

            // Update the last and first nodes based on the current state
            this.lastNode = this.nodes[this.nodes.length - 1];
            this.firstNode = this.nodes[1];

            // Update the circular edge to reflect the current last and first nodes
            this.edges[circleEdgeIndex].source = this.lastNode.id;
            this.edges[circleEdgeIndex].target = this.firstNode.id;

            // Adjust the edge class depending on whether the list contains a single node
            if (this.lastNode === this.firstNode) {
                // If the list has a single node, use the single node circular edge class
                this.edges[circleEdgeIndex].class = "singleNodeCircleEdge";
            } else {
                // If there are multiple nodes, use the standard circular edge class
                this.edges[circleEdgeIndex].class = "circleEdge";
            }
        }
    }

    /**
     * Initializes the graph with predefined styles and settings.
     * Sets up a custom style for the circle edge.
     */
    protected initGraph(): void {
        super.initGraph();

        const newEdgeStyles: StylesheetJsonBlock[] = [
            {
                selector: ".singleNodeCircleEdge",
                style: {
                    'width': 2,
                    'line-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': 'black',

                    'curve-style': 'unbundled-bezier',
                    'loop-direction': '0deg',
                    'loop-sweep': '-60deg',
                }
            },
            {
                selector: ".circleEdge",
                style: {
                    'width': 2,
                    'line-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': 'black',

                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': [125],
                    'control-point-weights': [0.5],

                    'source-endpoint': '0deg',
                    'target-endpoint': '0deg'
                }
            }
        ];

        // Adds a new edge style to the existing styles inherited from the parent class
        this.graph.style().fromJson([...this.graph.style().json(), ...newEdgeStyles]);
    }


    /**
     * Resets the circular singly linked list to its initial state.
     * Clears the last and first nodes and sets the adding process to false.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;

        super.resetStructure();
        this.lastNode = null;
        this.firstNode = null;
        this.addingInProcees = false;
    }

    /**
     * Inserts a new node at the beginning of the circular singly linked list.
     * Calls the parent method to perform the standard insertion.
     * Updates the circular edge and visual representation after insertion.
     * @param element - The value to be inserted as the first node.
     */
    public async insertFirstNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        this.addingInProcees = true;
        // Call the parent method to handle node insertion
        await super.insertFirstNode(element);

        this.animationInProcess = true;
        this.animationStatusCallback?.(true);

        this.addingInProcees = false;

        // Update the circular edge after the node insertion
        this.addCircularEdge();
        this.setClassToNodes();
        this.updateGraph();

        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
    }

    /**
     * Deletes the first node from the circular singly linked list.
     * Calls the parent method to perform the standard deletion.
     * Updates the circular edge and visual representation after deletion.
     */
    public async deleteFirstNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        // Call the parent method to handle node deletion
        await super.deleteFirstNode();

        this.animationInProcess = true;
        this.animationStatusCallback?.(true);

        // Check if the list only has the init pointer left
        if (this.nodes.length === 1) {
            // No nodes left, clear edges and reset circular references
            this.edges = [];
            this.lastNode = null;
            this.firstNode = null;
        }

        // Update the visual representation after deletion
        this.setClassToNodes();
        this.updateGraph();

        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
    }

    /**
     * Inserts a new node after the active node in the circular singly linked list.
     * Calls the parent method to perform the standard insertion.
     * Updates the circular edge and visual representation after insertion.
     * @param element - The value to be inserted after the active node.
     */
    public async insertAfterActiveNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        this.addingInProcees = true;
        // Call the parent method to handle node insertion
        await super.insertAfterActiveNode(element);
        this.addingInProcees = false;

        this.animationInProcess = true;
        this.animationStatusCallback?.(true);

        // Add the circular edge
        this.addCircularEdge();
        this.setClassToNodes();
        this.updateGraph();

        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
    }

    /**
     * Deletes the node that comes after the currently active node in the circular singly linked list.
     * Handles 2 cases:
     * 1. Active node is the last node pointing to the first (circular link) - deletes the first node.
     * 2. Standard case - there are multiple nodes, and the next node after the active one is deleted.
     */
    public async deleteAfterActiveNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        // Case 1: Active node is the last one and points to the first node (circular link)
        if (this.activeNode === this.nodes.length - 1 && this.activeNode !== 1) {
            await this.deleteFirstNode();
        }
        else {
            // Case 2: There are multiple nodes, use the standard deletion from the parent class
            await super.deleteAfterActiveNode();
        }

        this.setClassToNodes();
        this.updateGraph();
    }

    /**
     * Activates the next node in the circular singly linked list.
     * Handles 2 cases:
     * 1. Standard case - Moves the active node pointer to the next node.
     * 2. Circular case - If the active node is the last one, it loops back to the first node.
     */
    public async activateNextNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        this.animationInProcess = true;
        this.animationStatusCallback?.(true);

        // Case 1: Move to the next node
        this.activeNode++;

        // Case 2: If the active node goes beyond the last node, loop back to the first node
        if (this.activeNode >= this.nodes.length) {
            this.activeNode = 1;
        }

        this.setClassToNodes();
        this.updateGraph();

        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
    }

    /**
     * Generates a random circular singly linked list structure.
     * Inherits random generation from the parent class.
     */
    public randomStructure(): void {
        // Use the random generation from the parent class
        super.randomStructure();

        if (this.nodes.length <= 2) return;

        // Identify the first and last nodes in the list
        this.firstNode = this.nodes[1];
        this.lastNode = this.nodes[this.nodes.length - 1];

        // Try to find an existing circular edge
        const lastEdge = this.edges.find(
            e => e.source === this.lastNode!.id && e.target === this.firstNode!.id
        );

        if (lastEdge) {
            lastEdge.class = (this.firstNode === this.lastNode) ? "singleNodeCircleEdge" : "circleEdge";
        } else {
            this.edges.push({
                source: this.lastNode.id,
                target: this.firstNode.id,
                class: (this.firstNode === this.lastNode) ? "singleNodeCircleEdge" : "circleEdge",
                opacity: 1
            });
        }

        this.setClassToNodes();
        this.updateGraph();
        this.centerCanvas(true);
    }
}
