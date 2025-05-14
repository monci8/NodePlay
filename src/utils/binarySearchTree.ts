import BaseStructure, { NodeData, EdgeData } from "@/utils/base/baseStructure";
import cytoscape, { StylesheetJson, StylesheetJsonBlock } from "cytoscape";
import { i18n } from "@/i18n";
const t = i18n.global.t;

// Define constants for visual element dimensions and coordinates
const initHeight: number = 50
const initWidth: number = 50
const nodeDiameter: number = 55

const initPointerX: number = 0
const initPointerY: number = 0

const rootX: number = 0
const rootY: number = 100


/**
 * Represents the data structure for a single tree node in a graph.
 * Extends the NodeData interface by adding references to left and right child nodes.
 */
export interface TreeNodeData extends NodeData {
    left: number|string|null;    // ID of the left child node
    right: number|string|null;   // ID of the right child node
}

/**
 * BinarySearchTree - Represents a visualized binary search tree using Cytoscape.js.
 * This class inherits from BaseStructure and visualizes trees operations.
 */
export default class BinarySearchTree extends BaseStructure {
    protected treeNodes: TreeNodeData[];    // Array of nodes in the binary search tree
    protected traversalOutput: string;      // String for storing traversal results
    protected isTraversalLogging: boolean;  // Indicates if traversal actions are logged

    /**
     * Constructor to create a new binary search tree.
     * @param containerId - The ID of the HTML element where the list is displayed.
     *
     * Initializes the treeNodes array to store nodes,sets traversal output to an
     * empty string and disables traversal logging by default.
     */
    constructor(containerId: string) {
        super(containerId);
        this.treeNodes = [];
        this.traversalOutput = "";
        this.isTraversalLogging = false;

        // Set padding to center the list visualization
        this.paddingForCentering = 90;
    }

    /**
     * Logs a message or key using a callback or console.
     * @param keyOrMessage - The message or key to log.
     * @param params - Optional parameters for the log.
     *
     * Uses the log callback if available; otherwise, logs to the console.
     * If traversal logging is enabled, appends the message to the traversal output (last log entry).
     */
    protected async log(keyOrMessage: string, params?: Record<string, unknown>): Promise<void> {
        const logObject = { key: keyOrMessage, params: params ?? {} };

        if (this.logCallback) {
            // When traversal logging is enabled - update the last log entry
            if (this.isTraversalLogging) {
                this.traversalOutput += logObject.key + " ";  // Update traversal output
                this.logCallback({
                    key: "__UPDATE_LAST__" + this.traversalOutput.trim(),
                    params: params
                });

                await new Promise(resolve => setTimeout(resolve, 0));
            } else {
                // When traversal logging is disabled - add a new log entry
                this.logCallback(logObject);
            }
        } else {
            // When no callback is defined, use console logging
            const translated = t(logObject.key, logObject.params);
            console.log(translated);
        }
    }

    /**
     * Finds a node in the treeNodes array by its ID.
     * @param nodeId - The ID of the node to find.
     * @returns The matching TreeNodeData object or undefined if not found.
     */
    protected findNodeInTreeNodes(nodeId: string | number | null | undefined): TreeNodeData | undefined {
        return this.treeNodes.find(n => n.id === nodeId);
    }

    /**
     * Finds a node in the treeNodes array by its ID and class.
     * @param nodeId - The ID of the node to find.
     * @param nodeClass - The class of the node to match.
     * @returns The matching TreeNodeData object or undefined if not found.
     */
    protected findNodeWithClassInTreeNodes(nodeId: string | number | null | undefined, nodeClass: string): TreeNodeData | undefined {
        return this.treeNodes.find(n => n.id === nodeId && n.class === nodeClass);
    }

    /**
     * Checks if the given node is a null node representation.
     * @param node - The node to check.
     * @returns True if the node is a null representation, otherwise false.
     */
    protected isNullNode(node: string | number | null | undefined): boolean {
        return typeof node === "string" && node.startsWith("null");
    }

    /**
     * Validates if the given node is not null.
     * @param node - The node to validate.
     * @returns True if the node is valid (not null), otherwise false.
     */
    protected isNodeValid(node: string | number | null | undefined): node is string | number {
        return node !== null && !(this.isNullNode(node));
    }

    /**
     * Makes the node cursor visible.
     * Finds the node with ID "nodeCursor" and sets its opacity to 1.
     */
    protected showNodeCursor(): void {
        const nodeCursor: NodeData = this.nodes.find(n => n.id === "nodeCursor")!;
        if (!nodeCursor) return;
        nodeCursor.opacity = 1;
    }

    /**
     * Hides the node cursor.
     * Finds the node with ID "nodeCursor", sets its opacity to 0, and updates the graph.
     */
    protected hideNodeCursor(): void {
        const nodeCursor: NodeData = this.nodes.find(n => n.id === "nodeCursor")!;
        if (!nodeCursor) return;
        nodeCursor.opacity = 0;
        this.updateGraph();
    }

    /**
     * Moves the node cursor to the specified node's position.
     * @param nodeId - The ID of the target node.
     *
     * Finds the node and the cursor, sets the cursor's position to the node's coordinates,
     * makes the cursor visible, and updates the graph.
     */
    protected async moveNodeCursor(nodeId: string|number): Promise<void> {
        const node: TreeNodeData = this.findNodeInTreeNodes(nodeId)!;
        if (!node) return;

        const nodeCursor: NodeData = this.nodes.find(n => n.id === "nodeCursor")!;
        if (!nodeCursor) return;

        // Update the cursor position and make it visible
        nodeCursor.x = node.x;
        nodeCursor.y = node.y + 45;
        nodeCursor.opacity = 1;
        this.updateGraph();

        await this.wait();
    }


    /**
     * Calculates the coordinates of tree nodes to create a visually balanced layout.
     * @param rootId - The ID of the root node from which to start the layout calculation.
     *
     * Uses in-order traversal to calculate X and Y positions for each node.
     * Sets the root node to be centered at the initial pointer after calculation.
     */
    protected layoutTree(rootId: string|number): void {
        const levelSpacing: number = 70;  // Vertical space between tree levels
        const spaceBetweenNodes: number = 50;  // Horizontal space between sibling nodes
        let inOrderCounter: number = 0;  // Counter to track the position of nodes during in-order traversal

        /**
         * Recursively calculates the position of each node using in-order traversal.
         * @param nodeId - The current node being positioned.
         * @param depth - The depth level of the current node (starting from root).
         */
        const calculate = (nodeId: string|number|null, depth: number) => {
            const node: TreeNodeData|undefined = this.findNodeInTreeNodes(nodeId);
            if (!node) return;

            // Recursively calculate the left subtree position
            calculate(node.left, depth + 1);

            // Set X and Y coordinates based on in-order position and depth
            node.x = rootX + (inOrderCounter * spaceBetweenNodes);  // Horizontal position based on traversal order
            node.y = rootY + depth * levelSpacing;  // Vertical position based on depth level
            inOrderCounter++;  // Increment counter after positioning the current node

            // Recursively calculate the right subtree position
            calculate(node.right, depth + 1);
        };

        // Start the layout calculation from the root node at depth 0
        calculate(rootId, 0);

        // After calculating, the root might have shifted, so we shift it back to the initial position
        const actualRoot: TreeNodeData|undefined = this.findNodeInTreeNodes(rootId);
        if (!actualRoot) return;

        // Calculate the horizontal shift
        const shiftX: number = rootX - actualRoot.x;

        // Apply the calculated shift to all nodes
        this.treeNodes.forEach(node => node.x += shiftX);
    }

    /**
     * Converts the tree structure into a graph format for visualization.
     * Creates visual nodes and edges based on the current tree.
     * If the tree is empty, it shows a single "NULL" node.
     */
    protected transferTreeToGraph(): void {
        if (this.nodes.length === 0) return;

        // Keep the initial pointer and cursor node
        const initPointer: NodeData = this.nodes[0];
        const nodeCursor: NodeData = this.nodes[1];

        // Start with just the initial pointer and cursor
        this.nodes = [initPointer, nodeCursor];
        this.edges = [];

        // If the tree is empty, add a single "NULL" node to indicate an empty tree
        if (this.treeNodes.length === 0) {
            const nullNode: TreeNodeData = {
                id: "nullNode",
                value: "NULL",
                x: rootX,
                y: rootY,
                left: null,
                right: null,
                class: "nullNode",
                opacity: 1
            };
            this.treeNodes.push(nullNode);
        }

        // Recalculate the positions of all nodes
        const rootNode: TreeNodeData = this.treeNodes[0];
        this.layoutTree(rootNode.id);

        // Go through each tree node and make it a visual graph node
        this.treeNodes.forEach((node) => {
            // Add the current tree node as a graph node
            this.nodes.push({
                id: node.id,
                value: node.value,
                x: node.x,
                y: node.y,
                class: node.class,
                opacity: node.opacity
            });

            // If the node has a left child, add an edge to it
            if (node.left && node.left !== null) {
                this.edges.push({
                    source: node.id,
                    target: node.left,
                    class: "defaultEdge",
                });
            }
            // If the node has a right child, add an edge to it
            if (node.right && node.right !== null) {
                this.edges.push({
                    source: node.id,
                    target: node.right,
                    class: "defaultEdge",
                });
            }
        });

        // Make the initial pointer always point to the root node
        this.edges.unshift({
            source: "initPointer",
            target: rootNode.id,
            class: "defaultEdge",
        });

        // Update the graph to show the new nodes and edges
        this.updateGraph();
    }

    /**
     * Animates the traversal of an edge between two nodes.
     * @param sourceId - ID of the starting node.
     * @param targetId - ID of the destination node.
     *
     * Highlights the edge, waits briefly, then resets the edge style.
     */
    private async animateEdgeTraversal(sourceId: string | number, targetId: string | number): Promise<void> {
        const edgeIndex = this.edges.findIndex(e => e.source === sourceId && e.target === targetId);
        // If the edge exists, proceed with the animation
        if (edgeIndex !== -1) {
            // Highlight the edge to indicate traversal
            this.edges[edgeIndex].class = "highlightEdge";
            this.hideNodeCursor();   // Hide the cursor to focus on the edge
            this.updateGraph();
            await this.wait();

            // Reset the edge to its normal style after the animation
            this.edges[edgeIndex].class = "defaultEdge";
            this.updateGraph();
        }
    }

    /**
     * Finds the child node ID based on the key's value.
     * @param node - The current tree node.
     * @param key - The key to compare.
     * @returns The ID of the left or right child node, or null if no valid child.
     *
     * Returns the left child if the key is smaller, right if bigger.
     * Handles 3 cases:
     * 1. Key is smaller, return the left child.
     * 2. Key is larger, return the right child.
     * 3. Key is equal or no valid child, return null.
     */
    private getChildIdForKey(node: TreeNodeData, key: number | string): string | number | null {
        // Case 1: Key is smaller, return the left child
        if (Number(key) < Number(node.id) && node.left !== null) {
            return node.left;
        }
        // Case 2: Key is larger, return the right child
        else if (Number(key) > Number(node.id) && node.right !== null) {
            return node.right;
        }
        // Case 3: Key is equal or no valid child, return null
        return null;
    }

    /**
     * Adds a new node to the binary search tree with animation.
     * @param nodeId - The ID of the node where the insertion begins.
     * @param key - The value of the new node to add.
     * @param parent - The parent node to which the new node will be attached.
     * @param isLeft - Determines whether the new node is a left child.
     * @returns The ID of the newly added node or null if the operation fails.
     *
     * Handles 3 cases:
     * 1. Node is searched as null node:
     *    - Replaces the null node with the new node.
     *    - Creates new null children for the inserted node.
     *    - Updates the tree visualization.
     *
     * 2. Node is searched as an existing node:
     *    - Moves the cursor to the current node.
     *    - Checks if the node already exists (same key) and highlights it.
     *
     * 3. Node does not match:
     *    - Determines the correct child (left or right) based on the key.
     *    - Animates edge traversal and recursively calls the function to add the node.
     */
    protected async addNodeWithAnimation(
        nodeId: string | number | null, key: number | string,
        parent: TreeNodeData | null = null, isLeft: boolean = false
    ): Promise<string | number | null> {
        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return null;

        // Case 1: Node is a null node - replace with new node and create children
        if (node.class === "nullNode") {
            this.hideNodeCursor();
            await this.wait();

            let nodeFromGraph = this.findNodeInGraph(node);
            this.animateDeletingElement(nodeFromGraph);
            await this.wait();

            // Replace nullNode with the new node
            node.id = key;
            node.value = key;
            node.class = "defaultNode";
            node.opacity = 0;

            // Update parent link
            if (parent) {
                if (isLeft) parent.left = key;
                else parent.right = key;
            }

            this.transferTreeToGraph();

            // Animate adding the new node
            nodeFromGraph = this.findNodeInGraph(node);
            this.animateAddingElement(nodeFromGraph);
            await this.wait();
            node.opacity = 1;
            this.transferTreeToGraph();

            // Add null children to the new node
            const leftNullId = `null-${key}-left`;
            const rightNullId = `null-${key}-right`;

            // Add left null child to the tree array
            this.treeNodes.push({
                id: leftNullId,
                value: "NULL",
                x: 0,
                y: 0,
                left: null,
                right: null,
                class: "nullNode",
                opacity: 0
            });
            node.left = leftNullId;
            this.transferTreeToGraph();

            // Animate adding left null child
            let childNode = this.findNodeInTreeNodes(leftNullId)!;
            nodeFromGraph = this.findNodeInGraph(childNode);
            this.animateAddingElement(nodeFromGraph);
            await this.wait();
            childNode.opacity = 1;
            this.transferTreeToGraph();

            // Add right null child to the tree array
            this.treeNodes.push({
                id: rightNullId,
                value: "NULL",
                x: 0,
                y: 0,
                left: null,
                right: null,
                class: "nullNode",
                opacity: 0
            });
            node.right = rightNullId;
            this.transferTreeToGraph();

            // Animate adding right null child
            childNode = this.findNodeInTreeNodes(rightNullId)!;
            nodeFromGraph = this.findNodeInGraph(childNode);
            this.animateAddingElement(nodeFromGraph);
            await this.wait();
            childNode.opacity = 1;
            this.transferTreeToGraph();

            return key;
        }

        this.transferTreeToGraph();

        // If some node is a default node - move cursor to it
        if (node.class === "defaultNode") {
            await this.moveNodeCursor(node.id);
        }

        // Case 2: Node already exists - highlighted it
        if (node.id === key) {
            await this.highlightSearchedNode(node);
            return node.id;
        }

        // 3: Node does not match - determine child and recursively add
        const childId = this.getChildIdForKey(node, key);

        if (childId !== null) {
            await this.animateEdgeTraversal(node.id, childId);

            // Recursively add the node in the correct subtree
            if (Number(key) < Number(node.id)) {
                node.left = await this.addNodeWithAnimation(childId, key, node, true);
            } else {
                node.right = await this.addNodeWithAnimation(childId, key, node, false);
            }
        }

        return node.id;
    }

    /**
     * Extracts a numeric ID from a string or returns the number directly.
     * @param id - The ID to extract (either a string or a number).
     * @returns The numeric part of the ID or -1 if no number is found.
     */
    protected extractNumericId(id: string | number): number {
        // ID is a number - return it directly
        if (typeof id === "number") return id;

        // ID is a string - extract number using regex
        const match = id.match(/\d+/);
        return match ? Number(match[0]) : -1;
    }

    /**
     * Finds the edges connected to the left and right children of a node.
     * @param node - The parent node whose children edges are being searched.
     * @returns An object containing the left edge, right edge, and any null node found.
     *
     * This method checks both the left and right children of the given node.
     * It identifies if either child is a null node and returns the corresponding edge.
     */
    private findLeftRightNullEdges(node: TreeNodeData) {
        const leftNode = this.findNodeInTreeNodes(node.left);
        const rightNode = this.findNodeInTreeNodes(node.right);

        let leftEdge = undefined;
        let rightEdge = undefined;
        let nullNode = undefined;

        // Check if both children exist
        if (leftNode && rightNode) {
            // Find edges connecting to left and right children
            leftEdge = this.edges.find(e => e.source === node.id && e.target === leftNode.id);
            rightEdge = this.edges.find(e => e.source === node.id && e.target === rightNode.id);

            // Determine if either child is a null node
            if (this.isNullNode(leftNode.id)) {
                nullNode = leftNode;
            } else if (this.isNullNode(rightNode.id)) {
                nullNode = rightNode;
            }
        }

        return { nullNode, leftEdge, rightEdge };
    }

    /**
     * Removes the null children of a given node from the tree.
     * @param node - The parent node whose null children are to be removed.
     *
     * This function filters out any left or right null nodes associated with the parent node.
     */
    private removeNullChildren(node: TreeNodeData): void {
        this.treeNodes = this.treeNodes.filter(n =>
            n.id !== `null-${node.id}-left` && n.id !== `null-${node.id}-right`
        );
    }


    /**
     * Replaces a node in the binary search tree with its child node.
     * @param node - The node to be replaced.
     * @param child - The child node that will take the place of the original node.
     * @param parentId - The ID of the parent node.
     * @param deleteSuccessor - Whether the successor node should be deleted.
     *
     * Handles 2 cases:
     * 1. Node has a parent:
     *    - Updates the parent node to link to the child.
     *    - Removes the original node from the tree.
     *
     * 2. Node is the root:
     *    - Replaces the root node's properties with the child's properties.
     *    - Removes the child node from the tree.
     */
    protected async replaceNodeWithChild(
        node: TreeNodeData, child: TreeNodeData,
        parentId: string|number|null = null, deleteSuccessor: boolean): Promise<void> {

        // Highlight the successor node if not marked for deletion
        if (!deleteSuccessor) {
            child.class = "successorNode";
            this.transferTreeToGraph();
            await this.wait();
        }

        // Find and remove edges connected to the node's null children
        const { nullNode, leftEdge, rightEdge } = this.findLeftRightNullEdges(node);
        await this.animateDeletingNodeWithNulls([node, nullNode], [leftEdge, rightEdge]);

        // Remove null children from the tree
        this.removeNullChildren(node);

        // Case 1: Node has a parent - update the parent's link to the child
        if (parentId !== null) {
            const parentNode: TreeNodeData | undefined = this.findNodeInTreeNodes(parentId);

            if (parentNode) {
                const parentIdNum = this.extractNumericId(parentNode.id);
                const nodeIdNum = this.extractNumericId(node.id);

                if (parentIdNum > nodeIdNum) {
                    parentNode.left = child.id;
                } else {
                    parentNode.right = child.id;
                }
            }

            // Remove the original node from the tree
            const index = this.treeNodes.indexOf(node);
            if (index !== -1) this.treeNodes.splice(index, 1);
        }
        // Case 2: Node is the root - replace root with the child
        else {
            node.id = child.id;
            node.value = child.value;
            node.left = child.left;
            node.right = child.right;

            const index = this.treeNodes.indexOf(child);
            if (index !== -1) this.treeNodes.splice(index, 1);
        }

        // Update the class of the remaining node if not a successor
        const remainingNode = this.findNodeInTreeNodes(child.id);
        if (remainingNode && !deleteSuccessor) {
            remainingNode.class = "successorNode";
            this.transferTreeToGraph();
            await this.wait();

            remainingNode.class = "defaultNode";
            this.transferTreeToGraph();
            await this.wait();
        }
    }

    /**
     * Finds the leftmost node in a binary search tree.
     * @param node - The starting node to search from.
     * @returns The leftmost node found.
     *
     * Recursively traverses the left children until the leftmost node is reached.
     * Highlights the traversal path visually.
     */
    protected async findMostLeftNode(node: TreeNodeData): Promise<TreeNodeData> {
        // If the left child is a null node, return the current node
        if (this.isNullNode(node.left)) {
            return node;
        }
        // Move to the left child
        else {
            await this.moveNodeCursor(node.id);

            // Find the left child and highlight the traversal
            const leftNode: TreeNodeData = this.findNodeInTreeNodes(node?.left)!;
            const edgeIndex = this.edges.findIndex(e => e.source === node.id && e.target === leftNode.id);

            // Highlight the edge during traversal
            if (edgeIndex !== null && edgeIndex !== -1) {
                this.edges[edgeIndex].class = "highlightEdge";
                this.hideNodeCursor();
                this.updateGraph();
                await this.wait(1.5);

                // Reset the edge style after highlighting
                this.edges[edgeIndex].class = "defaultEdge";
                this.updateGraph();
            }

            // Recursively call the function on the left child
            return this.findMostLeftNode(leftNode);
        }
    }

    /**
     * Animates the deletion of nodes and their associated nulls.
     * @param nodesToDelete - Array of nodes to be deleted.
     * @param edgesToDelete - Array of edges to be deleted.
     *
     * This function visualizes the deletion of specified nodes and edges,
     * including null nodes connected to the main node.
     */
    protected async animateDeletingNodeWithNulls(
        nodesToDelete: (TreeNodeData|undefined)[],
        edgesToDelete: (EdgeData|undefined)[]
    ): Promise<void> {
        // Animate the deletion of each node
        for (let node of nodesToDelete) {
            if (node) {
                const nodeFromGraph = this.findNodeInGraph(node);
                this.animateDeletingElement(nodeFromGraph);
            }
        }

        // Animate the deletion of each edge
        for (let edge of edgesToDelete) {
            if (edge) {
                const edgeFromGraph = this.findEdgeInGraph(edge);
                this.animateDeletingElement(edgeFromGraph, true);
            }
        }

        await this.wait();
    }

    /**
     * Animates the highlighting of a node to indicate it was found.
     * @param node - The node that was found during the search.
     *
     * The animation toggle between the "searchedNode" and "highlightNode" styles.
     */
    private async animateSearchFinding(node: TreeNodeData): Promise<void> {
        node.class = "searchedNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "highlightNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "searchedNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "highlightNode";
        this.transferTreeToGraph();
    }

    /**
     * Deletes a leaf node from the binary search tree with animation.
     * @param node - The leaf node to be deleted.
     * @param key - The value of the leaf node.
     * @param parentId - The ID of the parent node.
     * @param isLeft - Determines if the node is a left child.
     *
     * Handles 2 cases:
     * 1. Node has a parent:
     *    - Updates the parent to link to a new null node.
     *    - Marks the deleted node as a null node.
     *
     * 2. Node is the root (tree is empty) - sets the root node as a single "nullNode".
     */
    private async deleteLeafNodeWithAnimation(
        node: TreeNodeData, key: string | number,
        parentId: string | number | null, isLeft: boolean
    ): Promise<void> {
        // Remove left null child if it exists
        const leftNull = this.findNodeInTreeNodes(`null-${key}-left`);
        let indexToRemove = this.treeNodes.findIndex(n => n.id === `null-${key}-left`);
        if (indexToRemove !== -1) this.treeNodes.splice(indexToRemove, 1);
        node.left = null;

        // Remove right null child if it exists
        const rightNull = this.findNodeInTreeNodes(`null-${key}-right`);
        indexToRemove = this.treeNodes.findIndex(n => n.id === `null-${key}-right`);
        if (indexToRemove !== -1) this.treeNodes.splice(indexToRemove, 1);
        node.right = null;

        // Find the node to remove and related edges
        const nodeToRemove = this.findNodeInTreeNodes(node.id);
        let leftEdge = undefined;
        let rightEdge = undefined;
        if (leftNull && rightNull && nodeToRemove) {
            leftEdge = this.edges.find(e => e.source === nodeToRemove.id && e.target === leftNull.id);
            rightEdge = this.edges.find(e => e.source === nodeToRemove.id && e.target === rightNull.id);
        }

        // Animate deletion of the node and its null children
        await this.animateDeletingNodeWithNulls([leftNull, rightNull, nodeToRemove], [leftEdge, rightEdge]);

        // Case 1: Node has a parent - update the parent link
        if (isLeft && parentId !== null) {
            node.id = `null-${parentId}-left`;
        } else if (!isLeft && parentId !== null) {
            node.id = `null-${parentId}-right`;
        }
        // Case 2: Node is the root - set as single nullNode
        else {
            node.id = "nullNode";
        }

        // Update node properties to mark it as a null node
        node.value = "NULL";
        node.class = "nullNode";

        // Link the parent to the new null node
        if (parentId !== null) {
            const parentNode = this.findNodeInTreeNodes(parentId);
            if (parentNode) {
                if (isLeft) parentNode.left = node.id;
                else parentNode.right = node.id;
            }
        }
    }

    /**
     * Removes a node from the binary search tree with animation.
     * @param nodeId - The ID of the node to be removed.
     * @param key - The value of the node to remove.
     * @param parentId - The ID of the parent node.
     * @param isLeft - Determines if the node is a left child.
     * @param deleteSuccessor - Whether the successor node should be deleted.
     * @returns The ID of the removed node or null if the operation fails.
     *
     * Handles 4 cases:
     * 1. Node is a leaf (no children) - deletes the leaf node and updates the parent link.
     *
     * 2. Node has one child (left or right) - replaces the node with its only child.
     *
     * 3. Node has two children:
     *    - Finds the inorder successor (smallest node in the right subtree).
     *    - Replaces the node's value with the successor's value.
     *    - Removes the successor node.
     *
     * 4. Node does not exist - returns null.
     */
    protected async removeNodeWithAnimation(
        nodeId: string | number | null, key: number | string,
        parentId: string | number | null = null, isLeft: boolean = false, deleteSuccessor: boolean = false
    ): Promise<string | number | null> {

        if (nodeId === null) return null;  // Case 4: Node does not exist
        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return null;

        if (node.class !== "nullNode" && !deleteSuccessor)
            await this.moveNodeCursor(node.id);

        // Node with the given key is found
        if (node.id === key) {
            this.hideNodeCursor();

            if (!deleteSuccessor) {
                await this.animateSearchFinding(node);  // Visualize the found node
            }

            const leftChild: TreeNodeData = this.findNodeInTreeNodes(node.left)!;
            const rightChild: TreeNodeData = this.findNodeInTreeNodes(node.right)!;

            // Case 1: Node is a leaf (no children)
            if (leftChild.class === "nullNode" && rightChild.class === "nullNode") {
                await this.deleteLeafNodeWithAnimation(node, key, parentId, isLeft);
            }

            // Case 2: Node has only left child
            else if (leftChild.class === "defaultNode" && rightChild.class === "nullNode") {
                await this.replaceNodeWithChild(node, leftChild, parentId, deleteSuccessor);
            }

            // Case 2: Node has only right child
            else if (leftChild.class === "nullNode" && rightChild.class === "defaultNode") {
                await this.replaceNodeWithChild(node, rightChild, parentId, deleteSuccessor);
            }

            // Case 3: Node has two children
            else if (leftChild.class === "defaultNode" && rightChild.class === "defaultNode") {

                const edgeToHighlight = this.edges.find(e => e.source === node.id && e.target === node.right);
                if (edgeToHighlight) {
                    edgeToHighlight.class = "highlightEdge";
                    this.hideNodeCursor();
                    this.updateGraph();
                    await this.wait();

                    edgeToHighlight.class = "defaultEdge";
                    this.updateGraph();
                }

                // Find the inorder successor (smallest in right subtree)
                const mostLeftNode = await this.findMostLeftNode(rightChild);
                const mostLeftNodeId = mostLeftNode.id;

                mostLeftNode.class = "successorNode";
                this.hideNodeCursor();
                this.transferTreeToGraph();
                await this.wait();

                // Replace the node's ID and value with the successor's
                node.id = `new-${mostLeftNodeId}`;
                node.value = mostLeftNode.value;
                node.class = "successorNode";

                // Update parent link if necessary
                if (parentId !== null) {
                    const parentNode: TreeNodeData | undefined = this.findNodeInTreeNodes(parentId);
                    if (parentNode) {
                        const parentIdNum = this.extractNumericId(parentNode.id);
                        const nodeIdNum = this.extractNumericId(node.id);

                        if (parentIdNum > nodeIdNum) {
                            parentNode.left = node.id;
                        } else {
                            parentNode.right = node.id;
                        }
                    }
                }

                // Recursively remove the successor node
                await this.removeNodeWithAnimation(node.right, mostLeftNode.id, node.id, false, true);

                // Fix the ID back from temporary "new-" to the original
                if (node.id === `new-${mostLeftNodeId}`) {
                    const idToRewrite = node.id;
                    node.id = mostLeftNodeId;

                    const nullRightNode = this.findNodeInTreeNodes(`null-new-${mostLeftNodeId}-right`);
                    if (nullRightNode) nullRightNode.id = `null-${mostLeftNodeId}-right`;

                    if (node.right === `null-new-${mostLeftNodeId}-right`)
                        node.right = `null-${mostLeftNodeId}-right`;

                    node.class = "defaultNode";

                    if (parentId !== null) {
                        const parentNode: TreeNodeData | undefined = this.findNodeInTreeNodes(parentId);
                        if (parentNode) {
                            if (parentNode.left === idToRewrite)
                                parentNode.left = mostLeftNodeId;
                            else if (parentNode.right === idToRewrite)
                                parentNode.right = mostLeftNodeId;
                        }
                    }
                }
            }

            this.hideNodeCursor();
            this.transferTreeToGraph();
            await this.wait();
            return key;
        }

        // Determine edge to animate during traversal
        let edge: EdgeData | undefined = undefined;

        if (Number(key) < Number(node.id) && node.left !== null) {
            edge = this.edges.find(e => e.source === node.id && e.target === node.left);
        } else if (Number(key) > Number(node.id) && node.right !== null) {
            edge = this.edges.find(e => e.source === node.id && e.target === node.right);
        }

        // Animate edge traversal
        if (edge && !deleteSuccessor) {
            edge.class = "highlightEdge";
            this.updateGraph();
            this.hideNodeCursor();
            await this.wait();

            edge.class = "defaultEdge";
            this.updateGraph();
        }

        // Recursively continue the deletion animation and process
        if (Number(key) < Number(node.value)) {
            await this.removeNodeWithAnimation(node.left, key, node.id, true, deleteSuccessor);
        } else {
            await this.removeNodeWithAnimation(node.right, key, node.id, false, deleteSuccessor);
        }

        return node.id;
    }

    /**
     * Highlights a node to indicate that it has been found during the search.
     * @param node - The node that was found.
     * @returns A promise that resolves after the animation is complete.
     */
    protected async highlightSearchedNode(node: TreeNodeData): Promise<void> {
        this.hideNodeCursor();

        node.class = "searchedNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "highlightNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "searchedNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "highlightNode";
        this.transferTreeToGraph();
        await this.wait(0.5);

        node.class = "defaultNode";
        this.transferTreeToGraph();
    }

    /**
     * Searches for a node in the binary search tree with animation.
     * @param nodeId - The ID of the node to start searching from.
     * @param key - The value of the node to find.
     * @returns The ID of the found node or null if not found.
     *
     * Handles 3 cases:
     * 1. Node is a null node (not found) - logs a message indicating the node was not found.
     *
     * 2. Node is found (matches the key):
     *    - Highlights the found node.
     *    - Logs a message indicating the node was found.
     *    - Returns the node ID.
     *
     * 3. Node does not match:
     *    - Determines the correct child (left or right) based on the key.
     *    - Animates the traversal to the next node and continues the search recursively.
     */
    protected async searchNodeWithAnimation(
        nodeId: string | number | null, key: number | string
    ): Promise<string | number | null> {

        // Case 1: Node is a null node - not found
        if (this.isNullNode(nodeId)) {
            this.log("tree.searchNotFound", { key });
            await this.wait(1.5);
            return null;
        }

        // Find the node by ID
        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return null;

        // Move cursor to the node if it is a default node
        if (node.class === "defaultNode") {
            await this.moveNodeCursor(node.id);
        }

        // Case 2: Node is found - matches the key
        if (node.id === key) {
            await this.highlightSearchedNode(node);
            this.log("tree.searchFound", { key });
            await this.wait(1.5);
            return key;
        }

        // Case 3: Node does not match - continue to the child node
        const childId = this.getChildIdForKey(node, key);

        if (childId !== null) {
            await this.animateEdgeTraversal(node.id, childId);
            await this.searchNodeWithAnimation(childId, key);  // Recursive search
        }

        return node.id;
    }

    /**
     * Animates a single node during in-order traversal.
     * @param node - The node to animate.
     *
     * The node briefly changes its class to "highlightNode" to indicate traversal,
     * and then reverts back to "defaultNode".
     */
    private async animateNodeInOrderTraversal(node: TreeNodeData): Promise<void> {
        await this.log(String(node.value));

        // Highlight the node during traversal
        if (node.class === "defaultNode") {
            node.class = "highlightNode";
            this.transferTreeToGraph();
            await this.wait();
        }

        // Revert the node style after traversal
        if (node.class === "highlightNode") {
            node.class = "defaultNode";
            this.transferTreeToGraph();
            await this.wait();
        }
    }

    /**
     * Performs a pre-order traversal of the binary search tree with animation.
     * @param nodeId - The ID of the current node.
     * @returns A promise that resolves after the traversal is complete.
     *
     * Pre-order traversal: Visit root, then left subtree, then right subtree.
     */
    protected async preOrderWithAnimation(nodeId: string | number | null): Promise<void> {
        if (!this.isNodeValid(nodeId)) return;

        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return;

        await this.moveNodeCursor(node.id);
        await this.animateNodeInOrderTraversal(node);

        // Traverse left child with edge highlighting
        if (this.isNodeValid(node.left)) {
            await this.animateEdgeTraversal(node.id, node.left);
            await this.preOrderWithAnimation(node.left);
        }

        // Traverse right child with edge highlighting
        if (this.isNodeValid(node.right)) {
            await this.animateEdgeTraversal(node.id, node.right);
            await this.preOrderWithAnimation(node.right);
        }
    }

    /**
     * Performs an in-order traversal of the binary search tree with animation.
     * @param nodeId - The ID of the current node.
     * @returns A promise that resolves after the traversal is complete.
     *
     * In-order traversal: Visit left subtree, then root, then right subtree.
     */
    protected async inOrderWithAnimation(nodeId: string | number | null): Promise<void> {
        if (!this.isNodeValid(nodeId)) return;

        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return;

        await this.moveNodeCursor(node.id);

        // Traverse left child with edge highlighting
        if (this.isNodeValid(node.left)) {
            await this.animateEdgeTraversal(node.id, node.left);
            await this.inOrderWithAnimation(node.left);
        }

        await this.moveNodeCursor(node.id);
        await this.animateNodeInOrderTraversal(node);

        // Traverse right child with edge highlighting
        if (this.isNodeValid(node.right)) {
            await this.animateEdgeTraversal(node.id, node.right);
            await this.inOrderWithAnimation(node.right);
        }
    }

    /**
     * Performs a post-order traversal of the binary search tree with animation.
     * @param nodeId - The ID of the current node.
     * @returns A promise that resolves after the traversal is complete.
     *
     * Post-order traversal: Visit left subtree, then right subtree, then root.
     */
    protected async postOrderWithAnimation(nodeId: string | number | null): Promise<void> {
        if (!this.isNodeValid(nodeId)) return;

        const node: TreeNodeData | undefined = this.findNodeInTreeNodes(nodeId);
        if (!node) return;

        await this.moveNodeCursor(node.id);

        // Traverse left child with edge highlighting
        if (this.isNodeValid(node.left)) {
            await this.moveNodeCursor(node.id);
            await this.animateEdgeTraversal(node.id, node.left);
            await this.postOrderWithAnimation(node.left);
        }

        // Traverse right child with edge highlighting
        if (this.isNodeValid(node.right)) {
            await this.moveNodeCursor(node.id);
            await this.animateEdgeTraversal(node.id, node.right);
            await this.postOrderWithAnimation(node.right);
        }

        await this.moveNodeCursor(node.id);
        await this.animateNodeInOrderTraversal(node);
    }

    /**
     * Performs a level-order traversal of the binary search tree with animation.
     * @param nodeId - The ID of the root node.
     * @returns A promise that resolves after the traversal is complete.
     *
     * Level-order traversal: Visit nodes level by level from top to bottom.
     */
    protected async levelOrderWithAnimation(nodeId: string | number | null): Promise<void> {
        if (!this.isNodeValid(nodeId)) return;

        const queue: (string | number)[] = [nodeId];

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!this.isNodeValid(currentId)) continue;

            const node: TreeNodeData | undefined = this.findNodeInTreeNodes(currentId);
            if (!node) continue;

            await this.animateNodeInOrderTraversal(node);

            // Add left and right children to the queue
            if (this.isNodeValid(node.left)) {
                queue.push(node.left);
            }
            if (this.isNodeValid(node.right)) {
                queue.push(node.right);
            }
        }
    }

    /**
     * Traverses to the left or right child of a node with animation and calculates the height.
     * @param node - The current node from which to traverse.
     * @param childKey - 'left' or 'right' to specify the child direction.
     * @returns The height of the subtree rooted at the specified child node.
     *
     * Handles 2 cases:
     * 1. Child node exists:
     *    - Highlights the edge to the child.
     *    - Recursively calculates the height of the subtree.
     *
     * 2. Child node does not exist - returns height as 0.
     */
    private async traverseChildWithHeight(node: TreeNodeData, childKey: 'left' | 'right'): Promise<number> {
        let height = 0;
        const childId = node[childKey];

        // Case 1: Child node exists
        if (this.isNodeValid(childId)) {
            const edgeIndex = this.edges.findIndex(e => e.source === node.id && e.target === childId);
            if (edgeIndex !== -1) {
                this.edges[edgeIndex].class = "highlightEdge";  // Highlight the edge to the child
                this.updateGraph();
                await this.wait();
            }

            // Recursively calculate the height of the subtree
            height = await this.heightWithAnimation(childId);

            if (edgeIndex !== -1) {
                this.edges[edgeIndex].class = "defaultEdge";  // Restore the edge style
                this.updateGraph();
                await this.wait();
            }
        }

        // Case 2: Child node does not exist (height is 0)
        return height;
    }

    /**
     * Calculates the height of the binary search tree with animation.
     * @param nodeId - The ID of the root node.
     * @returns The height of the subtree rooted at the specified node.
     *
     * The height of a node is the maximum height between its left and right children plus 1.
     */
    protected async heightWithAnimation(nodeId: string | number | null): Promise<number> {
        // Base case: Null node or single null root - height is 0
        if (nodeId === "nullNode") return 0;

        const node: TreeNodeData = this.findNodeInTreeNodes(nodeId)!;
        if (node.class === "nullNode" && this.treeNodes.length === 1) return 0;

        // Highlight the current node during height calculation
        if (node.class === "defaultNode") {
            node.class = "highlightNode";
            this.transferTreeToGraph();
            await this.wait();
        }

        // Traverse the left child to calculate height
        let leftHeight = await this.traverseChildWithHeight(node, 'left');

        // Traverse the right child to calculate height
        let rightHeight = await this.traverseChildWithHeight(node, 'right');

        // Unhighlight the current node after calculation
        if (node.class === "highlightNode") {
            node.class = "defaultNode";
            this.transferTreeToGraph();
        }

        // Calculate the height as the maximum of left and right subtree heights plus 1
        const currentHeight: number = Math.max(leftHeight, rightHeight) + 1;
        return currentHeight;
    }

    /**
     * Initializes the graph with predefined styles and settings.
     * Sets up the graphical representation of the binary search tree.
     */
    protected initGraph(): void {
        const createNodeStyle = (className: string, borderWidth: number, image: string): StylesheetJsonBlock =>
            ({
                selector: `.${className}`,
                style: {
                    "width": nodeDiameter,
                    "height": nodeDiameter,
                    "shape": "ellipse",
                    "border-color": "black",
                    "border-width": borderWidth,
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
            {
                selector: ".nodeCursor",
                style: {
                    "width": 21,
                    "height": 19,
                    "background-color": "white",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOSAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeTE9Ii0xIiB4Mj0iMTguOTcxNCIgeTI9Ii0xIiB0cmFuc2Zvcm09Im1hdHJpeCgtMC40NDM4ODEgMC44OTYwODYgLTAuODY3MTk4IC0wLjQ5Nzk2NCA4LjQyMDkgMCkiIHN0cm9rZT0iI0FGNDQzOSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHkxPSItMSIgeDI9IjE4Ljk3MTQiIHkyPSItMSIgdHJhbnNmb3JtPSJtYXRyaXgoMC40NDM4ODEgMC44OTYwODYgMC44NjcxOTggLTAuNDk3OTY0IDEwLjU3OTEgMCkiIHN0cm9rZT0iI0FGNDQzOSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSI4LjQwMDM5IiB5MT0iMC41IiB4Mj0iMTAuNjAwNCIgeTI9IjAuNSIgc3Ryb2tlPSIjQUY0NDM5Ii8+Cjwvc3ZnPgo=",
                }
            },
            createNodeStyle("defaultNode", 1, "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjI3LjUiIHI9IjI3LjUiIGZpbGw9IiM4OUQxRDkiLz4KPC9zdmc+Cg=="),
            createNodeStyle("highlightNode", 2, "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjI3LjUiIHI9IjI3LjUiIGZpbGw9IiNENTg1N0MiLz4KPC9zdmc+Cg=="),
            createNodeStyle("successorNode", 2, "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjI3LjUiIHI9IjI3LjUiIGZpbGw9IiNFQUI0NzYiLz4KPC9zdmc+Cg=="),
            createNodeStyle("searchedNode", 2, "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjI3LjUiIHI9IjI3LjUiIGZpbGw9IiNENTg1N0MiLz4KPGNpcmNsZSBjeD0iMjcuNSIgY3k9IjI3LjUiIHI9IjI0IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg=="),
            {
                selector: ".nullNode",
                style: {
                    "width": nodeDiameter/2,
                    "height": nodeDiameter/2,
                    "shape": "ellipse",
                    "background-width": "100%",
                    "background-height": "100%",
                    "background-opacity": 0,
                    "label": "data(value)",
                    "color": "black",
                    "font-size": 14,

                    "text-valign": "center",
                    "text-halign": "center",
                    "text-justification": "center",
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
            },
            {
                selector: ".highlightEdge",
                style: {
                    "width": 4,
                    "line-color": "#AF4439",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": "#AF4439",
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
     * Initializes the binary search tree structure.
     *
     * Sets up the initial graph with a pointer and a cursor.
     * Centers the canvas after initialization.
     * Marks the structure as initialized.
     */
    public initStructure(): void {
        if (this.isInit) return;
        // Initializes the graph
        this.initGraph();

        // Create the initial pointer node
        const initNode: NodeData = {
            id: "initPointer",
            value: "",
            x: initPointerX,
            y: initPointerY,
            class: "pointer"
        };
        this.nodes.push(initNode);

        // Create the node cursor (invisible by default)
        const nodeCursor: NodeData = {
            id: "nodeCursor",
            value: "",
            x: 0,
            y: 0,
            class: "nodeCursor",
            opacity: 0
        };
        this.nodes.push(nodeCursor);

        // Render the initial graph and center the canvas
        this.transferTreeToGraph();
        this.centerCanvas(true);

        this.isInit = true;
    }

    /**
     * Resets the binary search tree structure.
     *
     * Calls the reset method from the parent class.
     * Clears all tree nodes.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;
        super.resetStructure();
        this.treeNodes = [];
    }

    /**
     * Inserts a new node into the binary search tree.
     * @param key - The value of the new node to insert.
     * @returns A promise that resolves when the insertion animation is complete.
     *
     * These functions are called from the user interface when the user triggers an insertion.
     */
    public async insertNode(key: string|number): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the root node and start the insertion
        const rootNode: TreeNodeData = this.treeNodes[0];
        if (this.treeNodes.length > 1) this.showNodeCursor(); // Show the cursor if the tree is not empty
        await this.addNodeWithAnimation(rootNode.id, key);    // Add the node with an animation
        this.hideNodeCursor();  // Hide the cursor after insertion

        await this.afterAnimationEnds();
    }

    /**
     * Deletes a node from the binary search tree.
     * @param key - The value of the node to delete.
     * @returns A promise that resolves when the deletion animation is complete.
     *
     * These functions are called from the user interface when the user triggers a deletion.
     */
    public async deleteNode(key: string|number): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the tree is empty or only has the root node
        if (this.treeNodes.length <= 2) {
            this.log("tree.deleteEmpty");  // Log that the tree is already empty
            this.afterAnimationWithoutChange();
            return;
        }

        // Proceed with the deletion if the tree has more nodes
        const rootNode: TreeNodeData = this.treeNodes[0];
        this.showNodeCursor();  // Show the cursor during deletion
        await this.removeNodeWithAnimation(rootNode.id, key);  // Remove the node with animation
        this.hideNodeCursor();  // Hide the cursor after deletion

        await this.afterAnimationEnds();
    }

    /**
     * Searches for a node in the binary search tree.
     * @param key - The value of the node to search for.
     * @returns A promise that resolves when the search animation is complete.
     *
     * This function is called from the user interface when the user triggers a search.
     */
    public async searchNode(key: string|number): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Get the root node to start the search
        const rootNode: TreeNodeData = this.treeNodes[0];
        this.showNodeCursor();  // Highlight the starting point
        await this.searchNodeWithAnimation(rootNode.id, key);  // Execute the search animation
        this.hideNodeCursor();  // Hide the cursor after the search is done

        await this.afterAnimationEnds();
    }

    /**
     * Performs a pre-order traversal of the binary search tree.
     * @returns A promise that resolves when the traversal animation is complete.
     *
     * This function is called from the user interface when the user triggers a pre-order traversal.
     */
    public async preOrderTraversal(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        this.log("PreOrder:");
        await this.wait(1.5);
        await this.beforeAnimationStarts();

        // Initialize traversal output and enable logging
        this.traversalOutput = "PreOrder: ";
        this.isTraversalLogging = true;

        // Start traversal from the root node
        const rootNode: TreeNodeData = this.treeNodes[0];
        if (rootNode.class != "nullNode") {
            this.showNodeCursor();  // Show the cursor to indicate traversal start
            await this.preOrderWithAnimation(rootNode.id);  // Traverse the tree in pre-order
            this.hideNodeCursor();  // Hide the cursor when traversal is complete
        }

        // Disable traversal logging after completion
        this.isTraversalLogging = false;
        await this.afterAnimationEnds();
    }

    /**
     * Performs an in-order traversal of the binary search tree.
     * @returns A promise that resolves when the traversal animation is complete.
     *
     * This function is called from the user interface when the user triggers an in-order traversal.
     */
    public async inOrderTraversal(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        this.log("InOrder:");
        await this.wait(1.5);
        await this.beforeAnimationStarts();

        // Initialize traversal output and enable logging
        this.traversalOutput = "InOrder: ";
        this.isTraversalLogging = true;

        // Start traversal from the root node
        const rootNode: TreeNodeData = this.treeNodes[0];
        if (rootNode.class != "nullNode") {
            this.showNodeCursor();  // Show the cursor to indicate traversal start
            await this.inOrderWithAnimation(rootNode.id);  // Traverse the tree in in-order
            this.hideNodeCursor();  // Hide the cursor when traversal is complete
        }

        // Disable traversal logging after completion
        this.isTraversalLogging = false;
        await this.afterAnimationEnds();
    }

    /**
     * Performs a post-order traversal of the binary search tree.
     * @returns A promise that resolves when the traversal animation is complete.
     *
     * This function is called from the user interface when the user triggers a post-order traversal.
     */
    public async postOrderTraversal(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        this.log("PostOrder:");
        await this.wait(1.5);
        await this.beforeAnimationStarts();

        // Initialize traversal output and enable logging
        this.traversalOutput = "PostOrder: ";
        this.isTraversalLogging = true;

        // Start traversal from the root node
        const rootNode: TreeNodeData = this.treeNodes[0];
        if (rootNode.class != "nullNode") {
            this.showNodeCursor();  // Show the cursor to indicate traversal start
            await this.postOrderWithAnimation(rootNode.id);  // Traverse the tree in post-order
            this.hideNodeCursor();  // Hide the cursor when traversal is complete
        }

        // Disable traversal logging after completion
        this.isTraversalLogging = false;
        await this.afterAnimationEnds();
    }

    /**
     * Performs a level-order traversal of the binary search tree.
     * @returns A promise that resolves when the traversal animation is complete.
     *
     * This function is called from the user interface when the user triggers a level-order traversal.
     */
    public async levelOrderTraversal(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        this.log("LevelOrder:");
        await this.wait(1.5);
        await this.beforeAnimationStarts();

        // Initialize traversal output and enable logging
        this.traversalOutput = "LevelOrder: ";
        this.isTraversalLogging = true;

        // Start traversal from the root node
        const rootNode: TreeNodeData = this.treeNodes[0];
        if (rootNode.class != "nullNode") {
            await this.levelOrderWithAnimation(rootNode.id);  // Traverse the tree in level-order
        }

        // Disable traversal logging after completion
        this.isTraversalLogging = false;
        await this.afterAnimationEnds();
    }

    /**
     * Animates and displays the calculating of height in the binary search tree.
     * @returns A promise that resolves when the height calculation animation is complete.
     *
     * This function is called from the user interface when the user triggers the height calculation.
     */
    public async showHeight(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Calculate the height of the tree starting from the root node
        const rootNode: TreeNodeData = this.treeNodes[0];
        const height: number = await this.heightWithAnimation(rootNode.id);

        // Log the calculated height
        this.log("tree.height", { height });
        await this.wait(1.5);

        await this.afterAnimationEnds();
    }

    /**
     * Generates a random binary search tree structure.
     *
     * This function is triggered when the user requests a randomly generated tree.
     * The tree will have a random number of nodes (between 3 and 7) with unique values.
     */
    public randomStructure(): void {
        super.randomStructure(); // Calls the parent randomStructure method
        this.initStructure();    // Initializes the binary search tree structure


        // Determine the number of nodes (between 3 and 7)
        const nodeCount = Math.floor(Math.random() * (7 - 3 + 1)) + 3;

        // Generate unique random keys for the nodes
        const keys = Array.from(new Set<number>(
            Array.from({ length: nodeCount }, () => Math.floor(Math.random() * 100))
        ));

        if (this.treeNodes.length === 0) return;

        const nodeMap: Record<string, TreeNodeData> = {};

        // Replace the nullNode with the root node
        const rootKey = keys.shift()!;
        const rootNode = this.treeNodes[0];
        rootNode.id = String(rootKey);
        rootNode.value = String(rootKey);
        rootNode.class = "defaultNode";

        // Map the root node and create its null children
        nodeMap[rootNode.id] = rootNode;
        this.createNullChildren(rootNode, nodeMap);
        this.transferTreeToGraph();

        // Add remaining nodes to the tree
        for (const key of keys) {
            const newNode: TreeNodeData = {
                id: String(key),
                value: String(key),
                x: 0,
                y: 0,
                left: null,
                right: null,
                class: "defaultNode",
                opacity: 1
            };

            nodeMap[newNode.id] = newNode;

            // Insert the node into the tree
            this.insertIntoTreeById(rootNode.id, newNode, nodeMap);
            this.transferTreeToGraph();
        }

        // Center the canvas after generating the structure
        this.centerCanvas(true);
    }

    /**
     * Inserts a node into the binary search tree at the correct position.
     * @param currentId - The ID of the current node being compared.
     * @param node - The new node to insert.
     * @param nodeMap - A map of all nodes by ID.
     *
     * Handles 2 cases:
     * 1. The new node's value is smaller than the current node's value:
     *    - If the left child is a null node, replace it with the new node.
     *    - If not, recursively call the function on the left child.
     *
     * 2. The new node's value is greater or equal to the current node's value:
     *    - If the right child is a null node, replace it with the new node.
     *    - If not, recursively call the function on the right child.
     */
    protected insertIntoTreeById(currentId: string, node: TreeNodeData, nodeMap: Record<string, TreeNodeData>): void {
        const current = nodeMap[currentId];

        // Case 1: New node's value is smaller, go to the left subtree
        if (Number(node.value) < Number(current.value)) {
            if (this.isNullNode(current.left)) {
                this.replaceNullNode(current, "left", node, nodeMap);  // Replace left null node
            } else {
                this.insertIntoTreeById(String(current.left), node, nodeMap);  // Recursive call to the left
            }
        }
        // Case 2: New node's value is greater or equal, go to the right subtree
        else {
            if (this.isNullNode(current.right)) {
                this.replaceNullNode(current, "right", node, nodeMap);  // Replace right null node
            } else {
                this.insertIntoTreeById(String(current.right), node, nodeMap);  // Recursive call to the right
            }
        }
    }

    /**
     * Replaces a null node with a new tree node.
     * @param parent - The parent node containing the null node.
     * @param direction - The direction ("left" or "right") where the null node is located.
     * @param newNode - The new node to be inserted in place of the null node.
     * @param nodeMap - A map of all nodes by ID.
     *
     * This method removes the null node, updates the parent node with the new node,
     * and creates new null children for the inserted node.
     */
    protected replaceNullNode(
        parent: TreeNodeData, direction: "left" | "right",
        newNode: TreeNodeData, nodeMap: Record<string, TreeNodeData>): void {

        // Get the ID of the null node to be replaced
        const nullId = parent[direction] as string;

        // Remove the null node from the tree and the node map
        this.treeNodes = this.treeNodes.filter(n => n.id !== nullId);
        delete nodeMap[nullId];

        // Assign the new node to the parent in the specified direction
        parent[direction] = newNode.id;
        nodeMap[newNode.id] = newNode;
        this.treeNodes.push(newNode);

        // Create left and right null children for the new node
        this.createNullChildren(newNode, nodeMap);

        this.transferTreeToGraph();
    }


    /**
     * Creates null child nodes for a given parent node.
     * @param parent - The parent node for which null children are created.
     * @param nodeMap - A map of all nodes by ID.
     *
     * This function generates two null nodes (left and right) as children of the given parent node.
     */
    protected createNullChildren(parent: TreeNodeData, nodeMap: Record<string, TreeNodeData>): void {
        // Generate unique IDs for the left and right null nodes
        const leftNullId = `null-${parent.id}-left`;
        const rightNullId = `null-${parent.id}-right`;

        // Create the left null node
        const leftNullNode: TreeNodeData = {
            id: leftNullId,
            value: "NULL",
            x: 0,
            y: 0,
            left: null,
            right: null,
            class: "nullNode",
            opacity: 1
        };

        // Create the right null node
        const rightNullNode: TreeNodeData = {
            id: rightNullId,
            value: "NULL",
            x: 0,
            y: 0,
            left: null,
            right: null,
            class: "nullNode",
            opacity: 1
        };

        // Check and assign the left null node
        if (parent.left === null) {
            parent.left = leftNullId;
        }

        // Check and assign the right null node
        if (parent.right === null) {
            parent.right = rightNullId;
        }

        // Add the created null nodes to the node map and the tree
        nodeMap[leftNullId] = leftNullNode;
        nodeMap[rightNullId] = rightNullNode;
        this.treeNodes.push(leftNullNode);
        this.treeNodes.push(rightNullNode);

        this.transferTreeToGraph();
    }
}