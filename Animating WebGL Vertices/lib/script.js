var gl,
    shaderProgram,
    vertices,
    vertexBuffer, // Variabel global untuk buffer
    vertexCount = 5000; // Jumlah titik yang akan dianimasikan

// Panggilan fungsi utama
initGL();
createShaders();
createVertices();
draw();

// --- INIT GL FUNCTION (Lini 11-17) ---
function initGL() {
    var canvas = document.getElementById("canvas");
    // console.log(canvas); // Dihapus/Dikomendasikan
    
    if (!canvas) {
        console.error("Canvas element not found.");
        return;
    }

    gl = canvas.getContext("webgl");
    
    if (!gl) {
        console.error("Failed to get WebGL context.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1); // Latar belakang putih
}

// --- CREATE SHADERS FUNCTION (Lini 19-28) ---
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

// --- CREATE VERTICES FUNCTION (Lini 30-53) ---
function createVertices() {
    vertices = [];
    
    // Inisialisasi posisi acak untuk semua vertex
    for(var i = 0; i < vertexCount; i++) {
        vertices.push(Math.random() * 2 - 1); // X: -1.0 hingga 1.0
        vertices.push(Math.random() * 2 - 1); // Y: -1.0 hingga 1.0
    }
    
    // 1. BUFFERS UNTUK POSISI (coords)
    vertexBuffer = gl.createBuffer(); // Buat buffer global
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // PENTING: Gunakan gl.DYNAMIC_DRAW karena data akan sering diubah
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); 

    // Dapatkan lokasi 'coords'
    var coords = gl.getAttribLocation(shaderProgram, "coords");
    
    // Menghubungkan buffer ke atribut 'coords'
    // Setiap vertex memiliki 2 komponen (x, y)
    gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(coords);
    
    // Melepaskan buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    
    // 2. ATRIBUT NON-BUFFERED (PointSize)
    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 1); // Ukuran titik diset 1

    // 3. WARNA UNIFORM (Hitam)
    var color = gl.getUniformLocation(shaderProgram, "color");
    gl.uniform4f(color, 0, 0, 0, 1); 
}

// --- DRAW FUNCTION (Lini 54-65) ---
function draw() {
    // 1. Perbarui Data Posisi Vertices (Animasi)
    for(var i = 0; i < vertexCount * 2; i += 2) {
        // Tambahkan pergerakan acak kecil
        // Math.random() * 0.01 - 0.005 menghasilkan pergerakan antara -0.005 hingga +0.005
        vertices[i] += Math.random() * 0.01 - 0.005; // Perbarui X
        vertices[i + 1] += Math.random() * 0.01 - 0.005; // Perbarui Y

        // Optional: Wrap around (kembalikan titik jika keluar batas)
        if (vertices[i] > 1.0) vertices[i] = -1.0;
        if (vertices[i] < -1.0) vertices[i] = 1.0;
        if (vertices[i + 1] > 1.0) vertices[i + 1] = -1.0;
        if (vertices[i + 1] < -1.0) vertices[i + 1] = 1.0;
    }
    
    // 2. Kirim data baru ke GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // PENTING: Gunakan gl.bufferSubData untuk memperbarui hanya data (offset 0)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    
    // 3. Drawing
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, vertexCount); 
    
    // 4. Loop Animasi
    requestAnimationFrame(draw);
}


/* --- FUNGSI GET SHADER (Diambil dari Pola Kode Sebelumnya) --- */

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