const apiKey = "AIzaSyA5MInkpSbdSbmozCQSuBY3pylSTgmLlaM";

document.getElementById("defaultOpen").click();

document.getElementById('processBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;

    if (!fileInput.files[0]) {
        alert("Please upload an image.");
        return;
    }

    const file = fileInput.files[0];
    const base64Image = await toBase64(file);

    const detectedText = await detectText(base64Image);
    if (!detectedText) {
        alert("Failed to detect text. Please try again.");
        return;
    }

    document.getElementById('detectedText').innerText = detectedText;

    const translatedText = await translateText(detectedText, sourceLang, targetLang);
    document.getElementById('translatedText').innerText = translatedText || "Translation failed.";
});

document.getElementById('translateTextBtn').addEventListener('click', async () => {
    const inputText = document.getElementById('inputText').value;
    const sourceLang = document.getElementById('sourceLangText').value;
    const targetLang = document.getElementById('targetLangText').value;

    if (!inputText) {
        alert("Please enter text to translate.");
        return;
    }

    const translatedText = await translateText(inputText, sourceLang, targetLang);
    document.getElementById('translatedTextResult').innerText = translatedText || "Translation failed.";
});

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
}

async function detectText(base64Image) {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: "TEXT_DETECTION", maxResults: 10 }]
                }
            ]
        })
    });

    const result = await response.json();
    return result.responses?.[0]?.textAnnotations?.[0]?.description || null;
}

async function translateText(text, fromLang, toLang) {
    const token = await fetchTranslationToken();
    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLang}&to=${toLang}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify([{ Text: text }])
    });

    const result = await response.json();
    return result[0]?.translations?.[0]?.text || null;
}

async function fetchTranslationToken() {
    const response = await fetch("https://api.cognitive.microsoft.com/sts/v1.0/issueToken", {
        method: "POST",
        headers: {
            "Ocp-Apim-Subscription-Key": "429588a945804ec09a8c981c3b324c5f"
        }
    });

    return response.text();
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}