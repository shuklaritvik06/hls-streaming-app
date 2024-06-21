import { s3 } from "@/hls/lib/app-utils";
import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {SignedUrlData} from "@/hls/types/hls-types";

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const Bucket = process.env.VIDEOS_BUCKET;
    const continuationToken = searchParams.get("continuationToken") || undefined;
    const maxKeys = parseInt(searchParams.get("maxKeys") || "10");
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket,
            ContinuationToken: continuationToken,
            MaxKeys: maxKeys * 3
        });

        const listResponse = await s3.send(listCommand);
        const videoThumbnails: SignedUrlData  = {};
        for (const item of listResponse.Contents || []) {
            if (item.Key) {
                const parts = item.Key.split('/');
                if (parts.length === 2) {
                    const uuid = parts[0];
                    const filename = parts[1];
                    if (filename.startsWith('thumbnail_')) {
                        const thumbnailUrl = await getSignedThumbnailUrl(item.Key);
                        if (thumbnailUrl) {
                            videoThumbnails[uuid] = {
                                ...videoThumbnails[uuid],
                                thumbnailUrl: thumbnailUrl,
                            }
                            console.log(`Thumbnail URL added for UUID ${uuid}`);
                        } else {
                            console.log(`Failed to get signed URL for thumbnail: ${item.Key}`);
                        }
                    }else if (filename.startsWith('detail_')) {
                        const getObjectCommand = new GetObjectCommand({Bucket, Key: item.Key});
                        const objectResponse = await s3.send(getObjectCommand);
                        const objectData = await streamToString(objectResponse.Body);
                        videoThumbnails[uuid] = {
                            ...videoThumbnails[uuid],
                            details: JSON.parse(objectData)
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            data: videoThumbnails,
            nextToken: listResponse.NextContinuationToken
        });
    } catch (error: any) {
        console.error('Error fetching thumbnails:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}

async function getSignedThumbnailUrl(key: string) {
    const Bucket = process.env.VIDEOS_BUCKET;
    const getObjectCommand = new GetObjectCommand({Bucket, Key: key});
    try {
        return await getSignedUrl(s3, getObjectCommand, {expiresIn: 3600});
    } catch (error) {
        console.error(`Error generating signed URL for ${key}:`, error);
        return null;
    }
}

const streamToString = (stream: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: any) => chunks?.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
};
