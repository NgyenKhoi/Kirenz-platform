package com.example.social_service.media.controller;

import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.media.dto.MediaUploadResponse;
import com.example.social_service.media.service.CloudinaryMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final CloudinaryMediaService mediaService;

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaUploadResponse>> uploadPostImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", mediaService.uploadPostImage(file)));
    }
}