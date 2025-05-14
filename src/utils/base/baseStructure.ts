import { i18n } from "@/i18n";
const t = i18n.global.t;

/**
 * Represents the data structure for a single node in a graph.
 * Contains properties for node identification, position, appearance, and visibility.
 */
export interface NodeData {
    id: number|string;       // Unique identifier for the node
    value?: number|string;   // Optional value held by the node
    x: number;               // X coordinate of the node's position
    y: number;               // Y coordinate of the node's position
    class?: string;          // Optional visual class for styling
    opacity?: number;        // Optional opacity for visibility control
}

/**
 * Represents the data structure for an edge between two nodes in a graph.
 * Contains properties for defining connections and visual styling.
 */
export interface EdgeData {
    source: number|string;   // ID of the source node
    target: number|string;   // ID of the target node
    class?: string;          // Optional visual class for styling
    opacity?: number;        // Optional opacity for visibility control
}

/**
 * BaseStructure - An abstract class that serves as the base for visualizing
 * data structures. Manages nodes, edges, and animation settings.
 * Designed to be extended by specific data structure classes.
 */
export default abstract class BaseStructure {
    protected isInit: boolean;                 // Flag to check if the structure is initialized
    protected nodes: NodeData[];               // Array of nodes in the structure
    protected edges: EdgeData[];               // Array of edges connecting the nodes
    protected containerId: string;             // ID of the HTML element containing the graph
    protected graph: any | null;               // The Cytoscape graph instance
    protected animationInProcess: boolean;     // Indicates if an animation is currently running
    protected animationSpeed: number;          // Speed of animations in milliseconds
    protected centeringEnable: boolean;        // Flag to enable or disable automatic centering
    protected paddingForCentering: number;     // Padding used when centering the graph

    /**
     * Constructor to initialize the base structure with a given container ID.
     * Sets up default properties for nodes, edges and animation
     * @param containerId - The ID of the HTML element where the graph will be displayed.
     */
    constructor(containerId: string) {
        this.isInit = false;        // Initialize the structure as not set up
        this.nodes = [];            // Start with an empty list of nodes
        this.edges = [];            // Start with an empty list of edges

        this.containerId = containerId; // Store the container ID
        this.graph = null;          // No graph created

        this.animationInProcess = false; // No animation running initially
        this.animationSpeed = 400;  // Default speed for animations

        this.centeringEnable = true;      // Enable centering by default
        this.paddingForCentering = 100;   // Default padding for centering the graph
    }

    // Callback function for logging messages
    protected logCallback?: (message: { key: string, params?: Record<string, unknown> }) => void;

    /**
     * Sets a logging callback function to handle structured messages.
     * @param logger - The function to call for logging.
     */
    public setLogger(logger: (message: { key: string, params?: Record<string, unknown> }) => void) {
        this.logCallback = logger;
    }

    /**
     * Logs a message using the provided callback function or the default console.
     * Supports localization using the i18n library.
     * @param keyOrMessage - The message key or raw message to log.
     * @param params - Optional parameters for dynamic message content.
     */
    protected log(keyOrMessage: string, params?: Record<string, unknown>): void {
        const logObject = { key: keyOrMessage, params: params ?? {} };

        if (this.logCallback) {
            this.logCallback(logObject); // Use the callback if defined
        } else {
            const translated = t(logObject.key, logObject.params); // Translate message
            console.log(translated);  // Log to the console as a fallback
        }
    }

    /**
     * Checks whether the structure is initialized.
     * @returns True if the structure is initialized, false otherwise.
     */
    public isInitialized(): boolean {
        return this.isInit;
    }

    /**
     * Enables or disables automatic centering of the graph.
     * @param enable - Boolean flag to set centering on or off.
     */
    public setCenteringEnable(enable: boolean): void {
        this.centeringEnable = enable;
    }

    // Callback function to update status information
    protected statusInfoCallback: ((status: string) => void) | null = null;

    /**
     * Sets a callback function to update the status information.
     * @param callback - Function to be called with status updates.
     */
    public setStatusInfoCallback(callback: (status: string) => void) {
        this.statusInfoCallback = callback;
    }

    // Callback function to indicate animation status
    protected animationStatusCallback: ((isAnimating: boolean) => void) | null = null;

    /**
     * Sets a callback function to indicate when an animation is in progress.
     * @param callback - Function to be called when animation starts or ends.
     */
    public setAnimationStatusCallback(callback: (isAnimating: boolean) => void) {
        this.animationStatusCallback = callback;
    }

    /**
     * Sets the speed for animations.
     * @param speed - The desired animation speed in milliseconds.
     */
    public setAnimationSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    /**
     * Centers the graph within the canvas, making sure it fits well on the screen.
     * Adjusts the zoom and position to keep the graph in the middle.
     * @param enabled - If true, forces the centering even when disabled.
     */
    public async centerCanvas(enabled: boolean = false): Promise<void> {
        // Check if the graph is loaded
        if (!this.graph) {
            console.warn("The graph is not initialized yet!");
            return;
        }

        // If centering is not allowed and not explicitly requested, skip
        if (!this.centeringEnable && !enabled) return;

        const cy = this.graph;
        const elements = cy.elements();
        const box = elements.boundingBox();

        const canvasWidth = cy.width();
        const canvasHeight = cy.height();

        // Calculate how much to zoom to fit the entire graph on the screen
        const graphWidth = box.w + 2 * this.paddingForCentering;
        const graphHeight = box.h + 2 * this.paddingForCentering;

        // Find the best zoom level so the graph fits both horizontally and vertically
        const zoom = Math.min(canvasWidth / graphWidth, canvasHeight / graphHeight);

        // Apply the zoom to make the graph the right size
        cy.zoom(zoom);

        // Calculate the center of the graph
        const centerX = (box.x1 + box.x2) / 2;
        const centerY = (box.y1 + box.y2) / 2;

        // Figure out how to move the graph so that it's centered on the canvas
        const panX = canvasWidth / 2 - zoom * centerX;
        const panY = canvasHeight / 2 - zoom * centerY;

        // Move the graph to the calculated center position
        cy.pan({ x: panX, y: panY });
    }

    /**
     * Prepares the graph for animation.
     * Sets the animation state to active.
     * Displays a status message about centering and animation.
     * Centers the graph if centering is enabled.
     */
    protected async beforeAnimationStarts() {
        this.animationInProcess = true;
        this.animationStatusCallback?.(true);

        // If centering is enabled, show status and center the graph
        if (this.centeringEnable) {
            this.statusInfoCallback?.(t("status.centering"));
            await this.centerCanvas();
            await this.wait(1.5);
        }

        // Display animation status
        this.statusInfoCallback?.(t("status.animation"));
        await this.wait();
    }

    /**
     * Finalizes the animation process.
     * Optionally re-centers the graph.
     * Resets the animation state and clears the status message.
     */
    protected async afterAnimationEnds() {
        if (this.centeringEnable) {
            this.statusInfoCallback?.(t("status.centering"));
            await this.wait();
            await this.centerCanvas();
            await this.wait(1.5);
        }

        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
        this.statusInfoCallback?.("");
    }

    /**
     * Ends the animation without changing the graph.
     * Marks the animation as finished.
     * Clears the status message.
     */
    protected afterAnimationWithoutChange() {
        this.animationInProcess = false;
        this.animationStatusCallback?.(false);
        this.statusInfoCallback?.("");
    }

    /**
     * Pauses the animation for a given duration.
     * Uses a multiplier to adjust the waiting time.
     * @param multiplier - Adjusts the wait time relative to the animation speed.
     * @returns A promise that resolves after the delay.
     */
    protected wait(multiplier: number = 1): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.animationSpeed * multiplier));
    }

    /**
     * Finds the index of a given edge in the edges array.
     * Compares the source and target IDs to locate the correct edge.
     * @param edge - The edge to find.
     * @returns The index of the edge in the array, or -1 if not found.
     */
    protected findIndexOfEdgeInArray(edge: EdgeData): number {
        return this.edges.findIndex(e => e.source === edge.source && e.target === edge.target);
    }

    /**
     * Finds an edge in the array based on source and/or target nodes.
     * - Can search by source only, target only, or both.
     * @param sourceNode - The source node of the edge.
     * @param targetNode - The target node of the edge.
     * @returns The found edge or undefined if not present.
     */
    protected findEdgeInArray(sourceNode: NodeData|null, targetNode: NodeData|null): EdgeData|undefined {
        if (sourceNode === null && targetNode === null) return undefined;

        if (targetNode === null)
            return this.edges.find(edge => edge.source === sourceNode!.id);
        else if (sourceNode === null)
            return this.edges.find(edge => edge.target === targetNode.id);
        else
            return this.edges.find(edge => edge.source === sourceNode.id && edge.target === targetNode.id);
    }

    /**
     * Finds an edge in the graph by using its source and target IDs.
     * Uses Cytoscape's query syntax to locate the edge element.
     * @param edge - The edge to find.
     * @returns The Cytoscape graph element representing the edge.
     */
    protected findEdgeInGraph(edge: EdgeData): any {
        return this.graph.$(`edge[source="${edge.source}"][target="${edge.target}"]`);
    }

    /**
     * Finds a node in the graph by its ID.
     * Uses Cytoscape's query syntax to locate the node element.
     * @param node - The node to find.
     * @returns The Cytoscape graph element representing the node.
     */
    protected findNodeInGraph(node: NodeData): any {
        return this.graph.$(`node[id="${node.id}"]`);
    }

    /**
     * Finds the index of a node within the nodes array.
     * Compares the node's ID to identify its position.
     * @param node - The node to find.
     * @returns The index of the node in the array, or -1 if not found.
     */
    protected findIndexOfNodeInArray(node: NodeData): number {
        return this.nodes.findIndex(n => n.id === node.id);
    }

    /**
     * Animates the addition of a visual element to the graph.
     * Fades in the element by changing its opacity.
     * @param element - The graph element to animate (node or edge).
     */
    protected animateAddingElement(element: any): void {
        element.animate(
            { style: { opacity: 1 } },
            { duration: this.animationSpeed }
        );

        // Ensure the final opacity is set
        element.style({ opacity: 1 });
    }

    /**
     * Animates the removal of a visual element from the graph.
     * Fades out the element by reducing its opacity to zero.
     * If the element is an edge, make sure it's displayed before animation.
     * @param element - The graph element to animate (node or edge).
     * @param isEdge - Whether the element is an edge (default: false).
     */
    protected animateDeletingElement(element: any, isEdge: boolean = false): void {
        if (isEdge) element.style({ display: 'element', opacity: 1 });

        element.animate(
            { style: { opacity: 0 } },
            { duration: this.animationSpeed }
        );
    }

    /**
     * Deletes an edge from the edges array by its index.
     * @param edgeIndex - The index of the edge to delete.
     */
    protected deleteEdgeFromArray(edgeIndex: number): void {
        if (edgeIndex > -1){
            this.edges.splice(edgeIndex, 1);
        }
    }

    /**
     * Deletes a node from the nodes array by its index.
     * @param nodeIndex - The index of the node to delete.
     */
    protected deleteNodeFromArray(nodeIndex: number): void {
        if (nodeIndex > -1){
            this.nodes.splice(nodeIndex, 1);
        }
    }

    /**
     * Updates the visual style of a specific edge in the graph.
     * Finds the edge by its index and changes its class.
     * @param edge - The edge whose style needs to be changed.
     * @param classString - The new class to be assigned to the edge.
     */
    protected changeEdgeStyle(edge: EdgeData, classString: string): void {
        const index: number = this.findIndexOfEdgeInArray(edge);
        if (index > -1){
            this.edges[index].class = classString;
        }
        this.updateGraph();
    }

    /**
     * Initializes the base structure.
     * If the structure is already initialized, it does nothing.
     * Sets up the initial graph with an initial "Init Pointer" node.
     * @param initNumber - Optional parameter specifying the initial number of nodes - used in array based structures.
     */
    public initStructure(initNumber?: number): void {
        // Check if the structure is already initialized
        if (this.isInit) return;

        // Initialize the graph
        this.initGraph();

        // Create the initial pointer node
        const initNode: NodeData = {
            id: 0,
            value: "Init Pointer",
            x: 250,
            y: 200,
            class: "pointer"
        };
        this.nodes.push(initNode);

        // Update the graph and center it
        this.updateGraph();
        this.centerCanvas(true);

        // Set the structure as initialized
        this.isInit = true;
    }

    /**
     * Resets the entire structure.
     * Clears all nodes, edges, and graph elements.
     * Also resets the initialization status.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;

        // Reset structure status and clear data
        this.isInit = false;
        this.nodes = [];
        this.edges = [];

        // Clear graph elements if the graph exists
        if (this.graph) {
            this.graph.elements().remove();
            this.graph = null;
        }
    }

    /**
     * Generates a random structure.
     * Starts by resetting any existing structure.
     * To be implemented in the child structure to specify the random generation logic.
     */
    public randomStructure(): void {
        this.resetStructure();
    }

    /**
     * Adjusts the position of the graph when a dialog window is opened.
     * Ensures that the structure remains visible and centered on the canvas.
     * @param openedDialog - Indicates whether the dialog window is currently opened.
     */
    public moveGraph(openedDialog: boolean): void {
        if (this.graph != null) {
            const canvasHeight: number = window.innerHeight;

            // Get the bounding box of the entire structure
            const boundingBox = this.graph.elements().renderedBoundingBox();

            // Calculate the center of the structure and the canvas
            const structureCenterY = (boundingBox.y1 + boundingBox.y2) / 2;
            const canvasTriggerY = canvasHeight * 0.3;

            // Calculate the offset to move the structure to the canvas center
            const offset: number = canvasTriggerY - structureCenterY - 100;

            // Move the graph if the dialog window is opened and the structure is in the lower half
            if (openedDialog) {
                if (structureCenterY > canvasTriggerY) {
                    this.graph.animate({
                        panBy: { x: 0, y: offset }
                    }, {
                        duration: 150
                    });
                }
            }
        }
    }

    /**
     * Initializes the graph.
     * Must be implemented by the child class to define specific graph setup.
     */
    protected abstract initGraph(): void;

    /**
     * Updates the graph with current nodes and edges.
     * Uses the "preset" layout to maintain the custom node positions.
     */
    protected updateGraph(): void {
        if (!this.graph) {
            console.warn("Graph is not initialized!");
            return;
        }

        // Clear existing elements and add updated nodes and edges
        this.graph.elements().remove();
        this.graph.add([...this.getNodes(), ...this.getEdges()]);

        // Apply layout to keep nodes in their set positions without overlapping.
        this.graph.layout({ name: "preset", fit: false, avoidOverlap: true }).run();
    }

    /**
     * Gets the nodes for the graph.
     * Maps each node data to the required format for Cytoscape.
     * @returns An array of nodes formatted for graph rendering.
     */
    private getNodes(): any[] {
        return this.nodes.map(node => ({
            data: { id: node.id, value: node.value },
            position: { x: node.x, y: node.y },
            style: { opacity: node.opacity },
            classes: node.class
        }));
    }

    /**
     * Gets the edges for the graph.
     * Maps each edge data to the required format for Cytoscape.
     * @returns An array of edges formatted for graph rendering.
     */
    private getEdges(): any[] {
        return this.edges.map(edge => ({
            data: { source: edge.source, target: edge.target },
            style: { opacity: edge.opacity },
            classes: edge.class
        }));
    }
}