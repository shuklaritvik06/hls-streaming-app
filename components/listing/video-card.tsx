import React from 'react';
import Link from 'next/link';
import {StreamCardProps} from "@/hls/types/hls-types";
import Image from "next/image";
const imageLoader = ({ src }: any) => {
    return `${src}`
}
const VideoCard: React.FC<StreamCardProps> = ({ key, thumbnailUrl, title, description }) => {
    return (
        <Link href={`/stream/${key}`} key={key}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer">
                <Image
                    width={0}
                    loader={imageLoader}
                    height={0}
                    src={thumbnailUrl}
                    alt={`Thumbnail ${key}`}
                    className="object-cover w-full h-40"
                />
                <div className="p-4">
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                    <p className="text-gray-600 mt-2">{description}</p>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;
