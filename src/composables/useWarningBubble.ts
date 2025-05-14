import { computed, Ref } from "vue";
import { useI18n } from "vue-i18n";

// Function to manage warning bubble display and messages
export function useWarningBubble(
    showWarning: Ref<string | null>,        // Reactive reference to the current warning state
    animationBlockedMethod: Ref<string | null>, // Reactive reference for blocked method during animation
    isAnimating: Ref<boolean>,              // Reactive reference to check if animation is active
    methodName: string,                     // The method name associated with the warning
    id: string,                             // Unique ID for the warning element
    structureType: "stack" | "queue" | "lists" | "tables", // Type of data structure
    options?: { hasInput?: boolean }         // Optional parameter to specify if input is involved
) {
    const { t } = useI18n();  // Translation function

    // Define whether to show the warning bubble
    const showWarningBubble = computed(() => {
        return (showWarning.value === methodName && !isAnimating.value) ||
            (showWarning.value === "animation" && animationBlockedMethod.value === methodName) ||
            (methodName === "initStructure" && showWarning.value === "mustClean");
    });

    // Get the warning message based on the current state
    const warningMessage = computed(() => {
        if (showWarning.value === "animation") {
            return t('warnings.animation');
        }
        if (methodName === "initStructure" || showWarning.value === "mustClean") {
            return t('warnings.mustClean');
        }
        return t(`warnings.${structureType}.mustInit`);
    });

    // Get the target element for displaying the warning
    const warningTarget = computed(() => {
        if (showWarning.value === "animation" && options?.hasInput) {
            return `#${id}-submit`;
        }
        return `#${id}`;
    });

    // Return reactive properties and methods for use
    return { showWarningBubble, warningMessage, warningTarget };
}
