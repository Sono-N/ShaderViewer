

onload = function(){
    var canv = document.getElementById('canvas');
    canv.width = 500;
    canv.height = 500;

    var gl = canv.getContext('webgl');
    
    gl.clearColor(0.0,0.0,0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var v_shader = create_shader(gl, 'vshader');
    var f_shader = create_shader(gl, 'fshader');

    var program = create_program(gl, v_shader, f_shader);
1
    var vertex_positions = [
         1.0, 0.0, 0.0,
         0.0, 1.0, 0.0,
         -1.0, 0.0, 0.0,
         -1.0, 0.0, 0.0,
         0.0, -1.0, 0.0,
         1.0, 0.0, 0.0
    ];

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_positions), gl.STATIC_DRAW);

    var attLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attLocation);

    gl.vertexAttribPointer(attLocation,3, gl.FLOAT, false, 0, 0);

    var m = new mat();
    var v_mat = m.lookat([0.0, 1.0, 3], [0, 0, 0], [0, 1, 0]);
    //var v_mat = m.elementary();
    var p_mat = m.perspective(90, canv.width/canv.height, 0.1, 100);
    //var p_mat = m.elementary();
    var m_mat = m.elementary();

    var mvp = m.multiply(m.multiply(p_mat, v_mat),m_mat);
    console.log(mvp);
    mvp = m.transpose(mvp);
    console.log(mvp);

    var uniLocation = gl.getUniformLocation(program, 'mvpMat');

    gl.uniformMatrix4fv(uniLocation, false, mvp);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.flush();
}

function create_shader(gl, id){
    var shader;
    var scriptElement = document.getElementById(id);

    if(!scriptElement){return;}
    switch(id){
        case 'vshader':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        case 'fshader':
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default:
            return;
    }
    gl.shaderSource(shader, scriptElement.text);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }else{
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
}

function create_program(gl, vs, fs){
    var program = gl.createProgram();
    
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    
    gl.linkProgram(program);
    
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        gl.useProgram(program);
        return program;
    }else{
        alert(gl.getProgramInfoLog(program));
    }
}

function create_vbo(gl, data){
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

