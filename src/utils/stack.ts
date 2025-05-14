import {StylesheetJsonBlock} from "cytoscape";
import ArrayStructure from "@/utils/base/arrayStructure";
import {NodeData} from "@/utils/base/baseStructure";

// Constants defining the size of the "top" pointer in the stack visualization
const topNodeHeight: number = 60
const topNodeWidth: number = 40

/**
 * StackClass - Represents a visualized stack using Cytoscape.js.
 * This class inherits from ArrayStructure and visualizes stack operations.
 */
export default class StackClass extends ArrayStructure {
    protected topIndex: number|null;

    /**
     * Constructor to create a new visual stack.
     * @param containerId - The ID of the HTML element where the stack is displayed.
     */
    constructor(containerId: string) {
        super(containerId);
        this.topIndex = null;
        this.paddingForCentering = 170;
    }

    /**
     * Adds a new element to the stack.
     * If the stack is empty, it initializes the top index.
     * @param element - The value to add to the stack.
     */
    protected insertToArray(element: string): void {
        // Check if the stack is empty and set top index to 0
        if (this.topIndex == null) {
            this.topIndex = 0;
        } else {
            // Move the top index up to add the new element
            this.topIndex++;
        }
        // Set the value at the new top index
        this.structureNodeArray[this.topIndex].value = element;
    }

    /**
     * Initializes the visual representation of the stack.
     * Sets up a custom style for the "top" node.
     */
    protected initGraph(): void {
        super.initGraph();

        // Define the visual style for the top node of the stack
        const newNodeStyle: StylesheetJsonBlock = {
            selector: ".topNode",
            style: {
                "width": topNodeWidth,
                "height": topNodeHeight,
                "shape": "rectangle",
                "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA0MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIwLjc5OTgwNSIgeT0iMC43OTk5ODgiIHdpZHRoPSIzOC40IiBoZWlnaHQ9IjM5LjIiIGZpbGw9IiM0NUU2RkYiLz4KPHBhdGggZD0iTTUuNDU1OSAxNS42NzVMNS43MDU5IDE0LjE2MzZIMTQuNzExNkwxNC40NjE2IDE1LjY3NUgxMC44MzA5TDkuMTQ5MDkgMjUuOEg3LjM5OTA4TDkuMDgwOSAxNS42NzVINS40NTU5Wk0yNS4zMjY2IDIwLjA5NTRDMjUuMTIyMSAyMS4zMTg5IDI0LjcyNDQgMjIuMzY4MiAyNC4xMzM1IDIzLjI0MzJDMjMuNTQ2MyAyNC4xMTgyIDIyLjgyNjYgMjQuNzkwNSAyMS45NzQ0IDI1LjI2MDJDMjEuMTI1OSAyNS43MjYxIDIwLjIwOTIgMjUuOTU5MSAxOS4yMjQ0IDI1Ljk1OTFDMTguMTk3OSAyNS45NTkxIDE3LjMyMSAyNS43MTQ4IDE2LjU5MzcgMjUuMjI2MUMxNS44NzAyIDI0LjczMzcgMTUuMzUxMyAyNC4wMzQ4IDE1LjAzNjkgMjMuMTI5NUMxNC43MjI1IDIyLjIyMDQgMTQuNjY5NCAyMS4xMzcxIDE0Ljg3NzggMTkuODc5NUMxNS4wODIzIDE4LjY1NiAxNS40NzgyIDE3LjYwNjggMTYuMDY1MyAxNi43MzE4QzE2LjY1NjIgMTUuODUzIDE3LjM3NzggMTUuMTc4OCAxOC4yMzAxIDE0LjcwOTFDMTkuMDg2MSAxNC4yMzk0IDIwLjAxMDQgMTQuMDA0NSAyMS4wMDI4IDE0LjAwNDVDMjIuMDIxNyAxNC4wMDQ1IDIyLjg5MSAxNC4yNTA3IDIzLjYxMDcgMTQuNzQzMkMyNC4zMzQyIDE1LjIzMTggMjQuODUzMiAxNS45MzI2IDI1LjE2NzYgMTYuODQ1NEMyNS40ODE5IDE3Ljc1NDUgMjUuNTM1IDE4LjgzNzkgMjUuMzI2NiAyMC4wOTU0Wk0yMy42MTY0IDE5Ljg3OTVDMjMuNzcxNyAxOC45NTE1IDIzLjc1MjggMTguMTcxMiAyMy41NTk2IDE3LjUzODZDMjMuMzcwMiAxNi45MDIzIDIzLjA0NjMgMTYuNDIxMiAyMi41ODggMTYuMDk1NEMyMi4xMjk3IDE1Ljc2OTcgMjEuNTc2NiAxNS42MDY4IDIwLjkyODkgMTUuNjA2OEMyMC4yMzk1IDE1LjYwNjggMTkuNTkzNyAxNS43ODEgMTguOTkxNCAxNi4xMjk1QzE4LjM5MjkgMTYuNDc4IDE3Ljg4MTYgMTYuOTg1NiAxNy40NTczIDE3LjY1MjNDMTcuMDMzMSAxOC4zMTg5IDE2Ljc0MzMgMTkuMTMzMyAxNi41ODggMjAuMDk1NEMxNi40Mjg5IDIxLjAyMzUgMTYuNDQ2IDIxLjgwMzggMTYuNjM5MSAyMi40MzY0QzE2LjgzMjMgMjMuMDY4OSAxNy4xNTgxIDIzLjU0ODEgMTcuNjE2NCAyMy44NzM5QzE4LjA3ODUgMjQuMTk1OCAxOC42MzM1IDI0LjM1NjggMTkuMjgxMiAyNC4zNTY4QzE5Ljk2NjggMjQuMzU2OCAyMC42MDg4IDI0LjE4NDUgMjEuMjA3MyAyMy44Mzk4QzIxLjgwOTYgMjMuNDkxMyAyMi4zMjI5IDIyLjk4NTYgMjIuNzQ3MSAyMi4zMjI3QzIzLjE3MTMgMjEuNjU2IDIzLjQ2MTEgMjAuODQxNyAyMy42MTY0IDE5Ljg3OTVaTTI2LjU2NjcgMjUuOEwyOC40OTg1IDE0LjE2MzZIMzIuNjQ2MkMzMy41NDc4IDE0LjE2MzYgMzQuMjY3NSAxNC4zMjg0IDM0LjgwNTMgMTQuNjU3OUMzNS4zNDcgMTQuOTg3NSAzNS43MTgyIDE1LjQzNjQgMzUuOTE5IDE2LjAwNDVDMzYuMTIzNSAxNi41NzI3IDM2LjE2NzEgMTcuMjE0OCAzNi4wNDk3IDE3LjkzMDdDMzUuOTI4NCAxOC42NDY2IDM1LjY3MDkgMTkuMjkwNSAzNS4yNzY5IDE5Ljg2MjVDMzQuODg2OCAyMC40MzA3IDM0LjM2NTkgMjAuODgxNCAzMy43MTQ0IDIxLjIxNDhDMzMuMDYyOSAyMS41NDQzIDMyLjI4ODMgMjEuNzA5MSAzMS4zOTA2IDIxLjcwOTFIMjguNTMyNkwyOC43NzY5IDIwLjIyMDRIMzEuNDcwMUMzMi4wNDIxIDIwLjIyMDQgMzIuNTIzMSAyMC4xMjIgMzIuOTEzMyAxOS45MjVDMzMuMzA3MiAxOS43MjQyIDMzLjYxNTkgMTkuNDUxNSAzMy44Mzk0IDE5LjEwNjhDMzQuMDYyOSAxOC43NTgzIDM0LjIwODcgMTguMzY2MyAzNC4yNzY5IDE3LjkzMDdDMzQuMzQ4OSAxNy40ODc1IDM0LjMzIDE3LjA5NzMgMzQuMjIwMSAxNi43NjAyQzM0LjExMDMgMTYuNDE5MyAzMy44OTI1IDE2LjE1MjMgMzMuNTY2NyAxNS45NTkxQzMzLjI0NDcgMTUuNzY1OSAzMi43OTQgMTUuNjY5MyAzMi4yMTQ0IDE1LjY2OTNIMzAuMDA5OUwyOC4zMjI0IDI1LjhIMjYuNTY2N1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xOS4yOTI5IDU5LjcwNzFDMTkuNjgzNCA2MC4wOTc2IDIwLjMxNjYgNjAuMDk3NiAyMC43MDcxIDU5LjcwNzFMMjcuMDcxMSA1My4zNDMxQzI3LjQ2MTYgNTIuOTUyNiAyNy40NjE2IDUyLjMxOTUgMjcuMDcxMSA1MS45Mjg5QzI2LjY4MDUgNTEuNTM4NCAyNi4wNDc0IDUxLjUzODQgMjUuNjU2OSA1MS45Mjg5TDIwIDU3LjU4NThMMTQuMzQzMSA1MS45Mjg5QzEzLjk1MjYgNTEuNTM4NCAxMy4zMTk1IDUxLjUzODQgMTIuOTI4OSA1MS45Mjg5QzEyLjUzODQgNTIuMzE5NSAxMi41Mzg0IDUyLjk1MjYgMTIuOTI4OSA1My4zNDMxTDE5LjI5MjkgNTkuNzA3MVpNMTkgNDBWNTlIMjFWNDBIMTlaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K",
            }
        };

        // Add the new style to the graph
        this.graph.style().fromJson([...this.graph.style().json(), newNodeStyle]);
    }


    /**
     * Resets the stack to an empty state.
     * Clears all elements and resets the top index.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;
        super.resetStructure();
        this.topIndex = null;
    }

    /**
     * Adds a new element to the stack with an animation.
     * If the stack is full, logs an error and stops.
     * @param element - The value to add.
     */
    public async addElement(element: string): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the stack is already full
        if (this.topIndex! >= this.initNumber-1) {
            this.log("stack.addFull");
            this.afterAnimationWithoutChange();
            return;
        }

        // Insert the element into the array
        this.insertToArray(element);

        // Update the graph with the new element
        this.setAndUpdateGraph();
        await this.afterAnimationEnds();
    }


    /**
     * Removes the top element from the stack with an animation.
     * If the stack is empty, logs an error and stops.
     */
    public async removeElement(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the stack is empty
        if (this.topIndex == null) {
            this.log("stack.removeEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Clear the value at the current top index
        this.structureNodeArray[this.topIndex].value = "";

        // Move the top index down or set to null if empty
        if (this.topIndex === 0) {
            this.topIndex = null;
        } else {
            this.topIndex--;
        }

        // Update the graph after removing the element
        this.setAndUpdateGraph();
        await this.afterAnimationEnds();
    }

    /**
     * Checks if the stack is empty and logs the result.
     */
    public async isEmpty(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        if (this.topIndex == null)
            this.log("stack.empty");
        else
            this.log("stack.notEmpty");

        await this.afterAnimationEnds();
    }

    /**
     * Checks if the stack is full and logs the result.
     */
    public async isFull(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        if (this.topIndex === this.initNumber-1)
            this.log("stack.full");
        else
            this.log("stack.notFull");

        await this.afterAnimationEnds();
    }

    /**
     * Shows the top element of the stack with a temporary visual pointer.
     * If the stack is empty, logs an error.
     */
    public async foremostElement(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // If the stack is empty, log an error
        if (this.topIndex === null) {
            this.log("stack.topError");
            this.afterAnimationWithoutChange();
            return;
        }

        // Get the current top element
        const topNode: NodeData = this.structureNodeArray[this.topIndex];
        if (!topNode) {
            console.warn("No node found at topIndex.");
            this.afterAnimationWithoutChange();
            return;
        }

        // Create a temporary pointer for the top node and animate it
        const topPointer: NodeData = {
            id: "top",
            x: topNode.x,
            y: topNode.y - 60,
            opacity: 0,
            class: "topNode",
        }
        await this.addTempNodeWithAnimation(topPointer);

        // Log the value of the top element
        this.log("stack.top", { value: topNode.value });
        this.setAndUpdateGraph();

        await this.wait(2);

        // Remove the temporary pointer after a short delay
        const nodeToDelete: NodeData = this.tempNodeArray.find(node => node.id === "top")!;
        await this.deleteTempNodeWithAnimation(nodeToDelete);

        this.setAndUpdateGraph();
        await this.afterAnimationEnds();
    }
}