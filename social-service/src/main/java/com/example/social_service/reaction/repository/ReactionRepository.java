package com.example.social_service.reaction.repository;

import com.example.social_service.reaction.model.Reaction;
import com.example.social_service.reaction.model.ReactionTargetType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

public interface ReactionRepository extends MongoRepository<Reaction, String> {

    Optional<Reaction> findByUserIdAndTargetTypeAndTargetId(
        UUID userId,
        ReactionTargetType targetType,
        String targetId
    );

    List<Reaction> findByTargetTypeAndTargetId(ReactionTargetType targetType, String targetId);

    List<Reaction> findByTargetTypeAndTargetIdIn(ReactionTargetType targetType, Collection<String> targetIds);

    List<Reaction> findByUserIdAndTargetTypeAndTargetIdIn(
        UUID userId,
        ReactionTargetType targetType,
        Collection<String> targetIds
    );

    List<Reaction> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant from, Instant to);
}
