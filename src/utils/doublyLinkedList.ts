import SinglyLinkedList from "@/utils/singlyLinkedList";
import cytoscape, {StylesheetJson, StylesheetJsonBlock} from "cytoscape";
import {EdgeData, NodeData} from "@/utils/base/baseStructure";

const initHeight: number = 50
const initWidth: number = 50
const nodeHeight: number = 45
const nodeWidth: number = 110

/**
 * DoublyLinkedList - Represents a visualized doubly linked list using Cytoscape.js.
 * Inherits from SinglyLinkedList, extending its functionality by adding backward links.
 */
export default class DoublyLinkedList extends SinglyLinkedList {
    // Holds the ID of the currently adding node to ensure proper visual class assignment.
    protected addingNodeFutureId: number | null;

    /**
     * Constructor to initialize the doubly linked list visualization.
     * @param containerId - The ID of the HTML element where the list is displayed.
     */
    constructor(containerId: string) {
        super(containerId);
        this.addingNodeFutureId = null;

        // Adjust padding for better centering
        this.paddingForCentering = 220;
    }

    /**
     * Sets the visual class for each node in the doubly linked list.
     * The visual class determines how the node is displayed based on its connections with other nodes.
     *
     * Classification logic:
     * - The method determines the class of each node depending on whether it has outgoing edges
     *   and whether it is active or being added.
     * - The class assignment differs for nodes that are currently active, nodes being added,
     *   and nodes that are the start or end of the list.
     *
     * Process:
     * 1. Calculate the number of outgoing edges for each node and store it in a map.
     * 2. Store current visual classes for nodes (excluding initial pointers).
     * 3. Assign visual classes based on:
     *    - No edges (null-node-null).
     *    - One edge (forward or backward link).
     *    - Multiple edges (internal node).
     * 4. Handle nodes pointed to by initial pointers (head or tail) considering new node additions.
     * 5. Mark unconnected nodes as null-node-null if they have no edges.
     * 6. Update nodes only if their visual class has changed.
     */
    protected setClassToNodes(): void {
        // Store the number of outgoing edges for each node
        const sourceCount: Map<string|number, number> = new Map();
        this.edges.forEach( link => {
            sourceCount.set(link.source, (sourceCount.get(link.source) || 0) + 1);
        });

        // Helper to check if a node is not an initial node
        const isNotInitPointer = (index: number) => index > 1;

        // Store current visual class of nodes (excluding initial nodes)
        const nodeClasses: Map<string|number, string|undefined> = new Map();
        this.nodes.forEach((node, index) => {
            if (isNotInitPointer(index)) {
                nodeClasses.set(index, node.class);
            }
        });

        // Helper function to set the visual class of a node
        const setClass = (nodeId: string|number, activeClass: string, defaultClass: string) => {
            // Check if the node is active.
            // If active, set the activeClass, otherwise, set the defaultClass.
            nodeClasses.set(nodeId, nodeId === this.activeNode ? activeClass : defaultClass);
        }

        // Determine the visual class based on edge counts and node status
        this.edges.forEach(link => {
            const source: string|number = link.source;
            const count: number = sourceCount.get(source) || 0;
            const target: string|number = link.target;

            if (count === 0) {
                // No outgoing edges: set as a null node
                setClass(source, "nullActiveNodeNull", "nullDefaultNodeNull");
            }
            else if (count === 1) {
                // One outgoing edge: check if a new node is being added
                if (this.addingNodeFutureId === null) {
                    if (source > target)
                        setClass(source, "activeNodeNull", "defaultNodeNull");  // Node points backward
                    else
                        setClass(source, "nullActiveNode", "nullDefaultNode");  // Node points forward
                }
                else {
                    // Handle visual class when a new node is being added
                    if (source === this.addingNodeFutureId)
                        setClass(source, "activeNodeNull", "defaultNodeNull");  // Node points backward
                    else if (target === this.addingNodeFutureId)
                        setClass(source, "nullActiveNode", "nullDefaultNode");  // Node points forward
                }
            }
            else {
                // Multiple outgoing edges: internal node
                setClass(source, "activeNode", "defaultNode");
            }
        });


        // Handle the visual class assignment for nodes pointed to by the initial pointers.
        // In the doubly linked list, the initial pointers are identified by IDs:
        // - 0: Init pointer at the start of the list (head).
        // - 1: Init pointer at the end of the list (tail).
        if (this.nodes.length === 4 && this.addingNodeFutureId !== null) {
            // If the list contains exactly one node (plus the two initial nodes) and a new node is being added
            this.edges.forEach(link => {
                const target = link.target;
                const count = sourceCount.get(target) || 0;

                if (count === 1) {
                    if (target === this.addingNodeFutureId) {
                        // The new node (target) is being added to the right of the existing node.
                        // The condition link.source === 1 indicates that the end pointer (ID 1)
                        // is pointing to this new node.
                        if (link.source === 1)
                            setClass(target, "activeNodeNull", "defaultNodeNull");
                    } else {
                        // The new node (target) is being added to the left of the existing node.
                        // The condition link.source === 0 indicates that the start pointer (ID 0)
                        // is pointing to this new node.
                        if (link.source === 0)
                            setClass(target, "nullActiveNode", "nullDefaultNode");
                    }
                }
            });
        } else {
            // Standard Case: Handling the visual class assignment for nodes linked by initial pointers.
            this.edges.forEach(link => {
                const target = link.target;
                const count = sourceCount.get(target) || 0;

                if (count === 1) {
                    // If the source of the link is the start pointer (ID 0), it means that the
                    // node being pointed to (target) is at the beginning of the list.
                    if (link.source === 0)
                        setClass(target, "nullActiveNode", "nullDefaultNode");

                    // If the source of the link is the end pointer (ID 1), it means that the
                    // node being pointed to (target) is at the end of the list.
                    if (link.source === 1)
                        setClass(target, "activeNodeNull", "defaultNodeNull");
                }
            });
        }

        // Handle nodes that lost all their edges.
        this.nodes.forEach((node, index) => {
            if (isNotInitPointer(index) && !sourceCount.has(index))
                setClass(index, "nullActiveNodeNull", "nullDefaultNodeNull");
        });

        // Apply the updated visual classes to nodes.
        this.nodes.forEach((node, index) => {
            if (isNotInitPointer(index)) {
                const newClass: string|undefined = nodeClasses.get(index);
                if (newClass && newClass !== node.class) {
                    node.class = newClass;
                }
            }
        });
    }

    /**
     * Creates a reversed edge from a given edge.
     * The reversed edge swaps the source and target nodes.
     * @param edge - The original edge to be reversed.
     * @returns A new reversed edge with a rounded corner style.
     */
    protected returnReverseEdge(edge: EdgeData): EdgeData {
        return {
            source: edge.target,
            target: edge.source,
            class: "roundCornerEdge",
            opacity: 0
        };
    }

    /**
     * Adds the first node to an empty doubly linked list.
     * Connects the new node to both initial pointers (head and tail).
     * @param initNode1 - The initial head pointer node.
     * @param initNode2 - The initial tail pointer node.
     * @param element - The value to be stored in the new node.
     */
    protected async addFirstNodeToTheList(initNode1: NodeData, initNode2: NodeData, element: string): Promise<void> {
        // Create a new node to be the first element in the list.
        const newNode: NodeData = {
            id: this.nodes.length,
            value: element,
            x: 350,
            y: 300,
            opacity: 0,
            class: "nullDefaultNodeNull"
        };
        await this.addNewNodeWithAnimation(newNode);

        // Create edges from the initial head and tail pointers to the new node.
        const newEdge1: EdgeData = {
            source: initNode1.id,
            target: newNode.id,
            class: "edgeFromInitPointer",
            opacity: 0
        };

        const newEdge2: EdgeData = {
            source: initNode2.id,
            target: newNode.id,
            class: "edgeFromInitPointer",
            opacity: 0
        };
        await this.addNewEdgesWithAnimation([newEdge1, newEdge2]);
    }

    /**
     * Initializes the structure of the doubly linked list.
     * Creates the initial graph setup with two pointers representing the head and tail.
     */
    public initStructure(): void {
        if (this.isInit) return;

        // Initialize the graph visualization
        this.initGraph();

        // Create the first initial pointer (head) and add it to the list
        let initNode: NodeData = {
            id: this.nodes.length,
            value: "Init Pointer 1",
            x: 250,
            y: 200,
            class: "pointer"
        };
        this.nodes.push(initNode);

        // Create the second initial pointer (tail) and add it to the list
        initNode = {
            id: this.nodes.length,
            value: "Init Pointer 2",
            x: 450,
            y: 200,
            class: "pointer"
        };
        this.nodes.push(initNode);

        // Update the graph to reflect the new pointers and center the canvas
        this.updateGraph();
        this.centerCanvas(true);
        this.isInit = true;
    }

    /**
     * Initializes the visual representation of the doubly linked list.
     * Sets up a custom style for the nodes.
     */
    protected initGraph(): void {
        const createNodeStyle = (
            className: string, image: string): StylesheetJsonBlock =>
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
                    "text-justification": "center",
                }
            });

        const createRoundSegmentEdgeStyle = (
            className: string, segmentDistances: number[],
            segmentWeights: number[], segmentRadii: number[]): StylesheetJsonBlock => ({
            selector: `.${className}`,
            style: {
                "width": 2,
                "line-color": "black",
                "target-arrow-shape": "triangle",
                "target-arrow-color": "black",
                "curve-style": "round-segments" as any,
                "segment-distances": segmentDistances,
                "segment-weights": segmentWeights,
                "segment-radii": segmentRadii
            }
        });

        const createEdgeStyle = (
            className: string, curveStyle: any): StylesheetJsonBlock => ({
            selector: `.${className}`,
            style: {
                "width": 2,
                "line-color": "black",
                "target-arrow-shape": "triangle",
                "target-arrow-color": "black",
                "curve-style": curveStyle
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
            createNodeStyle("defaultNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iIzg0REVGRiIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPGNpcmNsZSBjeD0iMTAuNSIgY3k9IjIyLjUiIHI9IjMuNSIgZmlsbD0iIzAxMDEwMSIvPgo8Y2lyY2xlIGN4PSI5OS41IiBjeT0iMjIuNSIgcj0iMy41IiBmaWxsPSIjMDEwMTAxIi8+Cjwvc3ZnPgo="),
            createNodeStyle("nullDefaultNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iIzg0REVGRiIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTYuMjExNjkgMjAuMjcyN1YyNUg1LjQ0OTk3TDMuMjIyNTIgMjEuNzhIMy4xODMyOFYyNUgyLjMyNjkzVjIwLjI3MjdIMy4wOTMyNkw1LjMxODQgMjMuNDk1SDUuMzU5OTVWMjAuMjcyN0g2LjIxMTY5Wk0xMC4xMjQ3IDIwLjI3MjdIMTAuOTgxMVYyMy4zNjEyQzEwLjk4MTEgMjMuNjk5NyAxMC45MDExIDIzLjk5NzUgMTAuNzQxIDI0LjI1NDRDMTAuNTgyNSAyNC41MTE0IDEwLjM1OTQgMjQuNzEyMiAxMC4wNzE2IDI0Ljg1NjlDOS43ODM4OCAyNSA5LjQ0NzY1IDI1LjA3MTYgOS4wNjI5NCAyNS4wNzE2QzguNjc2NyAyNS4wNzE2IDguMzM5NyAyNSA4LjA1MTkzIDI0Ljg1NjlDNy43NjQxNyAyNC43MTIyIDcuNTQxMDQgMjQuNTExNCA3LjM4MjU1IDI0LjI1NDRDNy4yMjQwNSAyMy45OTc1IDcuMTQ0OCAyMy42OTk3IDcuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOC4wMDExNVYyMy4yODk2QzguMDAxMTUgMjMuNDg2NiA4LjA0NDI0IDIzLjY2MiA4LjEzMDQxIDIzLjgxNTlDOC4yMTgxMyAyMy45Njk4IDguMzQxMjMgMjQuMDkwNiA4LjQ5OTczIDI0LjE3ODNDOC42NTgyMyAyNC4yNjQ0IDguODQ1OTcgMjQuMzA3NSA5LjA2Mjk0IDI0LjMwNzVDOS4yNzk5MiAyNC4zMDc1IDkuNDY3NjUgMjQuMjY0NCA5LjYyNjE1IDI0LjE3ODNDOS43ODYxOSAyNC4wOTA2IDkuOTA5MyAyMy45Njk4IDkuOTk1NDcgMjMuODE1OUMxMC4wODE2IDIzLjY2MiAxMC4xMjQ3IDIzLjQ4NjYgMTAuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTExLjkxMTkgMjVWMjAuMjcyN0gxMi43NjgyVjI0LjI4MjFIMTQuODUwM1YyNUgxMS45MTE5Wk0xNS41OTM1IDI1VjIwLjI3MjdIMTYuNDQ5OVYyNC4yODIxSDE4LjUzMTlWMjVIMTUuNTkzNVoiIGZpbGw9ImJsYWNrIi8+CjxjaXJjbGUgY3g9Ijk5LjUiIGN5PSIyMi41IiByPSIzLjUiIGZpbGw9IiMwMTAxMDEiLz4KPC9zdmc+Cg=="),
            createNodeStyle("nullDefaultNodeNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iIzg0REVGRiIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTYuMjExNjkgMjAuMjcyN1YyNUg1LjQ0OTk3TDMuMjIyNTIgMjEuNzhIMy4xODMyOFYyNUgyLjMyNjkzVjIwLjI3MjdIMy4wOTMyNkw1LjMxODQgMjMuNDk1SDUuMzU5OTVWMjAuMjcyN0g2LjIxMTY5Wk0xMC4xMjQ3IDIwLjI3MjdIMTAuOTgxMVYyMy4zNjEyQzEwLjk4MTEgMjMuNjk5NyAxMC45MDExIDIzLjk5NzUgMTAuNzQxIDI0LjI1NDRDMTAuNTgyNSAyNC41MTE0IDEwLjM1OTQgMjQuNzEyMiAxMC4wNzE2IDI0Ljg1NjlDOS43ODM4OCAyNSA5LjQ0NzY1IDI1LjA3MTYgOS4wNjI5NCAyNS4wNzE2QzguNjc2NyAyNS4wNzE2IDguMzM5NyAyNSA4LjA1MTkzIDI0Ljg1NjlDNy43NjQxNyAyNC43MTIyIDcuNTQxMDQgMjQuNTExNCA3LjM4MjU1IDI0LjI1NDRDNy4yMjQwNSAyMy45OTc1IDcuMTQ0OCAyMy42OTk3IDcuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOC4wMDExNVYyMy4yODk2QzguMDAxMTUgMjMuNDg2NiA4LjA0NDI0IDIzLjY2MiA4LjEzMDQxIDIzLjgxNTlDOC4yMTgxMyAyMy45Njk4IDguMzQxMjMgMjQuMDkwNiA4LjQ5OTczIDI0LjE3ODNDOC42NTgyMyAyNC4yNjQ0IDguODQ1OTcgMjQuMzA3NSA5LjA2Mjk0IDI0LjMwNzVDOS4yNzk5MiAyNC4zMDc1IDkuNDY3NjUgMjQuMjY0NCA5LjYyNjE1IDI0LjE3ODNDOS43ODYxOSAyNC4wOTA2IDkuOTA5MyAyMy45Njk4IDkuOTk1NDcgMjMuODE1OUMxMC4wODE2IDIzLjY2MiAxMC4xMjQ3IDIzLjQ4NjYgMTAuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTExLjkxMTkgMjVWMjAuMjcyN0gxMi43NjgyVjI0LjI4MjFIMTQuODUwM1YyNUgxMS45MTE5Wk0xNS41OTM1IDI1VjIwLjI3MjdIMTYuNDQ5OVYyNC4yODIxSDE4LjUzMTlWMjVIMTUuNTkzNVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik05NS4yMTE3IDIwLjI3MjdWMjVIOTQuNDVMOTIuMjIyNSAyMS43OEg5Mi4xODMzVjI1SDkxLjMyNjlWMjAuMjcyN0g5Mi4wOTMzTDk0LjMxODQgMjMuNDk1SDk0LjM2VjIwLjI3MjdIOTUuMjExN1pNOTkuMTI0NyAyMC4yNzI3SDk5Ljk4MTFWMjMuMzYxMkM5OS45ODExIDIzLjY5OTcgOTkuOTAxMSAyMy45OTc1IDk5Ljc0MSAyNC4yNTQ0Qzk5LjU4MjUgMjQuNTExNCA5OS4zNTk0IDI0LjcxMjIgOTkuMDcxNiAyNC44NTY5Qzk4Ljc4MzkgMjUgOTguNDQ3NiAyNS4wNzE2IDk4LjA2MjkgMjUuMDcxNkM5Ny42NzY3IDI1LjA3MTYgOTcuMzM5NyAyNSA5Ny4wNTE5IDI0Ljg1NjlDOTYuNzY0MiAyNC43MTIyIDk2LjU0MSAyNC41MTE0IDk2LjM4MjUgMjQuMjU0NEM5Ni4yMjQgMjMuOTk3NSA5Ni4xNDQ4IDIzLjY5OTcgOTYuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOTcuMDAxMlYyMy4yODk2Qzk3LjAwMTIgMjMuNDg2NiA5Ny4wNDQyIDIzLjY2MiA5Ny4xMzA0IDIzLjgxNTlDOTcuMjE4MSAyMy45Njk4IDk3LjM0MTIgMjQuMDkwNiA5Ny40OTk3IDI0LjE3ODNDOTcuNjU4MiAyNC4yNjQ0IDk3Ljg0NiAyNC4zMDc1IDk4LjA2MjkgMjQuMzA3NUM5OC4yNzk5IDI0LjMwNzUgOTguNDY3NyAyNC4yNjQ0IDk4LjYyNjIgMjQuMTc4M0M5OC43ODYyIDI0LjA5MDYgOTguOTA5MyAyMy45Njk4IDk4Ljk5NTUgMjMuODE1OUM5OS4wODE2IDIzLjY2MiA5OS4xMjQ3IDIzLjQ4NjYgOTkuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTEwMC45MTIgMjVWMjAuMjcyN0gxMDEuNzY4VjI0LjI4MjFIMTAzLjg1VjI1SDEwMC45MTJaTTEwNC41OTQgMjVWMjAuMjcyN0gxMDUuNDVWMjQuMjgyMUgxMDcuNTMyVjI1SDEwNC41OTRaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K"),
            createNodeStyle("defaultNodeNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iIzg0REVGRiIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTk1LjIxMTcgMjAuMjcyN1YyNUg5NC40NUw5Mi4yMjI1IDIxLjc4SDkyLjE4MzNWMjVIOTEuMzI2OVYyMC4yNzI3SDkyLjA5MzNMOTQuMzE4NCAyMy40OTVIOTQuMzZWMjAuMjcyN0g5NS4yMTE3Wk05OS4xMjQ3IDIwLjI3MjdIOTkuOTgxMVYyMy4zNjEyQzk5Ljk4MTEgMjMuNjk5NyA5OS45MDExIDIzLjk5NzUgOTkuNzQxIDI0LjI1NDRDOTkuNTgyNSAyNC41MTE0IDk5LjM1OTQgMjQuNzEyMiA5OS4wNzE2IDI0Ljg1NjlDOTguNzgzOSAyNSA5OC40NDc2IDI1LjA3MTYgOTguMDYyOSAyNS4wNzE2Qzk3LjY3NjcgMjUuMDcxNiA5Ny4zMzk3IDI1IDk3LjA1MTkgMjQuODU2OUM5Ni43NjQyIDI0LjcxMjIgOTYuNTQxIDI0LjUxMTQgOTYuMzgyNSAyNC4yNTQ0Qzk2LjIyNCAyMy45OTc1IDk2LjE0NDggMjMuNjk5NyA5Ni4xNDQ4IDIzLjM2MTJWMjAuMjcyN0g5Ny4wMDEyVjIzLjI4OTZDOTcuMDAxMiAyMy40ODY2IDk3LjA0NDIgMjMuNjYyIDk3LjEzMDQgMjMuODE1OUM5Ny4yMTgxIDIzLjk2OTggOTcuMzQxMiAyNC4wOTA2IDk3LjQ5OTcgMjQuMTc4M0M5Ny42NTgyIDI0LjI2NDQgOTcuODQ2IDI0LjMwNzUgOTguMDYyOSAyNC4zMDc1Qzk4LjI3OTkgMjQuMzA3NSA5OC40Njc3IDI0LjI2NDQgOTguNjI2MiAyNC4xNzgzQzk4Ljc4NjIgMjQuMDkwNiA5OC45MDkzIDIzLjk2OTggOTguOTk1NSAyMy44MTU5Qzk5LjA4MTYgMjMuNjYyIDk5LjEyNDcgMjMuNDg2NiA5OS4xMjQ3IDIzLjI4OTZWMjAuMjcyN1pNMTAwLjkxMiAyNVYyMC4yNzI3SDEwMS43NjhWMjQuMjgyMUgxMDMuODVWMjVIMTAwLjkxMlpNMTA0LjU5NCAyNVYyMC4yNzI3SDEwNS40NVYyNC4yODIxSDEwNy41MzJWMjVIMTA0LjU5NFoiIGZpbGw9ImJsYWNrIi8+CjxjaXJjbGUgY3g9IjEwLjUiIGN5PSIyMi41IiByPSIzLjUiIGZpbGw9IiMwMTAxMDEiLz4KPC9zdmc+Cg=="),
            createNodeStyle("activeNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iI0ZGRTI2RSIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTI0LjQxMSA0Mi4xMjc4QzI0LjA2NTQgNDIuMTI3OCAyMy43NTE3IDQyLjA2MjcgMjMuNDY5OSA0MS45MzI1QzIzLjE4ODIgNDEuOCAyMi45NjQ1IDQxLjYwOTQgMjIuNzk4OCA0MS4zNjA4QzIyLjYzMzEgNDEuMTA5OCAyMi41NTAyIDQwLjgwNjggMjIuNTUwMiA0MC40NTE3QzIyLjU1MDIgNDAuMTM5MiAyMi42MTE4IDM5Ljg4NTkgMjIuNzM0OSAzOS42OTE4QzIyLjg1OCAzOS40OTUzIDIzLjAyMjUgMzkuMzQxNCAyMy4yMjg1IDM5LjIzMDFDMjMuNDM0NCAzOS4xMTg4IDIzLjY2MTcgMzkuMDM2IDIzLjkxMDMgMzguOTgxNUMyNC4xNjEyIDM4LjkyNDcgMjQuNDEzNCAzOC44Nzk3IDI0LjY2NjcgMzguODQ2NkMyNC45OTgxIDM4LjgwNCAyNS4yNjY4IDM4Ljc3MiAyNS40NzI4IDM4Ljc1MDdDMjUuNjgxMSAzOC43MjcgMjUuODMyNiAzOC42ODggMjUuOTI3MyAzOC42MzM1QzI2LjAyNDQgMzguNTc5MSAyNi4wNzI5IDM4LjQ4NDQgMjYuMDcyOSAzOC4zNDk0VjM4LjMyMUMyNi4wNzI5IDM3Ljk3MDYgMjUuOTc3MSAzNy42OTg0IDI1Ljc4NTMgMzcuNTA0M0MyNS41OTU5IDM3LjMxMDEgMjUuMzA4MyAzNy4yMTMxIDI0LjkyMjQgMzcuMjEzMUMyNC41MjIzIDM3LjIxMzEgMjQuMjA4NiAzNy4zMDA3IDIzLjk4MTMgMzcuNDc1OUMyMy43NTQgMzcuNjUxIDIzLjU5NDIgMzcuODM4MSAyMy41MDE5IDM4LjAzNjlMMjIuNzA2NSAzNy43NTI4QzIyLjg0ODUgMzcuNDIxNCAyMy4wMzc5IDM3LjE2MzQgMjMuMjc0NiAzNi45Nzg3QzIzLjUxMzcgMzYuNzkxNyAyMy43NzQyIDM2LjY2MTUgMjQuMDU1OSAzNi41ODgxQzI0LjM0IDM2LjUxMjMgMjQuNjE5MyAzNi40NzQ0IDI0Ljg5NCAzNi40NzQ0QzI1LjA2OTEgMzYuNDc0NCAyNS4yNzA0IDM2LjQ5NTcgMjUuNDk3NiAzNi41Mzg0QzI1LjcyNzMgMzYuNTc4NiAyNS45NDg2IDM2LjY2MjYgMjYuMTYxNyAzNi43OTA1QzI2LjM3NzEgMzYuOTE4MyAyNi41NTU5IDM3LjExMTMgMjYuNjk3OSAzNy4zNjkzQzI2Ljg0IDM3LjYyNzQgMjYuOTExIDM3Ljk3MyAyNi45MTEgMzguNDA2MlY0MkgyNi4wNzI5VjQxLjI2MTRIMjYuMDMwM0MyNS45NzM1IDQxLjM3OTcgMjUuODc4OCA0MS41MDY0IDI1Ljc0NjIgNDEuNjQxM0MyNS42MTM3IDQxLjc3NjMgMjUuNDM3MyA0MS44OTExIDI1LjIxNzEgNDEuOTg1OEMyNC45OTY5IDQyLjA4MDUgMjQuNzI4MiA0Mi4xMjc4IDI0LjQxMSA0Mi4xMjc4Wk0yNC41Mzg4IDQxLjM3NUMyNC44NzAzIDQxLjM3NSAyNS4xNDk2IDQxLjMwOTkgMjUuMzc2OSA0MS4xNzk3QzI1LjYwNjUgNDEuMDQ5NSAyNS43Nzk0IDQwLjg4MTQgMjUuODk1NCA0MC42NzU0QzI2LjAxMzcgNDAuNDY5NSAyNi4wNzI5IDQwLjI1MjggMjYuMDcyOSA0MC4wMjU2VjM5LjI1ODVDMjYuMDM3NCAzOS4zMDExIDI1Ljk1OTMgMzkuMzQwMiAyNS44Mzg2IDM5LjM3NTdDMjUuNzIwMiAzOS40MDg5IDI1LjU4MjkgMzkuNDM4NCAyNS40MjY2IDM5LjQ2NDVDMjUuMjcyNyAzOS40ODgyIDI1LjEyMjQgMzkuNTA5NSAyNC45NzU2IDM5LjUyODRDMjQuODMxMiAzOS41NDUgMjQuNzE0IDM5LjU1OTIgMjQuNjI0MSAzOS41NzFDMjQuNDA2MyAzOS41OTk0IDI0LjIwMjcgMzkuNjQ1NiAyNC4wMTMzIDM5LjcwOTVDMjMuODI2MiAzOS43NzExIDIzLjY3NDcgMzkuODY0NiAyMy41NTg3IDM5Ljk5MDFDMjMuNDQ1MSA0MC4xMTMyIDIzLjM4ODMgNDAuMjgxMiAyMy4zODgzIDQwLjQ5NDNDMjMuMzg4MyA0MC43ODU1IDIzLjQ5NiA0MS4wMDU3IDIzLjcxMTQgNDEuMTU0OEMyMy45MjkyIDQxLjMwMTYgMjQuMjA1IDQxLjM3NSAyNC41Mzg4IDQxLjM3NVpNMzAuNjU2NiA0Mi4xMTM2QzMwLjE0NTIgNDIuMTEzNiAyOS43MDQ5IDQxLjk5MjkgMjkuMzM1NSA0MS43NTE0QzI4Ljk2NjIgNDEuNTA5OSAyOC42ODIxIDQxLjE3NzMgMjguNDgzMyA0MC43NTM2QzI4LjI4NDQgNDAuMzI5OCAyOC4xODUgMzkuODQ1NiAyOC4xODUgMzkuMzAxMUMyOC4xODUgMzguNzQ3MiAyOC4yODY4IDM4LjI1ODMgMjguNDkwNCAzNy44MzQ1QzI4LjY5NjMgMzcuNDA4NCAyOC45ODI4IDM3LjA3NTggMjkuMzQ5NyAzNi44MzY2QzI5LjcxOTEgMzYuNTk1MiAzMC4xNDk5IDM2LjQ3NDQgMzAuNjQyNCAzNi40NzQ0QzMxLjAyNTkgMzYuNDc0NCAzMS4zNzE1IDM2LjU0NTUgMzEuNjc5MyAzNi42ODc1QzMxLjk4NzEgMzYuODI5NSAzMi4yMzkyIDM3LjAyODQgMzIuNDM1NyAzNy4yODQxQzMyLjYzMjIgMzcuNTM5OCAzMi43NTQxIDM3LjgzODEgMzIuODAxNCAzOC4xNzlIMzEuOTYzNEMzMS44OTk1IDM3LjkzMDQgMzEuNzU3NCAzNy43MTAyIDMxLjUzNzIgMzcuNTE4NUMzMS4zMTk0IDM3LjMyNDMgMzEuMDI1OSAzNy4yMjczIDMwLjY1NjYgMzcuMjI3M0MzMC4zMjk5IDM3LjIyNzMgMzAuMDQzNCAzNy4zMTI1IDI5Ljc5NzIgMzcuNDgzQzI5LjU1MzMgMzcuNjUxIDI5LjM2MjggMzcuODg5IDI5LjIyNTUgMzguMTk2N0MyOS4wOTA1IDM4LjUwMjEgMjkuMDIzIDM4Ljg2MDggMjkuMDIzIDM5LjI3MjdDMjkuMDIzIDM5LjY5NDEgMjkuMDg5MyA0MC4wNjExIDI5LjIyMTkgNDAuMzczNkMyOS4zNTY4IDQwLjY4NjEgMjkuNTQ2MiA0MC45Mjg3IDI5Ljc5MDEgNDEuMTAxNkMzMC4wMzYzIDQxLjI3NDQgMzAuMzI1MSA0MS4zNjA4IDMwLjY1NjYgNDEuMzYwOEMzMC44NzQ0IDQxLjM2MDggMzEuMDcyIDQxLjMyMjkgMzEuMjQ5NiA0MS4yNDcyQzMxLjQyNzIgNDEuMTcxNCAzMS41Nzc1IDQxLjA2MjUgMzEuNzAwNiA0MC45MjA1QzMxLjgyMzcgNDAuNzc4NCAzMS45MTEzIDQwLjYwOCAzMS45NjM0IDQwLjQwOTFIMzIuODAxNEMzMi43NTQxIDQwLjczMTEgMzIuNjM2OSA0MS4wMjExIDMyLjQ0OTkgNDEuMjc5MUMzMi4yNjUyIDQxLjUzNDggMzIuMDIwMiA0MS43Mzg0IDMxLjcxNDggNDEuODg5OUMzMS40MTE4IDQyLjAzOTEgMzEuMDU5IDQyLjExMzYgMzAuNjU2NiA0Mi4xMTM2Wk0zNi4zOTg3IDM2LjU0NTVWMzcuMjU1N0gzMy41NzJWMzYuNTQ1NUgzNi4zOTg3Wk0zNC4zOTU5IDM1LjIzODZIMzUuMjM0VjQwLjQzNzVDMzUuMjM0IDQwLjY3NDIgMzUuMjY4MyA0MC44NTE4IDM1LjMzNyA0MC45NzAyQzM1LjQwOCA0MS4wODYyIDM1LjQ5NzkgNDEuMTY0MyAzNS42MDY4IDQxLjIwNDVDMzUuNzE4MSA0MS4yNDI0IDM1LjgzNTMgNDEuMjYxNCAzNS45NTg0IDQxLjI2MTRDMzYuMDUwNyA0MS4yNjE0IDM2LjEyNjUgNDEuMjU2NiAzNi4xODU3IDQxLjI0NzJDMzYuMjQ0OSA0MS4yMzUzIDM2LjI5MjIgNDEuMjI1OSAzNi4zMjc3IDQxLjIxODhMMzYuNDk4MiA0MS45NzE2QzM2LjQ0MTQgNDEuOTkyOSAzNi4zNjIxIDQyLjAxNDIgMzYuMjYwMyA0Mi4wMzU1QzM2LjE1ODUgNDIuMDU5MiAzNi4wMjk0IDQyLjA3MSAzNS44NzMyIDQyLjA3MUMzNS42MzY0IDQyLjA3MSAzNS40MDQ0IDQyLjAyMDEgMzUuMTc3MiA0MS45MTgzQzM0Ljk1MjMgNDEuODE2NSAzNC43NjUyIDQxLjY2MTUgMzQuNjE2MSA0MS40NTMxQzM0LjQ2OTMgNDEuMjQ0OCAzNC4zOTU5IDQwLjk4MiAzNC4zOTU5IDQwLjY2NDhWMzUuMjM4NlpNMzcuNjU5NCA0MlYzNi41NDU1SDM4LjQ5NzVWNDJIMzcuNjU5NFpNMzguMDg1NSAzNS42MzY0QzM3LjkyMjIgMzUuNjM2NCAzNy43ODEzIDM1LjU4MDcgMzcuNjYzIDM1LjQ2OTVDMzcuNTQ2OSAzNS4zNTgyIDM3LjQ4ODkgMzUuMjI0NCAzNy40ODg5IDM1LjA2ODJDMzcuNDg4OSAzNC45MTE5IDM3LjU0NjkgMzQuNzc4MiAzNy42NjMgMzQuNjY2OUMzNy43ODEzIDM0LjU1NTYgMzcuOTIyMiAzNC41IDM4LjA4NTUgMzQuNUMzOC4yNDg5IDM0LjUgMzguMzg4NiAzNC41NTU2IDM4LjUwNDYgMzQuNjY2OUMzOC42MjI5IDM0Ljc3ODIgMzguNjgyMSAzNC45MTE5IDM4LjY4MjEgMzUuMDY4MkMzOC42ODIxIDM1LjIyNDQgMzguNjIyOSAzNS4zNTgyIDM4LjUwNDYgMzUuNDY5NUMzOC4zODg2IDM1LjU4MDcgMzguMjQ4OSAzNS42MzY0IDM4LjA4NTUgMzUuNjM2NFpNNDQuNDkyNyAzNi41NDU1TDQyLjQ3NTYgNDJINDEuNjIzNEwzOS42MDYzIDM2LjU0NTVINDAuNTE1NEw0Mi4wMjExIDQwLjg5Mkg0Mi4wNzc5TDQzLjU4MzYgMzYuNTQ1NUg0NC40OTI3Wk00Ny42OTA1IDQyLjExMzZDNDcuMTY0OSA0Mi4xMTM2IDQ2LjcxMTUgNDEuOTk3NiA0Ni4zMzA0IDQxLjc2NTZDNDUuOTUxNiA0MS41MzEyIDQ1LjY1OTIgNDEuMjA0NSA0NS40NTMzIDQwLjc4NTVDNDUuMjQ5NyA0MC4zNjQxIDQ1LjE0NzkgMzkuODc0MSA0NS4xNDc5IDM5LjMxNTNDNDUuMTQ3OSAzOC43NTY2IDQ1LjI0OTcgMzguMjY0MiA0NS40NTMzIDM3LjgzODFDNDUuNjU5MiAzNy40MDk2IDQ1Ljk0NTcgMzcuMDc1OCA0Ni4zMTI2IDM2LjgzNjZDNDYuNjgyIDM2LjU5NTIgNDcuMTEyOCAzNi40NzQ0IDQ3LjYwNTIgMzYuNDc0NEM0Ny44ODkzIDM2LjQ3NDQgNDguMTY5OSAzNi41MjE4IDQ4LjQ0NjkgMzYuNjE2NUM0OC43MjM5IDM2LjcxMTIgNDguOTc2IDM2Ljg2NTEgNDkuMjAzMyAzNy4wNzgxQzQ5LjQzMDUgMzcuMjg4OCA0OS42MTE2IDM3LjU2ODIgNDkuNzQ2NiAzNy45MTYyQzQ5Ljg4MTUgMzguMjY0MiA0OS45NDkgMzguNjkyNyA0OS45NDkgMzkuMjAxN1YzOS41NTY4SDQ1Ljc0NDVWMzguODMyNEg0OS4wOTY3QzQ5LjA5NjcgMzguNTI0NiA0OS4wMzUyIDM4LjI1IDQ4LjkxMjEgMzguMDA4NUM0OC43OTEzIDM3Ljc2NyA0OC42MTg1IDM3LjU3NjUgNDguMzkzNiAzNy40MzY4QzQ4LjE3MTEgMzcuMjk3MSA0Ny45MDgzIDM3LjIyNzMgNDcuNjA1MiAzNy4yMjczQzQ3LjI3MTQgMzcuMjI3MyA0Ni45ODI2IDM3LjMxMDEgNDYuNzM4OCAzNy40NzU5QzQ2LjQ5NzMgMzcuNjM5MiA0Ni4zMTE1IDM3Ljg1MjMgNDYuMTgxMiAzOC4xMTUxQzQ2LjA1MSAzOC4zNzc4IDQ1Ljk4NTkgMzguNjU5NiA0NS45ODU5IDM4Ljk2MDJWMzkuNDQzMkM0NS45ODU5IDM5Ljg1NTEgNDYuMDU3IDQwLjIwNDMgNDYuMTk5IDQwLjQ5MDhDNDYuMzQzNCA0MC43NzQ5IDQ2LjU0MzUgNDAuOTkxNSA0Ni43OTkxIDQxLjE0MDZDNDcuMDU0OCA0MS4yODc0IDQ3LjM1MTkgNDEuMzYwOCA0Ny42OTA1IDQxLjM2MDhDNDcuOTEwNiA0MS4zNjA4IDQ4LjEwOTUgNDEuMzMgNDguMjg3MSA0MS4yNjg1QzQ4LjQ2NyA0MS4yMDQ1IDQ4LjYyMjEgNDEuMTA5OCA0OC43NTIzIDQwLjk4NDRDNDguODgyNSA0MC44NTY1IDQ4Ljk4MzEgNDAuNjk3OSA0OS4wNTQxIDQwLjUwODVMNDkuODYzOCA0MC43MzU4QzQ5Ljc3ODUgNDEuMDEwNCA0OS42MzUzIDQxLjI1MTkgNDkuNDM0MSA0MS40NjAyQzQ5LjIzMjkgNDEuNjY2MiA0OC45ODQzIDQxLjgyNzIgNDguNjg4MyA0MS45NDMyQzQ4LjM5MjQgNDIuMDU2OCA0OC4wNTk4IDQyLjExMzYgNDcuNjkwNSA0Mi4xMTM2WiIgZmlsbD0iYmxhY2siLz4KPGNpcmNsZSBjeD0iMTAuNSIgY3k9IjIyLjUiIHI9IjMuNSIgZmlsbD0iIzAxMDEwMSIvPgo8Y2lyY2xlIGN4PSI5OS41IiBjeT0iMjIuNSIgcj0iMy41IiBmaWxsPSIjMDEwMTAxIi8+Cjwvc3ZnPgo="),
            createNodeStyle("nullActiveNode", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iI0ZGRTI2RSIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTYuMjExNjkgMjAuMjcyN1YyNUg1LjQ0OTk3TDMuMjIyNTIgMjEuNzhIMy4xODMyOFYyNUgyLjMyNjkzVjIwLjI3MjdIMy4wOTMyNkw1LjMxODQgMjMuNDk1SDUuMzU5OTVWMjAuMjcyN0g2LjIxMTY5Wk0xMC4xMjQ3IDIwLjI3MjdIMTAuOTgxMVYyMy4zNjEyQzEwLjk4MTEgMjMuNjk5NyAxMC45MDExIDIzLjk5NzUgMTAuNzQxIDI0LjI1NDRDMTAuNTgyNSAyNC41MTE0IDEwLjM1OTQgMjQuNzEyMiAxMC4wNzE2IDI0Ljg1NjlDOS43ODM4OCAyNSA5LjQ0NzY1IDI1LjA3MTYgOS4wNjI5NCAyNS4wNzE2QzguNjc2NyAyNS4wNzE2IDguMzM5NyAyNSA4LjA1MTkzIDI0Ljg1NjlDNy43NjQxNyAyNC43MTIyIDcuNTQxMDQgMjQuNTExNCA3LjM4MjU1IDI0LjI1NDRDNy4yMjQwNSAyMy45OTc1IDcuMTQ0OCAyMy42OTk3IDcuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOC4wMDExNVYyMy4yODk2QzguMDAxMTUgMjMuNDg2NiA4LjA0NDI0IDIzLjY2MiA4LjEzMDQxIDIzLjgxNTlDOC4yMTgxMyAyMy45Njk4IDguMzQxMjMgMjQuMDkwNiA4LjQ5OTczIDI0LjE3ODNDOC42NTgyMyAyNC4yNjQ0IDguODQ1OTcgMjQuMzA3NSA5LjA2Mjk0IDI0LjMwNzVDOS4yNzk5MiAyNC4zMDc1IDkuNDY3NjUgMjQuMjY0NCA5LjYyNjE1IDI0LjE3ODNDOS43ODYxOSAyNC4wOTA2IDkuOTA5MyAyMy45Njk4IDkuOTk1NDcgMjMuODE1OUMxMC4wODE2IDIzLjY2MiAxMC4xMjQ3IDIzLjQ4NjYgMTAuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTExLjkxMTkgMjVWMjAuMjcyN0gxMi43NjgyVjI0LjI4MjFIMTQuODUwM1YyNUgxMS45MTE5Wk0xNS41OTM1IDI1VjIwLjI3MjdIMTYuNDQ5OVYyNC4yODIxSDE4LjUzMTlWMjVIMTUuNTkzNVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yNC40MTEgNDIuMTI3OEMyNC4wNjU0IDQyLjEyNzggMjMuNzUxNyA0Mi4wNjI3IDIzLjQ2OTkgNDEuOTMyNUMyMy4xODgyIDQxLjggMjIuOTY0NSA0MS42MDk0IDIyLjc5ODggNDEuMzYwOEMyMi42MzMxIDQxLjEwOTggMjIuNTUwMiA0MC44MDY4IDIyLjU1MDIgNDAuNDUxN0MyMi41NTAyIDQwLjEzOTIgMjIuNjExOCAzOS44ODU5IDIyLjczNDkgMzkuNjkxOEMyMi44NTggMzkuNDk1MyAyMy4wMjI1IDM5LjM0MTQgMjMuMjI4NSAzOS4yMzAxQzIzLjQzNDQgMzkuMTE4OCAyMy42NjE3IDM5LjAzNiAyMy45MTAzIDM4Ljk4MTVDMjQuMTYxMiAzOC45MjQ3IDI0LjQxMzQgMzguODc5NyAyNC42NjY3IDM4Ljg0NjZDMjQuOTk4MSAzOC44MDQgMjUuMjY2OCAzOC43NzIgMjUuNDcyOCAzOC43NTA3QzI1LjY4MTEgMzguNzI3IDI1LjgzMjYgMzguNjg4IDI1LjkyNzMgMzguNjMzNUMyNi4wMjQ0IDM4LjU3OTEgMjYuMDcyOSAzOC40ODQ0IDI2LjA3MjkgMzguMzQ5NFYzOC4zMjFDMjYuMDcyOSAzNy45NzA2IDI1Ljk3NzEgMzcuNjk4NCAyNS43ODUzIDM3LjUwNDNDMjUuNTk1OSAzNy4zMTAxIDI1LjMwODMgMzcuMjEzMSAyNC45MjI0IDM3LjIxMzFDMjQuNTIyMyAzNy4yMTMxIDI0LjIwODYgMzcuMzAwNyAyMy45ODEzIDM3LjQ3NTlDMjMuNzU0IDM3LjY1MSAyMy41OTQyIDM3LjgzODEgMjMuNTAxOSAzOC4wMzY5TDIyLjcwNjUgMzcuNzUyOEMyMi44NDg1IDM3LjQyMTQgMjMuMDM3OSAzNy4xNjM0IDIzLjI3NDYgMzYuOTc4N0MyMy41MTM3IDM2Ljc5MTcgMjMuNzc0MiAzNi42NjE1IDI0LjA1NTkgMzYuNTg4MUMyNC4zNCAzNi41MTIzIDI0LjYxOTMgMzYuNDc0NCAyNC44OTQgMzYuNDc0NEMyNS4wNjkxIDM2LjQ3NDQgMjUuMjcwNCAzNi40OTU3IDI1LjQ5NzYgMzYuNTM4NEMyNS43MjczIDM2LjU3ODYgMjUuOTQ4NiAzNi42NjI2IDI2LjE2MTcgMzYuNzkwNUMyNi4zNzcxIDM2LjkxODMgMjYuNTU1OSAzNy4xMTEzIDI2LjY5NzkgMzcuMzY5M0MyNi44NCAzNy42Mjc0IDI2LjkxMSAzNy45NzMgMjYuOTExIDM4LjQwNjJWNDJIMjYuMDcyOVY0MS4yNjE0SDI2LjAzMDNDMjUuOTczNSA0MS4zNzk3IDI1Ljg3ODggNDEuNTA2NCAyNS43NDYyIDQxLjY0MTNDMjUuNjEzNyA0MS43NzYzIDI1LjQzNzMgNDEuODkxMSAyNS4yMTcxIDQxLjk4NThDMjQuOTk2OSA0Mi4wODA1IDI0LjcyODIgNDIuMTI3OCAyNC40MTEgNDIuMTI3OFpNMjQuNTM4OCA0MS4zNzVDMjQuODcwMyA0MS4zNzUgMjUuMTQ5NiA0MS4zMDk5IDI1LjM3NjkgNDEuMTc5N0MyNS42MDY1IDQxLjA0OTUgMjUuNzc5NCA0MC44ODE0IDI1Ljg5NTQgNDAuNjc1NEMyNi4wMTM3IDQwLjQ2OTUgMjYuMDcyOSA0MC4yNTI4IDI2LjA3MjkgNDAuMDI1NlYzOS4yNTg1QzI2LjAzNzQgMzkuMzAxMSAyNS45NTkzIDM5LjM0MDIgMjUuODM4NiAzOS4zNzU3QzI1LjcyMDIgMzkuNDA4OSAyNS41ODI5IDM5LjQzODQgMjUuNDI2NiAzOS40NjQ1QzI1LjI3MjcgMzkuNDg4MiAyNS4xMjI0IDM5LjUwOTUgMjQuOTc1NiAzOS41Mjg0QzI0LjgzMTIgMzkuNTQ1IDI0LjcxNCAzOS41NTkyIDI0LjYyNDEgMzkuNTcxQzI0LjQwNjMgMzkuNTk5NCAyNC4yMDI3IDM5LjY0NTYgMjQuMDEzMyAzOS43MDk1QzIzLjgyNjIgMzkuNzcxMSAyMy42NzQ3IDM5Ljg2NDYgMjMuNTU4NyAzOS45OTAxQzIzLjQ0NTEgNDAuMTEzMiAyMy4zODgzIDQwLjI4MTIgMjMuMzg4MyA0MC40OTQzQzIzLjM4ODMgNDAuNzg1NSAyMy40OTYgNDEuMDA1NyAyMy43MTE0IDQxLjE1NDhDMjMuOTI5MiA0MS4zMDE2IDI0LjIwNSA0MS4zNzUgMjQuNTM4OCA0MS4zNzVaTTMwLjY1NjYgNDIuMTEzNkMzMC4xNDUyIDQyLjExMzYgMjkuNzA0OSA0MS45OTI5IDI5LjMzNTUgNDEuNzUxNEMyOC45NjYyIDQxLjUwOTkgMjguNjgyMSA0MS4xNzczIDI4LjQ4MzMgNDAuNzUzNkMyOC4yODQ0IDQwLjMyOTggMjguMTg1IDM5Ljg0NTYgMjguMTg1IDM5LjMwMTFDMjguMTg1IDM4Ljc0NzIgMjguMjg2OCAzOC4yNTgzIDI4LjQ5MDQgMzcuODM0NUMyOC42OTYzIDM3LjQwODQgMjguOTgyOCAzNy4wNzU4IDI5LjM0OTcgMzYuODM2NkMyOS43MTkxIDM2LjU5NTIgMzAuMTQ5OSAzNi40NzQ0IDMwLjY0MjQgMzYuNDc0NEMzMS4wMjU5IDM2LjQ3NDQgMzEuMzcxNSAzNi41NDU1IDMxLjY3OTMgMzYuNjg3NUMzMS45ODcxIDM2LjgyOTUgMzIuMjM5MiAzNy4wMjg0IDMyLjQzNTcgMzcuMjg0MUMzMi42MzIyIDM3LjUzOTggMzIuNzU0MSAzNy44MzgxIDMyLjgwMTQgMzguMTc5SDMxLjk2MzRDMzEuODk5NSAzNy45MzA0IDMxLjc1NzQgMzcuNzEwMiAzMS41MzcyIDM3LjUxODVDMzEuMzE5NCAzNy4zMjQzIDMxLjAyNTkgMzcuMjI3MyAzMC42NTY2IDM3LjIyNzNDMzAuMzI5OSAzNy4yMjczIDMwLjA0MzQgMzcuMzEyNSAyOS43OTcyIDM3LjQ4M0MyOS41NTMzIDM3LjY1MSAyOS4zNjI4IDM3Ljg4OSAyOS4yMjU1IDM4LjE5NjdDMjkuMDkwNSAzOC41MDIxIDI5LjAyMyAzOC44NjA4IDI5LjAyMyAzOS4yNzI3QzI5LjAyMyAzOS42OTQxIDI5LjA4OTMgNDAuMDYxMSAyOS4yMjE5IDQwLjM3MzZDMjkuMzU2OCA0MC42ODYxIDI5LjU0NjIgNDAuOTI4NyAyOS43OTAxIDQxLjEwMTZDMzAuMDM2MyA0MS4yNzQ0IDMwLjMyNTEgNDEuMzYwOCAzMC42NTY2IDQxLjM2MDhDMzAuODc0NCA0MS4zNjA4IDMxLjA3MiA0MS4zMjI5IDMxLjI0OTYgNDEuMjQ3MkMzMS40MjcyIDQxLjE3MTQgMzEuNTc3NSA0MS4wNjI1IDMxLjcwMDYgNDAuOTIwNUMzMS44MjM3IDQwLjc3ODQgMzEuOTExMyA0MC42MDggMzEuOTYzNCA0MC40MDkxSDMyLjgwMTRDMzIuNzU0MSA0MC43MzExIDMyLjYzNjkgNDEuMDIxMSAzMi40NDk5IDQxLjI3OTFDMzIuMjY1MiA0MS41MzQ4IDMyLjAyMDIgNDEuNzM4NCAzMS43MTQ4IDQxLjg4OTlDMzEuNDExOCA0Mi4wMzkxIDMxLjA1OSA0Mi4xMTM2IDMwLjY1NjYgNDIuMTEzNlpNMzYuMzk4NyAzNi41NDU1VjM3LjI1NTdIMzMuNTcyVjM2LjU0NTVIMzYuMzk4N1pNMzQuMzk1OSAzNS4yMzg2SDM1LjIzNFY0MC40Mzc1QzM1LjIzNCA0MC42NzQyIDM1LjI2ODMgNDAuODUxOCAzNS4zMzcgNDAuOTcwMkMzNS40MDggNDEuMDg2MiAzNS40OTc5IDQxLjE2NDMgMzUuNjA2OCA0MS4yMDQ1QzM1LjcxODEgNDEuMjQyNCAzNS44MzUzIDQxLjI2MTQgMzUuOTU4NCA0MS4yNjE0QzM2LjA1MDcgNDEuMjYxNCAzNi4xMjY1IDQxLjI1NjYgMzYuMTg1NyA0MS4yNDcyQzM2LjI0NDkgNDEuMjM1MyAzNi4yOTIyIDQxLjIyNTkgMzYuMzI3NyA0MS4yMTg4TDM2LjQ5ODIgNDEuOTcxNkMzNi40NDE0IDQxLjk5MjkgMzYuMzYyMSA0Mi4wMTQyIDM2LjI2MDMgNDIuMDM1NUMzNi4xNTg1IDQyLjA1OTIgMzYuMDI5NCA0Mi4wNzEgMzUuODczMiA0Mi4wNzFDMzUuNjM2NCA0Mi4wNzEgMzUuNDA0NCA0Mi4wMjAxIDM1LjE3NzIgNDEuOTE4M0MzNC45NTIzIDQxLjgxNjUgMzQuNzY1MiA0MS42NjE1IDM0LjYxNjEgNDEuNDUzMUMzNC40NjkzIDQxLjI0NDggMzQuMzk1OSA0MC45ODIgMzQuMzk1OSA0MC42NjQ4VjM1LjIzODZaTTM3LjY1OTQgNDJWMzYuNTQ1NUgzOC40OTc1VjQySDM3LjY1OTRaTTM4LjA4NTUgMzUuNjM2NEMzNy45MjIyIDM1LjYzNjQgMzcuNzgxMyAzNS41ODA3IDM3LjY2MyAzNS40Njk1QzM3LjU0NjkgMzUuMzU4MiAzNy40ODg5IDM1LjIyNDQgMzcuNDg4OSAzNS4wNjgyQzM3LjQ4ODkgMzQuOTExOSAzNy41NDY5IDM0Ljc3ODIgMzcuNjYzIDM0LjY2NjlDMzcuNzgxMyAzNC41NTU2IDM3LjkyMjIgMzQuNSAzOC4wODU1IDM0LjVDMzguMjQ4OSAzNC41IDM4LjM4ODYgMzQuNTU1NiAzOC41MDQ2IDM0LjY2NjlDMzguNjIyOSAzNC43NzgyIDM4LjY4MjEgMzQuOTExOSAzOC42ODIxIDM1LjA2ODJDMzguNjgyMSAzNS4yMjQ0IDM4LjYyMjkgMzUuMzU4MiAzOC41MDQ2IDM1LjQ2OTVDMzguMzg4NiAzNS41ODA3IDM4LjI0ODkgMzUuNjM2NCAzOC4wODU1IDM1LjYzNjRaTTQ0LjQ5MjcgMzYuNTQ1NUw0Mi40NzU2IDQySDQxLjYyMzRMMzkuNjA2MyAzNi41NDU1SDQwLjUxNTRMNDIuMDIxMSA0MC44OTJINDIuMDc3OUw0My41ODM2IDM2LjU0NTVINDQuNDkyN1pNNDcuNjkwNSA0Mi4xMTM2QzQ3LjE2NDkgNDIuMTEzNiA0Ni43MTE1IDQxLjk5NzYgNDYuMzMwNCA0MS43NjU2QzQ1Ljk1MTYgNDEuNTMxMiA0NS42NTkyIDQxLjIwNDUgNDUuNDUzMyA0MC43ODU1QzQ1LjI0OTcgNDAuMzY0MSA0NS4xNDc5IDM5Ljg3NDEgNDUuMTQ3OSAzOS4zMTUzQzQ1LjE0NzkgMzguNzU2NiA0NS4yNDk3IDM4LjI2NDIgNDUuNDUzMyAzNy44MzgxQzQ1LjY1OTIgMzcuNDA5NiA0NS45NDU3IDM3LjA3NTggNDYuMzEyNiAzNi44MzY2QzQ2LjY4MiAzNi41OTUyIDQ3LjExMjggMzYuNDc0NCA0Ny42MDUyIDM2LjQ3NDRDNDcuODg5MyAzNi40NzQ0IDQ4LjE2OTkgMzYuNTIxOCA0OC40NDY5IDM2LjYxNjVDNDguNzIzOSAzNi43MTEyIDQ4Ljk3NiAzNi44NjUxIDQ5LjIwMzMgMzcuMDc4MUM0OS40MzA1IDM3LjI4ODggNDkuNjExNiAzNy41NjgyIDQ5Ljc0NjYgMzcuOTE2MkM0OS44ODE1IDM4LjI2NDIgNDkuOTQ5IDM4LjY5MjcgNDkuOTQ5IDM5LjIwMTdWMzkuNTU2OEg0NS43NDQ1VjM4LjgzMjRINDkuMDk2N0M0OS4wOTY3IDM4LjUyNDYgNDkuMDM1MiAzOC4yNSA0OC45MTIxIDM4LjAwODVDNDguNzkxMyAzNy43NjcgNDguNjE4NSAzNy41NzY1IDQ4LjM5MzYgMzcuNDM2OEM0OC4xNzExIDM3LjI5NzEgNDcuOTA4MyAzNy4yMjczIDQ3LjYwNTIgMzcuMjI3M0M0Ny4yNzE0IDM3LjIyNzMgNDYuOTgyNiAzNy4zMTAxIDQ2LjczODggMzcuNDc1OUM0Ni40OTczIDM3LjYzOTIgNDYuMzExNSAzNy44NTIzIDQ2LjE4MTIgMzguMTE1MUM0Ni4wNTEgMzguMzc3OCA0NS45ODU5IDM4LjY1OTYgNDUuOTg1OSAzOC45NjAyVjM5LjQ0MzJDNDUuOTg1OSAzOS44NTUxIDQ2LjA1NyA0MC4yMDQzIDQ2LjE5OSA0MC40OTA4QzQ2LjM0MzQgNDAuNzc0OSA0Ni41NDM1IDQwLjk5MTUgNDYuNzk5MSA0MS4xNDA2QzQ3LjA1NDggNDEuMjg3NCA0Ny4zNTE5IDQxLjM2MDggNDcuNjkwNSA0MS4zNjA4QzQ3LjkxMDYgNDEuMzYwOCA0OC4xMDk1IDQxLjMzIDQ4LjI4NzEgNDEuMjY4NUM0OC40NjcgNDEuMjA0NSA0OC42MjIxIDQxLjEwOTggNDguNzUyMyA0MC45ODQ0QzQ4Ljg4MjUgNDAuODU2NSA0OC45ODMxIDQwLjY5NzkgNDkuMDU0MSA0MC41MDg1TDQ5Ljg2MzggNDAuNzM1OEM0OS43Nzg1IDQxLjAxMDQgNDkuNjM1MyA0MS4yNTE5IDQ5LjQzNDEgNDEuNDYwMkM0OS4yMzI5IDQxLjY2NjIgNDguOTg0MyA0MS44MjcyIDQ4LjY4ODMgNDEuOTQzMkM0OC4zOTI0IDQyLjA1NjggNDguMDU5OCA0Mi4xMTM2IDQ3LjY5MDUgNDIuMTEzNloiIGZpbGw9ImJsYWNrIi8+CjxjaXJjbGUgY3g9Ijk5LjUiIGN5PSIyMi41IiByPSIzLjUiIGZpbGw9IiMwMTAxMDEiLz4KPC9zdmc+Cg=="),
            createNodeStyle("nullActiveNodeNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iI0ZGRTI2RSIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTYuMjExNjkgMjAuMjcyN1YyNUg1LjQ0OTk3TDMuMjIyNTIgMjEuNzhIMy4xODMyOFYyNUgyLjMyNjkzVjIwLjI3MjdIMy4wOTMyNkw1LjMxODQgMjMuNDk1SDUuMzU5OTVWMjAuMjcyN0g2LjIxMTY5Wk0xMC4xMjQ3IDIwLjI3MjdIMTAuOTgxMVYyMy4zNjEyQzEwLjk4MTEgMjMuNjk5NyAxMC45MDExIDIzLjk5NzUgMTAuNzQxIDI0LjI1NDRDMTAuNTgyNSAyNC41MTE0IDEwLjM1OTQgMjQuNzEyMiAxMC4wNzE2IDI0Ljg1NjlDOS43ODM4OCAyNSA5LjQ0NzY1IDI1LjA3MTYgOS4wNjI5NCAyNS4wNzE2QzguNjc2NyAyNS4wNzE2IDguMzM5NyAyNSA4LjA1MTkzIDI0Ljg1NjlDNy43NjQxNyAyNC43MTIyIDcuNTQxMDQgMjQuNTExNCA3LjM4MjU1IDI0LjI1NDRDNy4yMjQwNSAyMy45OTc1IDcuMTQ0OCAyMy42OTk3IDcuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOC4wMDExNVYyMy4yODk2QzguMDAxMTUgMjMuNDg2NiA4LjA0NDI0IDIzLjY2MiA4LjEzMDQxIDIzLjgxNTlDOC4yMTgxMyAyMy45Njk4IDguMzQxMjMgMjQuMDkwNiA4LjQ5OTczIDI0LjE3ODNDOC42NTgyMyAyNC4yNjQ0IDguODQ1OTcgMjQuMzA3NSA5LjA2Mjk0IDI0LjMwNzVDOS4yNzk5MiAyNC4zMDc1IDkuNDY3NjUgMjQuMjY0NCA5LjYyNjE1IDI0LjE3ODNDOS43ODYxOSAyNC4wOTA2IDkuOTA5MyAyMy45Njk4IDkuOTk1NDcgMjMuODE1OUMxMC4wODE2IDIzLjY2MiAxMC4xMjQ3IDIzLjQ4NjYgMTAuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTExLjkxMTkgMjVWMjAuMjcyN0gxMi43NjgyVjI0LjI4MjFIMTQuODUwM1YyNUgxMS45MTE5Wk0xNS41OTM1IDI1VjIwLjI3MjdIMTYuNDQ5OVYyNC4yODIxSDE4LjUzMTlWMjVIMTUuNTkzNVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik05NS4yMTE3IDIwLjI3MjdWMjVIOTQuNDVMOTIuMjIyNSAyMS43OEg5Mi4xODMzVjI1SDkxLjMyNjlWMjAuMjcyN0g5Mi4wOTMzTDk0LjMxODQgMjMuNDk1SDk0LjM2VjIwLjI3MjdIOTUuMjExN1pNOTkuMTI0NyAyMC4yNzI3SDk5Ljk4MTFWMjMuMzYxMkM5OS45ODExIDIzLjY5OTcgOTkuOTAxMSAyMy45OTc1IDk5Ljc0MSAyNC4yNTQ0Qzk5LjU4MjUgMjQuNTExNCA5OS4zNTk0IDI0LjcxMjIgOTkuMDcxNiAyNC44NTY5Qzk4Ljc4MzkgMjUgOTguNDQ3NiAyNS4wNzE2IDk4LjA2MjkgMjUuMDcxNkM5Ny42NzY3IDI1LjA3MTYgOTcuMzM5NyAyNSA5Ny4wNTE5IDI0Ljg1NjlDOTYuNzY0MiAyNC43MTIyIDk2LjU0MSAyNC41MTE0IDk2LjM4MjUgMjQuMjU0NEM5Ni4yMjQgMjMuOTk3NSA5Ni4xNDQ4IDIzLjY5OTcgOTYuMTQ0OCAyMy4zNjEyVjIwLjI3MjdIOTcuMDAxMlYyMy4yODk2Qzk3LjAwMTIgMjMuNDg2NiA5Ny4wNDQyIDIzLjY2MiA5Ny4xMzA0IDIzLjgxNTlDOTcuMjE4MSAyMy45Njk4IDk3LjM0MTIgMjQuMDkwNiA5Ny40OTk3IDI0LjE3ODNDOTcuNjU4MiAyNC4yNjQ0IDk3Ljg0NiAyNC4zMDc1IDk4LjA2MjkgMjQuMzA3NUM5OC4yNzk5IDI0LjMwNzUgOTguNDY3NyAyNC4yNjQ0IDk4LjYyNjIgMjQuMTc4M0M5OC43ODYyIDI0LjA5MDYgOTguOTA5MyAyMy45Njk4IDk4Ljk5NTUgMjMuODE1OUM5OS4wODE2IDIzLjY2MiA5OS4xMjQ3IDIzLjQ4NjYgOTkuMTI0NyAyMy4yODk2VjIwLjI3MjdaTTEwMC45MTIgMjVWMjAuMjcyN0gxMDEuNzY4VjI0LjI4MjFIMTAzLjg1VjI1SDEwMC45MTJaTTEwNC41OTQgMjVWMjAuMjcyN0gxMDUuNDVWMjQuMjgyMUgxMDcuNTMyVjI1SDEwNC41OTRaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMjQuNDExIDQyLjEyNzhDMjQuMDY1NCA0Mi4xMjc4IDIzLjc1MTcgNDIuMDYyNyAyMy40Njk5IDQxLjkzMjVDMjMuMTg4MiA0MS44IDIyLjk2NDUgNDEuNjA5NCAyMi43OTg4IDQxLjM2MDhDMjIuNjMzMSA0MS4xMDk4IDIyLjU1MDIgNDAuODA2OCAyMi41NTAyIDQwLjQ1MTdDMjIuNTUwMiA0MC4xMzkyIDIyLjYxMTggMzkuODg1OSAyMi43MzQ5IDM5LjY5MThDMjIuODU4IDM5LjQ5NTMgMjMuMDIyNSAzOS4zNDE0IDIzLjIyODUgMzkuMjMwMUMyMy40MzQ0IDM5LjExODggMjMuNjYxNyAzOS4wMzYgMjMuOTEwMyAzOC45ODE1QzI0LjE2MTIgMzguOTI0NyAyNC40MTM0IDM4Ljg3OTcgMjQuNjY2NyAzOC44NDY2QzI0Ljk5ODEgMzguODA0IDI1LjI2NjggMzguNzcyIDI1LjQ3MjggMzguNzUwN0MyNS42ODExIDM4LjcyNyAyNS44MzI2IDM4LjY4OCAyNS45MjczIDM4LjYzMzVDMjYuMDI0NCAzOC41NzkxIDI2LjA3MjkgMzguNDg0NCAyNi4wNzI5IDM4LjM0OTRWMzguMzIxQzI2LjA3MjkgMzcuOTcwNiAyNS45NzcxIDM3LjY5ODQgMjUuNzg1MyAzNy41MDQzQzI1LjU5NTkgMzcuMzEwMSAyNS4zMDgzIDM3LjIxMzEgMjQuOTIyNCAzNy4yMTMxQzI0LjUyMjMgMzcuMjEzMSAyNC4yMDg2IDM3LjMwMDcgMjMuOTgxMyAzNy40NzU5QzIzLjc1NCAzNy42NTEgMjMuNTk0MiAzNy44MzgxIDIzLjUwMTkgMzguMDM2OUwyMi43MDY1IDM3Ljc1MjhDMjIuODQ4NSAzNy40MjE0IDIzLjAzNzkgMzcuMTYzNCAyMy4yNzQ2IDM2Ljk3ODdDMjMuNTEzNyAzNi43OTE3IDIzLjc3NDIgMzYuNjYxNSAyNC4wNTU5IDM2LjU4ODFDMjQuMzQgMzYuNTEyMyAyNC42MTkzIDM2LjQ3NDQgMjQuODk0IDM2LjQ3NDRDMjUuMDY5MSAzNi40NzQ0IDI1LjI3MDQgMzYuNDk1NyAyNS40OTc2IDM2LjUzODRDMjUuNzI3MyAzNi41Nzg2IDI1Ljk0ODYgMzYuNjYyNiAyNi4xNjE3IDM2Ljc5MDVDMjYuMzc3MSAzNi45MTgzIDI2LjU1NTkgMzcuMTExMyAyNi42OTc5IDM3LjM2OTNDMjYuODQgMzcuNjI3NCAyNi45MTEgMzcuOTczIDI2LjkxMSAzOC40MDYyVjQySDI2LjA3MjlWNDEuMjYxNEgyNi4wMzAzQzI1Ljk3MzUgNDEuMzc5NyAyNS44Nzg4IDQxLjUwNjQgMjUuNzQ2MiA0MS42NDEzQzI1LjYxMzcgNDEuNzc2MyAyNS40MzczIDQxLjg5MTEgMjUuMjE3MSA0MS45ODU4QzI0Ljk5NjkgNDIuMDgwNSAyNC43MjgyIDQyLjEyNzggMjQuNDExIDQyLjEyNzhaTTI0LjUzODggNDEuMzc1QzI0Ljg3MDMgNDEuMzc1IDI1LjE0OTYgNDEuMzA5OSAyNS4zNzY5IDQxLjE3OTdDMjUuNjA2NSA0MS4wNDk1IDI1Ljc3OTQgNDAuODgxNCAyNS44OTU0IDQwLjY3NTRDMjYuMDEzNyA0MC40Njk1IDI2LjA3MjkgNDAuMjUyOCAyNi4wNzI5IDQwLjAyNTZWMzkuMjU4NUMyNi4wMzc0IDM5LjMwMTEgMjUuOTU5MyAzOS4zNDAyIDI1LjgzODYgMzkuMzc1N0MyNS43MjAyIDM5LjQwODkgMjUuNTgyOSAzOS40Mzg0IDI1LjQyNjYgMzkuNDY0NUMyNS4yNzI3IDM5LjQ4ODIgMjUuMTIyNCAzOS41MDk1IDI0Ljk3NTYgMzkuNTI4NEMyNC44MzEyIDM5LjU0NSAyNC43MTQgMzkuNTU5MiAyNC42MjQxIDM5LjU3MUMyNC40MDYzIDM5LjU5OTQgMjQuMjAyNyAzOS42NDU2IDI0LjAxMzMgMzkuNzA5NUMyMy44MjYyIDM5Ljc3MTEgMjMuNjc0NyAzOS44NjQ2IDIzLjU1ODcgMzkuOTkwMUMyMy40NDUxIDQwLjExMzIgMjMuMzg4MyA0MC4yODEyIDIzLjM4ODMgNDAuNDk0M0MyMy4zODgzIDQwLjc4NTUgMjMuNDk2IDQxLjAwNTcgMjMuNzExNCA0MS4xNTQ4QzIzLjkyOTIgNDEuMzAxNiAyNC4yMDUgNDEuMzc1IDI0LjUzODggNDEuMzc1Wk0zMC42NTY2IDQyLjExMzZDMzAuMTQ1MiA0Mi4xMTM2IDI5LjcwNDkgNDEuOTkyOSAyOS4zMzU1IDQxLjc1MTRDMjguOTY2MiA0MS41MDk5IDI4LjY4MjEgNDEuMTc3MyAyOC40ODMzIDQwLjc1MzZDMjguMjg0NCA0MC4zMjk4IDI4LjE4NSAzOS44NDU2IDI4LjE4NSAzOS4zMDExQzI4LjE4NSAzOC43NDcyIDI4LjI4NjggMzguMjU4MyAyOC40OTA0IDM3LjgzNDVDMjguNjk2MyAzNy40MDg0IDI4Ljk4MjggMzcuMDc1OCAyOS4zNDk3IDM2LjgzNjZDMjkuNzE5MSAzNi41OTUyIDMwLjE0OTkgMzYuNDc0NCAzMC42NDI0IDM2LjQ3NDRDMzEuMDI1OSAzNi40NzQ0IDMxLjM3MTUgMzYuNTQ1NSAzMS42NzkzIDM2LjY4NzVDMzEuOTg3MSAzNi44Mjk1IDMyLjIzOTIgMzcuMDI4NCAzMi40MzU3IDM3LjI4NDFDMzIuNjMyMiAzNy41Mzk4IDMyLjc1NDEgMzcuODM4MSAzMi44MDE0IDM4LjE3OUgzMS45NjM0QzMxLjg5OTUgMzcuOTMwNCAzMS43NTc0IDM3LjcxMDIgMzEuNTM3MiAzNy41MTg1QzMxLjMxOTQgMzcuMzI0MyAzMS4wMjU5IDM3LjIyNzMgMzAuNjU2NiAzNy4yMjczQzMwLjMyOTkgMzcuMjI3MyAzMC4wNDM0IDM3LjMxMjUgMjkuNzk3MiAzNy40ODNDMjkuNTUzMyAzNy42NTEgMjkuMzYyOCAzNy44ODkgMjkuMjI1NSAzOC4xOTY3QzI5LjA5MDUgMzguNTAyMSAyOS4wMjMgMzguODYwOCAyOS4wMjMgMzkuMjcyN0MyOS4wMjMgMzkuNjk0MSAyOS4wODkzIDQwLjA2MTEgMjkuMjIxOSA0MC4zNzM2QzI5LjM1NjggNDAuNjg2MSAyOS41NDYyIDQwLjkyODcgMjkuNzkwMSA0MS4xMDE2QzMwLjAzNjMgNDEuMjc0NCAzMC4zMjUxIDQxLjM2MDggMzAuNjU2NiA0MS4zNjA4QzMwLjg3NDQgNDEuMzYwOCAzMS4wNzIgNDEuMzIyOSAzMS4yNDk2IDQxLjI0NzJDMzEuNDI3MiA0MS4xNzE0IDMxLjU3NzUgNDEuMDYyNSAzMS43MDA2IDQwLjkyMDVDMzEuODIzNyA0MC43Nzg0IDMxLjkxMTMgNDAuNjA4IDMxLjk2MzQgNDAuNDA5MUgzMi44MDE0QzMyLjc1NDEgNDAuNzMxMSAzMi42MzY5IDQxLjAyMTEgMzIuNDQ5OSA0MS4yNzkxQzMyLjI2NTIgNDEuNTM0OCAzMi4wMjAyIDQxLjczODQgMzEuNzE0OCA0MS44ODk5QzMxLjQxMTggNDIuMDM5MSAzMS4wNTkgNDIuMTEzNiAzMC42NTY2IDQyLjExMzZaTTM2LjM5ODcgMzYuNTQ1NVYzNy4yNTU3SDMzLjU3MlYzNi41NDU1SDM2LjM5ODdaTTM0LjM5NTkgMzUuMjM4NkgzNS4yMzRWNDAuNDM3NUMzNS4yMzQgNDAuNjc0MiAzNS4yNjgzIDQwLjg1MTggMzUuMzM3IDQwLjk3MDJDMzUuNDA4IDQxLjA4NjIgMzUuNDk3OSA0MS4xNjQzIDM1LjYwNjggNDEuMjA0NUMzNS43MTgxIDQxLjI0MjQgMzUuODM1MyA0MS4yNjE0IDM1Ljk1ODQgNDEuMjYxNEMzNi4wNTA3IDQxLjI2MTQgMzYuMTI2NSA0MS4yNTY2IDM2LjE4NTcgNDEuMjQ3MkMzNi4yNDQ5IDQxLjIzNTMgMzYuMjkyMiA0MS4yMjU5IDM2LjMyNzcgNDEuMjE4OEwzNi40OTgyIDQxLjk3MTZDMzYuNDQxNCA0MS45OTI5IDM2LjM2MjEgNDIuMDE0MiAzNi4yNjAzIDQyLjAzNTVDMzYuMTU4NSA0Mi4wNTkyIDM2LjAyOTQgNDIuMDcxIDM1Ljg3MzIgNDIuMDcxQzM1LjYzNjQgNDIuMDcxIDM1LjQwNDQgNDIuMDIwMSAzNS4xNzcyIDQxLjkxODNDMzQuOTUyMyA0MS44MTY1IDM0Ljc2NTIgNDEuNjYxNSAzNC42MTYxIDQxLjQ1MzFDMzQuNDY5MyA0MS4yNDQ4IDM0LjM5NTkgNDAuOTgyIDM0LjM5NTkgNDAuNjY0OFYzNS4yMzg2Wk0zNy42NTk0IDQyVjM2LjU0NTVIMzguNDk3NVY0MkgzNy42NTk0Wk0zOC4wODU1IDM1LjYzNjRDMzcuOTIyMiAzNS42MzY0IDM3Ljc4MTMgMzUuNTgwNyAzNy42NjMgMzUuNDY5NUMzNy41NDY5IDM1LjM1ODIgMzcuNDg4OSAzNS4yMjQ0IDM3LjQ4ODkgMzUuMDY4MkMzNy40ODg5IDM0LjkxMTkgMzcuNTQ2OSAzNC43NzgyIDM3LjY2MyAzNC42NjY5QzM3Ljc4MTMgMzQuNTU1NiAzNy45MjIyIDM0LjUgMzguMDg1NSAzNC41QzM4LjI0ODkgMzQuNSAzOC4zODg2IDM0LjU1NTYgMzguNTA0NiAzNC42NjY5QzM4LjYyMjkgMzQuNzc4MiAzOC42ODIxIDM0LjkxMTkgMzguNjgyMSAzNS4wNjgyQzM4LjY4MjEgMzUuMjI0NCAzOC42MjI5IDM1LjM1ODIgMzguNTA0NiAzNS40Njk1QzM4LjM4ODYgMzUuNTgwNyAzOC4yNDg5IDM1LjYzNjQgMzguMDg1NSAzNS42MzY0Wk00NC40OTI3IDM2LjU0NTVMNDIuNDc1NiA0Mkg0MS42MjM0TDM5LjYwNjMgMzYuNTQ1NUg0MC41MTU0TDQyLjAyMTEgNDAuODkySDQyLjA3NzlMNDMuNTgzNiAzNi41NDU1SDQ0LjQ5MjdaTTQ3LjY5MDUgNDIuMTEzNkM0Ny4xNjQ5IDQyLjExMzYgNDYuNzExNSA0MS45OTc2IDQ2LjMzMDQgNDEuNzY1NkM0NS45NTE2IDQxLjUzMTIgNDUuNjU5MiA0MS4yMDQ1IDQ1LjQ1MzMgNDAuNzg1NUM0NS4yNDk3IDQwLjM2NDEgNDUuMTQ3OSAzOS44NzQxIDQ1LjE0NzkgMzkuMzE1M0M0NS4xNDc5IDM4Ljc1NjYgNDUuMjQ5NyAzOC4yNjQyIDQ1LjQ1MzMgMzcuODM4MUM0NS42NTkyIDM3LjQwOTYgNDUuOTQ1NyAzNy4wNzU4IDQ2LjMxMjYgMzYuODM2NkM0Ni42ODIgMzYuNTk1MiA0Ny4xMTI4IDM2LjQ3NDQgNDcuNjA1MiAzNi40NzQ0QzQ3Ljg4OTMgMzYuNDc0NCA0OC4xNjk5IDM2LjUyMTggNDguNDQ2OSAzNi42MTY1QzQ4LjcyMzkgMzYuNzExMiA0OC45NzYgMzYuODY1MSA0OS4yMDMzIDM3LjA3ODFDNDkuNDMwNSAzNy4yODg4IDQ5LjYxMTYgMzcuNTY4MiA0OS43NDY2IDM3LjkxNjJDNDkuODgxNSAzOC4yNjQyIDQ5Ljk0OSAzOC42OTI3IDQ5Ljk0OSAzOS4yMDE3VjM5LjU1NjhINDUuNzQ0NVYzOC44MzI0SDQ5LjA5NjdDNDkuMDk2NyAzOC41MjQ2IDQ5LjAzNTIgMzguMjUgNDguOTEyMSAzOC4wMDg1QzQ4Ljc5MTMgMzcuNzY3IDQ4LjYxODUgMzcuNTc2NSA0OC4zOTM2IDM3LjQzNjhDNDguMTcxMSAzNy4yOTcxIDQ3LjkwODMgMzcuMjI3MyA0Ny42MDUyIDM3LjIyNzNDNDcuMjcxNCAzNy4yMjczIDQ2Ljk4MjYgMzcuMzEwMSA0Ni43Mzg4IDM3LjQ3NTlDNDYuNDk3MyAzNy42MzkyIDQ2LjMxMTUgMzcuODUyMyA0Ni4xODEyIDM4LjExNTFDNDYuMDUxIDM4LjM3NzggNDUuOTg1OSAzOC42NTk2IDQ1Ljk4NTkgMzguOTYwMlYzOS40NDMyQzQ1Ljk4NTkgMzkuODU1MSA0Ni4wNTcgNDAuMjA0MyA0Ni4xOTkgNDAuNDkwOEM0Ni4zNDM0IDQwLjc3NDkgNDYuNTQzNSA0MC45OTE1IDQ2Ljc5OTEgNDEuMTQwNkM0Ny4wNTQ4IDQxLjI4NzQgNDcuMzUxOSA0MS4zNjA4IDQ3LjY5MDUgNDEuMzYwOEM0Ny45MTA2IDQxLjM2MDggNDguMTA5NSA0MS4zMyA0OC4yODcxIDQxLjI2ODVDNDguNDY3IDQxLjIwNDUgNDguNjIyMSA0MS4xMDk4IDQ4Ljc1MjMgNDAuOTg0NEM0OC44ODI1IDQwLjg1NjUgNDguOTgzMSA0MC42OTc5IDQ5LjA1NDEgNDAuNTA4NUw0OS44NjM4IDQwLjczNThDNDkuNzc4NSA0MS4wMTA0IDQ5LjYzNTMgNDEuMjUxOSA0OS40MzQxIDQxLjQ2MDJDNDkuMjMyOSA0MS42NjYyIDQ4Ljk4NDMgNDEuODI3MiA0OC42ODgzIDQxLjk0MzJDNDguMzkyNCA0Mi4wNTY4IDQ4LjA1OTggNDIuMTEzNiA0Ny42OTA1IDQyLjExMzZaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K"),
            createNodeStyle("activeNodeNull", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTEwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjEwOSIgaGVpZ2h0PSI0NCIgZmlsbD0iI0ZGRTI2RSIgc3Ryb2tlPSJibGFjayIvPgo8bGluZSB4MT0iODkuNjE3MiIgeDI9Ijg5LjYxNzIiIHkyPSI0NC4yNzQyIiBzdHJva2U9ImJsYWNrIi8+CjxsaW5lIHgxPSIyMC4xMzQ4IiB4Mj0iMjAuMTM0OCIgeTI9IjQ0LjI3NDIiIHN0cm9rZT0iYmxhY2siLz4KPHBhdGggZD0iTTk1LjIxMTcgMjAuMjcyN1YyNUg5NC40NUw5Mi4yMjI1IDIxLjc4SDkyLjE4MzNWMjVIOTEuMzI2OVYyMC4yNzI3SDkyLjA5MzNMOTQuMzE4NCAyMy40OTVIOTQuMzZWMjAuMjcyN0g5NS4yMTE3Wk05OS4xMjQ3IDIwLjI3MjdIOTkuOTgxMVYyMy4zNjEyQzk5Ljk4MTEgMjMuNjk5NyA5OS45MDExIDIzLjk5NzUgOTkuNzQxIDI0LjI1NDRDOTkuNTgyNSAyNC41MTE0IDk5LjM1OTQgMjQuNzEyMiA5OS4wNzE2IDI0Ljg1NjlDOTguNzgzOSAyNSA5OC40NDc2IDI1LjA3MTYgOTguMDYyOSAyNS4wNzE2Qzk3LjY3NjcgMjUuMDcxNiA5Ny4zMzk3IDI1IDk3LjA1MTkgMjQuODU2OUM5Ni43NjQyIDI0LjcxMjIgOTYuNTQxIDI0LjUxMTQgOTYuMzgyNSAyNC4yNTQ0Qzk2LjIyNCAyMy45OTc1IDk2LjE0NDggMjMuNjk5NyA5Ni4xNDQ4IDIzLjM2MTJWMjAuMjcyN0g5Ny4wMDEyVjIzLjI4OTZDOTcuMDAxMiAyMy40ODY2IDk3LjA0NDIgMjMuNjYyIDk3LjEzMDQgMjMuODE1OUM5Ny4yMTgxIDIzLjk2OTggOTcuMzQxMiAyNC4wOTA2IDk3LjQ5OTcgMjQuMTc4M0M5Ny42NTgyIDI0LjI2NDQgOTcuODQ2IDI0LjMwNzUgOTguMDYyOSAyNC4zMDc1Qzk4LjI3OTkgMjQuMzA3NSA5OC40Njc3IDI0LjI2NDQgOTguNjI2MiAyNC4xNzgzQzk4Ljc4NjIgMjQuMDkwNiA5OC45MDkzIDIzLjk2OTggOTguOTk1NSAyMy44MTU5Qzk5LjA4MTYgMjMuNjYyIDk5LjEyNDcgMjMuNDg2NiA5OS4xMjQ3IDIzLjI4OTZWMjAuMjcyN1pNMTAwLjkxMiAyNVYyMC4yNzI3SDEwMS43NjhWMjQuMjgyMUgxMDMuODVWMjVIMTAwLjkxMlpNMTA0LjU5NCAyNVYyMC4yNzI3SDEwNS40NVYyNC4yODIxSDEwNy41MzJWMjVIMTA0LjU5NFoiIGZpbGw9ImJsYWNrIi8+CjxjaXJjbGUgY3g9IjEwLjUiIGN5PSIyMi41IiByPSIzLjUiIGZpbGw9IiMwMTAxMDEiLz4KPHBhdGggZD0iTTI0LjQxMSA0Mi4xMjc4QzI0LjA2NTQgNDIuMTI3OCAyMy43NTE3IDQyLjA2MjcgMjMuNDY5OSA0MS45MzI1QzIzLjE4ODIgNDEuOCAyMi45NjQ1IDQxLjYwOTQgMjIuNzk4OCA0MS4zNjA4QzIyLjYzMzEgNDEuMTA5OCAyMi41NTAyIDQwLjgwNjggMjIuNTUwMiA0MC40NTE3QzIyLjU1MDIgNDAuMTM5MiAyMi42MTE4IDM5Ljg4NTkgMjIuNzM0OSAzOS42OTE4QzIyLjg1OCAzOS40OTUzIDIzLjAyMjUgMzkuMzQxNCAyMy4yMjg1IDM5LjIzMDFDMjMuNDM0NCAzOS4xMTg4IDIzLjY2MTcgMzkuMDM2IDIzLjkxMDMgMzguOTgxNUMyNC4xNjEyIDM4LjkyNDcgMjQuNDEzNCAzOC44Nzk3IDI0LjY2NjcgMzguODQ2NkMyNC45OTgxIDM4LjgwNCAyNS4yNjY4IDM4Ljc3MiAyNS40NzI4IDM4Ljc1MDdDMjUuNjgxMSAzOC43MjcgMjUuODMyNiAzOC42ODggMjUuOTI3MyAzOC42MzM1QzI2LjAyNDQgMzguNTc5MSAyNi4wNzI5IDM4LjQ4NDQgMjYuMDcyOSAzOC4zNDk0VjM4LjMyMUMyNi4wNzI5IDM3Ljk3MDYgMjUuOTc3MSAzNy42OTg0IDI1Ljc4NTMgMzcuNTA0M0MyNS41OTU5IDM3LjMxMDEgMjUuMzA4MyAzNy4yMTMxIDI0LjkyMjQgMzcuMjEzMUMyNC41MjIzIDM3LjIxMzEgMjQuMjA4NiAzNy4zMDA3IDIzLjk4MTMgMzcuNDc1OUMyMy43NTQgMzcuNjUxIDIzLjU5NDIgMzcuODM4MSAyMy41MDE5IDM4LjAzNjlMMjIuNzA2NSAzNy43NTI4QzIyLjg0ODUgMzcuNDIxNCAyMy4wMzc5IDM3LjE2MzQgMjMuMjc0NiAzNi45Nzg3QzIzLjUxMzcgMzYuNzkxNyAyMy43NzQyIDM2LjY2MTUgMjQuMDU1OSAzNi41ODgxQzI0LjM0IDM2LjUxMjMgMjQuNjE5MyAzNi40NzQ0IDI0Ljg5NCAzNi40NzQ0QzI1LjA2OTEgMzYuNDc0NCAyNS4yNzA0IDM2LjQ5NTcgMjUuNDk3NiAzNi41Mzg0QzI1LjcyNzMgMzYuNTc4NiAyNS45NDg2IDM2LjY2MjYgMjYuMTYxNyAzNi43OTA1QzI2LjM3NzEgMzYuOTE4MyAyNi41NTU5IDM3LjExMTMgMjYuNjk3OSAzNy4zNjkzQzI2Ljg0IDM3LjYyNzQgMjYuOTExIDM3Ljk3MyAyNi45MTEgMzguNDA2MlY0MkgyNi4wNzI5VjQxLjI2MTRIMjYuMDMwM0MyNS45NzM1IDQxLjM3OTcgMjUuODc4OCA0MS41MDY0IDI1Ljc0NjIgNDEuNjQxM0MyNS42MTM3IDQxLjc3NjMgMjUuNDM3MyA0MS44OTExIDI1LjIxNzEgNDEuOTg1OEMyNC45OTY5IDQyLjA4MDUgMjQuNzI4MiA0Mi4xMjc4IDI0LjQxMSA0Mi4xMjc4Wk0yNC41Mzg4IDQxLjM3NUMyNC44NzAzIDQxLjM3NSAyNS4xNDk2IDQxLjMwOTkgMjUuMzc2OSA0MS4xNzk3QzI1LjYwNjUgNDEuMDQ5NSAyNS43Nzk0IDQwLjg4MTQgMjUuODk1NCA0MC42NzU0QzI2LjAxMzcgNDAuNDY5NSAyNi4wNzI5IDQwLjI1MjggMjYuMDcyOSA0MC4wMjU2VjM5LjI1ODVDMjYuMDM3NCAzOS4zMDExIDI1Ljk1OTMgMzkuMzQwMiAyNS44Mzg2IDM5LjM3NTdDMjUuNzIwMiAzOS40MDg5IDI1LjU4MjkgMzkuNDM4NCAyNS40MjY2IDM5LjQ2NDVDMjUuMjcyNyAzOS40ODgyIDI1LjEyMjQgMzkuNTA5NSAyNC45NzU2IDM5LjUyODRDMjQuODMxMiAzOS41NDUgMjQuNzE0IDM5LjU1OTIgMjQuNjI0MSAzOS41NzFDMjQuNDA2MyAzOS41OTk0IDI0LjIwMjcgMzkuNjQ1NiAyNC4wMTMzIDM5LjcwOTVDMjMuODI2MiAzOS43NzExIDIzLjY3NDcgMzkuODY0NiAyMy41NTg3IDM5Ljk5MDFDMjMuNDQ1MSA0MC4xMTMyIDIzLjM4ODMgNDAuMjgxMiAyMy4zODgzIDQwLjQ5NDNDMjMuMzg4MyA0MC43ODU1IDIzLjQ5NiA0MS4wMDU3IDIzLjcxMTQgNDEuMTU0OEMyMy45MjkyIDQxLjMwMTYgMjQuMjA1IDQxLjM3NSAyNC41Mzg4IDQxLjM3NVpNMzAuNjU2NiA0Mi4xMTM2QzMwLjE0NTIgNDIuMTEzNiAyOS43MDQ5IDQxLjk5MjkgMjkuMzM1NSA0MS43NTE0QzI4Ljk2NjIgNDEuNTA5OSAyOC42ODIxIDQxLjE3NzMgMjguNDgzMyA0MC43NTM2QzI4LjI4NDQgNDAuMzI5OCAyOC4xODUgMzkuODQ1NiAyOC4xODUgMzkuMzAxMUMyOC4xODUgMzguNzQ3MiAyOC4yODY4IDM4LjI1ODMgMjguNDkwNCAzNy44MzQ1QzI4LjY5NjMgMzcuNDA4NCAyOC45ODI4IDM3LjA3NTggMjkuMzQ5NyAzNi44MzY2QzI5LjcxOTEgMzYuNTk1MiAzMC4xNDk5IDM2LjQ3NDQgMzAuNjQyNCAzNi40NzQ0QzMxLjAyNTkgMzYuNDc0NCAzMS4zNzE1IDM2LjU0NTUgMzEuNjc5MyAzNi42ODc1QzMxLjk4NzEgMzYuODI5NSAzMi4yMzkyIDM3LjAyODQgMzIuNDM1NyAzNy4yODQxQzMyLjYzMjIgMzcuNTM5OCAzMi43NTQxIDM3LjgzODEgMzIuODAxNCAzOC4xNzlIMzEuOTYzNEMzMS44OTk1IDM3LjkzMDQgMzEuNzU3NCAzNy43MTAyIDMxLjUzNzIgMzcuNTE4NUMzMS4zMTk0IDM3LjMyNDMgMzEuMDI1OSAzNy4yMjczIDMwLjY1NjYgMzcuMjI3M0MzMC4zMjk5IDM3LjIyNzMgMzAuMDQzNCAzNy4zMTI1IDI5Ljc5NzIgMzcuNDgzQzI5LjU1MzMgMzcuNjUxIDI5LjM2MjggMzcuODg5IDI5LjIyNTUgMzguMTk2N0MyOS4wOTA1IDM4LjUwMjEgMjkuMDIzIDM4Ljg2MDggMjkuMDIzIDM5LjI3MjdDMjkuMDIzIDM5LjY5NDEgMjkuMDg5MyA0MC4wNjExIDI5LjIyMTkgNDAuMzczNkMyOS4zNTY4IDQwLjY4NjEgMjkuNTQ2MiA0MC45Mjg3IDI5Ljc5MDEgNDEuMTAxNkMzMC4wMzYzIDQxLjI3NDQgMzAuMzI1MSA0MS4zNjA4IDMwLjY1NjYgNDEuMzYwOEMzMC44NzQ0IDQxLjM2MDggMzEuMDcyIDQxLjMyMjkgMzEuMjQ5NiA0MS4yNDcyQzMxLjQyNzIgNDEuMTcxNCAzMS41Nzc1IDQxLjA2MjUgMzEuNzAwNiA0MC45MjA1QzMxLjgyMzcgNDAuNzc4NCAzMS45MTEzIDQwLjYwOCAzMS45NjM0IDQwLjQwOTFIMzIuODAxNEMzMi43NTQxIDQwLjczMTEgMzIuNjM2OSA0MS4wMjExIDMyLjQ0OTkgNDEuMjc5MUMzMi4yNjUyIDQxLjUzNDggMzIuMDIwMiA0MS43Mzg0IDMxLjcxNDggNDEuODg5OUMzMS40MTE4IDQyLjAzOTEgMzEuMDU5IDQyLjExMzYgMzAuNjU2NiA0Mi4xMTM2Wk0zNi4zOTg3IDM2LjU0NTVWMzcuMjU1N0gzMy41NzJWMzYuNTQ1NUgzNi4zOTg3Wk0zNC4zOTU5IDM1LjIzODZIMzUuMjM0VjQwLjQzNzVDMzUuMjM0IDQwLjY3NDIgMzUuMjY4MyA0MC44NTE4IDM1LjMzNyA0MC45NzAyQzM1LjQwOCA0MS4wODYyIDM1LjQ5NzkgNDEuMTY0MyAzNS42MDY4IDQxLjIwNDVDMzUuNzE4MSA0MS4yNDI0IDM1LjgzNTMgNDEuMjYxNCAzNS45NTg0IDQxLjI2MTRDMzYuMDUwNyA0MS4yNjE0IDM2LjEyNjUgNDEuMjU2NiAzNi4xODU3IDQxLjI0NzJDMzYuMjQ0OSA0MS4yMzUzIDM2LjI5MjIgNDEuMjI1OSAzNi4zMjc3IDQxLjIxODhMMzYuNDk4MiA0MS45NzE2QzM2LjQ0MTQgNDEuOTkyOSAzNi4zNjIxIDQyLjAxNDIgMzYuMjYwMyA0Mi4wMzU1QzM2LjE1ODUgNDIuMDU5MiAzNi4wMjk0IDQyLjA3MSAzNS44NzMyIDQyLjA3MUMzNS42MzY0IDQyLjA3MSAzNS40MDQ0IDQyLjAyMDEgMzUuMTc3MiA0MS45MTgzQzM0Ljk1MjMgNDEuODE2NSAzNC43NjUyIDQxLjY2MTUgMzQuNjE2MSA0MS40NTMxQzM0LjQ2OTMgNDEuMjQ0OCAzNC4zOTU5IDQwLjk4MiAzNC4zOTU5IDQwLjY2NDhWMzUuMjM4NlpNMzcuNjU5NCA0MlYzNi41NDU1SDM4LjQ5NzVWNDJIMzcuNjU5NFpNMzguMDg1NSAzNS42MzY0QzM3LjkyMjIgMzUuNjM2NCAzNy43ODEzIDM1LjU4MDcgMzcuNjYzIDM1LjQ2OTVDMzcuNTQ2OSAzNS4zNTgyIDM3LjQ4ODkgMzUuMjI0NCAzNy40ODg5IDM1LjA2ODJDMzcuNDg4OSAzNC45MTE5IDM3LjU0NjkgMzQuNzc4MiAzNy42NjMgMzQuNjY2OUMzNy43ODEzIDM0LjU1NTYgMzcuOTIyMiAzNC41IDM4LjA4NTUgMzQuNUMzOC4yNDg5IDM0LjUgMzguMzg4NiAzNC41NTU2IDM4LjUwNDYgMzQuNjY2OUMzOC42MjI5IDM0Ljc3ODIgMzguNjgyMSAzNC45MTE5IDM4LjY4MjEgMzUuMDY4MkMzOC42ODIxIDM1LjIyNDQgMzguNjIyOSAzNS4zNTgyIDM4LjUwNDYgMzUuNDY5NUMzOC4zODg2IDM1LjU4MDcgMzguMjQ4OSAzNS42MzY0IDM4LjA4NTUgMzUuNjM2NFpNNDQuNDkyNyAzNi41NDU1TDQyLjQ3NTYgNDJINDEuNjIzNEwzOS42MDYzIDM2LjU0NTVINDAuNTE1NEw0Mi4wMjExIDQwLjg5Mkg0Mi4wNzc5TDQzLjU4MzYgMzYuNTQ1NUg0NC40OTI3Wk00Ny42OTA1IDQyLjExMzZDNDcuMTY0OSA0Mi4xMTM2IDQ2LjcxMTUgNDEuOTk3NiA0Ni4zMzA0IDQxLjc2NTZDNDUuOTUxNiA0MS41MzEyIDQ1LjY1OTIgNDEuMjA0NSA0NS40NTMzIDQwLjc4NTVDNDUuMjQ5NyA0MC4zNjQxIDQ1LjE0NzkgMzkuODc0MSA0NS4xNDc5IDM5LjMxNTNDNDUuMTQ3OSAzOC43NTY2IDQ1LjI0OTcgMzguMjY0MiA0NS40NTMzIDM3LjgzODFDNDUuNjU5MiAzNy40MDk2IDQ1Ljk0NTcgMzcuMDc1OCA0Ni4zMTI2IDM2LjgzNjZDNDYuNjgyIDM2LjU5NTIgNDcuMTEyOCAzNi40NzQ0IDQ3LjYwNTIgMzYuNDc0NEM0Ny44ODkzIDM2LjQ3NDQgNDguMTY5OSAzNi41MjE4IDQ4LjQ0NjkgMzYuNjE2NUM0OC43MjM5IDM2LjcxMTIgNDguOTc2IDM2Ljg2NTEgNDkuMjAzMyAzNy4wNzgxQzQ5LjQzMDUgMzcuMjg4OCA0OS42MTE2IDM3LjU2ODIgNDkuNzQ2NiAzNy45MTYyQzQ5Ljg4MTUgMzguMjY0MiA0OS45NDkgMzguNjkyNyA0OS45NDkgMzkuMjAxN1YzOS41NTY4SDQ1Ljc0NDVWMzguODMyNEg0OS4wOTY3QzQ5LjA5NjcgMzguNTI0NiA0OS4wMzUyIDM4LjI1IDQ4LjkxMjEgMzguMDA4NUM0OC43OTEzIDM3Ljc2NyA0OC42MTg1IDM3LjU3NjUgNDguMzkzNiAzNy40MzY4QzQ4LjE3MTEgMzcuMjk3MSA0Ny45MDgzIDM3LjIyNzMgNDcuNjA1MiAzNy4yMjczQzQ3LjI3MTQgMzcuMjI3MyA0Ni45ODI2IDM3LjMxMDEgNDYuNzM4OCAzNy40NzU5QzQ2LjQ5NzMgMzcuNjM5MiA0Ni4zMTE1IDM3Ljg1MjMgNDYuMTgxMiAzOC4xMTUxQzQ2LjA1MSAzOC4zNzc4IDQ1Ljk4NTkgMzguNjU5NiA0NS45ODU5IDM4Ljk2MDJWMzkuNDQzMkM0NS45ODU5IDM5Ljg1NTEgNDYuMDU3IDQwLjIwNDMgNDYuMTk5IDQwLjQ5MDhDNDYuMzQzNCA0MC43NzQ5IDQ2LjU0MzUgNDAuOTkxNSA0Ni43OTkxIDQxLjE0MDZDNDcuMDU0OCA0MS4yODc0IDQ3LjM1MTkgNDEuMzYwOCA0Ny42OTA1IDQxLjM2MDhDNDcuOTEwNiA0MS4zNjA4IDQ4LjEwOTUgNDEuMzMgNDguMjg3MSA0MS4yNjg1QzQ4LjQ2NyA0MS4yMDQ1IDQ4LjYyMjEgNDEuMTA5OCA0OC43NTIzIDQwLjk4NDRDNDguODgyNSA0MC44NTY1IDQ4Ljk4MzEgNDAuNjk3OSA0OS4wNTQxIDQwLjUwODVMNDkuODYzOCA0MC43MzU4QzQ5Ljc3ODUgNDEuMDEwNCA0OS42MzUzIDQxLjI1MTkgNDkuNDM0MSA0MS40NjAyQzQ5LjIzMjkgNDEuNjY2MiA0OC45ODQzIDQxLjgyNzIgNDguNjg4MyA0MS45NDMyQzQ4LjM5MjQgNDIuMDU2OCA0OC4wNTk4IDQyLjExMzYgNDcuNjkwNSA0Mi4xMTM2WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg=="),
            {
                selector: ".edgeFromInitPointer",
                style: {
                    "width": 2,
                    "line-color": "black",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "black",
                    "curve-style": "taxi",
                    "taxi-direction": "downward",
                    "taxi-turn": 1
                }
            },
            createRoundSegmentEdgeStyle("edgeUnderNodeFromInit1", [225], [0.5], [100]),
            createRoundSegmentEdgeStyle("edgeUnderNodeFromInit2", [-225], [0.5], [100]),
            createRoundSegmentEdgeStyle("edgeUnderNodeFromNodes", [100], [0.5], [100]),
            createRoundSegmentEdgeStyle("edgeOverNodeFromNodes", [200], [0.5], [100]),
            createEdgeStyle("roundCornerEdge", "round-segments"),
            createEdgeStyle("defaultEdge", "bezier"),
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
     * Inserts a new node at the beginning of the list.
     * @param element - The value to be inserted as the first node.
     *
     * Handles 2 cases:
     * 1. Adding the very first node when the list is empty.
     * 2. Inserting a new node at the beginning when nodes already exist.
     */
    public async insertFirstNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the initial pointers (head and tail)
        const initNode1: NodeData = this.nodes[0];  // head initial pointer
        const initNode2: NodeData = this.nodes[1];  // tail initial pointer

        // Case 1: Adding the very first node
        if (this.nodes.length === 2) {
            await this.addFirstNodeToTheList(initNode1, initNode2, element);
        }
        else {
            // Case 2: Adding a new node when the list already contains nodes

            // Get the current first node
            const firstNode: NodeData = this.nodes[2];

            // Create the new node at the position of the current first node
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (firstNode.x),  // Same x position as the first node
                y: (firstNode.y) + 2 * nodeHeight,  // Below the first node
                class: "nullDefaultNodeNull",
                opacity: 0
            };

            // Temporarily set the ID of the new node being added for class assignment
            this.addingNodeFutureId = 2;
            await this.addNewNodeWithAnimation(newNode);

            // Shift the nodes to the right to make space for the new node
            await this.shiftingNodes(1, this.nodes.length - 2, 1.8 * nodeWidth);

            // Create edges between the new node and the previous first node
            let newEdge: EdgeData = {
                source: newNode.id,
                target: firstNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseEdge: EdgeData = this.returnReverseEdge(newEdge);
            await this.addNewEdgesWithAnimation([newEdge, reverseEdge]);

            // Create an edge from the initial pointer to the new first node
            newEdge = {
                source: initNode1.id,
                target: newNode.id,
                class: "edgeFromInitPointer",
                opacity: 0
            };
            let edgeToDelete: EdgeData = this.findEdgeInArray(initNode1, firstNode)!;

            // Remove the old edge and add the new one
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([newEdge]);

            // Reset the ID tracking for node addition
            this.addingNodeFutureId = null;

            // Place the new node as the first element in the list
            this.placeNewNodeToList(2, true);
        }

        await this.afterAnimationEnds();
    }

    /**
     * Retrieves the value of the first node in the doubly linked list.
     * Logs the value if the list contains at least one node.
     * Logs an error if the list is empty.
     */
    public async getFirstNodeValue(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the list has nodes except the initial pointers
        if (this.nodes.length > 2) {
            const value: string | number | undefined = this.nodes[2].value;
            this.log("list.getFirstValue", { value });  // Log the first node's value
        } else {
            this.log("list.getFirstError");  // Log error if no nodes exist
        }

        await this.afterAnimationEnds();
    }

    /**
     * Deletes the first node from the doubly linked list.
     * Handles 3 cases:
     * 1. List is empty (only initial pointers) - Logs an error.
     * 2. List contains a single node - Deletes the node and its connections.
     * 3. List contains multiple nodes - Removes the first node and reconnects the list.
     */
    public async deleteFirstNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get initial nodes and the current first node
        const initNode1: NodeData = this.nodes[0];  // head initial pointer
        const initNode2: NodeData = this.nodes[1];  // tail initial pointer
        const firstNode: NodeData = this.nodes[2];

        // Case 1: List is empty (only initial nodes)
        if (this.nodes.length <= 2) {
            this.log("list.deleteFirstEmpty");
        }
        // Case 2: List contains only one node and the initial nodes
        else if (this.nodes.length === 3) {
            const edge1ToDelete: EdgeData = this.findEdgeInArray(initNode1, firstNode)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(initNode2, firstNode)!;

            // Delete the only node and its edges
            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete], [firstNode]);
        }
        // Case 3: List contains multiple nodes
        else {
            // Create a temporary pointer to the first node
            await this.addTempPtrNode(firstNode);
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[3];

            // Create a new edge from the initial pointer to the next node
            const newEdge: EdgeData = {
                source: initNode1.id,
                target: nodeToConnect.id,
                class: "edgeUnderNodeFromInit1",
                opacity: 0
            }

            // Delete the edge from the initial pointer to the first node
            let edge1ToDelete: EdgeData = this.findEdgeInArray(initNode1, firstNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete], [], false);
            await this.addNewEdgesWithAnimation([newEdge], false);

            // Delete edges connected to the first node and the temporary pointer
            edge1ToDelete = this.findEdgeInArray(firstNode, null)!;
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToConnect, firstNode)!;

            await this.deleteNodesAndEdgesWithAnimation(
                [edge1ToDelete, ptrEdgeToDelete, edge2ToDelete],
                [firstNode, ptrNode]
            );

            // Shift the nodes to fill the gap
            await this.shiftingNodes(1, this.nodes.length - 1, -1.8 * nodeWidth, false);
            this.changeEdgeStyle(newEdge, "edgeFromInitPointer");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Activates the first node in the doubly linked list.
     * If the list is empty (only initial nodes), logs an error.
     */
    public async activateFirstNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the list is empty (only contains initial nodes)
        if (this.nodes.length === 2) {
            this.log("list.firstEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Set the first node as active
        this.activeNode = 2;  // IDs 0 and 1 are initial nodes

        // Update node classes and visualization
        this.setClassToNodes();
        this.updateGraph();

        await this.afterAnimationEnds();
    }


    /**
     * Inserts a new node after the currently active node in the doubly linked list.
     * @param element - The value to be inserted after the active node.
     *
     * Handles 2 cases:
     * 1. Adding a new node at the end of the list.
     * 2. Adding a new node between existing nodes.
     */
    public async insertAfterActiveNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        // Get the active node and the end pointer node 
        const activeNode: NodeData = this.nodes[this.activeNode];
        const initNode2: NodeData = this.nodes[1];  // tail initial pointer

        // Case 1: Inserting at the end of the list
        if (this.activeNode === this.nodes.length - 1) {
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (this.nodes[this.nodes.length - 1].x) + 1.8 * nodeWidth,
                y: 300 + 2 * nodeHeight,
                opacity: 0,
                class: "nullDefaultNodeNull"
            };
            this.addingNodeFutureId = this.activeNode + 1;
            await this.addNewNodeWithAnimation(newNode);

            // Shift the end pointer to accommodate the new node
            await this.shiftingNodes(1, 1, 1.8 * nodeWidth);

            // Create bidirectional edges between the new node and the active node
            const newEdge: EdgeData = {
                source: newNode.id,
                target: activeNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            const reverseEdge: EdgeData = this.returnReverseEdge(newEdge);
            await this.addNewEdgesWithAnimation([newEdge, reverseEdge]);

            // Replace the link from initNode2 to the active node with a link to the new node
            let edgeToDelete: EdgeData = this.findEdgeInArray(initNode2, activeNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);

            const newEdgeFromInit2: EdgeData = {
                source: initNode2.id,
                target: newNode.id,
                class: "edgeFromInitPointer",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdgeFromInit2]);

            this.addingNodeFutureId = null;
            this.placeNewNodeToList(this.activeNode + 1);
        }
        // Case 2: Inserting between existing nodes
        else {
            const nodeAfterActiveNode: NodeData = this.nodes[this.activeNode + 1];

            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (nodeAfterActiveNode.x),
                y: 300 + 2 * nodeHeight,
                opacity: 0,
                class: "nullDefaultNodeNull"
            };
            this.addingNodeFutureId = this.activeNode + 1;
            await this.addNewNodeWithAnimation(newNode);

            // Shift the end pointer and nodes to the right
            await this.shiftingNodes(1, 1, 1.8 * nodeWidth, false);
            await this.shiftingNodes(this.activeNode + 1, this.nodes.length - 2, 1.8 * nodeWidth);

            // Create bidirectional edges between the new node and its neighbors
            let rightEdgeFromNewNode: EdgeData = {
                source: newNode.id,
                target: nodeAfterActiveNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseRightEdge: EdgeData = this.returnReverseEdge(rightEdgeFromNewNode);

            let leftEdgeFromNewNode: EdgeData = {
                source: newNode.id,
                target: activeNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseLeftEdge: EdgeData = this.returnReverseEdge(leftEdgeFromNewNode);

            await this.addNewEdgesWithAnimation([rightEdgeFromNewNode, leftEdgeFromNewNode]);

            // Update and replace the edges between the active node and the next node
            let edgeToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeAfterActiveNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([reverseLeftEdge]);

            edgeToDelete = this.findEdgeInArray(nodeAfterActiveNode, activeNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([reverseRightEdge]);

            this.addingNodeFutureId = null;
            this.placeNewNodeToList(this.activeNode + 1);
        }

        await this.afterAnimationEnds();
    }

    /**
     * Deletes the node following the currently active node in the doubly linked list.
     *
     * Handles 2 cases:
     * 1. Deleting the last node in the list.
     * 2. Deleting a node between other nodes.
     */
    public async deleteAfterActiveNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        // Get the active node and the next node to be deleted
        const activeNode: NodeData = this.nodes[this.activeNode];
        const nodeToDelete: NodeData = this.nodes[this.activeNode + 1];
        const initNode2: NodeData = this.nodes[1];  // Tail initial pointer

        // Case 1: Active node is the last node - no change needed
        if (this.activeNode === this.nodes.length - 1) {
            this.log("list.deleteAfterEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Case 2: Deleting the last node in the list
        if (this.activeNode === this.nodes.length - 2) {
            await this.addTempPtrNode(nodeToDelete);

            // Remove the edge from the tail pointer (initNode2) to the node to delete
            const edgeToDelete: EdgeData = this.findEdgeInArray(initNode2, null)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            // Create a new edge from the tail pointer to the active node
            const newEdgeFromInit2: EdgeData = {
                source: initNode2.id,
                target: activeNode.id,
                class: "edgeUnderNodeFromInit2",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdgeFromInit2], false);

            // Remove edges related to the node to be deleted
            const edge1ToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeToDelete)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, activeNode)!;
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;

            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete, ptrEdgeToDelete], [nodeToDelete, ptrNode]);

            // Shift the tail pointer to the left
            await this.shiftingNodes(1, 1, -1.8 * nodeWidth, false);
            this.changeEdgeStyle(newEdgeFromInit2, "edgeFromInitPointer");
        }
        // Case 3: Deleting a node between other nodes
        else {
            await this.addTempPtrNode(nodeToDelete);

            // Get the temporary pointer and the next node to connect after deletion
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[this.activeNode + 2];

            // Remove the edge from the active node to the node to be deleted
            let edgeToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            // Create a new edge between the active node and the next node
            let newEdge1: EdgeData = {
                source: activeNode.id,
                target: nodeToConnect.id,
                class: "edgeUnderNodeFromNodes",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge1], false);

            // Remove the reverse edge from the next node to the node to be deleted
            edgeToDelete = this.findEdgeInArray(nodeToConnect, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            // Create the reverse edge to maintain the bidirectional link
            let newEdge2: EdgeData = {
                source: nodeToConnect.id,
                target: activeNode.id,
                class: "edgeOverNodeFromNodes",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge2], false);

            // Delete remaining edges related to the node being removed
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;
            const edge1ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, nodeToConnect)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, activeNode)!;

            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete, ptrEdgeToDelete], [nodeToDelete, ptrNode]);

            // Shift the tail pointer and nodes to the left
            await this.shiftingNodes(1, 1, -1.8 * nodeWidth, false);
            await this.shiftingNodes(this.activeNode + 1, this.nodes.length - 1, -1.8 * nodeWidth, false);

            this.changeEdgeStyle(newEdge1, "roundCornerEdge");
            this.changeEdgeStyle(newEdge2, "roundCornerEdge");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Inserts a new node at the end of the doubly linked list.
     * @param element - The value to be inserted as the last node.
     *
     * Handles 2 cases:
     * 1. Adding the first node when the list is empty.
     * 2. Appending a new node to the end when nodes already exist.
     */
    public async insertLastNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the initial pointers
        const initNode1: NodeData = this.nodes[0];  // Head initial pointer
        const initNode2: NodeData = this.nodes[1];  // Tail initial pointer

        // Case 1: Adding the first node when the list is empty
        if (this.nodes.length === 2) {
            await this.addFirstNodeToTheList(initNode1, initNode2, element);
        }
        // Case 2: Appending a new node at the end of the list
        else {
            // Get the current last node
            const lastNode: NodeData = this.nodes[this.nodes.length - 1];

            // Create the new node to be inserted at the end
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: (lastNode.x) + 1.8 * nodeWidth,
                y: (lastNode.y) + 2 * nodeHeight,
                class: "nullDefaultNodeNull",
            };
            this.addingNodeFutureId = this.nodes.length;
            await this.addNewNodeWithAnimation(newNode);

            // Shift the tail pointer to make space for the new node
            await this.shiftingNodes(1, 1, 1.8 * nodeWidth);

            // Create forward and reverse edges between the new node and the last node
            let newEdge: EdgeData = {
                source: newNode.id,
                target: lastNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseEdge: EdgeData = this.returnReverseEdge(newEdge);
            await this.addNewEdgesWithAnimation([newEdge, reverseEdge]);

            // Update the edge from the tail pointer to the new node
            newEdge = {
                source: initNode2.id,
                target: newNode.id,
                class: "edgeFromInitPointer",
                opacity: 0
            };
            let edgeToDelete: EdgeData = this.findEdgeInArray(initNode2, lastNode)!;

            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([newEdge]);

            // Reset the adding node ID and place the new node at the end of the list
            this.addingNodeFutureId = null;
            this.placeNewNodeToList(this.nodes.length-1);
        }

        await this.afterAnimationEnds();
    }


    /**
     * Deletes the last node from the doubly linked list.
     *
     * Handles 3 cases:
     * 1. Empty list (only initial pointers) - Logs an error.
     * 2. List with one node - Deletes the only node.
     * 3. List with multiple nodes - Removes the last node and re-links the list.
     */
    public async deleteLastNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the initial pointers and the last node
        const initNode1: NodeData = this.nodes[0];  // Head initial pointer
        const initNode2: NodeData = this.nodes[1];  // Tail initial pointer
        const lastNode: NodeData = this.nodes[this.nodes.length - 1];

        // Case 1: Empty list (only initial pointers)
        if (this.nodes.length <= 2) {
            this.log("list.deleteLastEmpty");
        }
        // Case 2: List with one node
        else if (this.nodes.length === 3) {
            const edge1ToDelete: EdgeData = this.findEdgeInArray(initNode1, lastNode)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(initNode2, lastNode)!;

            // Delete the single node and its connections
            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete], [lastNode]);
        }
        // Case 3: List with multiple nodes
        else {
            // Create a temporary pointer node pointing to the last node
            await this.addTempPtrNode(lastNode);
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[this.nodes.length - 3];

            // Create a new edge from the tail pointer to the new last node
            const newEdge: EdgeData = {
                source: initNode2.id,
                target: nodeToConnect.id,
                class: "edgeUnderNodeFromInit2",
                opacity: 0
            }

            // Remove the current edge from tail pointer to the last node
            let edge1ToDelete: EdgeData = this.findEdgeInArray(initNode2, lastNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete], [], false);
            await this.addNewEdgesWithAnimation([newEdge], false);

            // Remove edges related to the deleted node
            edge1ToDelete = this.findEdgeInArray(lastNode, null)!;
            const ptrEdgeToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToConnect, lastNode)!;

            await this.deleteNodesAndEdgesWithAnimation(
                [edge1ToDelete, ptrEdgeToDelete, edge2ToDelete],
                [lastNode, ptrNode]
            );

            // Shift the tail pointer to its new position
            await this.shiftingNodes(1, 1, -1.8*nodeWidth, false);
            this.changeEdgeStyle(newEdge, "edgeFromInitPointer");
        }
        await this.afterAnimationEnds();
    }

    /**
     * Retrieves the value of the last node in the doubly linked list.
     * If the list is empty (only initial pointers), logs an error.
     */
    public async getLastNodeValue(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if there are nodes after the initial pointers
        if (this.nodes.length > 2) {
            const value: string|number|undefined = this.nodes[this.nodes.length-1].value;
            this.log("list.getLastValue", { value });
        } else {
            this.log("list.getLastError");
        }

        await this.afterAnimationEnds();
    }

    /**
     * Activates the previous node in the list.
     * If the current active node is the first, deactivates it.
     */
    public async activatePreviousNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        // Move to the previous node or deactivate if it is the first node
        this.activeNode--;
        if (this.activeNode <= 1) {
            this.activeNode = null;
        }

        this.setClassToNodes();
        this.updateGraph();

        await this.afterAnimationEnds();
    }

    /**
     * Activates the last node in the doubly linked list.
     * If the list is empty (only initial pointers), logs an error.
     */
    public async activateLastNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the list contains any nodes after the initial pointers
        if (this.nodes.length === 2) {
            this.log("list.lastEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Set the active node to the last node in the list
        this.activeNode = this.nodes.length - 1;

        this.setClassToNodes();
        this.updateGraph();

        await this.afterAnimationEnds();
    }

    /**
     * Inserts a new node before the currently active node in the doubly linked list.
     * @param element - The value to be inserted as the new node.
     *
     * Hanldes 2 cases:
     * 1. Inserting before the first data node (position 2).
     * 2. Inserting before a middle or last node.
     */
    public async insertBeforeActiveNode(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        const activeNode: NodeData = this.nodes[this.activeNode];
        const initNode1: NodeData = this.nodes[0];  // Head initial pointer

        // Case 1: Inserting before the first data node
        if (this.activeNode === 2) {
            // Create a new node at the start position
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: activeNode.x,
                y: 300 + 2 * nodeHeight,
                opacity: 0,
                class: "defaultNode"
            };
            this.addingNodeFutureId = this.activeNode;  // Mark as the future position
            await this.addNewNodeWithAnimation(newNode);

            // Shift the initial pointer and nodes to the right
            await this.shiftingNodes(1, 1, 1.8 * nodeWidth, false);
            await this.shiftingNodes(this.activeNode, this.nodes.length - 2, 1.8 * nodeWidth);

            // Add edges connecting the new node with the active node
            const newEdge: EdgeData = {
                source: newNode.id,
                target: activeNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            const reverseEdge: EdgeData = this.returnReverseEdge(newEdge);
            await this.addNewEdgesWithAnimation([newEdge, reverseEdge]);

            // Replace the edge from the initial pointer to the active node
            let edgeToDelete: EdgeData = this.findEdgeInArray(initNode1, activeNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);

            // Add a new edge from the initial pointer to the new node
            const newEdgeFromInit1: EdgeData = {
                source: initNode1.id,
                target: newNode.id,
                class: "edgeFromInitPointer",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdgeFromInit1]);

            this.addingNodeFutureId = null;
            this.placeNewNodeToList(this.activeNode, true);
        }
        // Case 2: Inserting before a middle or last node
        else {
            const nodeBeforeActiveNode: NodeData = this.nodes[this.activeNode - 1];

            // Create the new node before the active node
            const newNode: NodeData = {
                id: this.nodes.length,
                value: element,
                x: activeNode.x,
                y: 300 + 2 * nodeHeight,
                opacity: 0,
                class: "nullDefaultNodeNull"
            };
            this.addingNodeFutureId = this.activeNode;  // Mark as the future position
            await this.addNewNodeWithAnimation(newNode);

            // Shift the initial pointer and nodes to the right
            await this.shiftingNodes(1, 1, 1.8 * nodeWidth, false);
            await this.shiftingNodes(this.activeNode, this.nodes.length - 2, 1.8 * nodeWidth);

            // Add edges connecting the new node with the active node and the previous node
            let rightEdgeFromNewNode: EdgeData = {
                source: newNode.id,
                target: activeNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseRightEdge: EdgeData = this.returnReverseEdge(rightEdgeFromNewNode);

            let leftEdgeFromNewNode: EdgeData = {
                source: newNode.id,
                target: nodeBeforeActiveNode.id,
                class: "roundCornerEdge",
                opacity: 0
            };
            let reverseLeftEdge: EdgeData = this.returnReverseEdge(leftEdgeFromNewNode);

            await this.addNewEdgesWithAnimation([rightEdgeFromNewNode, leftEdgeFromNewNode]);

            // Delete the old edges between the active node and the previous node
            let edgeToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeBeforeActiveNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([reverseRightEdge]);

            edgeToDelete = this.findEdgeInArray(nodeBeforeActiveNode, activeNode)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], []);
            await this.addNewEdgesWithAnimation([reverseLeftEdge]);

            this.addingNodeFutureId = null;
            this.placeNewNodeToList(this.activeNode, true);
        }
        await this.afterAnimationEnds();
    }

    /**
     * Deletes the node before the currently active node in the doubly linked list.
     *
     * Hanldes 3 cases:
     * 1. Active node is the first data node - No change (logs a message).
     * 2. Deleting the first data node when it's directly after the head pointer.
     * 3. Deleting a middle node before the active node.
     */
    public async deleteBeforeActiveNode(): Promise<void> {
        if (this.animationInProcess || !this.isInit || this.activeNode == null) return;

        await this.beforeAnimationStarts();

        const activeNode: NodeData = this.nodes[this.activeNode];
        const nodeToDelete: NodeData = this.nodes[this.activeNode - 1];
        const initNode1: NodeData = this.nodes[0];  // Head initial pointer

        // Case 1: Active node is the first node - No deletion possible
        if (this.activeNode === 2) {
            this.log("list.deleteBeforeEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Case 2: Deleting the first node (directly after the head pointer)
        if (this.activeNode === 3) {
            await this.addTempPtrNode(nodeToDelete);

            const edgeToDelete: EdgeData = this.findEdgeInArray(initNode1, null)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            const newEdgeFromInit1: EdgeData = {
                source: initNode1.id,
                target: activeNode.id,
                class: "edgeUnderNodeFromInit1",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdgeFromInit1], false);

            const edge1ToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeToDelete)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, activeNode)!;
            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const edgePtrToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;

            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete, edgePtrToDelete], [nodeToDelete, ptrNode]);

            // Shift the list to the left to fill the gap
            await this.shiftingNodes(this.activeNode, this.nodes.length - 1, -1.8 * nodeWidth, false);
            await this.shiftingNodes(1, 1, -1.8 * nodeWidth, false); // Move head pointer
            this.changeEdgeStyle(newEdgeFromInit1, "edgeFromInitPointer");
        }
        // Case 3: Deleting a middle node before the active node
        else {
            await this.addTempPtrNode(nodeToDelete);

            const ptrNode: NodeData = this.nodes[this.nodes.length - 1];
            const nodeToConnect: NodeData = this.nodes[this.activeNode - 2];

            let edgeToDelete: EdgeData = this.findEdgeInArray(activeNode, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            // Create new edges to link the surrounding nodes
            let newEdge1: EdgeData = {
                source: activeNode.id,
                target: nodeToConnect.id,
                class: "edgeOverNodeFromNodes",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge1], false);

            edgeToDelete = this.findEdgeInArray(nodeToConnect, nodeToDelete)!;
            await this.deleteNodesAndEdgesWithAnimation([edgeToDelete], [], false);

            let newEdge2: EdgeData = {
                source: nodeToConnect.id,
                target: activeNode.id,
                class: "edgeUnderNodeFromNodes",
                opacity: 0
            };
            await this.addNewEdgesWithAnimation([newEdge2], false);

            const edgePtrToDelete: EdgeData = this.findEdgeInArray(ptrNode, null)!;
            const edge1ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, nodeToConnect)!;
            const edge2ToDelete: EdgeData = this.findEdgeInArray(nodeToDelete, activeNode)!;

            await this.deleteNodesAndEdgesWithAnimation([edge1ToDelete, edge2ToDelete, edgePtrToDelete], [nodeToDelete, ptrNode]);

            // Shift the list to the left to fill the gap
            await this.shiftingNodes(1, 1, -1.8 * nodeWidth, false);  // Move head pointer
            await this.shiftingNodes(this.activeNode, this.nodes.length - 1, -1.8 * nodeWidth, false);

            this.changeEdgeStyle(newEdge1, "roundCornerEdge");
            this.changeEdgeStyle(newEdge2, "roundCornerEdge");
        }

        await this.afterAnimationEnds();
    }


    /**
     * Generates a random doubly linked list structure with a random number of nodes.
     * The list will contain between 2 and 5 elements.
     */
    public randomStructure(): void {
        this.resetStructure();
        this.initStructure();

        // Determine the random number of elements (between 2 and 5)
        const numOfElements: number = Math.floor(Math.random() * (5 - 2 + 1)) + 2;

        // Add nodes to the structure
        for (let i = 0; i < numOfElements; i++) {
            const value = String(Math.floor(Math.random() * 100));  // Random value for the node
            const lastNode = this.nodes[this.nodes.length - 1];
            const initPointer1 = this.nodes[0]; // Head initial pointer

            let x = 0;
            let y = 300;

            // Determine the x-coordinate for the new node
            if (this.nodes.length <= 2) {
                x = initPointer1.x + 100;  // Position next to the initial pointer if the list is empty
            } else {
                x = lastNode.x + 1.8 * nodeWidth;  // Position after the last node
            }

            // Create the new node and add it to the list
            const newNode: NodeData = {
                id: this.nodes.length,
                value: value,
                x: x,
                y: y,
                opacity: 1,
                class: "defaultNode"
            };
            this.nodes.push(newNode);
            this.normalizeGraph();

            // Add forward and reverse edges if there are already nodes in the list
            if (this.nodes.length > 3) {
                const forwardEdge: EdgeData = {
                    source: lastNode.id,
                    target: newNode.id,
                    class: "roundCornerEdge",
                    opacity: 1
                };

                this.edges.push(forwardEdge);
                this.setClassToNodes();

                const reverseEdge: EdgeData = this.returnReverseEdge(forwardEdge);
                reverseEdge.opacity = 1;
                this.edges.push(reverseEdge);
                this.setClassToNodes();
            }
        }

        // Connect initial pointers to the first and last nodes
        const initPointer1 = this.nodes[0];  // Head initial pointer
        const initPointer2 = this.nodes[1];  // Tail initial pointer
        const firstNode = this.nodes[2];
        const lastNode = this.nodes[this.nodes.length - 1];

        const edgeFromInit1: EdgeData = {
            source: initPointer1.id,
            target: firstNode.id,
            class: "edgeFromInitPointer",
            opacity: 1
        };

        const edgeFromInit2: EdgeData = {
            source: initPointer2.id,
            target: lastNode.id,
            class: "edgeFromInitPointer",
            opacity: 1
        };

        // Add edges from initial pointers to the first and last nodes
        this.edges.push(edgeFromInit1, edgeFromInit2);

        // Adjust the position of the second initial pointer to the end of the list
        initPointer2.x = lastNode.x + 100;

        this.normalizeGraph();
        this.updateGraph();
        this.centerCanvas(true);
    }
}