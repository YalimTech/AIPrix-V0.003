import React from 'react';
interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadComplete?: (result: any) => void;
    onUploadError?: (error: string) => void;
    acceptedTypes?: string[];
    maxSize?: number;
    disabled?: boolean;
    className?: string;
    multiple?: boolean;
    autoUpload?: boolean;
    uploadEndpoint?: string;
    maxFiles?: number;
}
declare const FileUpload: React.FC<FileUploadProps>;
export default FileUpload;
