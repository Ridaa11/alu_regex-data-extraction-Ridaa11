document.getElementById("scanBtn").addEventListener("click", scanText);

function scanText() {
    const text = document.getElementById("userText").value.trim();
    const output = document.getElementById("output");

    if (text === "") {
        output.innerHTML = `<p class="no-text">Please enter text.</p>`;
        return;
    }

    const detectors = {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
        phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
        url: /\bhttps?:\/\/[^\s]+/gi,
        creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
        money: /(?:\$|€|£)\s?\d+(?:,\d{3})*(?:\.\d{2})?/g,
        hashtag: /#\w+/g,
        html: /<\/?[a-zA-Z][^>]*>/g,
        time: /\b((1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM))|((2[0-3]|[01]?[0-9]):[0-5][0-9])\b/g
    };

    const found = {};
    let total = 0;

    for (const key in detectors) {
        const matches = text.match(detectors[key]) || [];
        if (matches.length > 0) {
            found[key] = matches;
            total += matches.length;
        }
    }

    renderResults(found, total);
}

function renderResults(found, total) {
    const output = document.getElementById("output");

    if (total === 0) {
        output.innerHTML = `
            <div class="success-box">
                <h3> No sensitive info found!</h3>
                <p>Your text looks clean.</p>
            </div>
        `;
        return;
    }

    let resultHTML = `
        <div class="warning-box">
            <h3> ${total} potential issue(s) found</h3>
        </div>
    `;

    for (const key in found) {
        const label = formatLabel(key);
        const level = getRiskLevel(key);

        resultHTML += `
            <div class="result-item ${level}">
                <strong>${label}</strong> (${found[key].length})
                <ul>
                    ${found[key]
                        .map(item => `<li>${maskSensitive(item, key)}</li>`)
                        .join("")}
                </ul>
            </div>
        `;
    }

    output.innerHTML = resultHTML;
}

function formatLabel(type) {
    const labels = {
        email: " Email Addresses",
        phone: " Phone Numbers",
        url: " URLs",
        creditCard: " Credit Cards",
        money: " Currency Values",
        hashtag: "#️ Hashtags",
        html: " HTML Tags",
        time: " Time Formats"
    };
    return labels[type] || type;
}

function getRiskLevel(type) {
    const levels = {
        creditCard: "high",
        email: "medium",
        phone: "medium",
        money: "medium",
        url: "low",
        html: "low",
        time: "low",
        hashtag: "low"
    };
    return levels[type] || "low";
}

function maskSensitive(text, type) {
    if (type === "creditCard") {
        return text.replace(/\d(?=\d{4})/g, "*");
    }
    if (type === "email") {
        return text.replace(/(?<=.).(?=[^@]*?@)/g, "*");
    }
    return text;
}