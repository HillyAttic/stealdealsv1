const fs = require('fs');
const file = 'service-account.json';

try {
    let content = fs.readFileSync(file, 'utf8');
    console.log('Original length:', content.length);

    // Identify characters that should NOT be escaped in the private key string
    // A valid JSON string escape is \ followed by n, r, t, b, f, ", \, / or uXXXX
    // In a PEM key, usually only \n is used for newlines.

    // We will replace any \ followed by a character NOT in [n, r, t, b, f, ", \, /, u]
    // with that character itself (removing the backslash) or escape the backslash.

    // If someone copy-pasted raw PEM into a JSON string, they might have literal backslashes
    // that were intended to be there but weren't escaped as \\.

    // Let's see what we have
    const regex = /\\([^nrtbf"\\\/u])/g;
    let match;
    let badFound = false;
    while ((match = regex.exec(content)) !== null) {
        console.log(`Found invalid escape sequence: \\${match[1]} at index ${match.index}`);
        badFound = true;
    }

    if (!badFound) {
        console.log('No common invalid escape sequences found by regex.');
    } else {
        // Fix: replace \X with X or \\X? 
        // If it's a private key, the \ is almost certainly a typo or a mangled newline.
        // If it's \Q and Q is part of base64, the \ must go.

        const fixedContent = content.replace(/\\([^nrtbf"\\\/u])/g, '$1');
        fs.writeFileSync(file, fixedContent);
        console.log('Successfully repaired service-account.json (removed stray backslashes).');
    }

} catch (e) {
    console.error('Error repairing file:', e);
}
