document.addEventListener("DOMContentLoaded", () => {
    // --- AUDIO SETUP ---
    const sfx = {
        boot: document.getElementById('audio-boot'),
        keystroke: document.getElementById('audio-keystroke'),
        send: document.getElementById('audio-send'),
        receive: document.getElementById('audio-receive'),
    };

    // --- 3D NEURAL CORE BACKGROUND ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('neural-core'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00f6ff, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    camera.position.z = 5;

    function animate3D() {
        requestAnimationFrame(animate3D);
        sphere.rotation.x += 0.0005;
        sphere.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate3D();
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // --- SYSTEM TELEMETRY ---
    const tempEl = document.getElementById('telemetry-temp');
    const fluxEl = document.getElementById('telemetry-flux');
    const streamsEl = document.getElementById('telemetry-streams');
    setInterval(() => {
        tempEl.textContent = `${(72.0 + Math.random() * 2).toFixed(1)}°C`;
        fluxEl.textContent = `${(98.0 + Math.random()).toFixed(1)}%`;
        streamsEl.textContent = `${(4.0 + Math.random()).toFixed(1)}M/s`;
    }, 2000);

    // --- CHAT FUNCTIONALITY ---
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    
    // --- BOOT SEQUENCE ---
    sfx.boot.play();
    const initialMessage = "System online. D.A.I. core synced. Awaiting command.";
    const firstBotMessage = createBotMessage();
    dataStreamEffect(firstBotMessage, initialMessage);

    userInput.addEventListener('input', () => {
        sfx.keystroke.currentTime = 0;
        sfx.keystroke.play();
    });

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const messageText = userInput.value.trim();
        if (!messageText) return;
        
        sfx.send.play();
        appendUserMessage(messageText);
        userInput.value = "";

        const botMessageElement = createBotMessage();

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText }),
            });
            if (!response.ok) throw new Error(`Network Error`);
            const data = await response.json();
            dataStreamEffect(botMessageElement, data.reply);
        } catch (error) {
            dataStreamEffect(botMessageElement, "CRITICAL ERROR: NEURAL LINK SEVERED. ATTEMPTING TO RECONNECT...");
        }
    });

    function appendUserMessage(text) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message user-message";
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(messageDiv);
        scrollToBottom();
    }

    function createBotMessage() {
        sfx.receive.play();
        const messageDiv = document.createElement("div");
        messageDiv.className = "message bot-message";
        const p = document.createElement("p");
        messageDiv.appendChild(p);
        chatBox.appendChild(messageDiv);
        scrollToBottom();
        return p;
    }

    function dataStreamEffect(element, text) {
        let i = 0;
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        element.textContent = "";

        const interval = setInterval(() => {
            let revealedText = text.substring(0, i);
            let randomChars = '';
            for (let j = 0; j < 5; j++) {
                randomChars += chars[Math.floor(Math.random() * chars.length)];
            }
            element.textContent = revealedText + randomChars;
            
            if (i >= text.length) {
                element.textContent = text;
                clearInterval(interval);
            }
            i++;
            scrollToBottom();
        }, 30);
    }
    
    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});