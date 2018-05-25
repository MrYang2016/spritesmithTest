const spritesmith = require('spritesmith');
const fs = require('fs');
const path = require('path');
const config = require('./sprit_config.json');
const mime = require('mime-types');

const IMG_DIR = config.imgDir;
const PADDING = config.padding;
const IMG_NAME = config.imgName;
const STYLE_TYPE = config.styleType;
const STYLE_NAME = config.styleName;
const STYLE_UNIT = config.styleUnit;

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
    const imgUrl = writeImg(result.image);
    let base64 = config.createBase64;
    if (config.createBase64) base64 = createBase64(imgUrl);
    writeScss(result, STYLE_TYPE, base64);
});

/**
 * 生成图片
 * @param {Buffer} image 
 */
function writeImg(image) {
    const url = `${__dirname}/dist/${IMG_NAME}.png`;
    createFolder(url);
    fs.writeFileSync(url, image);
    return url;
}

/**
 * 生成样式文件
 */
function writeScss(result, type, base64) {
    const scssStr = getScssDoc(result, type, base64);
    const url = `${__dirname}/dist/${STYLE_NAME}.${type}`;
    createFolder(url);
    fs.writeFileSync(url, scssStr);
}

function createBase64(imgUrl) {
    const imgData = fs.readFileSync(imgUrl);
    const data = new Buffer(imgData).toString('base64');
    return 'data:' + mime.lookup(imgUrl) + ';base64,' + data;
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
function getScssDoc(result, type, base64) {
    const t = type && (type === 'scss' || type === 'css') ? type : 'scss';
    const preStr = t === 'scss' ? '@mixin ' : '.'
    const imgUrl = base64 || `./${IMG_NAME}.png`;
    return imgNames.reduce((s, v, i) => {
        const imgMsg = result.coordinates[urlArr[i]];
        s += `\n${preStr}${v.replace(/\.[^\.]*$/, '')} {
            height: ${imgMsg.height}${STYLE_UNIT};
            width: ${imgMsg.width}${STYLE_UNIT};
            background-position: -${imgMsg.x}${STYLE_UNIT} -${imgMsg.y}${STYLE_UNIT};
        }`;
        return s;
    }, `${preStr}${IMG_NAME}Img {
            background: url(${imgUrl}) no-repeat;
            background-size: ${result.properties.width}${STYLE_UNIT} ${result.properties.height}${STYLE_UNIT}
        }`
    );
}







