package com.example.admin_service.monitoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"rawtypes", "unchecked"})
class MonitoringServiceTest {

    @Mock DiscoveryClient discoveryClient;
    @Mock CircuitBreakerFactory circuitBreakerFactory;
    @Mock CircuitBreaker circuitBreaker;
    @Mock InfrastructureProbe infrastructureProbe;
    private MockRestServiceServer server;
    private MonitoringService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        lenient().when(circuitBreakerFactory.create(anyString())).thenReturn(circuitBreaker);
        lenient().when(circuitBreaker.run(any(Supplier.class), any(Function.class))).thenAnswer(invocation -> {
            Supplier supplier = invocation.getArgument(0);
            Function fallback = invocation.getArgument(1);
            try {
                return supplier.get();
            } catch (Throwable throwable) {
                return fallback.apply(throwable);
            }
        });
        when(infrastructureProbe.probe()).thenReturn(Map.of(
            "kafka", HealthStatus.UP,
            "redis", HealthStatus.UP,
            "postgresql", HealthStatus.UP
        ));
        service = new MonitoringService(
            discoveryClient,
            builder.build(),
            new ObjectMapper(),
            circuitBreakerFactory,
            infrastructureProbe,
            Clock.fixed(Instant.parse("2026-07-18T12:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void reportsMissingEurekaInstancesWithoutFailingResponse() {
        when(discoveryClient.getInstances(anyString())).thenReturn(List.of());

        var result = service.getMonitoring();

        assertThat(result.services()).hasSize(5);
        assertThat(result.services()).allMatch(item -> item.status() == HealthStatus.DOWN);
        assertThat(result.partialData()).isTrue();
    }

    @Test
    void reportsUpInstanceAndSanitizedDatabaseComponent() {
        var instance = new DefaultServiceInstance(
            "identity-1", "identity-service", "identity.local", 8081, false);
        when(discoveryClient.getInstances("identity-service")).thenReturn(List.of(instance));
        when(discoveryClient.getInstances("user-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("social-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("chat-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("notification-service")).thenReturn(List.of());
        server.expect(requestTo(URI.create("http://identity.local:8081/actuator/health")))
            .andRespond(withSuccess(
                "{\"status\":\"UP\",\"components\":{\"db\":{\"status\":\"UP\"}}}",
                MediaType.APPLICATION_JSON));

        var result = service.getMonitoring();

        assertThat(result.services().getFirst().status()).isEqualTo(HealthStatus.UP);
        assertThat(result.services().getFirst().registeredInstances()).isEqualTo(1);
        assertThat(result.services().getFirst().instances().getFirst().host()).isEqualTo("identity.local");
        server.verify();
    }

    @Test
    void mapsHealthEndpointFailureToUnknown() {
        var instance = new DefaultServiceInstance(
            "identity-1", "identity-service", "identity.local", 8081, false);
        when(discoveryClient.getInstances("identity-service")).thenReturn(List.of(instance));
        when(discoveryClient.getInstances("user-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("social-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("chat-service")).thenReturn(List.of());
        when(discoveryClient.getInstances("notification-service")).thenReturn(List.of());
        server.expect(requestTo(URI.create("http://identity.local:8081/actuator/health")))
            .andRespond(withServerError());

        var result = service.getMonitoring();

        assertThat(result.services().getFirst().status()).isEqualTo(HealthStatus.UNKNOWN);
        assertThat(result.partialData()).isTrue();
        server.verify();
    }
}
