## 使用spritesmith生成雪碧图
>spritesmith是一个npm模块，可以使多张图片直接生成雪碧图buffer格式。可以直接看[文档](https://github.com/Ensighten/spritesmith)。我这里主要是包一层，可以自动搜索指定文件夹中的图片，实现生成图片，并自动生成css或者scss代码。可以根据需要调整，方便工作时使用。

### 使用
打开命令行，先执行``npm install``,然后``node index.js``，可以看到img文件中生成了dist文件。

#### 一、主要参数设置
使用文件``sprit_config.json``进行参数配置，文件内容如下
``````
{
  "imgDir": "/img", //图片所在文件夹
  "padding": 20,   //图片间的距离
  "imgName": "player", //生成图片的名称
  "styleType": "css", //生成样式文件类型
  "styleName": "playerImg",  //生成样式文件名称
  "createBase64":true,  //是否生成base64格式
  "styleUnit":"rpx"  //样式单位
}

``````

#### 二、搜索指定文件夹下的图片
使用fs的``readdirSync``来获取文件夹下的所有文件名称，然后摘取其中的图片，如
````
const imgNames = fs.readdirSync(__dirname + IMG_DIR).filter(v => {//IMG_DIR为指定的图片所在文件夹路径
    const imgType = ['jpeg', 'png', 'jpg'];
    const mat = v.match(/[^\.]*$/);
    if (mat) {
        return imgType.indexOf(mat[0]) !== -1;
    } else {
        return false;
    }
});
````

#### 三、使用spritesmith生成合成图以及相关信息
````
//先获取需要合成图片的地址数组
const urlArr = imgNames.reduce((a, v) => {
    a.push(`${__dirname}${IMG_DIR}/${v}`);
    return a;
}, []);

//生成合成图片，设置每张图片的右边和下面的距离为10px，可以任意设置
spritesmith.run({ src: urlArr, padding: 10 }, (err, result) => {
    if (err) throw err;

    writeImg(result.image);//result.image为合成图片的buffer格式，使用它来生成图片，并放到指定文件夹中
    writeScss(result, STYLE_TYPE);//根据result中的相关信息，生成css或者scss样式
});
````
#### 四、生成图片
利用fs的``writeFileSync``来将buffer格式的数据生成图片
````
/**
 * 生成图片
 * @param {Buffer} image 
 */
function writeImg(image) {
    const url = `${__dirname}${IMG_DIR}/dist/${IMG_NAME}.png`;
    createFolder(url);
    fs.writeFileSync(url, image);
}
````
#### 五、生成样式文件
````
/**
 * 生成样式文件
 */
function writeScss(result, type) {
    const scssStr = getScssDoc(result, type);
    const url = `${__dirname}${IMG_DIR}/dist/${STYLE_NAME}.${type}`;
    createFolder(url);//判断指定路径是否存在，不存在则创建
    fs.writeFileSync(url, scssStr);
}
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
	//获取了类型，为css或scss
    const t = type && (type === 'scss' || type === 'css') ? type : 'scss';
    const preStr = t === 'scss' ? '@mixin ' : '.'
    //使用图片名称去命名样式中的名称或类
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

````


