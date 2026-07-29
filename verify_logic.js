
// Simple verification of the sanitation logic
function sanitize(property) {
    const sanitizedProperty = { ...property };
    Object.keys(sanitizedProperty).forEach(key => {
        if (sanitizedProperty[key] === undefined) {
            delete sanitizedProperty[key];
        }
    });
    return sanitizedProperty;
}

const testProperty = {
    id: "PROP_VCNT_118",
    location: "Test Location",
    createdBy: undefined,
    somethingElse: "value"
};

console.log("Original property:", testProperty);
const result = sanitize(testProperty);
console.log("Sanitized property:", result);

if (result.hasOwnProperty('createdBy')) {
    console.error("❌ Verification failed: createdBy should have been removed");
    process.exit(1);
} else {
    console.log("✅ Verification successful: createdBy was removed");
}

if (!result.hasOwnProperty('location') || result.location !== "Test Location") {
    console.error("❌ Verification failed: location should have been preserved");
    process.exit(1);
}

process.exit(0);
