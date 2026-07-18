package com.example.admin_service.monitoring;

import com.example.admin_service.monitoring.dto.ActuatorHealthResponse;
import com.example.admin_service.monitoring.dto.InfrastructureHealthResponse;
import com.example.admin_service.monitoring.dto.InstanceHealthResponse;
import com.example.admin_service.monitoring.dto.MonitoringResponse;
import com.example.admin_service.monitoring.dto.ServiceHealthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class MonitoringService {

    private static final List<String> MONITORED_SERVICES = List.of(
        "identity-service", "user-service", "social-service", "chat-service", "notification-service"
    );

    private final DiscoveryClient discoveryClient;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final CircuitBreakerFactory<?, ?> circuitBreakerFactory;
    private final InfrastructureProbe infrastructureProbe;
    private final Clock clock;

    public MonitoringService(
        DiscoveryClient discoveryClient,
        RestClient monitoringRestClient,
        ObjectMapper objectMapper,
        CircuitBreakerFactory<?, ?> circuitBreakerFactory,
        InfrastructureProbe infrastructureProbe,
        Clock clock
    ) {
        this.discoveryClient = discoveryClient;
        this.restClient = monitoringRestClient;
        this.objectMapper = objectMapper;
        this.circuitBreakerFactory = circuitBreakerFactory;
        this.infrastructureProbe = infrastructureProbe;
        this.clock = clock;
    }

    public MonitoringResponse getMonitoring() {
        Instant checkedAt = clock.instant();
        List<ServiceProbe> probes = MONITORED_SERVICES.stream()
            .map(service -> probeService(service, checkedAt))
            .toList();
        List<ServiceHealthResponse> services = probes.stream().map(ServiceProbe::response).toList();
        List<InfrastructureHealthResponse> infrastructure = aggregateInfrastructure(probes);
        boolean partialData = services.stream().anyMatch(service -> service.status() != HealthStatus.UP)
            || infrastructure.stream().anyMatch(component -> component.status() != HealthStatus.UP);
        return new MonitoringResponse(services, infrastructure, partialData, checkedAt);
    }

    private ServiceProbe probeService(String serviceName, Instant checkedAt) {
        List<ServiceInstance> discovered = discoveryClient.getInstances(serviceName);
        if (discovered.isEmpty()) {
            return new ServiceProbe(
                new ServiceHealthResponse(serviceName, HealthStatus.DOWN, 0, List.of()),
                Map.of()
            );
        }
        List<InstanceProbe> instanceProbes = discovered.stream()
            .map(instance -> probeInstance(serviceName, instance, checkedAt))
            .toList();
        HealthStatus status = aggregate(instanceProbes.stream().map(InstanceProbe::status).toList());
        return new ServiceProbe(
            new ServiceHealthResponse(
                serviceName,
                status,
                discovered.size(),
                instanceProbes.stream().map(InstanceProbe::response).toList()
            ),
            mergeComponents(instanceProbes)
        );
    }

    private InstanceProbe probeInstance(String serviceName, ServiceInstance instance, Instant checkedAt) {
        long started = System.nanoTime();
        ProbePayload payload = circuitBreakerFactory.create("monitor-" + serviceName).run(
            () -> loadHealth(instance.getUri()),
            ignored -> new ProbePayload(HealthStatus.UNKNOWN, Map.of())
        );
        long latencyMs = Math.max(0, (System.nanoTime() - started) / 1_000_000);
        InstanceHealthResponse response = new InstanceHealthResponse(
            safeInstanceId(instance),
            instance.getHost(),
            instance.getPort(),
            payload.status(),
            latencyMs,
            checkedAt
        );
        return new InstanceProbe(response, payload.status(), payload.components());
    }

    private ProbePayload loadHealth(URI baseUri) {
        URI healthUri = baseUri.resolve("/actuator/health");
        ActuatorHealthResponse body = restClient.get().uri(healthUri).exchange((request, response) ->
            objectMapper.readValue(response.getBody(), ActuatorHealthResponse.class)
        );
        Map<String, HealthStatus> components = new LinkedHashMap<>();
        if (body != null && body.components() != null) {
            body.components().forEach((name, component) ->
                components.put(name.toLowerCase(Locale.ROOT), HealthStatus.from(component.status())));
        }
        return new ProbePayload(body == null ? HealthStatus.UNKNOWN : HealthStatus.from(body.status()), components);
    }

    private List<InfrastructureHealthResponse> aggregateInfrastructure(List<ServiceProbe> probes) {
        Map<String, HealthStatus> local = infrastructureProbe.probe();
        List<InfrastructureHealthResponse> result = new ArrayList<>();
        result.add(component("Kafka", List.of("admin-service"), List.of(local.getOrDefault("kafka", HealthStatus.UNKNOWN))));
        result.add(component("Redis", List.of("admin-service"), List.of(local.getOrDefault("redis", HealthStatus.UNKNOWN))));

        List<HealthStatus> postgres = new ArrayList<>();
        List<String> postgresSources = new ArrayList<>();
        postgres.add(local.getOrDefault("postgresql", HealthStatus.UNKNOWN));
        postgresSources.add("admin-service");
        addRemoteComponent(probes, List.of("identity-service", "user-service", "notification-service"),
            List.of("db"), postgres, postgresSources);
        result.add(component("PostgreSQL", postgresSources, postgres));

        List<HealthStatus> mongo = new ArrayList<>();
        List<String> mongoSources = new ArrayList<>();
        addRemoteComponent(probes, List.of("social-service", "chat-service"),
            List.of("mongo", "mongodb"), mongo, mongoSources);
        result.add(component("MongoDB", mongoSources, mongo));
        return List.copyOf(result);
    }

    private void addRemoteComponent(
        List<ServiceProbe> probes,
        List<String> serviceNames,
        List<String> componentNames,
        List<HealthStatus> statuses,
        List<String> sources
    ) {
        serviceNames.forEach(serviceName -> {
            ServiceProbe service = probes.stream()
                .filter(candidate -> candidate.response().serviceName().equals(serviceName))
                .findFirst().orElse(null);
            HealthStatus componentStatus = HealthStatus.UNKNOWN;
            if (service != null) {
                componentStatus = componentNames.stream()
                    .map(service.components()::get)
                    .filter(java.util.Objects::nonNull)
                    .findFirst()
                    .orElse(service.response().status() == HealthStatus.DOWN
                        ? HealthStatus.DOWN : HealthStatus.UNKNOWN);
            }
            statuses.add(componentStatus);
            sources.add(serviceName);
        });
    }

    private InfrastructureHealthResponse component(
        String name, List<String> sources, List<HealthStatus> statuses
    ) {
        return new InfrastructureHealthResponse(name, aggregate(statuses), List.copyOf(sources));
    }

    private HealthStatus aggregate(List<HealthStatus> statuses) {
        if (statuses.isEmpty()) {
            return HealthStatus.UNKNOWN;
        }
        if (statuses.stream().anyMatch(status -> status == HealthStatus.DOWN)) {
            return HealthStatus.DOWN;
        }
        if (statuses.stream().anyMatch(status -> status == HealthStatus.UNKNOWN)) {
            return HealthStatus.UNKNOWN;
        }
        return HealthStatus.UP;
    }

    private Map<String, HealthStatus> mergeComponents(List<InstanceProbe> probes) {
        Map<String, List<HealthStatus>> grouped = new LinkedHashMap<>();
        probes.forEach(probe -> probe.components().forEach((name, status) ->
            grouped.computeIfAbsent(name, ignored -> new ArrayList<>()).add(status)));
        Map<String, HealthStatus> result = new LinkedHashMap<>();
        grouped.forEach((name, statuses) -> result.put(name, aggregate(statuses)));
        return result;
    }

    private String safeInstanceId(ServiceInstance instance) {
        return instance.getInstanceId() == null || instance.getInstanceId().isBlank()
            ? instance.getHost() + ':' + instance.getPort()
            : instance.getInstanceId();
    }

    private record ProbePayload(HealthStatus status, Map<String, HealthStatus> components) {
    }

    private record InstanceProbe(
        InstanceHealthResponse response,
        HealthStatus status,
        Map<String, HealthStatus> components
    ) {
    }

    private record ServiceProbe(ServiceHealthResponse response, Map<String, HealthStatus> components) {
    }
}
