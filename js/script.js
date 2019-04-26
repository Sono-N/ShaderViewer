onload = function(){
    main();
}
function main(){
    /* get canvas*/
    var canv = document.getElementById('canvas');
    /* get WebGL context*/
    var gl = canv.getContext('webgl');
    /*setting canvas*/
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    /*create two shaders*/
    var v_shader = create_shader(gl, 'vshader');
    var f_shader = create_shader(gl, 'fshader');
    /*create program*/
    var program = create_program(gl, v_shader, f_shader);
    /* attribute Location setting*/
    var attLocation = [];
    attLocation[0] = gl.getAttribLocation(program, 'position');
    attLocation[1] = gl.getAttribLocation(program, 'color');
    attLocation[2] = gl.getAttribLocation(program, 'normal');
    /* attSize (num of element for a vertex)*/
    var attSize = [];
    attSize[0] = 3;//position(x,y,x)
    attSize[1] = 4;//color(r,g,b,a)
    attSize[2] = 3;//(x,y,z)
    /*sphere*/
    var sphereData = sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
    var position = sphereData.p;
    var normal = sphereData.n;
    var color = sphereData.c;
    var index = sphereData.i;
    /* create vbo*/
    var vbo = new Array();
    vbo[0] = gl.createBuffer();
    vbo[1] = gl.createBuffer();
    vbo[2] = gl.createBuffer();

    var ibo =  gl.createBuffer();

    /* uniform Location setting*/
    var uniLocation = new Array();
    uniLocation[0] = gl.getUniformLocation(program, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(program, 'invMatrix');
    uniLocation[2] = gl.getUniformLocation(program, 'lightDirection');
    uniLocation[3] = gl.getUniformLocation(program, 'eyeDirection');
    uniLocation[4] = gl.getUniformLocation(program, 'ambientColor');

    set_vbo(gl, vbo[0], position, attLocation[0], attSize[0]);
    set_vbo(gl, vbo[1], color, attLocation[1], attSize[1]);
    set_vbo(gl, vbo[2], normal, attLocation[2], attSize[2]);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);

    /*Eye*/
    var eyeDirection = [0.0, 0.0, 1.0];
    /*Loght*/
    var ambientColor = [0.1, 0.1, 0.1, 1.0];
    var lightDirection = [1, 1, 1];

    var $lightDirectionX = $('#light-direction-x')
    $lightDirectionX.on('input', function(event) {
        lightDirection[0] = $lightDirectionX.val();
        drawScene();
    });
    var $lightDirectionY = $('#light-direction-y')
    $lightDirectionY.on('input', function(event) {
        lightDirection[1] = $lightDirectionY.val();
        drawScene();
    });
    var $lightDirectionZ = $('#light-direction-z')
    $lightDirectionZ.on('input', function(event) {
        lightDirection[2] = $lightDirectionZ.val();
        drawScene();
    });

    drawScene();


    function drawScene(){
        /* clear canvas*/
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        /* adjust WebGL view size according to canvas size*/
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        /*model view projection mat*/
        var m = new mat();
        var m_mat = m.rotatex(70);
        var v_mat = m.lookat([0.0, 0, 5], [0, 0, 0], [0, 1, 0]);
        var p_mat = m.perspective(90, canv.width/canv.height, 0.1, 100);
        var pv_mat = m.multiply(p_mat, v_mat);

        var mvp = m.multiply(pv_mat, m_mat);
        mvp = m.transpose(mvp);

        var inv = m.inverse(m_mat);
        inv = m.transpose(inv);

        /* set uniform*/
        gl.uniformMatrix4fv(uniLocation[0], false, mvp);
        gl.uniformMatrix4fv(uniLocation[1], false, inv);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform3fv(uniLocation[3], eyeDirection);
        gl.uniform4fv(uniLocation[4], ambientColor);

        console.log(m.inverse([1,2,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));

        /*draw*/
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();
    }
}

function sphere(row, column, rad, color){
    var pos = new Array(), nor = new Array(),
        col = new Array(), idx = new Array();
    for(var i = 0; i <= row; i++){
        var r = Math.PI / row * i;
        var ry = Math.cos(r);
        var rr = Math.sin(r);
        for(var ii = 0; ii <= column; ii++){
            var tr = Math.PI * 2 / column * ii;
            var tx = rr * rad * Math.cos(tr);
            var ty = ry * rad;
            var tz = rr * rad * Math.sin(tr);
            var rx = rr * Math.cos(tr);
            var rz = rr * Math.sin(tr);
            var tc = [0.5, 0.5, 0.0, 1.0];
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            col.push(tc[0], tc[1], tc[2], tc[3]);
        }
    }
    r = 0;
    for(i = 0; i < row; i++){
        for(ii = 0; ii < column; ii++){
            r = (column + 1) * i + ii;
            idx.push(r, r + 1, r + column + 2);
            idx.push(r, r + column + 2, r + column + 1);
        }
    }
    return {p : pos, n : nor, c : col, i : idx};
}

function change_right(x,y,z){

}

function set_vbo(gl, vbo, vertices, attLocation, attSize){
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, attSize, gl.FLOAT, false, 0, 0);
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

