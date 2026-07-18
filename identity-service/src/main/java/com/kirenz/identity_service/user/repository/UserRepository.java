package com.kirenz.identity_service.user.repository;

import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    long countByCreatedAtGreaterThanEqual(Instant createdAt);

    long countByStatus(AccountStatus status);

    @Query("select u.createdAt from User u where u.createdAt >= :from and u.createdAt < :to order by u.createdAt")
    List<Instant> findCreatedAtBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
        select u from User u
        where (
            lower(u.displayName) like lower(concat('%', :query, '%'))
            or lower(u.username) like lower(concat('%', :query, '%'))
            or lower(u.email) like lower(concat('%', :query, '%'))
        )
        and (:status is null or u.status = :status)
        and (:emailVerified is null or u.emailVerified = :emailVerified)
        """)
    Page<User> searchForAdmin(
        @Param("query") String query,
        @Param("status") AccountStatus status,
        @Param("emailVerified") Boolean emailVerified,
        Pageable pageable
    );

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

    @Query("""
        select u from User u
        where u.birthDate is not null
          and extract(month from u.birthDate) = :month
          and extract(day from u.birthDate) = :day
        """)
    List<User> findByBirthdayMonthAndDay(@Param("month") int month, @Param("day") int day);
}
