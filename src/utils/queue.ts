import cytoscape, {StylesheetJson} from "cytoscape";
import ArrayStructure from "@/utils/base/arrayStructure";
import {EdgeData, NodeData} from "@/utils/base/baseStructure";

// Define constants for visual element dimensions
const nodeHeight: number = 50
const nodeWidth: number = 50
const frontPtrWidth: number = 51
const frontPtrHeight: number = 46
const begEndPtrWidth: number = 33
const begEndPtrHeight: number = 50
const indexHeight: number = 20

/**
 * QueueClass - Represents a visualized queue using Cytoscape.js.
 * This class inherits from ArrayStructure and visualizes queue operations.
 */
export default class QueueClass extends ArrayStructure {
    protected beginIndex: number;
    protected endIndex: number;

    /**
     * Constructor to create a new visual queue.
     * @param containerId - The ID of the HTML element where the queue is displayed.
     */
    constructor(containerId: string) {
        super(containerId);
        this.beginIndex = 0;
        this.endIndex = 0;

        this.paddingForCentering = 170;
    }

    /**
     * Adds an edge to the graph with a fade-in animation.
     * @param edge - The edge data containing source and target nodes.
     */
    protected async addEdgeWithAnimation(edge: EdgeData): Promise<void> {
        this.edges.push(edge);
        this.setAndUpdateGraph();

        const element = this.graph.$(`edge[source="${edge.source}"][target="${edge.target}"]`);

        // Animate edge appearance
        element.animate(
            { style: { opacity: 1 } },
            { duration: 500 }
        );
        element.style({ opacity: 1 });

        await this.wait();
        this.edges[this.edges.length-1].opacity = 1;
    }

    /**
     * Removes the last edge from the graph with a fade-out animation.
     */
    protected async removeEdgeWithAnimation(): Promise<void> {
        const edge: EdgeData = this.edges[this.edges.length - 1];
        const element = this.graph.$(`edge[source="${edge.source}"][target="${edge.target}"]`);

        // Animate edge disappearance
        element.style({ display: 'element', opacity: 1 });
        element.animate(
            { style: { opacity: 0 } },
            { duration: 500 }
        );
        await this.wait();
        this.edges.splice(this.edges.length - 1, 1);
    }

    /**
     * Updates the graphical pointers for the beginning and end of the queue.
     */
    protected updateBeginAndEndPtrs(): void {
        const begin: NodeData = this.structureNodeArray[this.beginIndex];
        const xBeg: number = begin.x;
        const yBeg: number = begin.y + 80;

        const end: NodeData = this.structureNodeArray[this.endIndex];
        const xEnd: number = end.x;
        const yEnd: number = end.y + 80;

        if (this.isInit === false) {
            // Initialize pointers for the beginning and end when the queue is empty
            let tempPtr: NodeData = {
                id: "begAndEnd",
                x: xBeg,
                y: yBeg,
                opacity: 1,
                class: "beginAndEndPtr"
            }
            this.tempNodeArray.push(tempPtr);

            tempPtr = {
                id: "begin",
                x: xBeg,
                y: yBeg,
                opacity: 0,
                class: "beginPtr",
            }
            this.tempNodeArray.push(tempPtr);

            tempPtr = {
                id: "end",
                x: xBeg,
                y: yBeg,
                opacity: 0,
                class: "endPtr",
            }
            this.tempNodeArray.push(tempPtr);
        }
        else {
            // Update pointer positions when the queue is not empty
            if (this.beginIndex === this.endIndex) {
                let ptrIndex: number = this.tempNodeArray.findIndex(node => node.id === "begAndEnd");
                this.tempNodeArray[ptrIndex].opacity = 1;
                this.tempNodeArray[ptrIndex].x = xBeg;
                this.tempNodeArray[ptrIndex].y = yBeg;

                ptrIndex = this.tempNodeArray.findIndex(node => node.id === "begin");
                this.tempNodeArray[ptrIndex].opacity = 0;

                ptrIndex = this.tempNodeArray.findIndex(node => node.id === "end");
                this.tempNodeArray[ptrIndex].opacity = 0;
            }
            else {
                let ptrIndex: number = this.tempNodeArray.findIndex(node => node.id === "begAndEnd");
                this.tempNodeArray[ptrIndex].opacity = 0;

                ptrIndex = this.tempNodeArray.findIndex(node => node.id === "begin");
                this.tempNodeArray[ptrIndex].opacity = 1;
                this.tempNodeArray[ptrIndex].x = xBeg;
                this.tempNodeArray[ptrIndex].y = yBeg;

                ptrIndex = this.tempNodeArray.findIndex(node => node.id === "end");
                this.tempNodeArray[ptrIndex].opacity = 1;
                this.tempNodeArray[ptrIndex].x = xEnd;
                this.tempNodeArray[ptrIndex].y = yEnd;
            }
        }
    }

    /**
     * Updates the graphical pointers and then the graph.
     * Extends the parent class method to include pointers.
     */
    protected setAndUpdateGraph(): void {
        this.updateBeginAndEndPtrs();
        super.setAndUpdateGraph();
    }

    /**
     * Inserts a new element into the queue array.
     * @param element - The element to be inserted into the queue.
     */
    protected insertToArray(element: string): void {
        this.structureNodeArray[this.endIndex].value = element;
        this.structureNodeArray[this.endIndex].class = "arrayColorNode";
        this.setAndUpdateGraph();

        this.endIndex++;
    }

    /**
     * Initializes the graph with predefined styles and settings.
     * Sets up the graphical representation of the queue.
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
                selector: ".arrayColorNode",
                style: {
                    "width": nodeWidth,
                    "height": nodeHeight,
                    "shape": "rectangle",
                    "border-color": "black",
                    "border-width": 1,
                    "background-width": "100%",
                    "background-height": "100%",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI1OSIgaGVpZ2h0PSI1OSIgZmlsbD0iIzg0REVGRiIgc3Ryb2tlPSJibGFjayIvPgo8L3N2Zz4K",
                    "label": "data(value)",
                    "text-valign": "center",
                    "text-halign": "center",
                    "color": "black",
                    "font-size": 16
                }
            },
            {
                selector: ".frontPtr",
                style: {
                    "width": frontPtrWidth,
                    "height": frontPtrHeight,
                    "shape": "rectangle",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEiIGhlaWdodD0iNDYiIHZpZXdCb3g9IjAgMCA1MSA0NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUxIiBoZWlnaHQ9IjQ2IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNzkyOSAwLjUxMjUxMUMyNS4xODM0IDAuMTIxOTg3IDI1LjgxNjYgMC4xMjE5ODcgMjYuMjA3MSAwLjUxMjUxMUwzMi41NzExIDYuODc2NDdDMzIuOTYxNiA3LjI2NyAzMi45NjE2IDcuOTAwMTYgMzIuNTcxMSA4LjI5MDY5QzMyLjE4MDUgOC42ODEyMSAzMS41NDc0IDguNjgxMjEgMzEuMTU2OSA4LjI5MDY5TDI1LjUgMi42MzM4M0wxOS44NDMxIDguMjkwNjlDMTkuNDUyNiA4LjY4MTIxIDE4LjgxOTUgOC42ODEyMSAxOC40Mjg5IDguMjkwNjlDMTguMDM4NCA3LjkwMDE2IDE4LjAzODQgNy4yNjcgMTguNDI4OSA2Ljg3NjQ3TDI0Ljc5MjkgMC41MTI1MTFaTTI0LjUgMjYuNDE4OVYxLjIxOTYySDI2LjVWMjYuNDE4OUgyNC41WiIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeT0iMjYiIHdpZHRoPSI1MSIgaGVpZ2h0PSIyMCIgZmlsbD0iIzQ1RTZGRiIvPgo8cGF0aCBkPSJNMi4xNzk1MSA0MUwzLjg2OTg1IDMwLjgxODJIMTAuMTgzOEw5Ljk2NTAyIDMyLjE0MDZINS4xODczMkw0LjY3MDI4IDM1LjI0MjlIOC45OTU1Nkw4Ljc3NjgxIDM2LjU2MDRINC40NTE1M0wzLjcxNTczIDQxSDIuMTc5NTFaTTEwLjM4MjYgNDFMMTIuMDczIDMwLjgxODJIMTUuNzAyMkMxNi40OTExIDMwLjgxODIgMTcuMTIyNSAzMC45NTQxIDE3LjU5NjQgMzEuMjI1OUMxOC4wNzM3IDMxLjQ5NDMgMTguNDAxOCAzMS44Njg4IDE4LjU4MDggMzIuMzQ5NEMxOC43NjMxIDMyLjgyNjcgMTguODAyOSAzMy4zODAyIDE4LjcwMDEgMzQuMDA5OUMxOC41OTQgMzQuNjMzIDE4LjM3MDMgMzUuMTc5OSAxOC4wMjg5IDM1LjY1MDZDMTcuNjkwOSAzNi4xMjEyIDE3LjIzODUgMzYuNDg5MSAxNi42NzE3IDM2Ljc1NDNDMTYuMTA4MyAzNy4wMTYxIDE1LjQzMjEgMzcuMTQ3IDE0LjY0MzMgMzcuMTQ3SDExLjg5NEwxMi4xMjI3IDM1LjgyNDZIMTQuNzMyOEMxNS4yMzMzIDM1LjgyNDYgMTUuNjUwOSAzNS43NTMzIDE1Ljk4NTYgMzUuNjEwOEMxNi4zMjA0IDM1LjQ2ODMgMTYuNTgyMiAzNS4yNjExIDE2Ljc3MTEgMzQuOTg5M0MxNi45NjM0IDM0LjcxNzYgMTcuMDg5MyAzNC4zOTExIDE3LjE0OSAzNC4wMDk5QzE3LjIxMTkgMzMuNjIyMiAxNy4xOTM3IDMzLjI4OTEgMTcuMDk0MyAzMy4wMTA3QzE2Ljk5NDkgMzIuNzI4OSAxNi44MDEgMzIuNTEzNSAxNi41MTI2IDMyLjM2NDNDMTYuMjI0MyAzMi4yMTE5IDE1LjgyODIgMzIuMTM1NyAxNS4zMjQ0IDMyLjEzNTdIMTMuMzk1NEwxMS45MTg5IDQxSDEwLjM4MjZaTTE2LjE2OTYgMzYuNDA2MkwxNy45MjQ1IDQxSDE2LjE3NDVMMTQuNDY0MyAzNi40MDYySDE2LjE2OTZaTTI5LjEyMTggMzYuMDA4NUMyOC45NDI4IDM3LjA3OTEgMjguNTk0OCAzNy45OTcyIDI4LjA3NzggMzguNzYyOEMyNy41NjQgMzkuNTI4NCAyNi45MzQzIDQwLjExNjcgMjYuMTg4NiA0MC41Mjc3QzI1LjQ0NjEgNDAuOTM1NCAyNC42NDQxIDQxLjEzOTIgMjMuNzgyMyA0MS4xMzkyQzIyLjg4NDEgNDEuMTM5MiAyMi4xMTY4IDQwLjkyNTQgMjEuNDgwNSA0MC40OTc5QzIwLjg0NzQgNDAuMDY3IDIwLjM5MzMgMzkuNDU1NSAyMC4xMTgzIDM4LjY2MzRDMTkuODQzMiAzNy44Njc5IDE5Ljc5NjggMzYuOTIgMTkuOTc5IDM1LjgxOTZDMjAuMTU4IDM0Ljc0OTEgMjAuNTA0NCAzMy44MzEgMjEuMDE4MSAzMy4wNjUzQzIxLjUzNTIgMzIuMjk2NCAyMi4xNjY1IDMxLjcwNjQgMjIuOTEyMyAzMS4yOTU1QzIzLjY2MTMgMzAuODg0NSAyNC40NzAxIDMwLjY3OSAyNS4zMzg0IDMwLjY3OUMyNi4yMyAzMC42NzkgMjYuOTkwNiAzMC44OTQ0IDI3LjYyMDQgMzEuMzI1M0MyOC4yNTM0IDMxLjc1MjggMjguNzA3NSAzMi4zNjYgMjguOTgyNiAzMy4xNjQ4QzI5LjI1NzcgMzMuOTYwMiAyOS4zMDQxIDM0LjkwODEgMjkuMTIxOCAzNi4wMDg1Wk0yNy42MjU0IDM1LjgxOTZDMjcuNzYxMiAzNS4wMDc2IDI3Ljc0NDcgMzQuMzI0OCAyNy41NzU2IDMzLjc3MTNDMjcuNDA5OSAzMy4yMTQ1IDI3LjEyNjUgMzIuNzkzNiAyNi43MjU1IDMyLjUwODVDMjYuMzI0NSAzMi4yMjM1IDI1Ljg0MDYgMzIuMDgxIDI1LjI3MzggMzIuMDgxQzI0LjY3MDYgMzIuMDgxIDI0LjEwNTUgMzIuMjMzNCAyMy41Nzg1IDMyLjUzODRDMjMuMDU0OCAzMi44NDMzIDIyLjYwNzQgMzMuMjg3NCAyMi4yMzYyIDMzLjg3MDdDMjEuODY0OSAzNC40NTQxIDIxLjYxMTQgMzUuMTY2NyAyMS40NzU1IDM2LjAwODVDMjEuMzM2MyAzNi44MjA1IDIxLjM1MTIgMzcuNTAzMyAyMS41MjAyIDM4LjA1NjhDMjEuNjg5MyAzOC42MTAzIDIxLjk3NDMgMzkuMDI5NiAyMi4zNzU0IDM5LjMxNDZDMjIuNzc5NyAzOS41OTY0IDIzLjI2NTMgMzkuNzM3MiAyMy44MzIgMzkuNzM3MkMyNC40MzE5IDM5LjczNzIgMjQuOTkzNyAzOS41ODY0IDI1LjUxNzQgMzkuMjg0OEMyNi4wNDQ0IDM4Ljk3OTkgMjYuNDkzNSAzOC41Mzc0IDI2Ljg2NDcgMzcuOTU3NEMyNy4yMzU5IDM3LjM3NDEgMjcuNDg5NSAzNi42NjE1IDI3LjYyNTQgMzUuODE5NlpNNDAuMTE1MiAzMC44MTgyTDM4LjQyNDkgNDFIMzcuMDEzTDMzLjA4MDQgMzMuNTMyN0gzMi45OTA5TDMxLjc0MzEgNDFIMzAuMjA2OUwzMS44OTcyIDMwLjgxODJIMzMuMzE5MUwzNy4yNTY2IDM4LjI5NTVIMzcuMzUxTDM4LjU5MzkgMzAuODE4Mkg0MC4xMTUyWk00MS42MzUzIDMyLjE0MDZMNDEuODU0IDMwLjgxODJINDkuNzM0TDQ5LjUxNTMgMzIuMTQwNkg0Ni4zMzg0TDQ0Ljg2NjggNDFINDMuMzM1Nkw0NC44MDcyIDMyLjE0MDZINDEuNjM1M1oiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=",
                }
            },
            {
                selector: ".beginPtr",
                style: {
                    "width": begEndPtrWidth,
                    "height": begEndPtrHeight,
                    "shape": "rectangle",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA0NSA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ1IiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOC42MDc0NSA0Mi4zOTAxTDEwLjUzOTMgMzAuNzUzOEgxMi4yMzgxTDExLjUyNzkgMzUuMDc3NkgxMS42MzAyQzExLjc1OSAzNC44OTU4IDExLjkzNTEgMzQuNjg1NiAxMi4xNTg2IDM0LjQ0N0MxMi4zODU5IDM0LjIwODMgMTIuNjc5NCAzNCAxMy4wMzkzIDMzLjgyMkMxMy4zOTkxIDMzLjY0MDEgMTMuODQ5OSAzMy41NDkyIDE0LjM5MTUgMzMuNTQ5MkMxNS4wOTYxIDMzLjU0OTIgMTUuNjk0NiAzMy43MjczIDE2LjE4NyAzNC4wODMzQzE2LjY3OTQgMzQuNDM5NCAxNy4wMjc5IDM0Ljk1MjYgMTcuMjMyNSAzNS42MjMxQzE3LjQzNyAzNi4yOTM1IDE3LjQ2MTYgMzcuMTAwNCAxNy4zMDYzIDM4LjA0MzVDMTcuMTUxIDM4Ljk4NjcgMTYuODU5MyAzOS43OTU0IDE2LjQzMTMgNDAuNDY5N0MxNi4wMDcxIDQxLjE0MDEgMTUuNDkgNDEuNjU3MiAxNC44ODAyIDQyLjAyMDhDMTQuMjcwMyA0Mi4zODA3IDEzLjYxMzEgNDIuNTYwNiAxMi45MDg2IDQyLjU2MDZDMTIuMzc4MyA0Mi41NjA2IDExLjk1OTcgNDIuNDcxNiAxMS42NTI5IDQyLjI5MzVDMTEuMzQ5OSA0Mi4xMTU1IDExLjEyMjYgNDEuOTA3MiAxMC45NzExIDQxLjY2ODVDMTAuODIzNCA0MS40Mjk5IDEwLjcxMTYgNDEuMjE3OCAxMC42MzU5IDQxLjAzMjJIMTAuNDkzOEwxMC4yNjY1IDQyLjM5MDFIOC42MDc0NVpNMTAuOTk5NSAzOC4wMjY1QzEwLjkwMSAzOC42NDAxIDEwLjkwMSAzOS4xNzggMTAuOTk5NSAzOS42NDAxQzExLjEwMTggNDAuMTAyMyAxMS4zMDA2IDQwLjQ2NCAxMS41OTYxIDQwLjcyNTRDMTEuODk1MyA0MC45ODI5IDEyLjI4NzQgNDEuMTExNyAxMi43NzIyIDQxLjExMTdDMTMuMjc5OCA0MS4xMTE3IDEzLjcyNjggNDAuOTc3MyAxNC4xMTMxIDQwLjcwODNDMTQuNDk5NSA0MC40MzU2IDE0LjgxNzcgNDAuMDY2MyAxNS4wNjc3IDM5LjYwMDRDMTUuMzE3NyAzOS4xMzQ1IDE1LjQ5MTkgMzguNjA5OCAxNS41OTA0IDM4LjAyNjVDMTUuNjgxMyAzNy40NTA3IDE1LjY3OTQgMzYuOTMzNyAxNS41ODQ3IDM2LjQ3NTRDMTUuNDkgMzYuMDE3IDE1LjI5MzEgMzUuNjU1MyAxNC45OTM4IDM1LjM5MDFDMTQuNjk4NCAzNS4xMjUgMTQuMjk1IDM0Ljk5MjQgMTMuNzgzNiAzNC45OTI0QzEzLjI5MTIgMzQuOTkyNCAxMi44NTM3IDM1LjExOTMgMTIuNDcxMSAzNS4zNzMxQzEyLjA4ODUgMzUuNjI2OSAxMS43NzIyIDM1Ljk4MSAxMS41MjIyIDM2LjQzNTZDMTEuMjcyMiAzNi44OTAxIDExLjA5OCAzNy40MjA0IDEwLjk5OTUgMzguMDI2NVpNMjIuMjI1NCA0Mi41NjYzQzIxLjM2OTMgNDIuNTY2MyAyMC42NjEgNDIuMzgyNiAyMC4xMDA0IDQyLjAxNTFDMTkuNTQzNSA0MS42NDM5IDE5LjE1MzQgNDEuMTIzMSAxOC45Mjk5IDQwLjQ1MjZDMTguNzA2NCAzOS43Nzg0IDE4LjY3MDQgMzguOTg4NiAxOC44MjE5IDM4LjA4MzNDMTguOTY5NyAzNy4xODk0IDE5LjI2NyAzNi40MDE1IDE5LjcxNCAzNS43MTk3QzIwLjE2MSAzNS4wMzc5IDIwLjcxNzggMzQuNTA1NyAyMS4zODQ0IDM0LjEyMzFDMjIuMDU0OSAzMy43NDA1IDIyLjc5NTQgMzMuNTQ5MiAyMy42MDYgMzMuNTQ5MkMyNC4wOTg1IDMzLjU0OTIgMjQuNTYyNSAzMy42MzA3IDI0Ljk5ODEgMzMuNzkzNUMyNS40Mzc1IDMzLjk1NjQgMjUuODEwNiAzNC4yMTIxIDI2LjExNzQgMzQuNTYwNkMyNi40MjQyIDM0LjkwOTEgMjYuNjM2MyAzNS4zNjE3IDI2Ljc1MzggMzUuOTE4NUMyNi44NzUgMzYuNDcxNiAyNi44NzEyIDM3LjE0MzkgMjYuNzQyNCAzNy45MzU2TDI2LjY0NTggMzguNTM3OUgxOS43MDI2TDE5LjkwMTUgMzcuMjY1MUgyNS4xNzQyQzI1LjI1MzggMzYuODE4MiAyNS4yMzI5IDM2LjQyMjMgMjUuMTExNyAzNi4wNzc2QzI0Ljk5MDUgMzUuNzI5MiAyNC43ODIyIDM1LjQ1NDUgMjQuNDg2NyAzNS4yNTM4QzI0LjE5NSAzNS4wNTMgMjMuODI3NiAzNC45NTI2IDIzLjM4NDQgMzQuOTUyNkMyMi45Mjk5IDM0Ljk1MjYgMjIuNTA1NyAzNS4wNzIgMjIuMTExNyAzNS4zMTA2QzIxLjcxNzggMzUuNTQ5MiAyMS4zODgyIDM1Ljg1NDIgMjEuMTIzMSAzNi4yMjU0QzIwLjg2MTcgMzYuNTkyOCAyMC42OTY5IDM2Ljk3MTYgMjAuNjI4OCAzNy4zNjE3TDIwLjQyOTkgMzguNTI2NUMyMC4zMzE0IDM5LjE2MjkgMjAuMzQ4NSAzOS42NzQyIDIwLjQ4MSA0MC4wNjA2QzIwLjYxNzQgNDAuNDQ3IDIwLjg1NiA0MC43MjczIDIxLjE5NjkgNDAuOTAxNUMyMS41Mzc5IDQxLjA3NTcgMjEuOTY0IDQxLjE2MjkgMjIuNDc1NCA0MS4xNjI5QzIyLjgwNDkgNDEuMTYyOSAyMy4xMDk4IDQxLjExNzQgMjMuMzkwMSA0MS4wMjY1QzIzLjY3NDIgNDAuOTMxOCAyMy45MjYxIDQwLjc5MzUgMjQuMTQ1OCA0MC42MTE3QzI0LjM2NTUgNDAuNDI2MSAyNC41NDkyIDQwLjE5NTEgMjQuNjk2OSAzOS45MTg1TDI2LjI1MzggNDAuMjA4M0MyNi4wNDU0IDQwLjY4MTggMjUuNzQ2MiA0MS4wOTY2IDI1LjM1NiA0MS40NTI2QzI0Ljk2NTkgNDEuODA0OSAyNC41MDU3IDQyLjA3OTUgMjMuOTc1NCA0Mi4yNzY1QzIzLjQ0ODggNDIuNDY5NyAyMi44NjU1IDQyLjU2NjMgMjIuMjI1NCA0Mi41NjYzWk0zMS4wMjIyIDQ1Ljg0NDdDMzAuMzI1MyA0NS44NDQ3IDI5Ljc0MTkgNDUuNzUzOCAyOS4yNzIyIDQ1LjU3MkMyOC44MDYzIDQ1LjM5MDEgMjguNDM4OSA0NS4xNDk2IDI4LjE3IDQ0Ljg1MDRDMjcuOTA0OCA0NC41NTExIDI3LjcyMTEgNDQuMjIzNSAyNy42MTg4IDQzLjg2NzRMMjkuMTg3IDQzLjI2NTFDMjkuMjYyOCA0My40MzE4IDI5LjM2ODggNDMuNjA3OSAyOS41MDUyIDQzLjc5MzVDMjkuNjQxNSA0My45ODI5IDI5Ljg0NDIgNDQuMTQzOSAzMC4xMTMxIDQ0LjI3NjVDMzAuMzg1OSA0NC40MDkxIDMwLjc1OSA0NC40NzU0IDMxLjIzMjUgNDQuNDc1NEMzMS44NzY0IDQ0LjQ3NTQgMzIuNDM4OSA0NC4zMTgyIDMyLjkyIDQ0LjAwMzhDMzMuNDAxIDQzLjY5MzIgMzMuNjk4NCA0My4xOTcgMzMuODEyIDQyLjUxNTFMMzQuMDc5IDQwLjc5OTJIMzMuOTcxMUMzMy44NDIzIDQwLjk4NDggMzMuNjY0MyA0MS4xOTEzIDMzLjQzNyA0MS40MTg1QzMzLjIwOTcgNDEuNjQ1OCAzMi45MTYyIDQxLjg0MjggMzIuNTU2MyA0Mi4wMDk1QzMyLjE5NjUgNDIuMTc2MSAzMS43NDk1IDQyLjI1OTUgMzEuMjE1NCA0Mi4yNTk1QzMwLjUyNiA0Mi4yNTk1IDI5LjkzMTMgNDIuMDk4NSAyOS40MzEzIDQxLjc3NjVDMjguOTM1MSA0MS40NTA3IDI4LjU3OSA0MC45NzE2IDI4LjM2MzEgNDAuMzM5QzI4LjE0NzIgMzkuNzAyNiAyOC4xMTY5IDM4LjkyMDQgMjguMjcyMiAzNy45OTI0QzI4LjQyMzcgMzcuMDY0NCAyOC43MTE2IDM2LjI2ODkgMjkuMTM1OSAzNS42MDZDMjkuNTYzOSAzNC45NDMyIDMwLjA4MjggMzQuNDM1NiAzMC42OTI3IDM0LjA4MzNDMzEuMzA2MyAzMy43MjczIDMxLjk2MzUgMzMuNTQ5MiAzMi42NjQzIDMzLjU0OTJDMzMuMjA1OSAzMy41NDkyIDMzLjYyODMgMzMuNjQwMSAzMy45MzEzIDMzLjgyMkMzNC4yMzgxIDM0IDM0LjQ2NTQgMzQuMjA4MyAzNC42MTMxIDM0LjQ0N0MzNC43NjA5IDM0LjY4NTYgMzQuODY4OCAzNC44OTU4IDM0LjkzNyAzNS4wNzc2SDM1LjA2MkwzNS4yOTUgMzMuNjYyOUgzNi45NTk3TDM1LjQ4MjUgNDIuNTgzM0MzNS4zNjEyIDQzLjMzMzMgMzUuMDg2NiA0My45NDg4IDM0LjY1ODYgNDQuNDI5OUMzNC4yMzQzIDQ0LjkxMSAzMy43MDU5IDQ1LjI2NyAzMy4wNzM0IDQ1LjQ5ODFDMzIuNDQ0NiA0NS43MjkyIDMxLjc2MDkgNDUuODQ0NyAzMS4wMjIyIDQ1Ljg0NDdaTTMxLjc5NSA0MC44NTA0QzMyLjI3OTggNDAuODUwNCAzMi43MTE2IDQwLjczNjcgMzMuMDkwNCA0MC41MDk1QzMzLjQ3MyA0MC4yNzg0IDMzLjc5MTIgMzkuOTQ4OCAzNC4wNDUgMzkuNTIwOEMzNC4yOTg3IDM5LjA4OSAzNC40NzQ5IDM4LjU3MiAzNC41NzM0IDM3Ljk2OTdDMzQuNjcxOCAzNy4zODI2IDM0LjY2NjIgMzYuODY1NSAzNC41NTYzIDM2LjQxODVDMzQuNDUwMyAzNS45NzE2IDM0LjI0MzggMzUuNjIzMSAzMy45MzcgMzUuMzczMUMzMy42MzQgMzUuMTE5MyAzMy4yMzgxIDM0Ljk5MjQgMzIuNzQ5NSAzNC45OTI0QzMyLjIzNDMgMzQuOTkyNCAzMS43ODc0IDM1LjEyNSAzMS40MDg2IDM1LjM5MDFDMzEuMDI5OCAzNS42NTE1IDMwLjcyMTEgMzYuMDA3NiAzMC40ODI1IDM2LjQ1ODNDMzAuMjQ3NiAzNi45MDkxIDMwLjA4MjggMzcuNDEyOSAyOS45ODgxIDM3Ljk2OTdDMjkuODk3MiAzOC41NDE3IDI5Ljg5OTEgMzkuMDQzNSAyOS45OTM4IDM5LjQ3NTRDMzAuMDkyMyAzOS45MDcyIDMwLjI4OTMgNDAuMjQ0MyAzMC41ODQ3IDQwLjQ4NjdDMzAuODgwMiA0MC43MjkyIDMxLjI4MzYgNDAuODUwNCAzMS43OTUgNDAuODUwNFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yMS43OTI5IDAuNTEyNTExQzIyLjE4MzQgMC4xMjE5ODcgMjIuODE2NiAwLjEyMTk4NyAyMy4yMDcxIDAuNTEyNTExTDI5LjU3MTEgNi44NzY0N0MyOS45NjE2IDcuMjY3IDI5Ljk2MTYgNy45MDAxNiAyOS41NzExIDguMjkwNjlDMjkuMTgwNSA4LjY4MTIxIDI4LjU0NzQgOC42ODEyMSAyOC4xNTY5IDguMjkwNjlMMjIuNSAyLjYzMzgzTDE2Ljg0MzEgOC4yOTA2OUMxNi40NTI2IDguNjgxMjEgMTUuODE5NSA4LjY4MTIxIDE1LjQyODkgOC4yOTA2OUMxNS4wMzg0IDcuOTAwMTYgMTUuMDM4NCA3LjI2NyAxNS40Mjg5IDYuODc2NDdMMjEuNzkyOSAwLjUxMjUxMVpNMjEuNSAyNi40MTg5VjEuMjE5NjJIMjMuNVYyNi40MTg5SDIxLjVaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K",
                }
            },
            {
                selector: ".endPtr",
                style: {
                    "width": begEndPtrWidth,
                    "height": begEndPtrHeight,
                    "shape": "rectangle",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA0NSA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ1IiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIuMzY3IDQyLjU2NjNDMTEuNTEwOSA0Mi41NjYzIDEwLjgwMjYgNDIuMzgyNiAxMC4yNDIgNDIuMDE1MUM5LjY4NTEzIDQxLjY0MzkgOS4yOTQ5OCA0MS4xMjMxIDkuMDcxNSA0MC40NTI2QzguODQ4MDEgMzkuNzc4NCA4LjgxMjAzIDM4Ljk4ODYgOC45NjM1NCAzOC4wODMzQzkuMTExMjcgMzcuMTg5NCA5LjQwODYyIDM2LjQwMTUgOS44NTU1OSAzNS43MTk3QzEwLjMwMjYgMzUuMDM3OSAxMC44NTk0IDM0LjUwNTcgMTEuNTI2IDM0LjEyMzFDMTIuMTk2NSAzMy43NDA1IDEyLjkzNyAzMy41NDkyIDEzLjc0NzYgMzMuNTQ5MkMxNC4yNDAxIDMzLjU0OTIgMTQuNzA0MSAzMy42MzA3IDE1LjEzOTcgMzMuNzkzNUMxNS41NzkxIDMzLjk1NjQgMTUuOTUyMiAzNC4yMTIxIDE2LjI1OSAzNC41NjA2QzE2LjU2NTggMzQuOTA5MSAxNi43Nzc5IDM1LjM2MTcgMTYuODk1NCAzNS45MTg1QzE3LjAxNjYgMzYuNDcxNiAxNy4wMTI4IDM3LjE0MzkgMTYuODg0IDM3LjkzNTZMMTYuNzg3NCAzOC41Mzc5SDkuODQ0MjJMMTAuMDQzMSAzNy4yNjUxSDE1LjMxNThDMTUuMzk1NCAzNi44MTgyIDE1LjM3NDUgMzYuNDIyMyAxNS4yNTMzIDM2LjA3NzZDMTUuMTMyMSAzNS43MjkyIDE0LjkyMzggMzUuNDU0NSAxNC42MjgzIDM1LjI1MzhDMTQuMzM2NiAzNS4wNTMgMTMuOTY5MiAzNC45NTI2IDEzLjUyNiAzNC45NTI2QzEzLjA3MTUgMzQuOTUyNiAxMi42NDczIDM1LjA3MiAxMi4yNTMzIDM1LjMxMDZDMTEuODU5NCAzNS41NDkyIDExLjUyOTggMzUuODU0MiAxMS4yNjQ3IDM2LjIyNTRDMTEuMDAzMyAzNi41OTI4IDEwLjgzODUgMzYuOTcxNiAxMC43NzA0IDM3LjM2MTdMMTAuNTcxNSAzOC41MjY1QzEwLjQ3MyAzOS4xNjI5IDEwLjQ5MDEgMzkuNjc0MiAxMC42MjI2IDQwLjA2MDZDMTAuNzU5IDQwLjQ0NyAxMC45OTc2IDQwLjcyNzMgMTEuMzM4NSA0MC45MDE1QzExLjY3OTUgNDEuMDc1NyAxMi4xMDU2IDQxLjE2MjkgMTIuNjE3IDQxLjE2MjlDMTIuOTQ2NSA0MS4xNjI5IDEzLjI1MTQgNDEuMTE3NCAxMy41MzE3IDQxLjAyNjVDMTMuODE1OCA0MC45MzE4IDE0LjA2NzcgNDAuNzkzNSAxNC4yODc0IDQwLjYxMTdDMTQuNTA3MSA0MC40MjYxIDE0LjY5MDggNDAuMTk1MSAxNC44Mzg1IDM5LjkxODVMMTYuMzk1NCA0MC4yMDgzQzE2LjE4NyA0MC42ODE4IDE1Ljg4NzggNDEuMDk2NiAxNS40OTc2IDQxLjQ1MjZDMTUuMTA3NSA0MS44MDQ5IDE0LjY0NzMgNDIuMDc5NSAxNC4xMTcgNDIuMjc2NUMxMy41OTA0IDQyLjQ2OTcgMTMuMDA3MSA0Mi41NjYzIDEyLjM2NyA0Mi41NjYzWk0yMC42MDcgMzcuMjA4M0wxOS43NTQ3IDQyLjM5MDFIMTguMDU1OUwxOS41MTA0IDMzLjY2MjlIMjEuMTQxMUwyMC45MDI1IDM1LjA4MzNIMjEuMDEwNEMyMS4yODY5IDM0LjYxNzQgMjEuNjYzOCAzNC4yNDYyIDIyLjE0MTEgMzMuOTY5N0MyMi42MjIyIDMzLjY4OTQgMjMuMTkwMyAzMy41NDkyIDIzLjg0NTYgMzMuNTQ5MkMyNC40MzY2IDMzLjU0OTIgMjQuOTMyOCAzMy42NzQyIDI1LjMzNDMgMzMuOTI0MkMyNS43Mzk2IDM0LjE3MDQgMjYuMDI1NiAzNC41Mzc5IDI2LjE5MjIgMzUuMDI2NUMyNi4zNjI3IDM1LjUxNTEgMjYuMzg5MiAzNi4xMTkzIDI2LjI3MTggMzYuODM5TDI1LjM0IDQyLjM5MDFIMjMuNjQxMUwyNC41MzMxIDM3LjA0MzVDMjQuNjM1NCAzNi40MTEgMjQuNTUyMSAzNS45MTY3IDI0LjI4MzEgMzUuNTYwNkMyNC4wMTggMzUuMjAwNyAyMy41OTU2IDM1LjAyMDggMjMuMDE2MSAzNS4wMjA4QzIyLjYyMjIgMzUuMDIwOCAyMi4yNTY2IDM1LjEwNiAyMS45MTk1IDM1LjI3NjVDMjEuNTg2MiAzNS40NDcgMjEuMzA0IDM1LjY5NyAyMS4wNzI5IDM2LjAyNjVDMjAuODQ1NiAzNi4zNTIzIDIwLjY5MDMgMzYuNzQ2MiAyMC42MDcgMzcuMjA4M1pNMzAuODY4NCA0Mi41NjA2QzMwLjE2IDQyLjU2MDYgMjkuNTU5NyA0Mi4zODA3IDI5LjA2NzIgNDIuMDIwOEMyOC41Nzg2IDQxLjY1NzIgMjguMjMyIDQxLjE0MDEgMjguMDI3NSA0MC40Njk3QzI3LjgyNjcgMzkuNzk1NCAyNy44MDQgMzguOTg2NyAyNy45NTkzIDM4LjA0MzVDMjguMTE4NCAzNy4xMDA0IDI4LjQxMTkgMzYuMjkzNSAyOC44NCAzNS42MjMxQzI5LjI2OCAzNC45NTI2IDI5Ljc4NjkgMzQuNDM5NCAzMC4zOTY4IDM0LjA4MzNDMzEuMDA2NiAzMy43MjczIDMxLjY2MzggMzMuNTQ5MiAzMi4zNjg0IDMzLjU0OTJDMzIuOTEgMzMuNTQ5MiAzMy4zMzA1IDMzLjY0MDEgMzMuNjI5NyAzMy44MjJDMzMuOTMyOCAzNCAzNC4xNTYyIDM0LjIwODMgMzQuMzAwMiAzNC40NDdDMzQuNDQ0MSAzNC42ODU2IDM0LjU1MjEgMzQuODk1OCAzNC42MjQxIDM1LjA3NzZIMzQuNzIwNkwzNS40NDIyIDMwLjc1MzhIMzcuMTQxMUwzNS4yMDkzIDQyLjM5MDFIMzMuNTUwMkwzMy43ODMxIDQxLjAzMjJIMzMuNjQxMUMzMy41MDg1IDQxLjIxNzggMzMuMzI0OCA0MS40Mjk5IDMzLjA5IDQxLjY2ODVDMzIuODU4OSA0MS45MDcyIDMyLjU2MzQgNDIuMTE1NSAzMi4yMDM2IDQyLjI5MzVDMzEuODQzNyA0Mi40NzE2IDMxLjM5ODcgNDIuNTYwNiAzMC44Njg0IDQyLjU2MDZaTTMxLjQ0MjIgNDEuMTExN0MzMS45MzA5IDQxLjExMTcgMzIuMzY4NCA0MC45ODI5IDMyLjc1NDcgNDAuNzI1NEMzMy4xNDQ5IDQwLjQ2NCAzMy40Njg3IDQwLjEwMjMgMzMuNzI2MyAzOS42NDAxQzMzLjk4NzcgMzkuMTc4IDM0LjE2OTUgMzguNjQwMSAzNC4yNzE4IDM4LjAyNjVDMzQuMzc0MSAzNy40MjA0IDM0LjM3MjIgMzYuODkwMSAzNC4yNjYxIDM2LjQzNTZDMzQuMTYgMzUuOTgxIDMzLjk1NTUgMzUuNjI2OSAzMy42NTI1IDM1LjM3MzFDMzMuMzQ5NCAzNS4xMTkzIDMyLjk0OTggMzQuOTkyNCAzMi40NTM2IDM0Ljk5MjRDMzEuOTQyMiAzNC45OTI0IDMxLjQ5NzIgMzUuMTI1IDMxLjExODQgMzUuMzkwMUMzMC43Mzk2IDM1LjY1NTMgMzAuNDI5IDM2LjAxNyAzMC4xODY2IDM2LjQ3NTRDMjkuOTQ3OSAzNi45MzM3IDI5Ljc4MTIgMzcuNDUwNyAyOS42ODY2IDM4LjAyNjVDMjkuNTg4MSAzOC42MDk4IDI5LjU4NDMgMzkuMTM0NSAyOS42NzUyIDM5LjYwMDRDMjkuNzY2MSA0MC4wNjYzIDI5Ljk1NzQgNDAuNDM1NiAzMC4yNDkxIDQwLjcwODNDMzAuNTQwNyA0MC45NzczIDMwLjkzODQgNDEuMTExNyAzMS40NDIyIDQxLjExMTdaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMjEuNzkyOSAwLjUxMjUxMUMyMi4xODM0IDAuMTIxOTg3IDIyLjgxNjYgMC4xMjE5ODcgMjMuMjA3MSAwLjUxMjUxMUwyOS41NzExIDYuODc2NDdDMjkuOTYxNiA3LjI2NyAyOS45NjE2IDcuOTAwMTYgMjkuNTcxMSA4LjI5MDY5QzI5LjE4MDUgOC42ODEyMSAyOC41NDc0IDguNjgxMjEgMjguMTU2OSA4LjI5MDY5TDIyLjUgMi42MzM4M0wxNi44NDMxIDguMjkwNjlDMTYuNDUyNiA4LjY4MTIxIDE1LjgxOTUgOC42ODEyMSAxNS40Mjg5IDguMjkwNjlDMTUuMDM4NCA3LjkwMDE2IDE1LjAzODQgNy4yNjcgMTUuNDI4OSA2Ljg3NjQ3TDIxLjc5MjkgMC41MTI1MTFaTTIxLjUgMjYuNDE4OVYxLjIxOTYySDIzLjVWMjYuNDE4OUgyMS41WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==",
                }
            },
            {
                selector: ".beginAndEndPtr",
                style: {
                    "width": begEndPtrWidth*2,
                    "height": begEndPtrHeight,
                    "shape": "rectangle",
                    "background-image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjYiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA2NiA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMzIiBoZWlnaHQ9IjUwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMi41NTEzNSA0Mi4zOTAxTDQuNDgzMTcgMzAuNzUzOEg2LjE4MjA0TDUuNDcxODEgMzUuMDc3Nkg1LjU3NDA4QzUuNzAyODcgMzQuODk1OCA1Ljg3OTAxIDM0LjY4NTYgNi4xMDI0OSAzNC40NDdDNi4zMjk3NiAzNC4yMDgzIDYuNjIzMzIgMzQgNi45ODMxNyAzMy44MjJDNy4zNDMwMiAzMy42NDAxIDcuNzkzNzggMzMuNTQ5MiA4LjMzNTQ0IDMzLjU0OTJDOS4wMzk5OSAzMy41NDkyIDkuNjM4NDggMzMuNzI3MyAxMC4xMzA5IDM0LjA4MzNDMTAuNjIzMyAzNC40Mzk0IDEwLjk3MTggMzQuOTUyNiAxMS4xNzY0IDM1LjYyMzFDMTEuMzgwOSAzNi4yOTM1IDExLjQwNTUgMzcuMTAwNCAxMS4yNTAyIDM4LjA0MzVDMTEuMDk0OSAzOC45ODY3IDEwLjgwMzIgMzkuNzk1NCAxMC4zNzUyIDQwLjQ2OTdDOS45NTA5OCA0MS4xNDAxIDkuNDMzOTMgNDEuNjU3MiA4LjgyNDA4IDQyLjAyMDhDOC4yMTQyMyA0Mi4zODA3IDcuNTU3MDQgNDIuNTYwNiA2Ljg1MjQ5IDQyLjU2MDZDNi4zMjIxOSA0Mi41NjA2IDUuOTAzNjMgNDIuNDcxNiA1LjU5NjgxIDQyLjI5MzVDNS4yOTM3OCA0Mi4xMTU1IDUuMDY2NTEgNDEuOTA3MiA0LjkxNDk5IDQxLjY2ODVDNC43NjcyNiA0MS40Mjk5IDQuNjU1NTIgNDEuMjE3OCA0LjU3OTc2IDQxLjAzMjJINC40Mzc3Mkw0LjIxMDQ0IDQyLjM5MDFIMi41NTEzNVpNNC45NDM0IDM4LjAyNjVDNC44NDQ5MSAzOC42NDAxIDQuODQ0OTEgMzkuMTc4IDQuOTQzNCAzOS42NDAxQzUuMDQ1NjcgNDAuMTAyMyA1LjI0NDU0IDQwLjQ2NCA1LjUzOTk5IDQwLjcyNTRDNS44MzkyMyA0MC45ODI5IDYuMjMxMjggNDEuMTExNyA2LjcxNjEzIDQxLjExMTdDNy4yMjM3IDQxLjExMTcgNy42NzA2NyA0MC45NzczIDguMDU3MDQgNDAuNzA4M0M4LjQ0MzQgNDAuNDM1NiA4Ljc2MTU4IDQwLjA2NjMgOS4wMTE1OCAzOS42MDA0QzkuMjYxNTggMzkuMTM0NSA5LjQzNTgyIDM4LjYwOTggOS41MzQzMSAzOC4wMjY1QzkuNjI1MjIgMzcuNDUwNyA5LjYyMzMyIDM2LjkzMzcgOS41Mjg2MyAzNi40NzU0QzkuNDMzOTMgMzYuMDE3IDkuMjM2OTYgMzUuNjU1MyA4LjkzNzcyIDM1LjM5MDFDOC42NDIyNiAzNS4xMjUgOC4yMzg4NSAzNC45OTI0IDcuNzI3NDkgMzQuOTkyNEM3LjIzNTA3IDM0Ljk5MjQgNi43OTc1NyAzNS4xMTkzIDYuNDE0OTkgMzUuMzczMUM2LjAzMjQxIDM1LjYyNjkgNS43MTYxMyAzNS45ODEgNS40NjYxMyAzNi40MzU2QzUuMjE2MTMgMzYuODkwMSA1LjA0MTg4IDM3LjQyMDQgNC45NDM0IDM4LjAyNjVaTTE2LjE2OTMgNDIuNTY2M0MxNS4zMTMyIDQyLjU2NjMgMTQuNjA0OSA0Mi4zODI2IDE0LjA0NDMgNDIuMDE1MUMxMy40ODc0IDQxLjY0MzkgMTMuMDk3MyA0MS4xMjMxIDEyLjg3MzggNDAuNDUyNkMxMi42NTAzIDM5Ljc3ODQgMTIuNjE0MyAzOC45ODg2IDEyLjc2NTggMzguMDgzM0MxMi45MTM2IDM3LjE4OTQgMTMuMjEwOSAzNi40MDE1IDEzLjY1NzkgMzUuNzE5N0MxNC4xMDQ5IDM1LjAzNzkgMTQuNjYxNyAzNC41MDU3IDE1LjMyODMgMzQuMTIzMUMxNS45OTg4IDMzLjc0MDUgMTYuNzM5MyAzMy41NDkyIDE3LjU0OTkgMzMuNTQ5MkMxOC4wNDI0IDMzLjU0OTIgMTguNTA2NCAzMy42MzA3IDE4Ljk0MiAzMy43OTM1QzE5LjM4MTQgMzMuOTU2NCAxOS43NTQ1IDM0LjIxMjEgMjAuMDYxMyAzNC41NjA2QzIwLjM2ODEgMzQuOTA5MSAyMC41ODAyIDM1LjM2MTcgMjAuNjk3NyAzNS45MTg1QzIwLjgxODkgMzYuNDcxNiAyMC44MTUxIDM3LjE0MzkgMjAuNjg2MyAzNy45MzU2TDIwLjU4OTcgMzguNTM3OUgxMy42NDY1TDEzLjg0NTQgMzcuMjY1MUgxOS4xMTgxQzE5LjE5NzcgMzYuODE4MiAxOS4xNzY4IDM2LjQyMjMgMTkuMDU1NiAzNi4wNzc2QzE4LjkzNDQgMzUuNzI5MiAxOC43MjYxIDM1LjQ1NDUgMTguNDMwNiAzNS4yNTM4QzE4LjEzODkgMzUuMDUzIDE3Ljc3MTUgMzQuOTUyNiAxNy4zMjgzIDM0Ljk1MjZDMTYuODczOCAzNC45NTI2IDE2LjQ0OTYgMzUuMDcyIDE2LjA1NTYgMzUuMzEwNkMxNS42NjE3IDM1LjU0OTIgMTUuMzMyMSAzNS44NTQyIDE1LjA2NyAzNi4yMjU0QzE0LjgwNTYgMzYuNTkyOCAxNC42NDA4IDM2Ljk3MTYgMTQuNTcyNyAzNy4zNjE3TDE0LjM3MzggMzguNTI2NUMxNC4yNzUzIDM5LjE2MjkgMTQuMjkyNCAzOS42NzQyIDE0LjQyNDkgNDAuMDYwNkMxNC41NjEzIDQwLjQ0NyAxNC43OTk5IDQwLjcyNzMgMTUuMTQwOCA0MC45MDE1QzE1LjQ4MTggNDEuMDc1NyAxNS45MDc5IDQxLjE2MjkgMTYuNDE5MyA0MS4xNjI5QzE2Ljc0ODggNDEuMTYyOSAxNy4wNTM3IDQxLjExNzQgMTcuMzM0IDQxLjAyNjVDMTcuNjE4MSA0MC45MzE4IDE3Ljg3IDQwLjc5MzUgMTguMDg5NyA0MC42MTE3QzE4LjMwOTQgNDAuNDI2MSAxOC40OTMxIDQwLjE5NTEgMTguNjQwOCAzOS45MTg1TDIwLjE5NzcgNDAuMjA4M0MxOS45ODkzIDQwLjY4MTggMTkuNjkwMSA0MS4wOTY2IDE5LjI5OTkgNDEuNDUyNkMxOC45MDk4IDQxLjgwNDkgMTguNDQ5NiA0Mi4wNzk1IDE3LjkxOTMgNDIuMjc2NUMxNy4zOTI3IDQyLjQ2OTcgMTYuODA5NCA0Mi41NjYzIDE2LjE2OTMgNDIuNTY2M1pNMjQuOTY2MSA0NS44NDQ3QzI0LjI2OTIgNDUuODQ0NyAyMy42ODU4IDQ1Ljc1MzggMjMuMjE2MSA0NS41NzJDMjIuNzUwMiA0NS4zOTAxIDIyLjM4MjggNDUuMTQ5NiAyMi4xMTM5IDQ0Ljg1MDRDMjEuODQ4NyA0NC41NTExIDIxLjY2NSA0NC4yMjM1IDIxLjU2MjcgNDMuODY3NEwyMy4xMzA5IDQzLjI2NTFDMjMuMjA2NyA0My40MzE4IDIzLjMxMjcgNDMuNjA3OSAyMy40NDkxIDQzLjc5MzVDMjMuNTg1NCA0My45ODI5IDIzLjc4ODEgNDQuMTQzOSAyNC4wNTcgNDQuMjc2NUMyNC4zMjk4IDQ0LjQwOTEgMjQuNzAyOSA0NC40NzU0IDI1LjE3NjQgNDQuNDc1NEMyNS44MjAzIDQ0LjQ3NTQgMjYuMzgyOCA0NC4zMTgyIDI2Ljg2MzkgNDQuMDAzOEMyNy4zNDQ5IDQzLjY5MzIgMjcuNjQyMyA0My4xOTcgMjcuNzU1OSA0Mi41MTUxTDI4LjAyMjkgNDAuNzk5MkgyNy45MTVDMjcuNzg2MiA0MC45ODQ4IDI3LjYwODIgNDEuMTkxMyAyNy4zODA5IDQxLjQxODVDMjcuMTUzNiA0MS42NDU4IDI2Ljg2MDEgNDEuODQyOCAyNi41MDAyIDQyLjAwOTVDMjYuMTQwNCA0Mi4xNzYxIDI1LjY5MzQgNDIuMjU5NSAyNS4xNTkzIDQyLjI1OTVDMjQuNDY5OSA0Mi4yNTk1IDIzLjg3NTIgNDIuMDk4NSAyMy4zNzUyIDQxLjc3NjVDMjIuODc5IDQxLjQ1MDcgMjIuNTIyOSA0MC45NzE2IDIyLjMwNyA0MC4zMzlDMjIuMDkxMSAzOS43MDI2IDIyLjA2MDggMzguOTIwNCAyMi4yMTYxIDM3Ljk5MjRDMjIuMzY3NiAzNy4wNjQ0IDIyLjY1NTUgMzYuMjY4OSAyMy4wNzk4IDM1LjYwNkMyMy41MDc4IDM0Ljk0MzIgMjQuMDI2NyAzNC40MzU2IDI0LjYzNjYgMzQuMDgzM0MyNS4yNTAyIDMzLjcyNzMgMjUuOTA3NCAzMy41NDkyIDI2LjYwODIgMzMuNTQ5MkMyNy4xNDk4IDMzLjU0OTIgMjcuNTcyMiAzMy42NDAxIDI3Ljg3NTIgMzMuODIyQzI4LjE4MiAzNCAyOC40MDkzIDM0LjIwODMgMjguNTU3IDM0LjQ0N0MyOC43MDQ4IDM0LjY4NTYgMjguODEyNyAzNC44OTU4IDI4Ljg4MDkgMzUuMDc3NkgyOS4wMDU5TDI5LjIzODkgMzMuNjYyOUgzMC45MDM2TDI5LjQyNjQgNDIuNTgzM0MyOS4zMDUxIDQzLjMzMzMgMjkuMDMwNSA0My45NDg4IDI4LjYwMjUgNDQuNDI5OUMyOC4xNzgyIDQ0LjkxMSAyNy42NDk4IDQ1LjI2NyAyNy4wMTczIDQ1LjQ5ODFDMjYuMzg4NSA0NS43MjkyIDI1LjcwNDggNDUuODQ0NyAyNC45NjYxIDQ1Ljg0NDdaTTI1LjczODkgNDAuODUwNEMyNi4yMjM3IDQwLjg1MDQgMjYuNjU1NSA0MC43MzY3IDI3LjAzNDMgNDAuNTA5NUMyNy40MTY5IDQwLjI3ODQgMjcuNzM1MSAzOS45NDg4IDI3Ljk4ODkgMzkuNTIwOEMyOC4yNDI2IDM5LjA4OSAyOC40MTg4IDM4LjU3MiAyOC41MTczIDM3Ljk2OTdDMjguNjE1NyAzNy4zODI2IDI4LjYxMDEgMzYuODY1NSAyOC41MDAyIDM2LjQxODVDMjguMzk0MiAzNS45NzE2IDI4LjE4NzcgMzUuNjIzMSAyNy44ODA5IDM1LjM3MzFDMjcuNTc3OSAzNS4xMTkzIDI3LjE4MiAzNC45OTI0IDI2LjY5MzQgMzQuOTkyNEMyNi4xNzgyIDM0Ljk5MjQgMjUuNzMxMyAzNS4xMjUgMjUuMzUyNSAzNS4zOTAxQzI0Ljk3MzcgMzUuNjUxNSAyNC42NjUgMzYuMDA3NiAyNC40MjY0IDM2LjQ1ODNDMjQuMTkxNSAzNi45MDkxIDI0LjAyNjcgMzcuNDEyOSAyMy45MzIgMzcuOTY5N0MyMy44NDExIDM4LjU0MTcgMjMuODQzIDM5LjA0MzUgMjMuOTM3NyAzOS40NzU0QzI0LjAzNjIgMzkuOTA3MiAyNC4yMzMyIDQwLjI0NDMgMjQuNTI4NiA0MC40ODY3QzI0LjgyNDEgNDAuNzI5MiAyNS4yMjc1IDQwLjg1MDQgMjUuNzM4OSA0MC44NTA0WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE1Ljc5MjkgMC41MTI1MTFDMTYuMTgzNCAwLjEyMTk4NyAxNi44MTY2IDAuMTIxOTg3IDE3LjIwNzEgMC41MTI1MTFMMjMuNTcxMSA2Ljg3NjQ3QzIzLjk2MTYgNy4yNjcgMjMuOTYxNiA3LjkwMDE2IDIzLjU3MTEgOC4yOTA2OUMyMy4xODA1IDguNjgxMjEgMjIuNTQ3NCA4LjY4MTIxIDIyLjE1NjkgOC4yOTA2OUwxNi41IDIuNjMzODNMMTAuODQzMSA4LjI5MDY5QzEwLjQ1MjYgOC42ODEyMSA5LjgxOTQ2IDguNjgxMjEgOS40Mjg5MyA4LjI5MDY5QzkuMDM4NDEgNy45MDAxNiA5LjAzODQxIDcuMjY3IDkuNDI4OTMgNi44NzY0N0wxNS43OTI5IDAuNTEyNTExWk0xNS41IDI2LjQxODlWMS4yMTk2MkgxNy41VjI2LjQxODlIMTUuNVoiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjMzIiB3aWR0aD0iMzMiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zOS4zMDk5IDQyLjU2NjNDMzguNDUzOCA0Mi41NjYzIDM3Ljc0NTUgNDIuMzgyNiAzNy4xODQ5IDQyLjAxNTFDMzYuNjI4MSA0MS42NDM5IDM2LjIzNzkgNDEuMTIzMSAzNi4wMTQ0IDQwLjQ1MjZDMzUuNzkwOSAzOS43Nzg0IDM1Ljc1NSAzOC45ODg2IDM1LjkwNjUgMzguMDgzM0MzNi4wNTQyIDM3LjE4OTQgMzYuMzUxNSAzNi40MDE1IDM2Ljc5ODUgMzUuNzE5N0MzNy4yNDU1IDM1LjAzNzkgMzcuODAyMyAzNC41MDU3IDM4LjQ2OSAzNC4xMjMxQzM5LjEzOTQgMzMuNzQwNSAzOS44OCAzMy41NDkyIDQwLjY5MDYgMzMuNTQ5MkM0MS4xODMgMzMuNTQ5MiA0MS42NDcgMzMuNjMwNyA0Mi4wODI2IDMzLjc5MzVDNDIuNTIyIDMzLjk1NjQgNDIuODk1MSAzNC4yMTIxIDQzLjIwMTkgMzQuNTYwNkM0My41MDg3IDM0LjkwOTEgNDMuNzIwOSAzNS4zNjE3IDQzLjgzODMgMzUuOTE4NUM0My45NTk1IDM2LjQ3MTYgNDMuOTU1NyAzNy4xNDM5IDQzLjgyNjkgMzcuOTM1Nkw0My43MzAzIDM4LjUzNzlIMzYuNzg3MUwzNi45ODYgMzcuMjY1MUg0Mi4yNTg3QzQyLjMzODMgMzYuODE4MiA0Mi4zMTc1IDM2LjQyMjMgNDIuMTk2MiAzNi4wNzc2QzQyLjA3NSAzNS43MjkyIDQxLjg2NjcgMzUuNDU0NSA0MS41NzEyIDM1LjI1MzhDNDEuMjc5NiAzNS4wNTMgNDAuOTEyMSAzNC45NTI2IDQwLjQ2OSAzNC45NTI2QzQwLjAxNDQgMzQuOTUyNiAzOS41OTAyIDM1LjA3MiAzOS4xOTYyIDM1LjMxMDZDMzguODAyMyAzNS41NDkyIDM4LjQ3MjggMzUuODU0MiAzOC4yMDc2IDM2LjIyNTRDMzcuOTQ2MiAzNi41OTI4IDM3Ljc4MTUgMzYuOTcxNiAzNy43MTMzIDM3LjM2MTdMMzcuNTE0NCAzOC41MjY1QzM3LjQxNTkgMzkuMTYyOSAzNy40MzMgMzkuNjc0MiAzNy41NjU2IDQwLjA2MDZDMzcuNzAxOSA0MC40NDcgMzcuOTQwNiA0MC43MjczIDM4LjI4MTUgNDAuOTAxNUMzOC42MjI0IDQxLjA3NTcgMzkuMDQ4NSA0MS4xNjI5IDM5LjU1OTkgNDEuMTYyOUMzOS44ODk0IDQxLjE2MjkgNDAuMTk0MyA0MS4xMTc0IDQwLjQ3NDYgNDEuMDI2NUM0MC43NTg3IDQwLjkzMTggNDEuMDEwNiA0MC43OTM1IDQxLjIzMDMgNDAuNjExN0M0MS40NSA0MC40MjYxIDQxLjYzMzcgNDAuMTk1MSA0MS43ODE1IDM5LjkxODVMNDMuMzM4MyA0MC4yMDgzQzQzLjEzIDQwLjY4MTggNDIuODMwNyA0MS4wOTY2IDQyLjQ0MDYgNDEuNDUyNkM0Mi4wNTA0IDQxLjgwNDkgNDEuNTkwMiA0Mi4wNzk1IDQxLjA1OTkgNDIuMjc2NUM0MC41MzM0IDQyLjQ2OTcgMzkuOTUgNDIuNTY2MyAzOS4zMDk5IDQyLjU2NjNaTTQ3LjU0OTkgMzcuMjA4M0w0Ni42OTc3IDQyLjM5MDFINDQuOTk4OEw0Ni40NTMzIDMzLjY2MjlINDguMDg0TDQ3Ljg0NTQgMzUuMDgzM0g0Ny45NTMzQzQ4LjIyOTkgMzQuNjE3NCA0OC42MDY4IDM0LjI0NjIgNDkuMDg0IDMzLjk2OTdDNDkuNTY1MSAzMy42ODk0IDUwLjEzMzMgMzMuNTQ5MiA1MC43ODg2IDMzLjU0OTJDNTEuMzc5NSAzMy41NDkyIDUxLjg3NTcgMzMuNjc0MiA1Mi4yNzcyIDMzLjkyNDJDNTIuNjgyNSAzNC4xNzA0IDUyLjk2ODUgMzQuNTM3OSA1My4xMzUyIDM1LjAyNjVDNTMuMzA1NiAzNS41MTUxIDUzLjMzMjEgMzYuMTE5MyA1My4yMTQ3IDM2LjgzOUw1Mi4yODI5IDQyLjM5MDFINTAuNTg0TDUxLjQ3NjEgMzcuMDQzNUM1MS41NzgzIDM2LjQxMSA1MS40OTUgMzUuOTE2NyA1MS4yMjYxIDM1LjU2MDZDNTAuOTYwOSAzNS4yMDA3IDUwLjUzODYgMzUuMDIwOCA0OS45NTkgMzUuMDIwOEM0OS41NjUxIDM1LjAyMDggNDkuMTk5NiAzNS4xMDYgNDguODYyNCAzNS4yNzY1QzQ4LjUyOTEgMzUuNDQ3IDQ4LjI0NjkgMzUuNjk3IDQ4LjAxNTggMzYuMDI2NUM0Ny43ODg2IDM2LjM1MjMgNDcuNjMzMyAzNi43NDYyIDQ3LjU0OTkgMzcuMjA4M1pNNTcuODExMyA0Mi41NjA2QzU3LjEwMyA0Mi41NjA2IDU2LjUwMjYgNDIuMzgwNyA1Ni4wMTAyIDQyLjAyMDhDNTUuNTIxNSA0MS42NTcyIDU1LjE3NDkgNDEuMTQwMSA1NC45NzA0IDQwLjQ2OTdDNTQuNzY5NiAzOS43OTU0IDU0Ljc0NjkgMzguOTg2NyA1NC45MDIyIDM4LjA0MzVDNTUuMDYxMyAzNy4xMDA0IDU1LjM1NDkgMzYuMjkzNSA1NS43ODI5IDM1LjYyMzFDNTYuMjEwOSAzNC45NTI2IDU2LjcyOTkgMzQuNDM5NCA1Ny4zMzk3IDM0LjA4MzNDNTcuOTQ5NiAzMy43MjczIDU4LjYwNjggMzMuNTQ5MiA1OS4zMTEzIDMzLjU0OTJDNTkuODUzIDMzLjU0OTIgNjAuMjczNCAzMy42NDAxIDYwLjU3MjcgMzMuODIyQzYwLjg3NTcgMzQgNjEuMDk5MiAzNC4yMDgzIDYxLjI0MzEgMzQuNDQ3QzYxLjM4NzEgMzQuNjg1NiA2MS40OTUgMzQuODk1OCA2MS41NjcgMzUuMDc3Nkg2MS42NjM2TDYyLjM4NTIgMzAuNzUzOEg2NC4wODRMNjIuMTUyMiA0Mi4zOTAxSDYwLjQ5MzFMNjAuNzI2MSA0MS4wMzIySDYwLjU4NEM2MC40NTE0IDQxLjIxNzggNjAuMjY3NyA0MS40Mjk5IDYwLjAzMjkgNDEuNjY4NUM1OS44MDE4IDQxLjkwNzIgNTkuNTA2NCA0Mi4xMTU1IDU5LjE0NjUgNDIuMjkzNUM1OC43ODY3IDQyLjQ3MTYgNTguMzQxNiA0Mi41NjA2IDU3LjgxMTMgNDIuNTYwNlpNNTguMzg1MiA0MS4xMTE3QzU4Ljg3MzggNDEuMTExNyA1OS4zMTEzIDQwLjk4MjkgNTkuNjk3NyA0MC43MjU0QzYwLjA4NzggNDAuNDY0IDYwLjQxMTcgNDAuMTAyMyA2MC42NjkzIDM5LjY0MDFDNjAuOTMwNiAzOS4xNzggNjEuMTEyNCAzOC42NDAxIDYxLjIxNDcgMzguMDI2NUM2MS4zMTcgMzcuNDIwNCA2MS4zMTUxIDM2Ljg5MDEgNjEuMjA5IDM2LjQzNTZDNjEuMTAzIDM1Ljk4MSA2MC44OTg0IDM1LjYyNjkgNjAuNTk1NCAzNS4zNzMxQzYwLjI5MjQgMzUuMTE5MyA1OS44OTI3IDM0Ljk5MjQgNTkuMzk2NSAzNC45OTI0QzU4Ljg4NTIgMzQuOTkyNCA1OC40NDAxIDM1LjEyNSA1OC4wNjEzIDM1LjM5MDFDNTcuNjgyNSAzNS42NTUzIDU3LjM3MTkgMzYuMDE3IDU3LjEyOTUgMzYuNDc1NEM1Ni44OTA4IDM2LjkzMzcgNTYuNzI0MiAzNy40NTA3IDU2LjYyOTUgMzguMDI2NUM1Ni41MzEgMzguNjA5OCA1Ni41MjcyIDM5LjEzNDUgNTYuNjE4MSAzOS42MDA0QzU2LjcwOSA0MC4wNjYzIDU2LjkwMDMgNDAuNDM1NiA1Ny4xOTIgNDAuNzA4M0M1Ny40ODM2IDQwLjk3NzMgNTcuODgxNCA0MS4xMTE3IDU4LjM4NTIgNDEuMTExN1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik00OC43OTI5IDAuNTEyNTExQzQ5LjE4MzQgMC4xMjE5ODcgNDkuODE2NiAwLjEyMTk4NyA1MC4yMDcxIDAuNTEyNTExTDU2LjU3MTEgNi44NzY0N0M1Ni45NjE2IDcuMjY3IDU2Ljk2MTYgNy45MDAxNiA1Ni41NzExIDguMjkwNjlDNTYuMTgwNSA4LjY4MTIxIDU1LjU0NzQgOC42ODEyMSA1NS4xNTY5IDguMjkwNjlMNDkuNSAyLjYzMzgzTDQzLjg0MzEgOC4yOTA2OUM0My40NTI2IDguNjgxMjEgNDIuODE5NSA4LjY4MTIxIDQyLjQyODkgOC4yOTA2OUM0Mi4wMzg0IDcuOTAwMTYgNDIuMDM4NCA3LjI2NyA0Mi40Mjg5IDYuODc2NDdMNDguNzkyOSAwLjUxMjUxMVpNNDguNSAyNi40MTg5VjEuMjE5NjJINTAuNVYyNi40MTg5SDQ4LjVaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K",
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
                    'control-point-distances': [this.initNumber*5 + 75],
                    'control-point-weights': [0.5],

                    'source-endpoint': '0deg',
                    'target-endpoint': '0deg'
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
     * Resets the queue structure to its initial state.
     * Clears the indices and calls the parent reset method.
     */
    public resetStructure(): void {
        if (this.animationInProcess) return;
        super.resetStructure();
        this.beginIndex = 0;
        this.endIndex = 0;
    }

    /**
     * Adds a new element to the queue.
     * @param element - The element to be added to the queue.
     * Handles circular behavior when the queue reaches the end.
     */
    public async addElement(element: string): Promise<void> {
        const isFull: boolean = (this.beginIndex - 1 === this.endIndex) ||
            (this.beginIndex === 0 && this.endIndex === this.initNumber-1);

        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the queue is full
        if (isFull) {
            this.log("queue.addFull");
            this.afterAnimationWithoutChange();
            return;
        }

        // Insert the element into the queue array
        this.insertToArray(element);

        // Handle circular behavior of the queue
        if (this.endIndex === this.initNumber) {
            this.endIndex = 0;

            // Create a circular edge when the queue reaches the end
            const newEdge: EdgeData = {
                source: this.structureNodeArray[this.initNumber-1].id,
                target: this.structureNodeArray[0].id,
                class: "circleEdge",
                opacity: 0
            }

            await this.addEdgeWithAnimation(newEdge);
        }

        this.setAndUpdateGraph();
        await this.afterAnimationEnds();
    }

    /**
     * Removes an element from the front of the queue.
     * Updates the graph and handles the circular behavior.
     * If the removed element is the last one that forms the circular connection,
     * the circular edge is also removed to reflect the correct queue state.
     */
    public async removeElement(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the queue is empty
        if (this.beginIndex === this.endIndex) {
            this.log("queue.removeEmpty");
            this.afterAnimationWithoutChange();
            return;
        }

        // Remove the front element and update the graph
        this.structureNodeArray[this.beginIndex].value = "";
        this.structureNodeArray[this.beginIndex].class = "arrayNode";
        this.setAndUpdateGraph();

        // Move the beginning pointer to the start of the queue
        this.beginIndex++;

        // Handle circular behavior: if the beginning pointer reaches the end, reset it
        if (this.beginIndex === this.initNumber) {
            this.beginIndex = 0;
            this.setAndUpdateGraph();
            // Remove the circular edge
            await this.removeEdgeWithAnimation();
        }

        this.setAndUpdateGraph();
        await this.afterAnimationEnds();
    }

    /**
     * Checks if the queue is empty and logs the result.
     */
    public async isEmpty(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        if (this.beginIndex === this.endIndex)
            this.log("queue.empty");
        else
            this.log("queue.notEmpty");

        await this.afterAnimationEnds();
    }

    /**
     * Checks if the queue is full and logs the result.
     */
    public async isFull(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        const isFull: boolean = (this.beginIndex - 1 === this.endIndex) ||
            (this.beginIndex === 0 && this.endIndex === this.initNumber-1);

        if (isFull)
            this.log("queue.full");
        else
            this.log("queue.notFull");

        await this.afterAnimationEnds();
    }

    /**
     * Retrieves the front element of the queue and animates the temporary pointer to it.
     * If the queue is empty, logs an error.
     */
    public async foremostElement(): Promise<void> {
        if (this.animationInProcess || !this.isInit) return;

        await this.beforeAnimationStarts();

        // Check if the queue is empty
        if (this.beginIndex === this.endIndex) {
            this.log(`queue.frontError`);
            this.afterAnimationWithoutChange();
            return;
        }

        // Get the current front node of the queue
        const frontNode: NodeData = this.structureNodeArray[this.beginIndex];
        if (!frontNode) {
            console.warn("No node found at beginIndex.");
            this.afterAnimationWithoutChange();
            return;
        }

        // Create and animate a temporary pointer to the front element
        const frontPointer: NodeData = {
            id: "front",
            x: frontNode.x,
            y: frontNode.y + 78,
            opacity: 0,
            class: "frontPtr",
        }
        await this.addTempNodeWithAnimation(frontPointer);

        this.log("queue.front", { value: frontNode.value });
        this.setAndUpdateGraph();

        await this.wait(2);

        // Remove the temporary front pointer after display
        const nodeToDelete: NodeData = this.tempNodeArray.find(node => node.id === "front")!;
        await this.deleteTempNodeWithAnimation(nodeToDelete);
        this.setAndUpdateGraph();

        await this.afterAnimationEnds();
    }
}