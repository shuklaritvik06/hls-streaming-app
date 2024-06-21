import { s3 } from "@/hls/lib/app-utils";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const Bucket = process.env.VIDEOS_BUCKET;

export async function POST(request: NextRequest) {
    const uploadedKeys: string[] = [];
    try {
        const formData = await request.formData();
        const thumbnail = formData.get("thumbnail") as File;
        const video = formData.get("video") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const Prefix = uuidv4();

        if (!thumbnail || !video) {
            return NextResponse.json({ error: "No thumbnail or video provided" }, { status: 400 });
        }

        const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
        if (!allowedImageTypes.includes(thumbnail.type)) {
            return NextResponse.json({ error: `Thumbnail type not allowed: ${thumbnail.type}` }, { status: 400 });
        }

        const detailKey = `${Prefix}/detail_${Prefix}.json`;
        await s3.send(new PutObjectCommand({ Bucket, Key: detailKey, Body: JSON.stringify({ title, description }) }));
        uploadedKeys.push(detailKey);

        const thumbnailArrayBuffer = await thumbnail.arrayBuffer();
        const thumbnailBody = Buffer.from(thumbnailArrayBuffer);
        const thumbnailExtension = thumbnail.name.split('.').pop();
        const thumbnailKey = `${Prefix}/thumbnail_${Prefix}.${thumbnailExtension}`;
        await s3.send(new PutObjectCommand({ Bucket, Key: thumbnailKey, Body: thumbnailBody }));
        uploadedKeys.push(thumbnailKey);

        const videoArrayBuffer = await video.arrayBuffer();
        const videoBody = Buffer.from(videoArrayBuffer);
        const videoExtension = video.name.split('.').pop();
        const videoKey = `${Prefix}/video_${Prefix}.${videoExtension}`;
        await s3.send(new PutObjectCommand({ Bucket, Key: videoKey, Body: videoBody }));
        uploadedKeys.push(videoKey);

        return NextResponse.json({
            thumbnail: { name: thumbnail.name, status: "uploaded", key: thumbnailKey },
            video: { name: video.name, status: "uploaded", key: videoKey }
        });
    } catch (error: any) {
        console.error('Error uploading files:', error);
        await Promise.all(uploadedKeys.map(async (key) => {
            try {
                await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
                console.log(`Deleted ${key}`);
            } catch (deleteError) {
                console.error(`Error deleting ${key}:`, deleteError);
            }
        }));
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
