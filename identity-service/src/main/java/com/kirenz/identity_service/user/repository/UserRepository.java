package com.kirenz.identity_service.user.repository;

import com.kirenz.identity_service.user.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("""
        select u from User u
        where u.id <> :excludeId
          and (
            lower(u.username) like lower(concat('%', :query, '%'))
            or lower(u.displayName) like lower(concat('%', :query, '%'))
            or lower(u.email) like lower(concat('%', :query, '%'))
          )
        order by u.displayName asc nulls last, u.username asc
        """)
    List<User> searchProfiles(@Param("query") String query, @Param("excludeId") UUID excludeId, Pageable pageable);
}