var gl,
    shaderProgram,
    vertices,
    angle = 0; // PENTING: Variabel global untuk sudut rotasi

// Panggilan fungsi utama
initGL();
createShaders();
createVertices();
draw();

// --- INIT GL FUNCTION ---
function initGL() {
    var canvas = document.getElementById("canvas");
    if (!canvas) return;

    gl = canvas.getContext("webgl");
    if (!gl) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1); // Latar belakang putih
}

// --- CREATE SHADERS FUNCTION ---
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

// --- CREATE VERTICES FUNCTION ---
function createVertices() {
    // 3 Titik untuk Segitiga dalam 3D (X, Y, Z)
    vertices = [
        -0.9, -0.9, 0.0,  // Titik 1
        0.0, -0.9, 0.0,   // Titik 2
        0.0, 0.9, 0.0     // Titik 3
    ];
    
    // 1. BUFFERS UNTUK POSISI (coords)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Menggunakan gl.STATIC_DRAW karena vertex tidak berubah
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    // 3 komponen per vertex (X, Y, Z)
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(coords);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    
    // 2. ATRIBUT NON-BUFFERED (PointSize)
    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 20); // Ukuran titik diset 20

    // 3. WARNA UNIFORM (Merah)
    var color = gl.getUniformLocation(shaderProgram, "color");
    gl.uniform4f(color, 1, 0, 0, 1); // Merah
}

// --- ROTATION FUNCTION ---

// Fungsi untuk membuat Matriks Rotasi pada Sumbu Y
function rotateY(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    
    // Matriks Rotasi Y (4x4, Column-Major Order)
    var matrix = new Float32Array([
        cos, 0, sin, 0,
        0, 1, 0, 0,
        -sin, 0, cos, 0,
        0, 0, 0, 1
    ]);
    
    // Kirim matriks ke shader melalui uniform
    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    // gl.uniformMatrix4fv(location, transpose, value)
    gl.uniformMatrix4fv(transformMatrix, false, matrix);
}

// --- DRAW/ANIMATION LOOP FUNCTION ---

function draw() {
    // 1. Perbarui Sudut dan Rotasi
    // Tingkatkan sudut rotasi sebesar 0.01 radian (sekitar 0.57 derajat)
    angle += 0.01; 
    rotateY(angle); // Hitung dan kirim matriks rotasi baru

    // 2. Drawing
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Gambar 3 titik sebagai segitiga
    gl.drawArrays(gl.TRIANGLES, 0, 3); 
    
    // 3. Loop Animasi
    requestAnimationFrame(draw);
}

// --- GET SHADER FUNCTION ---

/* Sumber: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context */
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