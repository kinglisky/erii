const OSS = require('ali-oss');
const recursive = require('recursive-readdir');
const PUBLISH_PATH = './public';

// 从 Github Secrets 中获取配置
const {
    OSS_REGION,
    OSS_BUCKET,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    ORIGIN,
} = process.env;

const client = new OSS({
    region: OSS_REGION,
    bucket: OSS_BUCKET,
    accessKeyId: OSS_ACCESS_KEY_ID,
    accessKeySecret: OSS_ACCESS_KEY_SECRET,
    timeout: 120000,
});

function getFiles() {
    return new Promise((resolve, reject) => {
        recursive(PUBLISH_PATH, (err, files) => {
            if (!err) {
                resolve(files);
            } else {
                reject(err);
            }
        });
    });
}

function upload(file) {
    return client.put(file.replace('public/', ''), `./${file}`, { timeout: 120000 })
        .then(res => {
            const url = `${ORIGIN}/${res.name}`
            console.log(`SYNC SUCCESS: ${url}`);
            return url;
        });
}

function uploadFiles(files) {
    const failure = [];
    return files.reduce((promise, file) => {
        return promise.then(() => {
            return upload(file).catch(error => {
                console.log('UPLOAD ERROR', file, error);
                failure.push(file);
            });
        });
    }, Promise.resolve()).then(() => failure);
}

(async function main() {
    const files = await getFiles();
    let failure = await uploadFiles(files);
    if (failure.length) {
        console.log('RETRY SYNC!');
        failure = await uploadFiles(failure);
        console.log('RETRY SYNC FAILURE!');
    }
    console.log('SYNC DONE !');
})();
