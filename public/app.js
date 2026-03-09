const messagesDiv = document.getElementById('messages');
const input = document.getElementById('userInput');
const history = [];

// Welcome message
window.addEventListener('load', () => {
    addMessage('bot', "Hi there! 👋 I can help you book an appointment. What service are you interested in?");
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    input.disabled = true;

    history.push({ role: 'user', content: text });

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'message bot typing';
    typing.textContent = 'Typing...';
    messagesDiv.appendChild(typing);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history })
        });
        const data = await res.json();

        typing.remove();

        if (data.error) {
            addMessage('bot', 'Sorry, something went wrong. Can you try again?');
        } else {
            addMessage('bot', data.reply);
            history.push({ role: 'assistant', content: data.reply });
        }
    } catch (err) {
        typing.remove();
        addMessage('bot', 'Connection error. Make sure the server is running.');
    }

    input.disabled = false;
    input.focus();
}
