function sendCurationMessage() {
    const iframe = document.querySelector('iframe');
    const message = {
        type: "messageToFrontend",
        figureId: "fig1",
        message: {
            type: "SET_CURATION",
            curation: {}
        }
    };
    iframe.contentWindow.postMessage(message, 'https://figurl.org');
}

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');

    // Function to add a new message to the container
    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        // Try to stringify objects for better display
        let messageText;
        try {
            messageText = typeof message === 'object'
                ? JSON.stringify(message, null, 2)
                : String(message);
        } catch (error) {
            messageText = 'Unable to display message: ' + error.message;
        }

        // Create a pre element for formatted JSON display
        const preElement = document.createElement('pre');
        preElement.textContent = messageText;
        messageElement.appendChild(preElement);

        // Add the message at the top of the container
        messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
    }

    // Listen for messages from the iframe
    window.addEventListener('message', (event) => {
        // Check if the message is from the expected origin
        if (!event.origin.match(/^https?:\/\/(.*\.)?figurl\.org$/)) {
            console.warn('Received message from unexpected origin:', event.origin);
            return;
        }

        // Log the raw event for debugging
        console.log('Received message event:', event);

        // Add the message data to the display
        addMessage({
            origin: event.origin,
            data: event.data,
            timestamp: new Date().toISOString()
        });
    });

    // Add initial message
    addMessage('Listening for messages...');
});
