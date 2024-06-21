const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
    region: 'us-west-2'
});

const bucketName = 'web-streamer-ritvik';
const outputBucketName = 'transformed-videos-streamer-ritvik';

const resolutions = [
    { name: '360p', width: 640, height: 360 },
    { name: '480p', width: 854, height: 480 },
    { name: '720p', width: 1280, height: 720 },
    { name: '1080p', width: 1920, height: 1080 },
];

const downloadFromS3 = async (uuid) => {
    const key = `${uuid}/video_${uuid}.mp4`;
    const localVideoPath = `/tmp/${uuid}.mp4`;

    const params = {
        Bucket: bucketName,
        Key: key
    };

    const file = fs.createWriteStream(localVideoPath);
    return new Promise((resolve, reject) => {
        s3.getObject(params).createReadStream().pipe(file)
            .on('finish', () => resolve(localVideoPath))
            .on('error', reject);
    });
};

const uploadToS3 = async (filePath, targetKey) => {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: outputBucketName,
        Key: targetKey,
        Body: fileContent
    };
    return s3.upload(params).promise();
};

const processVideo = (inputPath, outputDir, resolution, uuid) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioBitrate(resolution.name === '360p' ? 96 : 128)
            .size(`${resolution.width}x${resolution.height}`)
            .outputOptions([
                '-hls_time 10',
                '-preset ultrafast',
                '-hls_playlist_type vod',
                `-hls_base_url ${process.env.STREAM_URL}/${uuid}/`,
                `-hls_segment_filename ${outputDir}/${resolution.name}_%03d.ts`
            ])
            .output(`${outputDir}/${resolution.name}.m3u8`)
            .on('progress', function(progress) {
                console.log(`Processing ${resolution.name}: ${progress.percent}% done`);
            })
            .on('end', function() {
                console.log(`Finished processing ${resolution.name}!`);
                resolve();
            })
            .on('error', function(err) {
                console.error(`Error processing video ${resolution.name}:`, err);
                reject(err);
            })
            .run();
    });
};

const transcodeVideo = async (uuid) => {
    const localVideoPath = `/tmp/${uuid}.mp4`;
    const outputDir = `/tmp/${uuid}_output`;

    try {
        console.log('Downloading video from S3...');
        await downloadFromS3(uuid);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        for (const resolution of resolutions) {
            console.log(`Processing video at ${resolution.name}...`);
            await processVideo(localVideoPath, outputDir, resolution, uuid);
        }

        console.log('Uploading HLS files to S3...');
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const s3Key = `${uuid}/${file}`;
            await uploadToS3(filePath, s3Key);
        }
        console.log('All files uploaded successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (fs.existsSync(localVideoPath)) {
            fs.unlinkSync(localVideoPath);
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    }
};

const uuid = process.env.UUID_TO_PROCESS;
transcodeVideo(uuid).then(()=>{
    console.log("Video is transcoded")
}).catch((err)=>{
    console.log(err)
});
