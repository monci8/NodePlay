import { onMounted } from "vue";
import { getCenteringSetting, getAnimationSpeed } from "@/composables/localStorageSettings";
import BinarySearchTree from "@/utils/binarySearchTree";

// Function to set up the visualization of a data structure
function setupStructure(
    structure: any,          // Reactive reference for the data structure instance
    structureClass: any,     // Class of the data structure to initialize
    output: any,             // Reactive object for output logs
    dialogVisible: any,      // Reactive variable controlling the visibility of the dialog
    isAnimating: any,        // Reactive variable indicating if an animation is running
    statusInfo: any          // Reactive variable storing the current status information
) {
    // Lifecycle hook that runs once the component is created and inserted into the DOM
    onMounted(() => {
        // Initialize the structure using the provided class
        structure.value = new structureClass("structureGraph");

        // Set up the logger function for the structure
        structure.value.setLogger((message: { key: string, params?: Record<string, unknown> }) => {
            // Check for an update format for BinarySearchTree
            if (structureClass === BinarySearchTree && message.key.startsWith("__UPDATE_LAST__")) {
                // Update the last log entry with the new message content
                output.lines[output.lines.length - 1] = {
                    key: message.key.replace("__UPDATE_LAST__", ""), // Remove the special update flag
                    params: message.params || {},  // Add additional parameters if present
                };
            } else {
                // Add a new log entry if not an update
                output.lines.push({
                    key: message.key,
                    params: message.params || {},  // Include parameters if available
                });
            }
            // Show the dialog whenever a new log message is added
            dialogVisible.value = true;
        });

        // Set up a callback to update the animation status
        structure.value.setAnimationStatusCallback((status: boolean) => {
            isAnimating.value = status;
        });

        // Set up a callback to update the current status info
        structure.value.setStatusInfoCallback((status: string) => {
            statusInfo.value = status || "";
        });

        // Configure the animation speed based on user settings from local storage
        structure.value.setAnimationSpeed(getAnimationSpeed());

        // Enable or disable centering based on the stored setting
        structure.value.setCenteringEnable(getCenteringSetting());
    });
}

export default setupStructure;
