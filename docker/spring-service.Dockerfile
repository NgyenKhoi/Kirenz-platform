FROM maven:3.9-eclipse-temurin-21 AS build

ARG SERVICE_DIR
WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY ${SERVICE_DIR}/pom.xml ${SERVICE_DIR}/pom.xml
COPY ${SERVICE_DIR}/src ${SERVICE_DIR}/src

WORKDIR /workspace/${SERVICE_DIR}
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
ARG SERVICE_DIR
WORKDIR /app
COPY --from=build /workspace/${SERVICE_DIR}/target/*.jar app.jar
EXPOSE 8080 8081 8082 8083 8084 8085 8086 8761
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
