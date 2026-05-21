const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, 'public', 'sample_images');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const imagesToDownload = [
    { name: 'mountain.jpg', url: 'https://picsum.photos/id/10/800/600' },
    { name: 'red_car.jpg', url: 'https://picsum.photos/id/111/800/600' },
    { name: 'yellow_rose.jpg', url: 'https://picsum.photos/id/106/800/600' },
    { name: 'city.jpg', url: 'https://picsum.photos/id/1043/800/600' },
    { name: 'kitten.jpg', url: 'https://picsum.photos/id/659/800/600' },
    { name: 'beach.jpg', url: 'https://picsum.photos/id/1025/800/600' },
    { name: 'bicycle.jpg', url: 'https://picsum.photos/id/146/800/600' },
    { name: 'dog.jpg', url: 'https://picsum.photos/id/237/800/600' },
    { name: 'coffee.jpg', url: 'https://picsum.photos/id/425/800/600' },
    { name: 'forest.jpg', url: 'https://picsum.photos/id/28/800/600' }
];

function downloadImage(url, destPath, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadImage(response.headers.location, destPath, filename)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(destPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✓ Đã tải xong: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

async function startDownload() {
    console.log('=== ĐANG TẢI THÊM KHO ẢNH MẪU PHONG PHÚ (10 ẢNH) ===');
    for (const img of imagesToDownload) {
        const dest = path.join(targetDir, img.name);
        try {
            console.log(`Đang tải ${img.name}...`);
            await downloadImage(img.url, dest, img.name);
        } catch (error) {
            console.error(`❌ Lỗi khi tải ${img.name}:`, error.message);
        }
    }
    console.log('\n=== TẤT CẢ 10 ẢNH MẪU ĐÃ ĐƯỢC LƯU TẠI: public/sample_images/ ===\n');
}

startDownload();
