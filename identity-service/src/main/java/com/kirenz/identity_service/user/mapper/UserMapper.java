package com.kirenz.identity_service.user.mapper;

import com.kirenz.identity_service.auth.dto.RegisterRequestDTO;
import com.kirenz.identity_service.auth.dto.RegisterResponseDTO;
import com.kirenz.identity_service.user.dto.UpdateUserProfileRequest;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    RegisterResponseDTO toRegisterResponseDTO(User user);
    UserProfileDTO toUserProfileDTO(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "emailVerifiedAt", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "privacySetting", ignore = true)
    @Mapping(target = "notificationSetting", ignore = true)
    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateUserProfileRequest dto, @org.mapstruct.MappingTarget User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "emailVerifiedAt", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "birthDate", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "website", ignore = true)
    @Mapping(target = "role", constant = "USER")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "emailVerified", constant = "false")
    @Mapping(target = "privacySetting", ignore = true)
    @Mapping(target = "notificationSetting", ignore = true)
    User toEntity(RegisterRequestDTO dto);
}

