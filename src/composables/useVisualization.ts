import { ref, shallowRef, reactive, watch } from 'vue';

// Interface to define the structure of the input data for useVisualization
interface UseVisualizationData {
    // A function that returns an object of method handlers
    methodHandlers: (structure: any, isInit: any, dialogVisible: any, output: any) => Record<string, (val?: any) => Promise<void> | void>;
}

// Function to visualization logic and state
export function useVisualization({ methodHandlers }: UseVisualizationData) {
    // Reactive reference to the data structure object
    const structure = shallowRef<any>(null);

    // Reactive references to control UI elements and animation speed
    const dialogVisible = ref(false);   // Indicates whether the dialog is visible
    const output = reactive<{ lines: { key: string, params?: Record<string, unknown> }[] }>({ lines: [] }); // Stores output logs
    const animationSpeed = ref<number>(400); // Default animation speed in milliseconds
    const isInit = ref(false);          // Tracks whether the structure is initialized
    const isAnimating = ref(false);     // Indicates if an animation is currently active
    const statusInfo = ref("");         // Holds status information for the visualization

    // Function to handle method calls dynamically
    const handleMethod = async (methodName: string, value?: any) => {
        // Retrieve method handlers for the current structure
        const methods = methodHandlers(structure, isInit, dialogVisible, output);

        // Check if the method exists and execute it
        if (methods[methodName]) {
            await methods[methodName](value ?? '');  // Call the method with the given value
        } else {
            // Log a warning if the method name is unknown
            console.warn(`Unknown method: ${methodName}`);
        }
    };

    // Function to center the visualization canvas
    const centerCanvas = (enabled: boolean = true) => {
        structure.value?.centerCanvas(enabled);  // Call the method to center the canvas
    };

    // Function to update whether centering is enabled or not
    const updateCenteringEnable = (val: boolean) => {
        structure.value?.setCenteringEnable(val); // Enable or disable centering
    };

    // Watcher to move the graph when the dialog visibility changes
    watch(dialogVisible, (visible) => {
        structure.value?.moveGraph(visible);  // Adjust graph position based on dialog visibility
    });

    // Watcher to update the animation speed when it changes
    watch(animationSpeed, (val) => {
        structure.value?.setAnimationSpeed(val);  // Adjust the animation speed dynamically
    });

    // Returning reactive variables and methods for external use
    return {
        structure,             // The data structure reference
        dialogVisible,         // Visibility of the dialog window
        output,                // Output logs for visualization
        animationSpeed,        // Speed of animations in the visualization
        isInit,                // Boolean flag for initialization state
        isAnimating,           // Boolean flag for animation state
        statusInfo,            // Status information about the visualization
        centerCanvas,          // Function to center the visualization on the canvas
        updateCenteringEnable, // Function to enable/disable centering
        handleMethod,          // General method handler for calling structure methods
    };
}
