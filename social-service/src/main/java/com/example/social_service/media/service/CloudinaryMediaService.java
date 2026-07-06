package com.example.social_service.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.media.dto.MediaUploadResponse;
import com.example.social_service.post.model.MediaType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryMediaService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folders.posts:kirenz/posts}")
    private String postFolder;

    @Value("${cloudinary.max-image-bytes:10485760}")
    private long maxImageBytes;
    @Value("${cloudinary.max-chat-image-bytes:52428800}")
    private long maxChatImageBytes;

    @Value("${cloudinary.max-chat-video-bytes:524288000}")
    private long maxChatVideoBytes;

    @Value("${cloudinary.folders.chat:kirenz/chat}")
    private String chatFolder;

    public MediaUploadResponse uploadPostImage(MultipartFile file) {
        validateImage(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", postFolder,
                "resource_type", "image"
            ));

            return new MediaUploadResponse(
                MediaType.IMAGE,
                stringValue(result.get("secure_url")),
                stringValue(result.get("public_id")),
                intValue(result.get("width")),
                intValue(result.get("height")),
                stringValue(result.get("format")),
                longValue(result.get("bytes"))
            );
        } catch (IOException ex) {
            throw new BadRequestException("Could not read uploaded image");
        }
    }

    public MediaUploadResponse uploadChatMedia(MultipartFile file) {
        MediaType mediaType = validateChatMedia(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", chatFolder,
                "resource_type", mediaType == MediaType.VIDEO ? "video" : "image"
            ));

            return new MediaUploadResponse(
                mediaType,
                stringValue(result.get("secure_url")),
                stringValue(result.get("public_id")),
                intValue(result.get("width")),
                intValue(result.get("height")),
                stringValue(result.get("format")),
                longValue(result.get("bytes"))
            );
        } catch (IOException ex) {
            throw new BadRequestException("Could not read uploaded media");
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        if (file.getSize() > maxImageBytes) {
            throw new BadRequestException("Image must be 10MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image uploads are supported");
        }
    }

    private MediaType validateChatMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Media file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("Unsupported media type");
        }

        if (contentType.startsWith("image/")) {
            if (file.getSize() > maxChatImageBytes) {
                throw new BadRequestException("Image must be 50MB or smaller");
            }
            return MediaType.IMAGE;
        }

        if (contentType.startsWith("video/")) {
            if (file.getSize() > maxChatVideoBytes) {
                throw new BadRequestException("Video must be 500MB or smaller");
            }
            return MediaType.VIDEO;
        }

        throw new BadRequestException("Only image and video uploads are supported");
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer intValue(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private Long longValue(Object value) {
        return value instanceof Number number ? number.longValue() : null;
    }
}
