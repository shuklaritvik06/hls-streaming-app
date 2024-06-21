"use client";

import React, {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import ReactHlsPlayer from 'react-hls-player';

const qualityOptions = [
    { label: '360p', value: '360p' },
    { label: '480p', value: '480p' },
    { label: '720p', value: '720p' },
    { label: '1080p', value: '1080p' },
];

const baseHlsUrl = process.env.NEXT_PUBLIC_STREAM_URL;

const StreamVideo = () => {
    const [quality, setQuality] = useState('1080p');
    const params = useParams();
    const playerRef = React.useRef<HTMLVideoElement | null>(null);
    const [isClient, setIsClient] = useState(false);

    const handleQualityChange = (event: any) => {
        setQuality(event.target.value);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Video Player
            </h1>
            <div className="mb-6">
                <label htmlFor="quality" className="mr-2 text-xl font-semibold text-gray-700">
                    Select Quality:
                </label>
                <select
                    id="quality"
                    value={quality}
                    onChange={handleQualityChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {qualityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <ReactHlsPlayer
                    playerRef={playerRef}
                    src={`${baseHlsUrl}/${params.uuid}/${quality}.m3u8`}
                    autoPlay={true}
                    muted={false}
                    controls={true}
                    width="100%"
                    height="auto"
                    className="w-full"
                />
            </div>
        </div>
    </div>
    );
};

export default StreamVideo;