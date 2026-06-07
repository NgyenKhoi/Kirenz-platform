package com.kirenz.identity_service.user.repository;

import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for UserRepository.
 * Tests custom query methods and database operations.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("UserRepository Tests")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test user
        testUser = User.builder()
                .email("test@example.com")
                .username("testuser")
                .password("hashedPassword123")
                .displayName("Test User")
                .role(UserRole.USER)
                .status(AccountStatus.ACTIVE)
                .emailVerified(false)
                .build();
    }

    @Test
    @DisplayName("should find user by email when email exists")
    void findByEmail_WhenEmailExists_ShouldReturnUser() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        assertThat(found.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("should return empty optional when email does not exist")
    void findByEmail_WhenEmailDoesNotExist_ShouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("should find user by username when username exists")
    void findByUsername_WhenUsernameExists_ShouldReturnUser() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        Optional<User> found = userRepository.findByUsername("testuser");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("testuser");
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("should return empty optional when username does not exist")
    void findByUsername_WhenUsernameDoesNotExist_ShouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByUsername("nonexistentuser");

        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("should return true when email exists")
    void existsByEmail_WhenEmailExists_ShouldReturnTrue() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        boolean exists = userRepository.existsByEmail("test@example.com");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("should return false when email does not exist")
    void existsByEmail_WhenEmailDoesNotExist_ShouldReturnFalse() {
        // Act
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("should return true when username exists")
    void existsByUsername_WhenUsernameExists_ShouldReturnTrue() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        boolean exists = userRepository.existsByUsername("testuser");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("should return false when username does not exist")
    void existsByUsername_WhenUsernameDoesNotExist_ShouldReturnFalse() {
        // Act
        boolean exists = userRepository.existsByUsername("nonexistentuser");

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("should be case-sensitive for email searches")
    void findByEmail_ShouldBeCaseSensitive() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        Optional<User> found = userRepository.findByEmail("TEST@EXAMPLE.COM");

        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("should be case-sensitive for username searches")
    void findByUsername_ShouldBeCaseSensitive() {
        // Arrange
        entityManager.persistAndFlush(testUser);

        // Act
        Optional<User> found = userRepository.findByUsername("TESTUSER");

        // Assert
        assertThat(found).isEmpty();
    }
}
