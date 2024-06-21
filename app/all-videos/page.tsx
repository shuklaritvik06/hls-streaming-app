"use client"

import React, {useEffect, useState} from "react";
import {VideoData} from "@/hls/types/hls-types";
import toast from "react-hot-toast";
import {VideoCard} from "@/hls/components/listing";

const AllVideos: React.FC = () => {
    const [videos, setVideos] = useState<VideoData>({});
    const [continuationToken, setContinuationToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchThumbnails = (continuationToken: string | null) => {
        let url = '/api/signed-url';
        if (continuationToken) {
            url += `?continuationToken=${encodeURIComponent(continuationToken)}`;
        }
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                setVideos((prevVideos) => ({...prevVideos, ...data.data}));
                setContinuationToken(data.nextToken);
                setLoading(false)
            })
            .catch((error) => {
                setLoading(false)
                toast.error('Error fetching thumbnails:', error);
            });
    };

    useEffect(() => {
        fetchThumbnails('')
    }, [])
    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Video Gallery</h1>
            {
                loading ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {
                        [1, 2, 3, 4].map((item) => {
                            return <div key={item} className="animate-pulse bg-gray-200 h-[300px] rounded-md"></div>
                        })
                    }
                </div> : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Object.entries(videos).length==0 && <div className="text-center my-4">No Videos Uploaded</div>}
                            {Object.entries(videos).map(([key, value]) => (
                                <VideoCard key={key} description={value.details.description} title={value.details.title} thumbnailUrl={value.thumbnailUrl} />
                            ))}
                        </div>
                        {continuationToken && (
                            <div className="flex justify-center mt-10">
                                <button
                                    className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                                    onClick={() => fetchThumbnails(continuationToken)}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default AllVideos;
