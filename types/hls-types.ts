export interface StreamCardProps {
    key: string;
    thumbnailUrl: string;
    title: string;
    description: string;
}

export interface SignedUrlData{
    [name:string]: object;
}

export interface VideoData{
    [name:string]: {
        thumbnailUrl: string;
        details: {
            title: string;
            description: string;
        }
    };
}