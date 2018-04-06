const spritesmith = require('spritesmith');
const fs = require('fs');
const path = require('path');

const IMG_DIR = '/img';
const PADDING = 10;
const IMG_NAME = 'padding';
const STYLE_TYPE = 'css';
const STYLE_NAME = 'style';

const imgNames = fs.readdirSync(__dirname + IMG_DIR).filter(v => {
    const imgType = ['jpeg', 'png', 'jpg'];
    const mat = v.match(/[^\.]*$/);
    if (mat) {
        return imgType.indexOf(mat[0]) !== -1;
    } else {
        return false;
    }
});

const urlArr = imgNames.reduce((a, v) => {
    a.push(`${__dirname}${IMG_DIR}/${v}`);
    return a;
}, []);

spritesmith.run({ src: urlArr, padding: PADDING }, (err, result) => {
    if (err) throw err;

    writeImg(result.image);
    writeScss(result, STYLE_TYPE);
});

/**
 * 生成图片
 * @param {Buffer} image 
 */
function writeImg(image) {
    const url = `${__dirname}${IMG_DIR}/dist/${IMG_NAME}.png`;
    createFolder(url);
    fs.writeFileSync(url, image);
}

/**
 * 生成样式文件
 */
function writeScss(result, type) {
    const scssStr = getScssDoc(result, type);
    const url = `${__dirname}${IMG_DIR}/dist/${STYLE_NAME}.${type}`;
    createFolder(url);
    fs.writeFileSync(url, scssStr);
}

/**
 * 检查文件路径是否存在，不存在则创建
 * @param {String} url 
 */
function createFolder(url) {
    const pathArr = path.dirname(url).split('/');
    let p = '';
    for (let i = 0; i < pathArr.length; i++) {
        p += pathArr[i] + path.sep;
        if (!fs.existsSync(p)) fs.mkdirSync(p);
    }
};

/**
 * 根据给的信息生成scss代码
 */
function getScssDoc(result, type) {
    const t = type && (type === 'scss' || type === 'css') ? type : 'scss';
    const preStr = t === 'scss' ? '@mixin ' : '.'
    return imgNames.reduce((s, v, i) => {
        const imgMsg = result.coordinates[urlArr[i]];
        s += `\n${preStr}${v.replace(/\.[^\.]*$/, '')} {
            height: ${imgMsg.height}px;
            width: ${imgMsg.width}px;
            background-position: ${imgMsg.x}px ${imgMsg.y}px;
        }`;
        return s;
    }, `${preStr}softImg {
            background: url(./${IMG_NAME}.png) no-repeat;
            background-size: ${result.properties.width}px ${result.properties.height}px
        }`
    );
}







