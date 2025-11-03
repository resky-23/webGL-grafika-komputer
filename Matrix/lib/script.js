var gl,
    shaderProgram,
    vertices,
    matrix = mat4.create(), // PENTING: Membuat matriks identitas menggunakan library
    vertexCount = 30; // Jumlah titik yang akan digambar

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
    vertices = [];
    
    // Menghasilkan posisi acak untuk semua vertex (30 titik * 2 komponen/titik = 60 nilai)
    // Catatan: Walaupun *shader* menggunakan vec4 (X, Y, Z), kita hanya *push* X dan Y
    // Z diasumsikan 0.0 jika kita menggunakan gl.vertexAttribPointer(..., 2, ...)
    for(var i = 0; i < vertexCount; i++) {
        vertices.push(Math.random() * 2 - 1); // X
        vertices.push(Math.random() * 2 - 1); // Y
        // Z secara implisit akan menjadi 0.0 jika attribute size di set 2.
    }
    
    // 1. BUFFERS UNTUK POSISI (coords)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Menggunakan gl.STATIC_DRAW karena vertex tidak berubah
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    // 2 komponen per vertex (X, Y)
    gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0); 
    gl.enableVertexAttribArray(coords);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    
    // 2. ATRIBUT NON-BUFFERED (PointSize)
    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 20); // Ukuran titik diset 20

    // 3. WARNA UNIFORM (Hitam)
    var color = gl.getUniformLocation(shaderProgram, "color");
    gl.uniform4f(color, 0, 0, 0, 1); // Hitam
}

// --- DRAW/ANIMATION LOOP FUNCTION ---

function draw() {
    // 1. Reset Matriks ke Identitas
    mat4.identity(matrix); 
    
    // 2. Terapkan Rotasi Bertahap menggunakan gl-matrix (mat4.rotate[X, Y, Z])
    // PENTING: Operasi gl-matrix bersifat kumulatif (hasil ditulis ke matriks pertama)
    // Rotasi X: -0.007 radian
    mat4.rotateX(matrix, matrix, -0.007); 
    // Rotasi Y: 0.013 radian
    mat4.rotateY(matrix, matrix, 0.013); 
    // Rotasi Z: 0.01 radian
    mat4.rotateZ(matrix, matrix, 0.01); 

    // 3. Kirim Matriks ke Shader
    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    // gl.uniformMatrix4fv(location, transpose=false, value)
    gl.uniformMatrix4fv(transformMatrix, false, matrix);

    // 4. Drawing
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Gambar semua titik sebagai Segitiga (gl.TRIANGLES)
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount); 
    
    // 5. Loop Animasi
    requestAnimationFrame(draw);
}

// --- GET SHADER FUNCTION ---

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