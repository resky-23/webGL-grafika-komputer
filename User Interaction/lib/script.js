var gl,
    shaderProgram,
    vertices,
    vertexBuffer, // Variabel global untuk buffer
    vertexCount = 5000;
    
// Variabel global untuk posisi mouse dalam koordinat WebGL (-1.0 hingga 1.0)
var mouseX = 0,
    mouseY = 0;

// --- A. SETUP UTAMA DAN EVENT LISTENER ---

// PENTING: Pemasangan event listener harus dilakukan setelah canvas tersedia
window.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Awal
    initGL();
    createShaders();
    createVertices();
    
    // 2. Setup Event Listener
    var canvas = document.getElementById("canvas");
    if (canvas) {
        // Event listener "mousemove" untuk melacak kursor
        canvas.addEventListener("mousemove", function(event) {
            // Konversi koordinat layar (0 ke 600) ke WebGL (-1.0 ke 1.0)
            mouseX = map(event.clientX, 0, canvas.width, -1, 1);
            // Koordinat Y WebGL terbalik (atas=1, bawah=-1), sehingga konversi Y harus dibalik.
            mouseY = map(event.clientY, 0, canvas.height, 1, -1);
        });
    }

    // 3. Mulai Loop Gambar
    draw();
});

// PENTING: Fungsi map() untuk konversi koordinat
function map(value, minSrc, maxSrc, minDst, maxDst) {
    // Rumus Mapping: (value - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst
    return (value - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}

// --- B. FUNGSI INISIALISASI ---

function initGL() {
    var canvas = document.getElementById("canvas");
    if (!canvas) return false;

    gl = canvas.getContext("webgl");
    if (!gl) return false;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1); // Latar belakang putih
    
    return true;
}

function createShaders() {
    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");
    
    if (!vertexShader || !fragmentShader) return;

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

function createVertices() {
    vertices = [];
    
    // Inisialisasi posisi acak untuk semua vertex
    for(var i = 0; i < vertexCount; i++) {
        vertices.push(Math.random() * 2 - 1); // X: -1.0 hingga 1.0
        vertices.push(Math.random() * 2 - 1); // Y: -1.0 hingga 1.0
    }
    
    // 1. BUFFERS UNTUK POSISI (coords)
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); 

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(coords);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    
    // 2. ATRIBUT NON-BUFFERED (PointSize)
    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 5); // Ukuran titik diset 5

    // 3. WARNA UNIFORM (Merah)
    var color = gl.getUniformLocation(shaderProgram, "color");
    gl.uniform4f(color, 1, 0, 0, 1); // Merah
}

// --- C. DRAW/ANIMATION LOOP FUNCTION ---

function draw() {
    // Loop melalui semua vertices (setiap 2 elemen = satu titik)
    for(var i = 0; i < vertexCount * 2; i += 2) {
        // dx = jarak horizontal dari mouse ke titik
        var dx = vertices[i] - mouseX;
        // dy = jarak vertikal dari mouse ke titik
        var dy = vertices[i + 1] - mouseY;
        
        // Jarak Euclidean (Pythagoras)
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        // Cek apakah titik berada di dalam radius pengaruh (dist < 0.2)
        if (dist < 0.2) {
            // Logika Menjauh (Repel)
            
            // Hitung vektor normalisasi (dx/dist, dy/dist)
            // Kalikan dengan faktor dorongan (0.2)
            vertices[i] = mouseX + dx / dist * 0.2; // Posisi X baru
            vertices[i + 1] = mouseY + dy / dist * 0.2; // Posisi Y baru
        } else {
            // Jika di luar radius, lakukan pergerakan acak kecil (Animasi dasar)
            vertices[i] += Math.random() * 0.01 - 0.005;
            vertices[i + 1] += Math.random() * 0.01 - 0.005;
        }
    }
    
    // Kirim data vertices yang sudah diperbarui ke GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    
    // Drawing
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, vertexCount); 
    
    // Loop Animasi
    requestAnimationFrame(draw);
}

// --- D. GET SHADER FUNCTION ---

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) { return null; }

    var theSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}