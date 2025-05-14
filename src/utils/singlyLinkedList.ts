import BaseStructure, { NodeData, EdgeData } from "@/utils/base/baseStructure";
import cytoscape, { StylesheetJson, StylesheetJsonBlock } from "cytoscape";

// Define constants for visual element dimensions
const initHeight: number = 50
const initWidth: number = 50
const nodeHeight: number = 45
const nodeWidth: number = 100

/**
 * SinglyLinkedList - Represents a visualized singly linked list using Cytoscape.js.
 * This class inherits from BaseStructure and visualizes linked list operations.
 */
export default class SinglyLinkedList extends BaseStructure{
    /**
     * Holds the index of the currently active node.
     * If null, no node is currently active.
     */
    protected activeNode: number|null;

    /**
     * Constructor to create a new visual singly linked list.
     * @param containerId - The ID of the HTML element where the list is displayed.
     *
     * Initializes the active node to null.
     */
    constructor(containerId: string) {
        super(containerId);
        this.activeNode = null;

        // Set padding to center the list visualization
        this.paddingForCentering = 200;
    }

    /**
     * Normalizes the graph structure by updating node and edge IDs.
     * This method is called before updating the graph whenever nodes are added or removed.
     *
     * 1. Creates a mapping of current node IDs to their new normalized indices.
     * 2. Updates each node's ID to match its new position in the list.
     * 3. Updates each edge's source and target to reflect the new node IDs.
     * 4. Calls setClassToNodes to update node classes based on their status.
     *
     * The purpose of normalization is to maintain a consistent, ordered representation
     * of nodes and edges within the list.
     */
    protected normalizeGraph(): void {
        // Create a map to store the new normalized IDs for each node
        const idMap: Map<string|number, number> = new Map();

        // Assign new IDs to nodes based on their current index in the list
        this.nodes.forEach((node, index) => {
            idMap.set(node.id, index);  // Map the original ID to the new index
            node.id = index;            // Update the node's ID to the normalized index
        });

        // Update edges to use the normalized node IDs
        this.edges.forEach((edge: EdgeData) => {
            edge.source = idMap.get(edge.source)!;
            edge.target = idMap.get(edge.target)!;
        });

        // Update the class of each node
        this.setClassToNodes();
    }

    /**
     * Sets the visual class for each node based on its connections with other nodes in the list.
     * This method is responsible for visually distinguishing between:
     * - Nodes with an outgoing link (basic node).
     * - Nodes without an outgoing link (null pointer at the end).
     * - The active node, which is currently highlighted.
     *
     * Classification:
     * - "activeNodeWithNull" - An active node that is also a tail node (points to null).
     * - "nodeWithNull" - A basic tail node (not active) that points to null.
     * - "activeNode" - An active node that has a link to another node.
     * - "defaultNode" - A basic internal node that has an outgoing link.
     */
    protected setClassToNodes(): void {
        // Create a set of source node IDs to track nodes with outgoing links
        const sourceIds: Set<number|string> = new Set();
        this.edges.forEach(link => sourceIds.add(link.source));

        // Iterate over all nodes to assign appropriate classes
        this.nodes.forEach((node, index) => {
            if (index > 0) {  // Skip the pointer node
                // Check if the node is the tail (no outgoing link) and is active
                if (!sourceIds.has(node.id) && index === this.activeNode) {
                    node.class = "activeNodeWithNull";  // Active tail node
                }
                // Check if the node is the tail (no outgoing link) and not active
                else if (!sourceIds.has(node.id)) {
                    node.class = "nodeWithNull";  // Inactive tail node
                }
                // Check if the node is active (but not a tail)
                else if (index === this.activeNode) {
                    node.class = "activeNode";  // Active non-tail node
                }
                // Default case for internal nodes with outgoing links
                else {
                    node.class = "defaultNode";  // Basic internal node
                }
            }
        });
    }

    /**
     * Adds a new node to the list with an animation.
     * @param newNode - The node to add.
     * @param normalize - Whether to normalize the graph after adding (default: true).
     *
     * Adds the node, optionally normalizes the graph, updates the visualization,
     * animates the node's appearance, and sets its opacity to fully visible.
     */
    protected async addNewNodeWithAnimation(newNode: NodeData, normalize: boolean = true): Promise<void> {
        this.nodes.push(newNode);  // Add the node to the list
        if (normalize) this.normalizeGraph();  // Normalize graph if needed
        this.updateGraph();  // Update the visual representation

        // Animate the new node
        const node = this.findNodeInGraph(newNode);
        this.animateAddingElement(node)
        await this.wait();

        // Ensure node is fully visible
        const index: number = this.findIndexOfNodeInArray(newNode);
        this.nodes[index].opacity = 1;
        await this.wait();
    }

    /**
     * Adds new edges to the list with an animation.
     * @param newEdges - An array of edges to add.
     * @param setClasses - Whether to update node classes after adding (default: true).
     *
     * Iterates through edges, updates the graph, animates each edge,
     * and sets its opacity to fully visible.
     */
    protected async addNewEdgesWithAnimation(newEdges: EdgeData[], setClasses: boolean = true): Promise<void> {
        for (let i = 0; i < newEdges.length; i++) {
            this.edges.push(newEdges[i]);  // Add edge to the list
            if (setClasses) this.setClassToNodes();  // Update classes if needed
            this.updateGraph();  // Update visualization

            // Animate the new edge
            const edge = this.findEdgeInGraph(newEdges[i]);
            this.animateAddingElement(edge);
            await this.wait();

            // Ensure edge is fully visible
            const index: number = this.findIndexOfEdgeInArray(newEdges[i]);
            this.edges[index].opacity = 1;
        }
        await this.wait();
    }

    /**
     * Deletes a node from the list by its index.
     * @param nodeIndex - The index of the node to delete.
     *
     * Updates the active node if affected, then removes the node from the list.
     */
    protected deleteNodeFromArray(nodeIndex: number): void {
        if (nodeIndex > -1) {
            // Update active node if it was affected
            if (this.activeNode !== null) {
                if (this.activeNode === nodeIndex) {
                    this.activeNode = null;  // Clear active node if it was deleted
                } else if (this.activeNode > nodeIndex) {
                    this.activeNode--;  // Adjust index if active node was after the deleted one
                }
            }
            this.nodes.splice(nodeIndex, 1);  // Remove the node
        }
    }

    /**
     * Deletes specified nodes and edges with an animation.
     * @param edgesToDelete - An array of edges to remove.
     * @param nodesToDelete - An array of nodes to remove.
     * @param normalize - Whether to normalize the graph after deletion (default: true).
     *
     * Animates the removal of edges and nodes,
     * then deletes them from the internal list and updates the graph.
     */
    protected async deleteNodesAndEdgesWithAnimation(
        edgesToDelete: EdgeData[], nodesToDelete: NodeData[], normalize: boolean = true): Promise<void> {

        // Animate edge deletion
        for (let i = 0; i < edgesToDelete.length; i++) {
            let edge = this.findEdgeInGraph(edgesToDelete[i]);
            this.animateDeletingElement(edge, true);
        }

        // Animate node deletion
        for (let i = 0; i < nodesToDelete.length; i++) {
            const node = this.findNodeInGraph(nodesToDelete[i]);
            this.animateDeletingElement(node);
        }

        await this.wait();

        // Remove edges from the list
        for (let i = 0; i < edgesToDelete.length; i++) {
            let edgeIndex: number = this.findIndexOfEdgeInArray(edgesToDelete[i]);
            this.deleteEdgeFromArray(edgeIndex);
        }

        // Remove nodes from the list
        for (let i = 0; i < nodesToDelete.length; i++) {
            let nodeIndex: number = this.findIndexOfNodeInArray(nodesToDelete[i]);
            this.deleteNodeFromArray(nodeIndex);
        }

        // Normalize and update the graph
        if (normalize) this.normalizeGraph();
        this.updateGraph();
    }

    /**
     * Creates a temporary pointer node above the specified node.
     * @param nodeToDelete - The node to which the temporary pointer points.
     *
     * Creates a temporary pointer node at a position above the given node,
     * adds it to the graph with an animation, and connects it with an edge.
     */
    protected async addTempPtrNode(nodeToDelete: NodeData): Promise<void> {
        // Define temporary pointer node above the given node
        const tempPtr: NodeData = {
            id: "temp",
            value: "Temp Pointer",
            x: nodeToDelete.x,
            y: nodeToDelete.y - 100,  // Position above the node
            class: "pointer",
            opacity: 0
        }

        // Add temporary pointer node with animation
        await this.addNewNodeWithAnimation(tempPtr, false);

        // Create an edge from the temporary pointer to the target node
        const ptrEdge: EdgeData = {
            source: tempPtr.id,
            target: nodeToDelete.id,
            class: "defaultEdge",
            opacity: 0
        }

        // Add the connecting edge with animation
        await this.addNewEdgesWithAnimation([ptrEdge], false);
    }

    /**
     * Shifts a range of nodes horizontally in the visualization by a given amount.
     * @param from - Starting index of the range.
     * @param to - Ending index of the range.
     * @param shiftX - Amount to shift nodes horizontally.
     * @param wait - Whether to wait after shifting (default: true).
     *
     * Adjusts the x-coordinate of nodes within the specified range.
     */
    protected async shiftingNodes(
        from: number, to: number, shiftX: number, wait: boolean = true): Promise<void> {

        // Shift nodes horizontally within the given range
        this.nodes.forEach((node, index) => {
            if (index >= from && index <= to)
                node.x = node.x + shiftX;
        });

        this.normalizeGraph();
        this.updateGraph();
        if (wait) await this.wait();
    }

    /**
     * Places a newly added node at the specified position in the list.
     * @param index - The position to insert the new node.
     * @param incrementActiveNode - Whether to increment the active node index (default: false).
     *
     * Moves the newly added node to the specified position in the array,
     * updates the active node if necessary, and refreshes the visualization.
     */
    protected placeNewNodeToList(index: number, incrementActiveNode: boolean = false): void {
        // Set the vertical position of the newly added node
        this.nodes[this.nodes.length - 1].y = 300;

        // Remove the last node from the array and place it at the specified index
        const lastNode: NodeData | undefined = this.nodes.pop();
        this.nodes.splice(index, 0, lastNode!);

        // Update the active node index if needed
        if (this.activeNode != null && incrementActiveNode) {
            this.activeNode++;
        }

        // Normalize and update the graph
        this.normalizeGraph();
        this.updateGraph();
    }

    /**
     * Initializes the graph with predefined styles and settings.
     * Sets up the graphical representation of the singly linked list.
     */
    protected initGraph(): void {
        const createNodeStyle = (className: string, image: string): StylesheetJsonBlock =>
            ({
                selector: `.${className}`,
                style: {
                    "width": nodeWidth,
                    "height": nodeHeight,
                    "shape": "rectangle",
                    "border-color": "black",
                    "border-width": 1,
                    "background-width": "100%",
                    "background-height": "100%",
                    "background-image": image,
                    "label": "data(value)",
                    "color": "black",
                    "font-size": 14,

                    "text-valign": "center",
                    "text-halign": "center",
                    "text-margin-x": -11,
                    "text-justification": "center",
                }
            });

        const graphStyles: StylesheetJson = [
            {
                selector: "node, edge",
                style: {
                    "events": "no",
                    "overlay-padding": 0,
                }
            },
            {
                selector: ".pointer",
                style: {
                    "width": initWidth,
                    "height": initHeight,
                    "shape": "round-rectangle",
                    "border-color": "black",
                    "border-width": 1,
                    "background-color": "transparent",
                    "background-image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADgSURBVHgB7dqxDYMwEIXhu2OBLIEQXUYgk5BNgElCNmEEOgqWYAHs3EXJDs/ofRJIduVftjur/Gzb1lVVNeSc7z68CThVXXytc9M07+84fvu+DymlUQpkZmNd15P6Tjx98JKC+SY8zI9TL4WLK2F+zjopXNxrk2u4XSVEGIKGIWgYgoYhaBiChiFoGIKGIWgYgoYhaBiChiFoGIKGIWgYgoYhaBiChiFoGIImQg65AFPVVQqXc17sPM9JCuebMVvbtktKqdiYWHu82dL/RDx38rLev07wHX6cVv+m2IiY+ABGpEJyegIZcQAAAABJRU5ErkJggg==",
                    "background-width": "100%",
                    "background-height": "100%",

                    "label": "data(value)",
                    "text-halign": "center",
                    "color": "black",
                    "font-size": 15
                }
            },
            createNodeStyle("defaultNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTAwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9Ijk5IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjODRERUZGIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSI3Ni4xOTUzIiB4Mj0iNzYuMTk1MyIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPGVsbGlwc2UgY3g9Ijg4LjE5NDkiIGN5PSIyMi41IiByeD0iMy40NzIyMiIgcnk9IjMuNjI5MDMiIGZpbGw9IiMwMTAxMDEiLz4KPC9zdmc+Cg=="),
            createNodeStyle("activeNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTAwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9Ijk5IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjRkZFMjZFIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSI3Ni4xOTUzIiB4Mj0iNzYuMTk1MyIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPGVsbGlwc2UgY3g9Ijg4LjE5NDkiIGN5PSIyMi41IiByeD0iMy40NzIyMiIgcnk9IjMuNjI5MDMiIGZpbGw9IiMwMTAxMDEiLz4KPHBhdGggZD0iTTYuMTYzMTcgNDEuMTI3OEM1LjgxNzUzIDQxLjEyNzggNS41MDM4NSA0MS4wNjI3IDUuMjIyMTIgNDAuOTMyNUM0Ljk0MDQgNDAuOCA0LjcxNjY4IDQwLjYwOTQgNC41NTA5NiA0MC4zNjA4QzQuMzg1MjQgNDAuMTA5OCA0LjMwMjM4IDM5LjgwNjggNC4zMDIzOCAzOS40NTE3QzQuMzAyMzggMzkuMTM5MiA0LjM2MzkzIDM4Ljg4NTkgNC40ODcwNCAzOC42OTE4QzQuNjEwMTQgMzguNDk1MyA0Ljc3NDY4IDM4LjM0MTQgNC45ODA2NSAzOC4yMzAxQzUuMTg2NjEgMzguMTE4OCA1LjQxMzg4IDM4LjAzNiA1LjY2MjQ2IDM3Ljk4MTVDNS45MTM0MSAzNy45MjQ3IDYuMTY1NTQgMzcuODc5NyA2LjQxODg2IDM3Ljg0NjZDNi43NTAzIDM3LjgwNCA3LjAxOSAzNy43NzIgNy4yMjQ5NiAzNy43NTA3QzcuNDMzMyAzNy43MjcgNy41ODQ4MSAzNy42ODggNy42Nzk1MSAzNy42MzM1QzcuNzc2NTcgMzcuNTc5MSA3LjgyNTExIDM3LjQ4NDQgNy44MjUxMSAzNy4zNDk0VjM3LjMyMUM3LjgyNTExIDM2Ljk3MDYgNy43MjkyMyAzNi42OTg0IDcuNTM3NDYgMzYuNTA0M0M3LjM0ODA3IDM2LjMxMDEgNy4wNjA0MyAzNi4yMTMxIDYuNjc0NTQgMzYuMjEzMUM2LjI3NDQ0IDM2LjIxMzEgNS45NjA3NiAzNi4zMDA3IDUuNzMzNDkgMzYuNDc1OUM1LjUwNjIxIDM2LjY1MSA1LjM0NjQxIDM2LjgzODEgNS4yNTQwOCAzNy4wMzY5TDQuNDU4NjMgMzYuNzUyOEM0LjYwMDY3IDM2LjQyMTQgNC43OTAwNyAzNi4xNjM0IDUuMDI2ODEgMzUuOTc4N0M1LjI2NTkyIDM1Ljc5MTcgNS41MjYzNCAzNS42NjE1IDUuODA4MDYgMzUuNTg4MUM2LjA5MjE1IDM1LjUxMjMgNi4zNzE1MSAzNS40NzQ0IDYuNjQ2MTMgMzUuNDc0NEM2LjgyMTMyIDM1LjQ3NDQgNy4wMjI1NSAzNS40OTU3IDcuMjQ5ODIgMzUuNTM4NEM3LjQ3OTQ2IDM1LjU3ODYgNy43MDA4MiAzNS42NjI2IDcuOTEzODggMzUuNzkwNUM4LjEyOTMyIDM1LjkxODMgOC4zMDgwNiAzNi4xMTEzIDguNDUwMTEgMzYuMzY5M0M4LjU5MjE1IDM2LjYyNzQgOC42NjMxNyAzNi45NzMgOC42NjMxNyAzNy40MDYyVjQxSDcuODI1MTFWNDAuMjYxNEg3Ljc4MjQ5QzcuNzI1NjcgNDAuMzc5NyA3LjYzMDk4IDQwLjUwNjQgNy40OTg0IDQwLjY0MTNDNy4zNjU4MyA0MC43NzYzIDcuMTg5NDUgNDAuODkxMSA2Ljk2OTI4IDQwLjk4NThDNi43NDkxMSA0MS4wODA1IDYuNDgwNDEgNDEuMTI3OCA2LjE2MzE3IDQxLjEyNzhaTTYuMjkxMDIgNDAuMzc1QzYuNjIyNDYgNDAuMzc1IDYuOTAxODEgNDAuMzA5OSA3LjEyOTA4IDQwLjE3OTdDNy4zNTg3MiA0MC4wNDk1IDcuNTMxNTUgMzkuODgxNCA3LjY0NzU1IDM5LjY3NTRDNy43NjU5MiAzOS40Njk1IDcuODI1MTEgMzkuMjUyOCA3LjgyNTExIDM5LjAyNTZWMzguMjU4NUM3Ljc4OTYgMzguMzAxMSA3LjcxMTQ3IDM4LjM0MDIgNy41OTA3MyAzOC4zNzU3QzcuNDcyMzYgMzguNDA4OSA3LjMzNTA1IDM4LjQzODQgNy4xNzg4IDM4LjQ2NDVDNy4wMjQ5MiAzOC40ODgyIDYuODc0NTkgMzguNTA5NSA2LjcyNzgxIDM4LjUyODRDNi41ODMzOSAzOC41NDUgNi40NjYyMSAzOC41NTkyIDYuMzc2MjQgMzguNTcxQzYuMTU4NDQgMzguNTk5NCA1Ljk1NDg0IDM4LjY0NTYgNS43NjU0NSAzOC43MDk1QzUuNTc4NDIgMzguNzcxMSA1LjQyNjkxIDM4Ljg2NDYgNS4zMTA5IDM4Ljk5MDFDNS4xOTcyNyAzOS4xMTMyIDUuMTQwNDUgMzkuMjgxMiA1LjE0MDQ1IDM5LjQ5NDNDNS4xNDA0NSAzOS43ODU1IDUuMjQ4MTcgNDAuMDA1NyA1LjQ2MzYgNDAuMTU0OEM1LjY4MTQgNDAuMzAxNiA1Ljk1NzIxIDQwLjM3NSA2LjI5MTAyIDQwLjM3NVpNMTIuNDA4NyA0MS4xMTM2QzExLjg5NzQgNDEuMTEzNiAxMS40NTcgNDAuOTkyOSAxMS4wODc3IDQwLjc1MTRDMTAuNzE4NCA0MC41MDk5IDEwLjQzNDMgNDAuMTc3MyAxMC4yMzU0IDM5Ljc1MzZDMTAuMDM2NiAzOS4zMjk4IDkuOTM3MTQgMzguODQ1NiA5LjkzNzE0IDM4LjMwMTFDOS45MzcxNCAzNy43NDcyIDEwLjAzODkgMzcuMjU4MyAxMC4yNDI1IDM2LjgzNDVDMTAuNDQ4NSAzNi40MDg0IDEwLjczNSAzNi4wNzU4IDExLjEwMTkgMzUuODM2NkMxMS40NzEyIDM1LjU5NTIgMTEuOTAyMSAzNS40NzQ0IDEyLjM5NDUgMzUuNDc0NEMxMi43NzgxIDM1LjQ3NDQgMTMuMTIzNyAzNS41NDU1IDEzLjQzMTUgMzUuNjg3NUMxMy43MzkyIDM1LjgyOTUgMTMuOTkxNCAzNi4wMjg0IDE0LjE4NzkgMzYuMjg0MUMxNC4zODQ0IDM2LjUzOTggMTQuNTA2MyAzNi44MzgxIDE0LjU1MzYgMzcuMTc5SDEzLjcxNTZDMTMuNjUxNiAzNi45MzA0IDEzLjUwOTYgMzYuNzEwMiAxMy4yODk0IDM2LjUxODVDMTMuMDcxNiAzNi4zMjQzIDEyLjc3ODEgMzYuMjI3MyAxMi40MDg3IDM2LjIyNzNDMTIuMDgyIDM2LjIyNzMgMTEuNzk1NiAzNi4zMTI1IDExLjU0OTQgMzYuNDgzQzExLjMwNTUgMzYuNjUxIDExLjExNDkgMzYuODg5IDEwLjk3NzYgMzcuMTk2N0MxMC44NDI3IDM3LjUwMjEgMTAuNzc1MiAzNy44NjA4IDEwLjc3NTIgMzguMjcyN0MxMC43NzUyIDM4LjY5NDEgMTAuODQxNSAzOS4wNjExIDEwLjk3NDEgMzkuMzczNkMxMS4xMDkgMzkuNjg2MSAxMS4yOTg0IDM5LjkyODcgMTEuNTQyMyA0MC4xMDE2QzExLjc4ODUgNDAuMjc0NCAxMi4wNzczIDQwLjM2MDggMTIuNDA4NyA0MC4zNjA4QzEyLjYyNjUgNDAuMzYwOCAxMi44MjQyIDQwLjMyMjkgMTMuMDAxOCA0MC4yNDcyQzEzLjE3OTMgNDAuMTcxNCAxMy4zMjk3IDQwLjA2MjUgMTMuNDUyOCAzOS45MjA1QzEzLjU3NTkgMzkuNzc4NCAxMy42NjM1IDM5LjYwOCAxMy43MTU2IDM5LjQwOTFIMTQuNTUzNkMxNC41MDYzIDM5LjczMTEgMTQuMzg5MSA0MC4wMjExIDE0LjIwMjEgNDAuMjc5MUMxNC4wMTc0IDQwLjUzNDggMTMuNzcyNCA0MC43Mzg0IDEzLjQ2NyA0MC44ODk5QzEzLjE2MzkgNDEuMDM5MSAxMi44MTEyIDQxLjExMzYgMTIuNDA4NyA0MS4xMTM2Wk0xOC4xNTA5IDM1LjU0NTVWMzYuMjU1N0gxNS4zMjQyVjM1LjU0NTVIMTguMTUwOVpNMTYuMTQ4MSAzNC4yMzg2SDE2Ljk4NjJWMzkuNDM3NUMxNi45ODYyIDM5LjY3NDIgMTcuMDIwNSAzOS44NTE4IDE3LjA4OTEgMzkuOTcwMkMxNy4xNjAyIDQwLjA4NjIgMTcuMjUwMSA0MC4xNjQzIDE3LjM1OSA0MC4yMDQ1QzE3LjQ3MDMgNDAuMjQyNCAxNy41ODc1IDQwLjI2MTQgMTcuNzEwNiA0MC4yNjE0QzE3LjgwMjkgNDAuMjYxNCAxNy44Nzg3IDQwLjI1NjYgMTcuOTM3OSA0MC4yNDcyQzE3Ljk5NyA0MC4yMzUzIDE4LjA0NDQgNDAuMjI1OSAxOC4wNzk5IDQwLjIxODhMMTguMjUwNCA0MC45NzE2QzE4LjE5MzUgNDAuOTkyOSAxOC4xMTQyIDQxLjAxNDIgMTguMDEyNCA0MS4wMzU1QzE3LjkxMDYgNDEuMDU5MiAxNy43ODE2IDQxLjA3MSAxNy42MjU0IDQxLjA3MUMxNy4zODg2IDQxLjA3MSAxNy4xNTY2IDQxLjAyMDEgMTYuOTI5MyA0MC45MTgzQzE2LjcwNDQgNDAuODE2NSAxNi41MTc0IDQwLjY2MTUgMTYuMzY4MyA0MC40NTMxQzE2LjIyMTUgNDAuMjQ0OCAxNi4xNDgxIDM5Ljk4MiAxNi4xNDgxIDM5LjY2NDhWMzQuMjM4NlpNMTkuNDExNiA0MVYzNS41NDU1SDIwLjI0OTZWNDFIMTkuNDExNlpNMTkuODM3NyAzNC42MzY0QzE5LjY3NDQgMzQuNjM2NCAxOS41MzM1IDM0LjU4MDcgMTkuNDE1MSAzNC40Njk1QzE5LjI5OTEgMzQuMzU4MiAxOS4yNDExIDM0LjIyNDQgMTkuMjQxMSAzNC4wNjgyQzE5LjI0MTEgMzMuOTExOSAxOS4yOTkxIDMzLjc3ODIgMTkuNDE1MSAzMy42NjY5QzE5LjUzMzUgMzMuNTU1NiAxOS42NzQ0IDMzLjUgMTkuODM3NyAzMy41QzIwLjAwMTEgMzMuNSAyMC4xNDA3IDMzLjU1NTYgMjAuMjU2NyAzMy42NjY5QzIwLjM3NTEgMzMuNzc4MiAyMC40MzQzIDMzLjkxMTkgMjAuNDM0MyAzNC4wNjgyQzIwLjQzNDMgMzQuMjI0NCAyMC4zNzUxIDM0LjM1ODIgMjAuMjU2NyAzNC40Njk1QzIwLjE0MDcgMzQuNTgwNyAyMC4wMDExIDM0LjYzNjQgMTkuODM3NyAzNC42MzY0Wk0yNi4yNDQ5IDM1LjU0NTVMMjQuMjI3OCA0MUgyMy4zNzU1TDIxLjM1ODUgMzUuNTQ1NUgyMi4yNjc2TDIzLjc3MzMgMzkuODkySDIzLjgzMDFMMjUuMzM1OCAzNS41NDU1SDI2LjI0NDlaTTI5LjQ0MjYgNDEuMTEzNkMyOC45MTcxIDQxLjExMzYgMjguNDYzNyA0MC45OTc2IDI4LjA4MjYgNDAuNzY1NkMyNy43MDM4IDQwLjUzMTIgMjcuNDExNCA0MC4yMDQ1IDI3LjIwNTQgMzkuNzg1NUMyNy4wMDE4IDM5LjM2NDEgMjYuOSAzOC44NzQxIDI2LjkgMzguMzE1M0MyNi45IDM3Ljc1NjYgMjcuMDAxOCAzNy4yNjQyIDI3LjIwNTQgMzYuODM4MUMyNy40MTE0IDM2LjQwOTYgMjcuNjk3OSAzNi4wNzU4IDI4LjA2NDggMzUuODM2NkMyOC40MzQxIDM1LjU5NTIgMjguODY1IDM1LjQ3NDQgMjkuMzU3NCAzNS40NzQ0QzI5LjY0MTUgMzUuNDc0NCAyOS45MjIxIDM1LjUyMTggMzAuMTk5IDM1LjYxNjVDMzAuNDc2IDM1LjcxMTIgMzAuNzI4MiAzNS44NjUxIDMwLjk1NTQgMzYuMDc4MUMzMS4xODI3IDM2LjI4ODggMzEuMzYzOCAzNi41NjgyIDMxLjQ5ODggMzYuOTE2MkMzMS42MzM3IDM3LjI2NDIgMzEuNzAxMiAzNy42OTI3IDMxLjcwMTIgMzguMjAxN1YzOC41NTY4SDI3LjQ5NjZWMzcuODMyNEgzMC44NDg5QzMwLjg0ODkgMzcuNTI0NiAzMC43ODczIDM3LjI1IDMwLjY2NDIgMzcuMDA4NUMzMC41NDM1IDM2Ljc2NyAzMC4zNzA3IDM2LjU3NjUgMzAuMTQ1OCAzNi40MzY4QzI5LjkyMzIgMzYuMjk3MSAyOS42NjA1IDM2LjIyNzMgMjkuMzU3NCAzNi4yMjczQzI5LjAyMzYgMzYuMjI3MyAyOC43MzQ4IDM2LjMxMDEgMjguNDkwOSAzNi40NzU5QzI4LjI0OTUgMzYuNjM5MiAyOC4wNjM2IDM2Ljg1MjMgMjcuOTMzNCAzNy4xMTUxQzI3LjgwMzIgMzcuMzc3OCAyNy43MzgxIDM3LjY1OTYgMjcuNzM4MSAzNy45NjAyVjM4LjQ0MzJDMjcuNzM4MSAzOC44NTUxIDI3LjgwOTEgMzkuMjA0MyAyNy45NTEyIDM5LjQ5MDhDMjguMDk1NiAzOS43NzQ5IDI4LjI5NTYgMzkuOTkxNSAyOC41NTEzIDQwLjE0MDZDMjguODA3IDQwLjI4NzQgMjkuMTA0MSA0MC4zNjA4IDI5LjQ0MjYgNDAuMzYwOEMyOS42NjI4IDQwLjM2MDggMjkuODYxNyA0MC4zMyAzMC4wMzkyIDQwLjI2ODVDMzAuMjE5MiA0MC4yMDQ1IDMwLjM3NDIgNDAuMTA5OCAzMC41MDQ0IDM5Ljk4NDRDMzAuNjM0NiAzOS44NTY1IDMwLjczNTMgMzkuNjk3OSAzMC44MDYzIDM5LjUwODVMMzEuNjE1OSAzOS43MzU4QzMxLjUzMDcgNDAuMDEwNCAzMS4zODc1IDQwLjI1MTkgMzEuMTg2MyA0MC40NjAyQzMwLjk4NSA0MC42NjYyIDMwLjczNjQgNDAuODI3MiAzMC40NDA1IDQwLjk0MzJDMzAuMTQ0NiA0MS4wNTY4IDI5LjgxMiA0MS4xMTM2IDI5LjQ0MjYgNDEuMTEzNloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="),
            createNodeStyle("nodeWithNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTAwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9Ijk5IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjODRERUZGIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSI3Ni4xOTUzIiB4Mj0iNzYuMTk1MyIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTgzLjg3NjkgMTkuMjcyN1YyNEg4My4xMTUyTDgwLjg4NzcgMjAuNzhIODAuODQ4NVYyNEg3OS45OTIxVjE5LjI3MjdIODAuNzU4NUw4Mi45ODM2IDIyLjQ5NUg4My4wMjUyVjE5LjI3MjdIODMuODc2OVpNODcuNzkgMTkuMjcyN0g4OC42NDYzVjIyLjM2MTJDODguNjQ2MyAyMi42OTk3IDg4LjU2NjMgMjIuOTk3NSA4OC40MDYyIDIzLjI1NDRDODguMjQ3OCAyMy41MTE0IDg4LjAyNDYgMjMuNzEyMiA4Ny43MzY5IDIzLjg1NjlDODcuNDQ5MSAyNCA4Ny4xMTI5IDI0LjA3MTYgODYuNzI4MiAyNC4wNzE2Qzg2LjM0MTkgMjQuMDcxNiA4Ni4wMDQ5IDI0IDg1LjcxNzIgMjMuODU2OUM4NS40Mjk0IDIzLjcxMjIgODUuMjA2MyAyMy41MTE0IDg1LjA0NzggMjMuMjU0NEM4NC44ODkzIDIyLjk5NzUgODQuODEgMjIuNjk5NyA4NC44MSAyMi4zNjEyVjE5LjI3MjdIODUuNjY2NFYyMi4yODk2Qzg1LjY2NjQgMjIuNDg2NiA4NS43MDk1IDIyLjY2MiA4NS43OTU2IDIyLjgxNTlDODUuODgzMyAyMi45Njk4IDg2LjAwNjUgMjMuMDkwNiA4Ni4xNjUgMjMuMTc4M0M4Ni4zMjM0IDIzLjI2NDQgODYuNTExMiAyMy4zMDc1IDg2LjcyODIgMjMuMzA3NUM4Ni45NDUxIDIzLjMwNzUgODcuMTMyOSAyMy4yNjQ0IDg3LjI5MTQgMjMuMTc4M0M4Ny40NTE0IDIzLjA5MDYgODcuNTc0NSAyMi45Njk4IDg3LjY2MDcgMjIuODE1OUM4Ny43NDY5IDIyLjY2MiA4Ny43OSAyMi40ODY2IDg3Ljc5IDIyLjI4OTZWMTkuMjcyN1pNODkuNTc3MSAyNFYxOS4yNzI3SDkwLjQzMzVWMjMuMjgyMUg5Mi41MTU1VjI0SDg5LjU3NzFaTTkzLjI1ODcgMjRWMTkuMjcyN0g5NC4xMTUxVjIzLjI4MjFIOTYuMTk3MVYyNEg5My4yNTg3WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="),
            createNodeStyle("activeNodeWithNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTAwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9Ijk5IiBoZWlnaHQ9IjQ0IiBmaWxsPSIjRkZFMjZFIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSI3Ni4xOTUzIiB4Mj0iNzYuMTk1MyIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTgzLjg3NjkgMTkuMjcyN1YyNEg4My4xMTUyTDgwLjg4NzcgMjAuNzhIODAuODQ4NVYyNEg3OS45OTIxVjE5LjI3MjdIODAuNzU4NUw4Mi45ODM2IDIyLjQ5NUg4My4wMjUyVjE5LjI3MjdIODMuODc2OVpNODcuNzkgMTkuMjcyN0g4OC42NDYzVjIyLjM2MTJDODguNjQ2MyAyMi42OTk3IDg4LjU2NjMgMjIuOTk3NSA4OC40MDYyIDIzLjI1NDRDODguMjQ3OCAyMy41MTE0IDg4LjAyNDYgMjMuNzEyMiA4Ny43MzY5IDIzLjg1NjlDODcuNDQ5MSAyNCA4Ny4xMTI5IDI0LjA3MTYgODYuNzI4MiAyNC4wNzE2Qzg2LjM0MTkgMjQuMDcxNiA4Ni4wMDQ5IDI0IDg1LjcxNzIgMjMuODU2OUM4NS40Mjk0IDIzLjcxMjIgODUuMjA2MyAyMy41MTE0IDg1LjA0NzggMjMuMjU0NEM4NC44ODkzIDIyLjk5NzUgODQuODEgMjIuNjk5NyA4NC44MSAyMi4zNjEyVjE5LjI3MjdIODUuNjY2NFYyMi4yODk2Qzg1LjY2NjQgMjIuNDg2NiA4NS43MDk1IDIyLjY2MiA4NS43OTU2IDIyLjgxNTlDODUuODgzMyAyMi45Njk4IDg2LjAwNjUgMjMuMDkwNiA4Ni4xNjUgMjMuMTc4M0M4Ni4zMjM0IDIzLjI2NDQgODYuNTExMiAyMy4zMDc1IDg2LjcyODIgMjMuMzA3NUM4Ni45NDUxIDIzLjMwNzUgODcuMTMyOSAyMy4yNjQ0IDg3LjI5MTQgMjMuMTc4M0M4Ny40NTE0IDIzLjA5MDYgODcuNTc0NSAyMi45Njk4IDg3LjY2MDcgMjIuODE1OUM4Ny43NDY5IDIyLjY2MiA4Ny43OSAyMi40ODY2IDg3Ljc5IDIyLjI4OTZWMTkuMjcyN1pNODkuNTc3MSAyNFYxOS4yNzI3SDkwLjQzMzVWMjMuMjgyMUg5Mi41MTU1VjI0SDg5LjU3NzFaTTkzLjI1ODcgMjRWMTkuMjcyN0g5NC4xMTUxVjIzLjI4MjFIOTYuMTk3MVYyNEg5My4yNTg3WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTYuMTYzMTcgNDEuMTI3OEM1LjgxNzUzIDQxLjEyNzggNS41MDM4NSA0MS4wNjI3IDUuMjIyMTIgNDAuOTMyNUM0Ljk0MDQgNDAuOCA0LjcxNjY4IDQwLjYwOTQgNC41NTA5NiA0MC4zNjA4QzQuMzg1MjQgNDAuMTA5OCA0LjMwMjM4IDM5LjgwNjggNC4zMDIzOCAzOS40NTE3QzQuMzAyMzggMzkuMTM5MiA0LjM2MzkzIDM4Ljg4NTkgNC40ODcwNCAzOC42OTE4QzQuNjEwMTQgMzguNDk1MyA0Ljc3NDY4IDM4LjM0MTQgNC45ODA2NSAzOC4yMzAxQzUuMTg2NjEgMzguMTE4OCA1LjQxMzg4IDM4LjAzNiA1LjY2MjQ2IDM3Ljk4MTVDNS45MTM0MSAzNy45MjQ3IDYuMTY1NTQgMzcuODc5NyA2LjQxODg2IDM3Ljg0NjZDNi43NTAzIDM3LjgwNCA3LjAxOSAzNy43NzIgNy4yMjQ5NiAzNy43NTA3QzcuNDMzMyAzNy43MjcgNy41ODQ4MSAzNy42ODggNy42Nzk1MSAzNy42MzM1QzcuNzc2NTcgMzcuNTc5MSA3LjgyNTExIDM3LjQ4NDQgNy44MjUxMSAzNy4zNDk0VjM3LjMyMUM3LjgyNTExIDM2Ljk3MDYgNy43MjkyMyAzNi42OTg0IDcuNTM3NDYgMzYuNTA0M0M3LjM0ODA3IDM2LjMxMDEgNy4wNjA0MyAzNi4yMTMxIDYuNjc0NTQgMzYuMjEzMUM2LjI3NDQ0IDM2LjIxMzEgNS45NjA3NiAzNi4zMDA3IDUuNzMzNDkgMzYuNDc1OUM1LjUwNjIxIDM2LjY1MSA1LjM0NjQxIDM2LjgzODEgNS4yNTQwOCAzNy4wMzY5TDQuNDU4NjMgMzYuNzUyOEM0LjYwMDY3IDM2LjQyMTQgNC43OTAwNyAzNi4xNjM0IDUuMDI2ODEgMzUuOTc4N0M1LjI2NTkyIDM1Ljc5MTcgNS41MjYzNCAzNS42NjE1IDUuODA4MDYgMzUuNTg4MUM2LjA5MjE1IDM1LjUxMjMgNi4zNzE1MSAzNS40NzQ0IDYuNjQ2MTMgMzUuNDc0NEM2LjgyMTMyIDM1LjQ3NDQgNy4wMjI1NSAzNS40OTU3IDcuMjQ5ODIgMzUuNTM4NEM3LjQ3OTQ2IDM1LjU3ODYgNy43MDA4MiAzNS42NjI2IDcuOTEzODggMzUuNzkwNUM4LjEyOTMyIDM1LjkxODMgOC4zMDgwNiAzNi4xMTEzIDguNDUwMTEgMzYuMzY5M0M4LjU5MjE1IDM2LjYyNzQgOC42NjMxNyAzNi45NzMgOC42NjMxNyAzNy40MDYyVjQxSDcuODI1MTFWNDAuMjYxNEg3Ljc4MjQ5QzcuNzI1NjcgNDAuMzc5NyA3LjYzMDk4IDQwLjUwNjQgNy40OTg0IDQwLjY0MTNDNy4zNjU4MyA0MC43NzYzIDcuMTg5NDUgNDAuODkxMSA2Ljk2OTI4IDQwLjk4NThDNi43NDkxMSA0MS4wODA1IDYuNDgwNDEgNDEuMTI3OCA2LjE2MzE3IDQxLjEyNzhaTTYuMjkxMDIgNDAuMzc1QzYuNjIyNDYgNDAuMzc1IDYuOTAxODEgNDAuMzA5OSA3LjEyOTA4IDQwLjE3OTdDNy4zNTg3MiA0MC4wNDk1IDcuNTMxNTUgMzkuODgxNCA3LjY0NzU1IDM5LjY3NTRDNy43NjU5MiAzOS40Njk1IDcuODI1MTEgMzkuMjUyOCA3LjgyNTExIDM5LjAyNTZWMzguMjU4NUM3Ljc4OTYgMzguMzAxMSA3LjcxMTQ3IDM4LjM0MDIgNy41OTA3MyAzOC4zNzU3QzcuNDcyMzYgMzguNDA4OSA3LjMzNTA1IDM4LjQzODQgNy4xNzg4IDM4LjQ2NDVDNy4wMjQ5MiAzOC40ODgyIDYuODc0NTkgMzguNTA5NSA2LjcyNzgxIDM4LjUyODRDNi41ODMzOSAzOC41NDUgNi40NjYyMSAzOC41NTkyIDYuMzc2MjQgMzguNTcxQzYuMTU4NDQgMzguNTk5NCA1Ljk1NDg0IDM4LjY0NTYgNS43NjU0NSAzOC43MDk1QzUuNTc4NDIgMzguNzcxMSA1LjQyNjkxIDM4Ljg2NDYgNS4zMTA5IDM4Ljk5MDFDNS4xOTcyNyAzOS4xMTMyIDUuMTQwNDUgMzkuMjgxMiA1LjE0MDQ1IDM5LjQ5NDNDNS4xNDA0NSAzOS43ODU1IDUuMjQ4MTcgNDAuMDA1NyA1LjQ2MzYgNDAuMTU0OEM1LjY4MTQgNDAuMzAxNiA1Ljk1NzIxIDQwLjM3NSA2LjI5MTAyIDQwLjM3NVpNMTIuNDA4NyA0MS4xMTM2QzExLjg5NzQgNDEuMTEzNiAxMS40NTcgNDAuOTkyOSAxMS4wODc3IDQwLjc1MTRDMTAuNzE4NCA0MC41MDk5IDEwLjQzNDMgNDAuMTc3MyAxMC4yMzU0IDM5Ljc1MzZDMTAuMDM2NiAzOS4zMjk4IDkuOTM3MTQgMzguODQ1NiA5LjkzNzE0IDM4LjMwMTFDOS45MzcxNCAzNy43NDcyIDEwLjAzODkgMzcuMjU4MyAxMC4yNDI1IDM2LjgzNDVDMTAuNDQ4NSAzNi40MDg0IDEwLjczNSAzNi4wNzU4IDExLjEwMTkgMzUuODM2NkMxMS40NzEyIDM1LjU5NTIgMTEuOTAyMSAzNS40NzQ0IDEyLjM5NDUgMzUuNDc0NEMxMi43NzgxIDM1LjQ3NDQgMTMuMTIzNyAzNS41NDU1IDEzLjQzMTUgMzUuNjg3NUMxMy43MzkyIDM1LjgyOTUgMTMuOTkxNCAzNi4wMjg0IDE0LjE4NzkgMzYuMjg0MUMxNC4zODQ0IDM2LjUzOTggMTQuNTA2MyAzNi44MzgxIDE0LjU1MzYgMzcuMTc5SDEzLjcxNTZDMTMuNjUxNiAzNi45MzA0IDEzLjUwOTYgMzYuNzEwMiAxMy4yODk0IDM2LjUxODVDMTMuMDcxNiAzNi4zMjQzIDEyLjc3ODEgMzYuMjI3MyAxMi40MDg3IDM2LjIyNzNDMTIuMDgyIDM2LjIyNzMgMTEuNzk1NiAzNi4zMTI1IDExLjU0OTQgMzYuNDgzQzExLjMwNTUgMzYuNjUxIDExLjExNDkgMzYuODg5IDEwLjk3NzYgMzcuMTk2N0MxMC44NDI3IDM3LjUwMjEgMTAuNzc1MiAzNy44NjA4IDEwLjc3NTIgMzguMjcyN0MxMC43NzUyIDM4LjY5NDEgMTAuODQxNSAzOS4wNjExIDEwLjk3NDEgMzkuMzczNkMxMS4xMDkgMzkuNjg2MSAxMS4yOTg0IDM5LjkyODcgMTEuNTQyMyA0MC4xMDE2QzExLjc4ODUgNDAuMjc0NCAxMi4wNzczIDQwLjM2MDggMTIuNDA4NyA0MC4zNjA4QzEyLjYyNjUgNDAuMzYwOCAxMi44MjQyIDQwLjMyMjkgMTMuMDAxOCA0MC4yNDcyQzEzLjE3OTMgNDAuMTcxNCAxMy4zMjk3IDQwLjA2MjUgMTMuNDUyOCAzOS45MjA1QzEzLjU3NTkgMzkuNzc4NCAxMy42NjM1IDM5LjYwOCAxMy43MTU2IDM5LjQwOTFIMTQuNTUzNkMxNC41MDYzIDM5LjczMTEgMTQuMzg5MSA0MC4wMjExIDE0LjIwMjEgNDAuMjc5MUMxNC4wMTc0IDQwLjUzNDggMTMuNzcyNCA0MC43Mzg0IDEzLjQ2NyA0MC44ODk5QzEzLjE2MzkgNDEuMDM5MSAxMi44MTEyIDQxLjExMzYgMTIuNDA4NyA0MS4xMTM2Wk0xOC4xNTA5IDM1LjU0NTVWMzYuMjU1N0gxNS4zMjQyVjM1LjU0NTVIMTguMTUwOVpNMTYuMTQ4MSAzNC4yMzg2SDE2Ljk4NjJWMzkuNDM3NUMxNi45ODYyIDM5LjY3NDIgMTcuMDIwNSAzOS44NTE4IDE3LjA4OTEgMzkuOTcwMkMxNy4xNjAyIDQwLjA4NjIgMTcuMjUwMSA0MC4xNjQzIDE3LjM1OSA0MC4yMDQ1QzE3LjQ3MDMgNDAuMjQyNCAxNy41ODc1IDQwLjI2MTQgMTcuNzEwNiA0MC4yNjE0QzE3LjgwMjkgNDAuMjYxNCAxNy44Nzg3IDQwLjI1NjYgMTcuOTM3OSA0MC4yNDcyQzE3Ljk5NyA0MC4yMzUzIDE4LjA0NDQgNDAuMjI1OSAxOC4wNzk5IDQwLjIxODhMMTguMjUwNCA0MC45NzE2QzE4LjE5MzUgNDAuOTkyOSAxOC4xMTQyIDQxLjAxNDIgMTguMDEyNCA0MS4wMzU1QzE3LjkxMDYgNDEuMDU5MiAxNy43ODE2IDQxLjA3MSAxNy42MjU0IDQxLjA3MUMxNy4zODg2IDQxLjA3MSAxNy4xNTY2IDQxLjAyMDEgMTYuOTI5MyA0MC45MTgzQzE2LjcwNDQgNDAuODE2NSAxNi41MTc0IDQwLjY2MTUgMTYuMzY4MyA0MC40NTMxQzE2LjIyMTUgNDAuMjQ0OCAxNi4xNDgxIDM5Ljk4MiAxNi4xNDgxIDM5LjY2NDhWMzQuMjM4NlpNMTkuNDExNiA0MVYzNS41NDU1SDIwLjI0OTZWNDFIMTkuNDExNlpNMTkuODM3NyAzNC42MzY0QzE5LjY3NDQgMzQuNjM2NCAxOS41MzM1IDM0LjU4MDcgMTkuNDE1MSAzNC40Njk1QzE5LjI5OTEgMzQuMzU4MiAxOS4yNDExIDM0LjIyNDQgMTkuMjQxMSAzNC4wNjgyQzE5LjI0MTEgMzMuOTExOSAxOS4yOTkxIDMzLjc3ODIgMTkuNDE1MSAzMy42NjY5QzE5LjUzMzUgMzMuNTU1NiAxOS42NzQ0IDMzLjUgMTkuODM3NyAzMy41QzIwLjAwMTEgMzMuNSAyMC4xNDA3IDMzLjU1NTYgMjAuMjU2NyAzMy42NjY5QzIwLjM3NTEgMzMuNzc4MiAyMC40MzQzIDMzLjkxMTkgMjAuNDM0MyAzNC4wNjgyQzIwLjQzNDMgMzQuMjI0NCAyMC4zNzUxIDM0LjM1ODIgMjAuMjU2NyAzNC40Njk1QzIwLjE0MDcgMzQuNTgwNyAyMC4wMDExIDM0LjYzNjQgMTkuODM3NyAzNC42MzY0Wk0yNi4yNDQ5IDM1LjU0NTVMMjQuMjI3OCA0MUgyMy4zNzU1TDIxLjM1ODUgMzUuNTQ1NUgyMi4yNjc2TDIzLjc3MzMgMzkuODkySDIzLjgzMDFMMjUuMzM1OCAzNS41NDU1SDI2LjI0NDlaTTI5LjQ0MjYgNDEuMTEzNkMyOC45MTcxIDQxLjExMzYgMjguNDYzNyA0MC45OTc2IDI4LjA4MjYgNDAuNzY1NkMyNy43MDM4IDQwLjUzMTIgMjcuNDExNCA0MC4yMDQ1IDI3LjIwNTQgMzkuNzg1NUMyNy4wMDE4IDM5LjM2NDEgMjYuOSAzOC44NzQxIDI2LjkgMzguMzE1M0MyNi45IDM3Ljc1NjYgMjcuMDAxOCAzNy4yNjQyIDI3LjIwNTQgMzYuODM4MUMyNy40MTE0IDM2LjQwOTYgMjcuNjk3OSAzNi4wNzU4IDI4LjA2NDggMzUuODM2NkMyOC40MzQxIDM1LjU5NTIgMjguODY1IDM1LjQ3NDQgMjkuMzU3NCAzNS40NzQ0QzI5LjY0MTUgMzUuNDc0NCAyOS45MjIxIDM1LjUyMTggMzAuMTk5IDM1LjYxNjVDMzAuNDc2IDM1LjcxMTIgMzAuNzI4MiAzNS44NjUxIDMwLjk1NTQgMzYuMDc4MUMzMS4xODI3IDM2LjI4ODggMzEuMzYzOCAzNi41NjgyIDMxLjQ5ODggMzYuOTE2MkMzMS42MzM3IDM3LjI2NDIgMzEuNzAxMiAzNy42OTI3IDMxLjcwMTIgMzguMjAxN1YzOC41NTY4SDI3LjQ5NjZWMzcuODMyNEgzMC44NDg5QzMwLjg0ODkgMzcuNTI0NiAzMC43ODczIDM3LjI1IDMwLjY2NDIgMzcuMDA4NUMzMC41NDM1IDM2Ljc2NyAzMC4zNzA3IDM2LjU3NjUgMzAuMTQ1OCAzNi40MzY4QzI5LjkyMzIgMzYuMjk3MSAyOS42NjA1IDM2LjIyNzMgMjkuMzU3NCAzNi4yMjczQzI5LjAyMzYgMzYuMjI3MyAyOC43MzQ4IDM2LjMxMDEgMjguNDkwOSAzNi40NzU5QzI4LjI0OTUgMzYuNjM5MiAyOC4wNjM2IDM2Ljg1MjMgMjcuOTMzNCAzNy4xMTUxQzI3LjgwMzIgMzcuMzc3OCAyNy43MzgxIDM3LjY1OTYgMjcuNzM4MSAzNy45NjAyVjM4LjQ0MzJDMjcuNzM4MSAzOC44NTUxIDI3LjgwOTEgMzkuMjA0MyAyNy45NTEyIDM5LjQ5MDhDMjguMDk1NiAzOS43NzQ5IDI4LjI5NTYgMzkuOTkxNSAyOC41NTEzIDQwLjE0MDZDMjguODA3IDQwLjI4NzQgMjkuMTA0MSA0MC4zNjA4IDI5LjQ0MjYgNDAuMzYwOEMyOS42NjI4IDQwLjM2MDggMjkuODYxNyA0MC4zMyAzMC4wMzkyIDQwLjI2ODVDMzAuMjE5MiA0MC4yMDQ1IDMwLjM3NDIgNDAuMTA5OCAzMC41MDQ0IDM5Ljk4NDRDMzAuNjM0NiAzOS44NTY1IDMwLjczNTMgMzkuNjk3OSAzMC44MDYzIDM5LjUwODVMMzEuNjE1OSAzOS43MzU4QzMxLjUzMDcgNDAuMDEwNCAzMS4zODc1IDQwLjI1MTkgMzEuMTg2MyA0MC40NjAyQzMwLjk4NSA0MC42NjYyIDMwLjczNjQgNDAuODI3MiAzMC40NDA1IDQwLjk0MzJDMzAuMTQ0NiA0MS4wNTY4IDI5LjgxMiA0MS4xMTM2IDI5LjQ0MjYgNDEuMTEzNloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="),
            {
                selector: ".edgeToNewNode",
                style: {
                    "width": 2,
                    "line-color": "black",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "black",

                    "curve-style": "taxi",
                    "taxi-direction": "downward",
                    "taxi-turn": 1,
                }
            },
            {
                selector: ".edgeFromNewNode",
                style: {
                    "width": 2,
                    "line-color": "black",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "black",

                    "curve-style": "taxi",
                    "taxi-direction": "rightward",
                    "taxi-turn": 1,
                }
            },
            {
                selector: ".edgeOverDeletingAfterNode",
                style: {
                        'width': 2,
                        'line-color': 'black',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-color': 'black',

                        'curve-style': 'round-segments' as any,
                        'segment-distances': [60],
                        'segment-weights': [0.5],
                        'segment-radii': [100],
                }
            },
            {
                selector: ".edgeOverDeletingFirstNode",
                style: {
                    'width': 2,
                    'line-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': 'black',

                    'curve-style': 'round-segments' as any,
                    'segment-distances': [150],
                    'segment-weights': [0.5],
                    'segment-radii': [100],
                }
            },
            {
                selector: ".defaultEdge",
                style: {
                    "width": 2,
                    "line-color": "black",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "black",
                    "curve-style": "bezier",
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
            wheelSensitivity: 0.2,
        });
    }

    /**
     * Resets the linked list structure to its initial state.
     * Clears the active node and calls the parent reset method.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;
        super.resetStructure();
        this.activeNode = null;  // Clear the active node reference
    }

    /**
     * Checks if there is an active node in the list.
     * @returns true if an active node exists, false otherwise.
     */
    public isActive(): boolean {
        return (this.activeNode !== null);
    }

    /**
     * Inserts a new node at the beginning of the singly linked list.
     * @param element - The value to be inserted as the first node.
     *
     * Handles two cases:
     * 1. Adding the very first node when the list is empty.
     * 2. Inserting a new node at the start when nodes already exist.
     */
    public async insertFirstNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the initial node
        const initNode: NodeData = this.nodes[0];

        // Case 1: Adding the first-ever node to the list
        if (this.nodes.length === 1) {
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (this.nodes[this.nodes.length - 1].x) + 1.6*nodeWidth, // Position next to the initial node
                y: 300,
                opacity: 0,
                class: "defaultNode"
            };
            await this.addNewNodeWithAnimation(newNode);

            // Create an edge connecting from the initial node to the new node
            const newEdge: EdgeData = {
                source: initNode.id,
                target: newNode.id,
                class: "edgeToNewNode",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge]);
        } else {
            // Case 2: Adding a new node at the start when nodes exist

            // Reference the current first node in the list
            const firstNode: NodeData = this.nodes[1];

            // Create the new node at the start position
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: firstNode.x,  // Same x position as the first node
                y: firstNode.y + 2 * nodeHeight,  // Below the first node
                opacity: 0,
                class: "defaultNode"
            };
            await this.addNewNodeWithAnimation(newNode);

            // Shift existing nodes to the right to make space for the new node
            await this.shiftingNodes(1, this.nodes.length-2, 1.8*nodeWidth);

            // Create the new edge from the new node to the existing first node
            let newEdge: EdgeData = {
                source: newNode.id,
                target: firstNode.id,
                class: "edgeFromNewNode",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge]);

            // Create the edge from the initial node to the new first node
            newEdge = {
                source: initNode.id,
                target: newNode.id,
                class: "edgeToNewNode",
                opacity: 0
            };

            // Find and delete the old edge that connects the initial node to the previous first node
            let edgeToDelete: EdgeData = this.findEdgeInArray(initNode, firstNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([newEdge]);

            // Place the new node in the list as the first element
            this.placeNewNodeToList(1, true);
        }

        await this.afterAnimationEnds();
    }


    /**
     * Retrieves the value of the first node in the singly linked list.
     * Logs the value if the first node exists, otherwise logs an error.
     */
    public async getFirstNodeValue(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the list has more than one node
        if (this.nodes.length > 1) {
            const value: string | number | undefined = this.nodes[1].value;
            this.log("list.getFirstValue", { value });
        } else {
            this.log("list.getFirstError");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Retrieves the value of the currently active node.
     * Logs the value if an active node is present, otherwise logs an error.
     */
    public async getActiveNodeValue(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if an active node exists
        if (this.activeNode != null) {
            const value: string | number | undefined = this.nodes[this.activeNode].value;
            this.log("list.getActiveValue", { value });
        } else {
            this.log("list.getActiveError");
        }

        await this.afterAnimationEnds();
    }


    /**
     * Deletes the first node from the singly linked list.
     * Handles different cases depending on the list size:
     * 1. Empty list (only init node) - Logs an error.
     * 2. List with a single node - Deletes the only node.
     * 3. List with multiple nodes - Removes the first node and re-links the list.
     */
    public async deleteFirstNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the initial node and the current first node
        const initNode: NodeData = this.nodes[0];
        const firstNode: NodeData = this.nodes[1];

        // Case 1: List contains only the init node
        if (this.nodes.length <= 1) {
            this.log("list.deleteFirstEmpty");
        }
        // Case 2: List contains only one data node and the init node
        else if (this.nodes.length === 2) {
            const edgeToDelete: EdgeData = this.findEdgeInArray(null, firstNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [firstNode]);
        }
        // Case 3: List contains multiple nodes
        else {
            // Create a temporary pointer node pointing to the first node
            await this.addTempPtrNode(firstNode);

            // Get the temporary pointer and the next node after the first
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[2];

            // Create a new edge from the init node to the next node (bypassing the first node)
            const newEdge: EdgeData = {
                source: initNode.id,
                target: nodeToConnect.id,
                class: "edgeOverDeletingFirstNode",
                opacity: 0
            };

            // Find and delete the edge from init to the first node
            let edgeToDelete: EdgeData = this.findEdgeInArray(null, firstNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);
            await this.addNewEdgesWithAnimation([newEdge], false);

            // Find and delete the edge from the first node and the temporary pointer edge
            edgeToDelete = this.findEdgeInArray(firstNode, null)!;
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;

            // Delete the first node and temporary pointer node with animation
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete, ptrEdgeToDelete], [firstNode, ptrNode]);

            // Shift nodes to the left to fill the gap
            await this.shiftingNodes(1, this.nodes.length - 1, -1.8 *nodeWidth, false);

            // Update the visual style of the new edge
            this.changeEdgeStyle(newEdge, "edgeToNewNode");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Activates the first node in the singly linked list.
     * Logs an error if the list is empty.
     */
    public async activateFirstNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the list only contains the init node
        if (this.nodes.length === 1) {
            this.log("list.firstEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Set the first data node as the active node
        this.activeNode = 1;

        this.setClassToNodes();  // Update node classes to reflect the active state
        this.updateGraph();      // Refresh the visualization

        await this.afterAnimationEnds();
    }

    /**
     * Activates the next node in the singly linked list.
     * If there is no next node, it deactivates the active node.
     */
    public async activateNextNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        // Move the active pointer to the next node
        this.activeNode++;
        // If the active node exceeds the list length, deactivate
        if (this.activeNode >= this.nodes.length) {
            this.activeNode = null;
        }

        this.setClassToNodes();  // Update node classes to reflect the active state
        this.updateGraph();      // Refresh the visualization

        await this.afterAnimationEnds();
    }

    /**
     * Updates the value of the currently active node.
     * Logs the new value after the update.
     * @param element - The new value to set for the active node.
     */
    public async setActiveNodeValue(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode === null) return;

        await this.beforeAnimationStarts();

        // Set the new value for the active node
        this.nodes[this.activeNode].value = element;
        this.updateGraph();  // Update the visualization

        // Log the updated value
        const value: string | number | undefined = this.nodes[this.activeNode].value;
        this.log("list.setActiveValue", { value });

        await this.afterAnimationEnds();
    }


    /**
     * Inserts a new node after the currently active node in the singly linked list.
     * @param element - The value of the new node to be inserted.
     * Handles both cases: adding to the end or between existing nodes.
     */
    public async insertAfterActiveNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        const activeNode: NodeData = this.nodes[this.activeNode];

        // Case 1: Adding the new node at the end of the list
        if (this.activeNode === this.nodes.length - 1) {
            // Create the new node positioned after the current last node
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (this.nodes[this.nodes.length -1].x) + 1.6*nodeWidth,
                y: 300,
                opacity: 0,
                class: "defaultNode"
            };
            await this.addNewNodeWithAnimation(newNode);

            // Create an edge from the active node to the new node
            const newEdge: EdgeData = {
                source: activeNode.id,
                target: newNode.id,
                class: "defaultEdge",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge]);
        }
        else {
            // Case 2: Inserting between existing nodes
            const nodeAfterActiveNode: NodeData = this.nodes[this.activeNode + 1];

            // Create the new node at the position of the node after the active one
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: nodeAfterActiveNode.x,
                y: 300 + 2 * nodeHeight,
                opacity: 0,
                class: "defaultNode"
            };
            await this.addNewNodeWithAnimation(newNode);

            // Shift the following nodes to the right to make space
            await this.shiftingNodes(this.activeNode + 1, this.nodes.length-2, 1.8*nodeWidth);

            // Create a new edge from the new node to the next node
            let newEdge: EdgeData = {
                source: newNode.id,
                target: nodeAfterActiveNode.id,
                class: "edgeFromNewNode",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge]);

            // Delete the existing edge between the active node and the next node
            let edgeToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeAfterActiveNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);

            // Create a new edge from the active node to the newly inserted node
            newEdge = {
                source: activeNode.id,
                target: newNode.id,
                class: "edgeToNewNode",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge]);

            // Insert the new node in the correct position within the list
            this.placeNewNodeToList(this.activeNode + 1);
        }

        await this.afterAnimationEnds();
    }

    /**
     * Deletes the node that comes after the active node in the singly linked list.
     * Handles different cases depending on the list structure:
     * 1. Active node is the last node - No change, logs an error.
     * 2. Deleting the last node - Removes the only node after the active node.
     * 3. Deleting a middle node - Bypasses the node and re-links the list.
     */
    public async deleteAfterActiveNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit
            || this.activeNode == null || this.nodes.length <= 1) return;

        await this.beforeAnimationStarts();

        // Get the active node and the node to delete (the next one)
        const activeNode: NodeData = this.nodes[this.activeNode];
        const nodeToDelete: NodeData = this.nodes[this.activeNode + 1];

        // Case 1: Active node is the last in the list - no node to delete after it
        if (this.activeNode === this.nodes.length - 1) {
            this.log("list.deleteAfterEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Case 2: Deleting the last node in the list
        if (this.activeNode === this.nodes.length - 2) {
            const edgeToDelete: EdgeData = this.findEdgeInArray(null, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [nodeToDelete]);
        }
        else {
            // Case 3: Deleting a node from the middle of the list

            // Create a temporary pointer node to visualize the transition
            await this.addTempPtrNode(nodeToDelete);

            // Get the temporary pointer and the node after the one to delete
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[this.activeNode + 2];

            // Create a new edge to bypass the deleted node
            const newEdge: EdgeData = {
                source: activeNode.id,
                target: nodeToConnect.id,
                class: "edgeOverDeletingAfterNode",
                opacity: 0
            }

            // Remove the existing edge between the active node and the node to delete
            let edgeToDelete: EdgeData = this.findEdgeInArray(null, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);
            await this.addNewEdgesWithAnimation([newEdge], false);

            // Remove the edges connected to the node to delete and the temporary pointer
            edgeToDelete = this.findEdgeInArray(nodeToDelete, null)!;
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;

            // Delete the node and temporary pointer node with animation
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete, ptrEdgeToDelete], [nodeToDelete, ptrNode]);

            // Shift nodes to the left to fill the gap
            await this.shiftingNodes(this.activeNode + 1, this.nodes.length - 1, -1.8*nodeWidth, false);

            // Update the visual style of the new edge
            this.changeEdgeStyle(newEdge, "defaultEdge");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Checks if the singly linked list has an active node.
     * Logs the result indicating whether the list is active or not.
     */
    public async isListActive(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Log the status of the active node
        if (this.activeNode == null)
            this.log("list.notActive");
        else
            this.log("list.active");

        await this.afterAnimationEnds();
    }

    /**
     * Generates a random singly linked list structure.
     * Creates a list with a random number of nodes (between 2 and 5) with a random value.
     */
    public randomStructure(): void {
        super.randomStructure();
        this.initStructure();

        // Generate a random number of elements between 2 and 5
        const numOfElements: number = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
        const startX: number = 250 + 1.6 * nodeWidth;  // Starting x-coordinate
        const y: number = 300;  // Fixed y-coordinate

        for (let i = 0; i < numOfElements; i++) {
            // Generate a random value for the new node
            const value: string = String(Math.floor(Math.random() * 100));
            const id: number = this.nodes.length;

            // Create a new node with random value and position
            const newNode: NodeData = {
                id: id,
                value: value,
                x: startX + i * 1.8*nodeWidth,
                y: y,
                opacity: 1,
                class: "defaultNode"
            };

            this.nodes.push(newNode);

            // Connect the new node to the previous node with an edge
            const previousNode: NodeData = this.nodes[this.nodes.length - 2];
            const newEdge: EdgeData = {
                source: previousNode.id,
                target: newNode.id,
                class: "edgeToNewNode",
                opacity: 1
            };

            this.edges.push(newEdge);
        }

        // Update the visualization with the newly created structure
        this.normalizeGraph();
        this.updateGraph();
        this.centerCanvas(true);
    }

}
