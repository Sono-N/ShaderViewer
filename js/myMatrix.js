/*-----------------------------------
my Matrix Calculation Set
-----------------------------------*/

//3Dの演算に特化
function mat() {
    this.create = function(){
        return new Float32Array(16);
    };

    this.elementary = function(){
        return [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
        ];
    };
    
    this.add = function(m1, m2){
        var dest=[];
        dest[0]=m1[0]+m2[0]; dest[1]=m1[1]+m2[1]; dest[2]= m1[2]+m2[2]; dest[3]=m1[3]+m2[3];
        dest[4]=m1[4]+m2[4]; dest[5]=m1[5]+m2[5]; dest[6]= m1[6]+m2[6]; dest[7]=m1[7]+m2[7];
        dest[8]=m1[8]+m2[8]; dest[9]=m1[9]+m2[9]; dest[10]= m1[10]+m2[10]; dest[11]=m1[11]+m2[11];
        dest[12]=m1[12]+m2[12]; dest[13]=m1[13]+m2[13]; dest[14]= m1[14]+m2[14]; dest[15]=m1[15]+m2[15];
        return dest;
    };
    this.multiply = function(m1, m2){
        var dest=[];
        var m1_00=m1[0], m1_01=m1[1], m1_02=m1[2], m1_03=m1[3],
            m1_10=m1[4], m1_11=m1[5], m1_12=m1[6], m1_13=m1[7],
            m1_20=m1[8], m1_21=m1[9], m1_22=m1[10], m1_23=m1[11],
            m1_30=m1[12], m1_31=m1[13], m1_32=m1[14], m1_33=m1[15],

            m2_00=m2[0], m2_01=m2[1], m2_02=m2[2], m2_03=m2[3],
            m2_10=m2[4], m2_11=m2[5], m2_12=m2[6], m2_13=m2[7],
            m2_20=m2[8], m2_21=m2[9], m2_22=m2[10], m2_23=m2[11],
            m2_30=m2[12], m2_31=m2[13], m2_32=m2[14], m2_33=m2[15];

        dest[0] = m1_00*m2_00 + m1_01*m2_10 + m1_02*m2_20 + m1_03*m2_30;
        dest[1] = m1_00*m2_01 + m1_01*m2_11 + m1_02*m2_21 + m1_03*m2_31;
        dest[2] = m1_00*m2_02 + m1_01*m2_12 + m1_02*m2_22 + m1_03*m2_32;
        dest[3] = m1_00*m2_03 + m1_01*m2_13 + m1_02*m2_23 + m1_03*m2_33;
        dest[4] = m1_10*m2_00 + m1_11*m2_10 + m1_12*m2_20 + m1_13*m2_30;
        dest[5] = m1_10*m2_01 + m1_11*m2_11 + m1_12*m2_21 + m1_13*m2_31;
        dest[6] = m1_10*m2_02 + m1_11*m2_12 + m1_12*m2_22 + m1_13*m2_32;
        dest[7] = m1_10*m2_03 + m1_11*m2_13 + m1_12*m2_23 + m1_13*m2_33;
        dest[8] = m1_20*m2_00 + m1_21*m2_10 + m1_22*m2_20 + m1_23*m2_30;
        dest[9] = m1_20*m2_01 + m1_21*m2_11 + m1_22*m2_21 + m1_23*m2_31;
        dest[10] = m1_20*m2_02 + m1_21*m2_12 + m1_22*m2_22 + m1_23*m2_32;
        dest[11] = m1_20*m2_03 + m1_21*m2_13 + m1_22*m2_23 + m1_23*m2_33;
        dest[12] = m1_30*m2_00 + m1_31*m2_10 + m1_32*m2_20 + m1_33*m2_30;
        dest[13] = m1_30*m2_01 + m1_31*m2_11 + m1_32*m2_21 + m1_33*m2_31;
        dest[14] = m1_30*m2_02 + m1_31*m2_12 + m1_32*m2_22 + m1_33*m2_32;
        dest[15] = m1_30*m2_03 + m1_31*m2_13 + m1_32*m2_23 + m1_33*m2_33;
        return dest;
    };
    this.cross = function(vec1, vec2){
        var dest=[];
        var v1_0=vec1[0], v1_1=vec1[1], v1_2=vec1[2],
        v2_0=vec2[0], v2_1=vec2[1], v2_2=vec2[2];

        dest[0] = v1_1*v2_2 - v1_2*v2_1;
        dest[1] = v1_2*v2_0 - v1_0*v2_2;
        dest[2] = v1_0*v2_1 - v1_1*v2_0;
        return dest;
    };
    this.scale = function(vec){
        return[
        vec[0],0,0,0,
        0,vec[1],0,0,
        0,0,vec[2],0,
        0,0,0,1
        ];
    };
    this.translate = function(vec){
        return[
        1,0,0,vec[0],
        0,1,0,vec[1],
        0,0,1,vec[2],
        0,0,0,1
        ];
    };
    this.rotate = function(angle, axis){
        var sin = Math.sin(angle), cos = Math.cos(angle), cos_diff = 1-cos;
        var ax=axis[0], ay=axis[1], az=axis[2];
        return[
        cos+ax*ax*cos_diff, ax*ay*cos_diff-az*sin, az*ax*cos_diff+ay*sin,0,
        ax*ay*cos_diff+az*sin, cos+ay*ay*cos_diff, ay*az*cos_diff-ax*sin,0,
        z*ax*cos_diff-ay*sin, ay*az*cos_diff+ax*sin, cos+az*az*cos_diff,0,
        0,0,0,1
        ];
    };
    this.rotatex = function(angle){
        var sin = Math.sin(angle), cos = Math.cos(angle);
        return[
        1,0,0,0,
        0,cos,-sin,0,
        0,sin,cos,0,
        0,0,0,1
        ];
    };
    this.rotatey = function(angle){
        var sin = Math.sin(angle), cos = Math.cos(angle);
        return[
        cos,0,sin,0,
        0,1,0,0,
        -sin,0,cos,0,
        0,0,0,1
        ];
    };
    this.rotatez = function(angle){
        var sin = Math.sin(angle), cos = Math.cos(angle);
        return[
        cos,-sin,0,0,
        sin,cos,0,0,
        0,0,1,0,
        0,0,0,1
        ];
    };
    this.lookat = function(pos, goal, up){
        var ex=pos[0], ey=pos[1], ez=pos[2],
        ux=up[0], uy=up[1], uz=up[2],
        tx=goal[0], ty=goal[1], tz=goal[2];
        e_t=Math.sqrt((ex-tx)*(ex-tx)+(ey-ty)*(ey-ty)+(ez-tz)*(ez-tz));
        var z_=[(ex-tx)/e_t, (ey-ty)/e_t, (ez-tz)/e_t];
        console.log("check z_");
        console.log(z_);
        u_cross_z=this.cross(up,z_);
        console.log("check u_cross_z");
        console.log(u_cross_z);
        u_z = Math.sqrt(u_cross_z[0]*u_cross_z[0]+u_cross_z[1]*u_cross_z[1]+u_cross_z[2]*u_cross_z[2]);
        console.log("check u_z");
        console.log(u_z);
        var x_=[u_cross_z[0]/u_z, u_cross_z[1]/u_z, u_cross_z[2]/u_z];
        var y_=this.cross(z_, x_);
        console.log("check x_");
        console.log(x_);

        var xx = x_[0], xy=x_[1], xz=x_[2],
        yx=y_[0], yy=y_[1], yz=y_[2],
        zx=z_[0], zy=z_[1], zz=z_[2];
        return[
        xx, xy, xz, -ex*xx-ey*xy-ez*xz,
        yx, yy, yz, -ex*yx-ey*yy-ez*yz,
        zx, zy, zz, -ex*zx-ey*zy-ez*zz,
        0, 0, 0, 1
        ];
    };
    this.perspective = function(fovy, aspect, near, far){
        var top = near * Math.tan(fovy * Math.PI / 360);
        var right = top * aspect;
        var f = 1/Math.tan(fovy * Math.PI / 360);
        return[
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, -(far+near)/(far-near), -2*far*near/(far-near),
        0, 0, -1, 0
        ];
    };

    this.transpose = function(mat){
        var dest = [];
        dest[0] = mat[0]; dest[1] = mat[4]; dest[2] = mat[8]; dest[3] = mat[12];
        dest[4] = mat[1]; dest[5] = mat[5]; dest[6] = mat[9]; dest[7] = mat[13];
        dest[8] = mat[2]; dest[9]  = mat[6]; dest[10] = mat[10]; dest[11] = mat[14];
        dest[12] = mat[3]; dest[13] = mat[7]; dest[14] = mat[11]; dest[15] = mat[15];
        return dest;
    };

    this.det3 = function(mat){
        var m_00 = mat[0], m_01 = mat[1], m_02 = mat[2],
            m_10 = mat[3], m_11 = mat[4], m_12 = mat[5],
            m_20 = mat[6], m_21 = mat[7], m_22 = mat[8],
            a_012 = m_00*m_11*m_22,
            a_021 = m_00*m_12*m_21,
            a_102 = m_01*m_10*m_22,
            a_120 = m_01*m_12*m_20,
            a_201 = m_02*m_10*m_21,
            a_210 = m_02*m_11*m_20;

        console.log(a_012-a_021-a_102+a_120+a_201-a_210);
        return a_012-a_021-a_102+a_120+a_201-a_210;
    };

    this.inverse = function(mat){
        var dest=[];
        var det = 0;
        var m_00 = mat[0], m_01 = mat[1], m_02 = mat[2], m_03 = mat[3],
            m_10 = mat[4], m_11 = mat[5], m_12 = mat[6], m_13 = mat[7],
            m_20 = mat[8], m_21 = mat[9], m_22 = mat[10], m_23 = mat[11],
            m_30 = mat[12], m_31 = mat[13], m_32 = mat[14], m_33 = mat[15],

            det = (m_00*m_11 - m_01*m_10)*(m_22*m_33 - m_23*m_33);
            det += (-m_00*m_12 + m_02*m_10)*(m_21*m_33 - m_23*m_31);
            det += (m_00*m_13 - m_03*m_10)*(m_21*m_32 - m_22*m_31);
            det += (m_01*m_12 - m_02*m_11)*(m_20*m_33 - m_23*m_30);
            det += (-m_01*m_13 + m_03*m_11)*(m_20*m_32 - m_21*m_32);
            det += (m_02*m_13 - m_03*m_12)*(m_20*m_32 - m_22*m_30);

            console.log("det");
            console.log(det);

            inv_det = 1 / det;
        dest[0] = this.det3([m_11, m_12, m_13, m_21, m_22, m_23, m_31, m_32, m_33]) * inv_det;
        dest[1] = -this.det3([m_01, m_02, m_03, m_21, m_22, m_23, m_31, m_32, m_33]) * inv_det;
        dest[2] = this.det3([m_01, m_02, m_03, m_11, m_12, m_13, m_31, m_32, m_33]) * inv_det;
        dest[3] = -this.det3([m_01, m_02, m_03, m_11, m_12, m_13, m_21 ,m_22, m_23]) * inv_det;
        dest[4] = -this.det3([m_10, m_12, m_13, m_20, m_22, m_23, m_30, m_32, m_33]) * inv_det;
        dest[5] = this.det3([m_00, m_02, m_03, m_20, m_22, m_23, m_30, m_32, m_33]) * inv_det;
        dest[6] = -this.det3([m_00, m_02, m_03, m_10, m_12, m_13, m_30, m_32, m_33]) * inv_det;
        dest[7] = this.det3([m_10, m_11, m_12, m_20, m_21, m_22, m_30, m_31, m_32]) * inv_det;
        dest[8] = this.det3([m_10, m_11, m_13, m_20, m_21, m_23, m_31, m_32, m_33]) * inv_det;
        dest[9] = -this.det3([m_00, m_01, m_03, m_20, m_21, m_23, m_30, m_31, m_33]) * inv_det;
        dest[10] = this.det3([m_00, m_01, m_03, m_10, m_11, m_13, m_30, m_31, m_33]) * inv_det;
        dest[11] = -this.det3([m_00, m_01, m_03, m_10, m_11, m_13, m_20, m_21, m_23]) * inv_det;
        dest[12] = -this.det3([m_00, m_01, m_02, m_20, m_21, m_22, m_30, m_31, m_32]) * inv_det;
        dest[13] = this.det3([m_00, m_02, m_03, m_10, m_12, m_13, m_20, m_22, m_23]) * inv_det;
        dest[14] = -this.det3([m_00, m_01, m_02, m_10, m_11, m_12, m_30, m_31, m_32]) * inv_det;
        dest[15] = this.det3([m_00, m_01, m_02, m_10, m_11, m_12, m_20, m_21, m_22]) * inv_det;
        return dest;
    };
};