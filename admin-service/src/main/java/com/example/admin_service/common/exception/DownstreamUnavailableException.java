package com.example.admin_service.common.exception;

public class DownstreamUnavailableException extends RuntimeException {

    private final String serviceName;

    public DownstreamUnavailableException(String serviceName, Throwable cause) {
        super(serviceName + " is temporarily unavailable", cause);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
