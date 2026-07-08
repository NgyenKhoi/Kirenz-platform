package com.kirenz.identity_service.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kirenz.identity_service.common.exception.BadRequestException;
import com.kirenz.identity_service.media.dto.MediaUploadResponse;
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

    @Value("${cloudinary.folders.avatars:kirenz/avatars}")
    private String avatarFolder;

    @Value("${cloudinary.folders.covers:kirenz/covers}")
    private String coverFolder;

    @Value("${cloudinary.max-image-bytes:10485760}")
    private long maxImageBytes;

    public MediaUploadResponse uploadAvatar(MultipartFile file) {
        return uploadImage(file, avatarFolder);
    }

    public MediaUploadResponse uploadCover(MultipartFile file) {
        return uploadImage(file, coverFolder);
    }

    private MediaUploadResponse uploadImage(MultipartFile file, String folder) {
        validateImage(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
            ));

            return new MediaUploadResponse(
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
