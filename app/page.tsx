"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {ClipLoader} from "react-spinners";
import toast from "react-hot-toast";
import Image from "next/image";

const Home: React.FC = () => {
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoTitle, setVideoTitle] = useState<string>('');
    const [videoDescription, setVideoDescription] = useState<string>('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!thumbnailFile || !videoFile) {
            toast.error("Please select both a thumbnail and a video file.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("thumbnail", thumbnailFile);
        formData.append("video", videoFile);
        formData.append("title", videoTitle);
        formData.append("description", videoDescription);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                toast.success("Uploaded Successfully!")
                resetFiles();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error);
            }
        } catch (error: any) {
            toast.error("Error uploading files:", error.message);
        }
        setLoading(false);
    };

    const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const resetFiles = () => {
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setVideoFile(null);
        setVideoPreview(null);
        setVideoTitle('');
        setVideoDescription('');
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen h-auto bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                <h1 className="text-2xl font-bold text-gray-800">
                    Upload a Video File for Streaming
                </h1>
                <p className="text-sm text-gray-600 mb-5 mt-2">A simple and intuitive web application for uploading and streaming video files, featuring thumbnail previews and video browsing.</p>
                <form className="flex flex-col gap-6" onSubmit={handleUpload}>
                    <div className="flex flex-col items-center">
                        <input
                            id="thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="thumbnail"
                            className="cursor-pointer rounded-lg w-full border border-gray-300 p-3 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-200 transition duration-300 ease-in-out"
                        >
                            {thumbnailPreview ? (
                                <Image
                                    width={0}
                                    height={0}
                                    src={thumbnailPreview}
                                    alt="Thumbnail Preview"
                                    className="w-full h-auto object-cover rounded-lg"
                                />
                            ) : (
                                <span>Choose a Thumbnail</span>
                            )}
                        </label>
                    </div>
                    <div className="flex flex-col items-center">
                        <input
                            id="video"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="video"
                            className="cursor-pointer rounded-lg w-full border border-gray-300 p-3 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-200 transition duration-300 ease-in-out"
                        >
                            {videoPreview ? (
                                <video
                                    src={videoPreview}
                                    controls
                                    className="w-full h-auto object-cover rounded-lg"
                                />
                            ) : (
                                <span>Choose a Video</span>
                            )}
                        </label>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="title" className="text-lg text-gray-800">
                            Video Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="description" className="text-lg text-gray-800">
                            Video Description
                        </label>
                        <textarea
                            id="description"
                            required
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                            className="border border-gray-300 rounded-lg p-2"
                            rows={4}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out"
                    >
                        {loading ? <ClipLoader size={20} color={"white"}/> : "Upload File"}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default Home;
