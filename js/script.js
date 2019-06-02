var now_obj = "";
var attLocation = [];
var uniLocation = [];
var env_name_directory = "sky";

onload = function(){
    main('cube', 0 );
}

function changeShader(shader_name){
    httpv = new XMLHttpRequest();
    httpv.open('GET',"shaders/"+shader_name+"/vertex.txt"+"?"+(new Date()).getTime(),true);
    httpv.send(null);
    httpv.onreadystatechange = function(){
        if ((httpv.readyState == 4) && (httpv.status == 200)){
            document.getElementById("vshader").value=httpv.responseText;
        }
    }
    httpf = new XMLHttpRequest();
    httpf.open('GET',"shaders/"+shader_name+"/fragment.txt"+"?"+(new Date()).getTime(),true);
    httpf.send(null);
    httpf.onreadystatechange = function(){
        if ((httpf.readyState == 4) && (httpf.status == 200)){
            document.getElementById("fshader").value=httpf.responseText;
            main(now_obj,1);
        }
    }
}

function main(obj_name, is_redraw){
    /* get canvas*/
    var canv = document.getElementById('canvas');
    width = canv.width;
    height = canv.height;

    /* get WebGL context*/
    var gl = canv.getContext('webgl');

    /*setting canvas*/
    gl.enable(gl.CULL_FACE);
    //gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /*create two shaders*/
    var v_shader = create_shader(gl, 'vshader');
    var f_shader = create_shader(gl, 'fshader');
    /*create program*/
    var program = create_program(gl, v_shader, f_shader);
    /* attribute Location setting*/
    attLocation[0] = gl.getAttribLocation(program, 'position');
    attLocation[1] = gl.getAttribLocation(program, 'color');
    attLocation[2] = gl.getAttribLocation(program, 'normal');
    attLocation[3] = gl.getAttribLocation(program, 'texture_coordinates');

    /* attSize (num of element for a vertex)*/
    var attSize = [];
    attSize[0] = 3;//position(x,y,x)
    attSize[1] = 4;//color(r,g,b,a)
    attSize[2] = 3;//(x,y,z)
    attSize[3] = 2;//(x,y)

    /*emvironmental mapping*/
    var envTexture;
    var envSource = new Array(
        'img/env/'+env_name_directory+'/cube_pos_x.png',
        'img/env/'+env_name_directory+'/cube_pos_y.png',
        'img/env/'+env_name_directory+'/cube_pos_z.png',
        'img/env/'+env_name_directory+'/cube_neg_x.png',
        'img/env/'+env_name_directory+'/cube_neg_y.png',
        'img/env/'+env_name_directory+'/cube_neg_z.png');
    var envTarget = new Array(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
    promise = new Promise((resolve, reject) =>{
        resolve();
    })
    create_env_texture(envSource, envTarget);

    /*FrameBuffer*/
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 256, 256);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    var frameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameTexture,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /*back obj*/
    var backObj = cube(100.0, new Array(1.0, 1.0, 1.0));
    //var backObj = sphere(64, 64, 2.0, 0);
    var back_position = backObj.p;
    var back_normal = list_inverse(backObj.n);
    var back_color = backObj.c;
    var back_texture_coordinates = backObj.t;
    var back_index = index_reverse(backObj.i, 3);
    /*create vbo*/
    var back_vbo = new Array();
    back_vbo[0] = gl.createBuffer();
    back_vbo[1] = gl.createBuffer();
    back_vbo[2] = gl.createBuffer();
    back_vbo[3] = gl.createBuffer();
    var back_ibo = gl.createBuffer();

    /*color setting*/
    var r = $('#color-r').val()/255;
    var g = $('#color-g').val()/255;
    var b = $('#color-b').val()/255;

    /*obj data*/
    var objData
    now_obj = obj_name;
    if(obj_name == 'sphere'){
        objData = sphere(64, 64, 2.0, new Array(r, g, b));
    }else if(obj_name == 'cube'){
        objData = cube(3.0, new Array(r, g, b));
    }else if(obj_name == 'plane'){
        objData = plane(4.0, new Array(r, g, b));
    }
    var position = objData.p;
    var normal = objData.n;
    var color = objData.c;
    var texture_coordinates = objData.t;
    var index = objData.i;

    /* create vbo*/
    var vbo = new Array();
    vbo[0] = gl.createBuffer();
    vbo[1] = gl.createBuffer();
    vbo[2] = gl.createBuffer();
    vbo[3] = gl.createBuffer();

    var ibo =  gl.createBuffer();

    /* uniform Location setting*/
    uniLocation[0] = gl.getUniformLocation(program, 'mvpMatrix');
    uniLocation[1] = gl.getUniformLocation(program, 'invMatrix');
    uniLocation[2] = gl.getUniformLocation(program, 'lightDirection');
    uniLocation[3] = gl.getUniformLocation(program, 'eyeDirection');
    uniLocation[4] = gl.getUniformLocation(program, 'ambientColor');
    uniLocation[5] = gl.getUniformLocation(program, 'texture1');
    uniLocation[6] = gl.getUniformLocation(program, 'texture2');
    uniLocation[7] = gl.getUniformLocation(program, 'back');
    uniLocation[8] = gl.getUniformLocation(program, 'cubeTexture');
    uniLocation[9] = gl.getUniformLocation(program, 'frameTexture');

    /*create texture*/
    var img1 = new Image();
    var img2 = new Image();
    img1.src = 'img/img01.jpg';
    img2.src = 'img/img02.jpg';
    var tex1 = gl.createTexture();
    var tex2 = gl.createTexture();

    /*Loght*/
    //var ambientColor = [0.1, 0.1, 0.1, 1.0];
    var lightDirection = [1, 1, 1];

    /*Position*/
    var cameraPosition = [0,0,5];
    var lookAt = [0,0,0];

    /*Eye*/
    var eyeDirection = [lookAt[0]-cameraPosition[0],lookAt[1]-cameraPosition[1],lookAt[2]-cameraPosition[2]];

    /*Model*/
    var modelScale = [1,1,1];

    /*myMatrix*/
    var m = new mat();

    /*model view projection mat*/
    var m_mat = m.rotatex(0);
    var v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
    var p_mat = m.perspective(90, canv.width/canv.height, 0.1, 100);
    var pv_mat = m.multiply(p_mat, v_mat);

    var m_mat_before;
    var m_mat_rotate = m.rotatex(0);

    /*back mmodel view projection mat*/
    var back_m_mat = m.rotatex(0);


    /*Setting*/
    settings();

    promise.then()

    if(img1){
        img1.onload = function(){
            gl.bindTexture(gl.TEXTURE_2D, tex1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img1);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
    }if(img2){
        img2.onload = function(){
            gl.bindTexture(gl.TEXTURE_2D, tex2);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img2);
            gl.generateMipmap(gl.TEXTURE_2D);
            drawScene();
        };
    }
    else{
        //drawScene();
    }

    function settings(){
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

        var $cameraPositionX = $('#camera-position-x')
        $cameraPositionX.on('input', function(event) {
            cameraPosition[0] = $cameraPositionX.val();
            if(cameraPosition[0] > 10){
                cameraPosition[0] = 10;
                $cameraPositionX.val(10);
            }
            else if(cameraPosition[0] < -10){
                cameraPosition[0] = -10;
                $cameraPositionX.val(-10);
            }
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });
        var $cameraPositionY = $('#camera-position-y')
        $cameraPositionY.on('input', function(event) {
            cameraPosition[1] = $cameraPositionY.val();
            if(cameraPosition[1] > 10){
                cameraPosition[1] = 10;
                $cameraPositionY.val(10);
            }
            else if(cameraPosition[1] < -10){
                cameraPosition[1] = -10;
                $cameraPositionY.val(-10);
            }
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });
        var $cameraPositionZ = $('#camera-position-z')
        $cameraPositionZ.on('input', function(event) {
            cameraPosition[2] = $cameraPositionZ.val();
            if(cameraPosition[2] > 10){
                cameraPosition[2] = 10;
                $cameraPositionZ.val(10);
            }
            else if(cameraPosition[2] < -10){
                cameraPosition[2] = -10;
                $cameraPositionZ.val(-10);
            }
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });

        var $lookAtX = $('#look-at-x')
        $lookAtX .on('input', function(event) {
            lookAt[0] = $lookAtX .val();
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });
        var $lookAtY = $('#look-at-y')
        $lookAtY .on('input', function(event) {
            lookAt[1] = $lookAtY .val();
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });
        var $lookAtZ = $('#look-at-z')
        $lookAtZ .on('input', function(event) {
            lookAt[2] = $lookAtZ .val();
            v_mat = m.lookat(cameraPosition, lookAt, [0, 1, 0]);
            pv_mat = m.multiply(p_mat, v_mat);
            drawScene();
        });
        /*
        var $ambientColorR = $('#ambient-color-r')
            $ambientColorR.on('input', function(event) {
            ambientColor[0] = $ambientColorR.val()/255;
            drawScene();
        });
        var $ambientColorG = $('#ambient-color-g')
            $ambientColorG.on('input', function(event) {
            ambientColor[1] = $ambientColorG.val()/255;
            drawScene();
        });
        var $ambientColorB = $('#ambient-color-b')
            $ambientColorB.on('input', function(event) {
            ambientColor[2] = $ambientColorB.val()/255;
            drawScene();
        });
        */

        var $eyeDirectionX = $('#eye-direction-x')
        $eyeDirectionX.on('input', function(event) {
            eyeDirection[0] = $eyeDirectionX.val();
            drawScene();
        });
        var $eyeDirectionY = $('#eye-direction-y')
            $eyeDirectionY.on('input', function(event) {
            eyeDirection[1] = $eyeDirectionY.val();
            drawScene();
        });
        var $eyeDirectionZ = $('#eye-direction-z')
        $eyeDirectionZ.on('input', function(event) {
            eyeDirection[2] = $eyeDirectionZ.val();
            drawScene();
        });
        var $scaleX= $('#scale-x');
        var $scaleY= $('#scale-y');
        var $scaleZ= $('#scale-z');
        var translate_before;
        $scaleX.on('input', function(event) {
            modelScale[0] = $scaleX.val();
            m_mat = m.multiply(m_mat_rotate,m.scale(modelScale));
            drawScene();
        });
        $scaleY.on('input', function(event) {
            modelScale[1] = $scaleY.val();
            m_mat = m.multiply( m_mat_rotate,m.scale(modelScale));
            drawScene();
        });
        $scaleZ.on('input', function(event) {
            modelScale[2] = $scaleZ.val();
            m_mat = m.multiply( m_mat_rotate,m.scale(modelScale));
            drawScene();
        });
    
        var $rotateX= $('#rotate-x');
        var $rotateY= $('#rotate-y');
        var $rotateZ= $('#rotate-z');
        var m_mat_rotate_before = m_mat;
        var rotate_before=0;
        $rotateX.on('focus', function(event) {
            m_mat_rotate_before = m_mat_rotate;
            rotate_before = $rotateX.val();
        });
        $rotateX.on('input', function(event) {
            m_mat_rotate = m.multiply(m.rotatex(($rotateX.val()-rotate_before)*0.02*Math.PI),m_mat_rotate_before);
            m_mat = m.multiply(m_mat_rotate,m.scale(modelScale));
            drawScene();
        });
        $rotateY.on('focus', function(event) {
            m_mat_rotate_before = m_mat_rotate;
            rotate_before = $rotateY.val();
        });
        $rotateY.on('input', function(event) {
            m_mat_rotate = m.multiply(m.rotatey(($rotateY.val()-rotate_before)*0.02*Math.PI),m_mat_rotate_before);
            m_mat = m.multiply(m_mat_rotate,m.scale(modelScale));
            drawScene();
        });
        $rotateZ.on('focus', function(event) {
            m_mat_rotate_before = m_mat_rotate;
            rotate_before = $rotateZ.val();
        });
        $rotateZ.on('input', function(event) {
            m_mat_rotate = m.multiply(m.rotatez(($rotateZ.val()-rotate_before)*0.02*Math.PI),m_mat_rotate_before);
            m_mat = m.multiply(m_mat_rotate, m.scale(modelScale));
            drawScene();
        });
    }

    function drawScene(){
        /* clear canvas*/
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        /* adjust WebGL view size according to canvas size*/
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex1);
        gl.uniform1i(uniLocation[5], 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tex2);
        gl.uniform1i(uniLocation[6], 1);

        var mvp = m.multiply(pv_mat, m_mat);
        mvp = m.transpose(mvp);
        var inv = m.inverse(m_mat);
        inv = m.transpose(inv);

        var back_mvp = m.multiply(pv_mat, back_m_mat);
        back_mvp = m.transpose(back_mvp);
        var back_inv = m.inverse(back_m_mat);
        back_inv = m.transpose(back_inv);

        /*set back vbo and ibo*/
        set_vbo(gl, back_vbo[0], back_position, attLocation[0], attSize[0]);
        set_vbo(gl, back_vbo[1], back_color, attLocation[1], attSize[1]);
        set_vbo(gl, back_vbo[2], back_normal, attLocation[2], attSize[2]);
        set_vbo(gl, back_vbo[3], back_texture_coordinates, attLocation[3], attSize[3]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, back_ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(back_index), gl.STATIC_DRAW);

        /* set uniform*/
        gl.uniformMatrix4fv(uniLocation[0], false, back_mvp);
        gl.uniformMatrix4fv(uniLocation[1], false, back_inv);
        gl.uniform1i(uniLocation[7], true);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, envTexture);
        gl.uniform1i(uniLocation[8], 2);

        console.log("tex1: ",tex1);
        console.log("envTexture: ",envTexture);

        /*Type*/
        gl.drawElements(gl.TRIANGLES, back_index.length, gl.UNSIGNED_SHORT, 0);
        //gl.drawElements(gl.POINTS, back_index.length, gl.UNSIGNED_SHORT, 0);

        /* set uniform*/
        gl.uniformMatrix4fv(uniLocation[0], false, mvp);
        gl.uniformMatrix4fv(uniLocation[1], false, inv);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform3fv(uniLocation[3], eyeDirection);
        //gl.uniform4fv(uniLocation[4], ambientColor);
        gl.uniform1i(uniLocation[7], false);

        /*set vbo and ibo*/
        set_vbo(gl, vbo[0], position, attLocation[0], attSize[0]);
        set_vbo(gl, vbo[1], color, attLocation[1], attSize[1]);
        set_vbo(gl, vbo[2], normal, attLocation[2], attSize[2]);
        set_vbo(gl, vbo[3], texture_coordinates, attLocation[3], attSize[3]);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);

        /*draw*/
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();

        gl.disableVertexAttribArray(attLocation[0]);
        gl.disableVertexAttribArray(attLocation[1]);
        gl.disableVertexAttribArray(attLocation[2]);
        gl.disableVertexAttribArray(attLocation[3]);
    }

    function create_env_texture(source, target){
    var envImage =[];
    var envImageLoaded = [];
    var trigger;
    var texture = gl.createTexture();
    for(var i=0; i<source.length; i++){
        envImageLoaded[i] = false;
    }
    for(var i=0; i<source.length; i++){
        var img = new Image();
        img.src = source[i];
        console.log("check1 img", i);
        wait_loading(img, i);
        envImage[i] = img;
    }
    function wait_loading(img, index){
        console.log("check2 img", index);
        img.onload = function(){
            trigger =true;
            console.log("check3 img", index);
            envImageLoaded[index] = true;
            for(var i=0; i<source.length; i++){
                trigger = trigger&&envImageLoaded[i];
                console.log("check4 img", envImageLoaded[i]);
            }
            console.log("check5 img", trigger);
            if(trigger){
                console.log("check6 img");
                set_texture_cube_map();
            }
        };
    }

    function set_texture_cube_map(){
        console.log("check7 img");
        // bind texture to TEXTURE_CUBE_MAP
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        
        for(var i = 0; i < source.length; i++){
            // set texture to target
            gl.texImage2D(target[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, envImage[i]);
        }
        //generate mio map
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        // テクスチャパラメータの設定
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        envTexture = texture;
        console.log("bind texture");
        //bind to null
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        drawScene();
    }
    }
}

function sphere(row, coll, rad, color){
    var pos = new Array(), nor = new Array(),
        col = new Array(), tex = new Array(),
        idx = new Array();
    for(var i = 0; i <= row; i++){
        var r = Math.PI / row * i;
        var ry = Math.cos(r);
        var rr = Math.sin(r);
        for(var j = 0; j <= coll; j++){
            var tr = Math.PI * 2 / coll * j;
            var tx = rr * rad * Math.cos(tr);
            var ty = ry * rad;
            var tz = rr * rad * Math.sin(tr);
            var rx = rr * Math.cos(tr);
            var rz = rr * Math.sin(tr);
            //var tc = [0.8, 0.8, 0.0, 1.0];
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            var a_rx = Math.abs(rx);
            var a_ry = Math.abs(ry);
            var a_rz = Math.abs(rz);
            col.push(color[0],color[1],color[2], 1.0);
            /*
            switch(color_code){
                case 0:
                    col.push(0.5, 0.5, 0.5, 1.0);
                    break;
                case 1:
                    col.push(a_rx/(a_rx+a_ry+a_rz), a_ry/(a_rx+a_ry+a_rz), a_rz/(a_rx+a_ry+a_rz), 1.0);
                    break;
            }*/
            tex.push(1-1/coll*j ,1/row*i);
        }

    }
    r = 0;
    for(i = 0; i < row; i++){
        for(j = 0; j < coll; j++){
            r = (coll + 1) * i + j;
            idx.push(r, r + 1, r + coll + 2);
            idx.push(r, r + coll + 2, r + coll + 1);
        }
    }
    return {p : pos, n : nor, c : col, t : tex, i : idx};
}

function cube(length, color){
    var pos = new Array(), nor = new Array(),
        col = new Array(), tex = new Array(),
        idx = new Array();
        var s = length/2;
        pos = new Array(
            s,s,s, s,s,-s, -s,s,-s, -s,s,s,
            s,s,s, s,-s,s, s,-s,-s, s,s,-s, 
            s,s,-s, s,-s,-s, -s,-s,-s, -s,s,-s,
            -s,s,-s, -s,-s,-s, -s,-s,s, -s,s,s,
            -s,s,s, -s,-s,s, s,-s,s, s,s,s,
            s,-s,s, -s,-s,s, -s,-s,-s, s,-s,-s);
        nor = new Array(
            1,1,1, 1,1,-1, -1,1,-1, -1,1,1,
            1,1,1, 1,-1,1, 1,-1,-1, 1,1,-1, 
            1,1,-1, 1,-1,-1, -1,-1,-1, -1,1,-1,
            -1,1,-1, -1,-1,-1, -1,-1,1, -1,1,1,
            -1,1,1, -1,-1,1, 1,-1,1, 1,1,1,
            1,-1,1, -1,-1,1, -1,-1,-1, 1,-1,-1);
        for(var i=0; i<24; i++){
            col.push(color[0], color[1], color[2], 1.0);
        }
        /*
        switch(color_code){
            case 0:
                for(var i=0; i<24; i++){
                    col.push(0.5,0.5,0.5,1.0);
                }
                break;
            case 1:
                for(var i=0; i<24; i++){
                    var a_rx = Math.abs(nor[i*3]);
                    var a_ry = Math.abs(nor[i*3+1]);
                    var a_rz = Math.abs(nor[i*3+2]);
                    col.push(a_rx/(a_rx+a_ry+a_rz), a_ry/(a_rx+a_ry+a_rz), a_rz/(a_rx+a_ry+a_rz),1.0);
                }
                break;
        }*/
        tex = new Array(
            0,0, 0,1, 1,1, 1,0,
            0,0, 0,1, 1,1, 1,0,
            0,0, 0,1, 1,1, 1,0,
            0,0, 0,1, 1,1, 1,0,
            0,0, 0,1, 1,1, 1,0,
            0,0, 0,1, 1,1, 1,0);
        idx = new Array(
            0,1,2, 0,2,3,
            4,5,6, 4,6,7,
            8,9,10, 8,10,11,
            12,13,14, 12,14,15,
            16,17,18, 16,18,19,
            20,21,22, 20,22,23);
    return {p : pos, n : nor, c : col, t : tex, i : idx};
}

function index_reverse(list, size){
    var dest = new Array
    for(var i=0; i<list.length/size; i++){
        for(var j=0; j<size; j++){
            dest.push(list[i*size+(size-1-j)]);
        }
    }
    return dest;
}

function list_inverse(list, size){
    var dest = new Array
    var length = list.length;
    for(var i=0; i<length; i++){
        dest.push(list[length-1-i]);
    }
    return dest;
}


function plane(width, color){
    var pos = new Array(), nor = new Array(),
        col = new Array(), tex = new Array(),
        idx = new Array();
        var s = width/2;
        pos = new Array(
            -s, s, 0,
            s, s, 0,
            -s, -s, 0,
            s, -s, 0);
        nor = new Array(
            -1, 1, 0,
            1, 1, 0,
            -1, -1, 0,
            1, -1, 0);
        for(var i=0; i<4; i++){
            col.push(color[0], color[1], color[2],1.0);
        }
        /*
        switch(color_code){
            case 0:
                for(var i=0; i<4; i++){
                    col.push(0.5,0.5,0.0,1.0);
                }
                break;
            case 1:
                col = new Array(
                    0,1,0,1,
                    0.3,1,0,1,
                    0.6,1,0,1,
                    1,1,0,1);
                break;
        }*/
        tex = new Array(
            0,0,
            1,0,
            0,1,
            1,1);
        idx = new Array(
            2,1,0,
            1,2,3);
    return {p : pos, n : nor, c : col, t : tex, i : idx};
}

function set_vbo(gl, vbo, vertices, attLocation, attSize){
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, attSize, gl.FLOAT, false, 0, 0);
}

function create_shader(gl, id){
    var shader;
    //var scriptElement = document.getElementById(id);
    var script_vars = document.getElementById(id+'_vars').text;
    var scriptElement = document.getElementById(id).value;

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
    //gl.shaderSource(shader, scriptElement.text);
    gl.shaderSource(shader, script_vars+scriptElement);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }else{
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
    //gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

function create_texture(gl, source){
    var img = new Image();
    img.src = source;
    img.onload = function(){
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        //gl.bindTexture(gl.TEXTURE_2D, null);
        texture = tex;
    };
}

function change_env(env_directory){
    env_name_directory = env_directory;
    main(now_obj);
}

