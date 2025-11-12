// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const imagePreview = document.getElementById('imagePreview');
const changeImageBtn = document.getElementById('changeImageBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const recipeContent = document.getElementById('recipeContent');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const newSearchBtn = document.getElementById('newSearchBtn');
const retryBtn = document.getElementById('retryBtn');

let selectedFile = null;

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
changeImageBtn.addEventListener('click', resetUpload);
analyzeBtn.addEventListener('click', analyzeImage);
newSearchBtn.addEventListener('click', resetUpload);
retryBtn.addEventListener('click', resetUpload);

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#764ba2';
    uploadArea.style.background = '#f0f2ff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f8f9ff';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f8f9ff';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Handle file processing
function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('אנא בחר קובץ תמונה');
        return;
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
        showError('גודל התמונה צריך להיות פחות מ-4MB');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        uploadArea.style.display = 'none';
        previewSection.style.display = 'block';
        errorSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Convert image to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Get base64 string without the data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Analyze image
async function analyzeImage() {
    if (!selectedFile) return;

    // Show loading state
    analyzeBtn.disabled = true;
    previewSection.style.display = 'none';
    loading.style.display = 'block';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';

    try {
        // Convert image to base64
        const base64Image = await fileToBase64(selectedFile);

        // Call Netlify function
        const response = await fetch('/.netlify/functions/analyze-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                mimeType: selectedFile.type
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'נכשל בניתוח התמונה');
        }

        // Display recipe
        displayRecipe(data.recipe);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'נכשל בניתוח התמונה. אנא נסה שוב.');
        previewSection.style.display = 'block';
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Display recipe
function displayRecipe(recipe) {
    recipeContent.innerHTML = formatRecipe(recipe);
    // Display the uploaded image with the recipe
    resultImage.src = imagePreview.src;
    resultImage.style.display = 'block';
    resultSection.style.display = 'block';
}

// Format recipe text with basic markdown-like parsing
function formatRecipe(text) {
    // Split into lines and process
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<br>';
            return;
        }

        // Headers
        if (line.startsWith('##')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<h3>${line.replace(/^##\s*/, '')}</h3>`;
        }
        // List items
        else if (line.match(/^[-*]\s/) || line.match(/^\d+\.\s/)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '')}</li>`;
        }
        // Regular text
        else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<p>${line}</p>`;
        }
    });

    if (inList) {
        html += '</ul>';
    }

    return html;
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    loading.style.display = 'none';
}

// Reset upload
function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    resultSection.style.display = 'none';
    resultImage.style.display = 'none';
    errorSection.style.display = 'none';
    loading.style.display = 'none';
}
