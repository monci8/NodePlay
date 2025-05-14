import { ref, watch } from "vue";

// Function to manage the method bar functionality
export function useMethodBar(
    props: { isInit: boolean; isAnimating: boolean },  // Props containing initialization and animation state
    emit: any,                                          // Emit function to trigger events
    inputMethods: string[]                              // List of methods that require input
) {
    // Reactive references for managing warnings, input visibility, and messages
    const showWarning = ref<string | null>(null);          // Stores the warning message key
    const animationBlockedMethod = ref<string | null>(null); // Tracks which method is blocked by animation
    const showInput = ref<{ [key: string]: boolean }>({}); // Controls the visibility of input fields
    const inputValues = ref<{ [key: string]: string }>({}); // Stores input values for each method
    const errorMessages = ref<{ [key: string]: string }>({}); // Holds error messages related to input fields
    const warningTimeout = ref<ReturnType<typeof setTimeout> | null>(null); // Timeout reference for hiding warnings

    // Function to display a warning message and optionally block a method due to animation
    const showWarningMessage = (warningKey: string, blockedMethod: string | null = null) => {
        // Clear any existing warning timeout
        if (warningTimeout.value) clearTimeout(warningTimeout.value);

        // Set the current warning and blocked method
        showWarning.value = warningKey;
        animationBlockedMethod.value = blockedMethod;

        // Automatically hide the warning after 1.5 seconds
        warningTimeout.value = setTimeout(() => {
            showWarning.value = null;
            animationBlockedMethod.value = null;
            warningTimeout.value = null;
        }, 1500);
    };

    // Function to validate whether a button click should proceed
    const baseButtonClickCheck = (methodName: string): boolean => {
        // Prevent initialization if the structure is already initialized
        if (props.isInit && methodName === "initStructure") {
            showWarningMessage("mustClean");
            return false;
        }

        // Prevent method calls if the structure is not initialized
        if (!props.isInit && methodName !== "initStructure") {
            showWarningMessage(methodName);
            return false;
        }

        // Check if the method requires input
        const isInputMethod = inputMethods.includes(methodName);

        // Prevent non-input methods if animation is active and structure is initialized
        if (props.isAnimating && props.isInit && !isInputMethod) {
            showWarningMessage("animation", methodName);
            return false;
        }

        // Allow button click
        return true;
    };

    // Function to handle the submission of input data
    const onSubmitInput = (payload: { methodName: string; value: string; animationBlocked: boolean }) => {
        // Check if animation is blocking the method call
        if (payload.animationBlocked) {
            showWarningMessage("animation", payload.methodName);
            return;
        }

        // Emit the method call with the provided value
        emit("method-call", payload.methodName, payload.value);

        // Reset the input field and error message after successful submission
        inputValues.value[payload.methodName] = "";
        errorMessages.value[payload.methodName] = "";
    };

    // Function to reset all input fields and messages
    const resetInputs = () => {
        // Clear all input values, error messages, and hide inputs
        Object.keys(inputValues.value).forEach(key => {
            inputValues.value[key] = "";
            errorMessages.value[key] = "";
            showInput.value[key] = false;
        });
    };

    // Watch for changes in the initialization state and reset inputs if uninitialized
    watch(() => props.isInit, (newVal) => {
        if (!newVal) resetInputs();
    });

    // Return all the reactive references and methods for external use
    return {
        showWarning,              // Reactive variable for displaying warnings
        animationBlockedMethod,   // Reactive variable for blocked method during animation
        showInput,                // Reactive object to manage input field visibility
        inputValues,              // Reactive object to store input values
        errorMessages,            // Reactive object to store error messages
        showWarningMessage,       // Function to show warning messages
        baseButtonClickCheck,     // Function to validate button clicks
        onSubmitInput,            // Function to handle input submission
        resetInputs,              // Function to reset all inputs
    };
}