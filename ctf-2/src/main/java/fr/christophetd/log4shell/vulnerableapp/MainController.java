package fr.christophetd.log4shell.vulnerableapp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@RestController
public class MainController {

    private static final Logger logger = LogManager.getLogger("HelloWorld");

    @GetMapping("/")
    public String index(@RequestHeader("X-Api-Version") String apiVersion) {
        logger.info("Received a request for API version " + apiVersion);
        return "Hello, world!";
    }

    @GetMapping("/api")
    public String status(@RequestHeader(value = "X-Api-Version", required = false) String apiVersion) {
        if (apiVersion == null || apiVersion.trim().isEmpty()) {
            logger.warn("Status check requested without API version");
            return "API version is required. X-Api-Version header in http.";
        }
        logger.info("Status check requested with API version " + apiVersion);
        return "Service is running.";
    }

    @GetMapping("/systeminfo")
    public String systeminfo() {
        String javaVersion = System.getProperty("java.version");
        String gradleVersion = "7.3.1"; // From gradle-wrapper.properties
        String osVersion = System.getProperty("os.name") + " " + System.getProperty("os.version");
        String log4jVersion = "2.6.1"; // From build.gradle

        logger.info("System info requested");
        return String.format("System Information:\n" +
                "Java Version: %s\n" +
                "Gradle Version: %s\n" +
                "OS Version: %s\n" +
                "Log4j Version: %s",
                javaVersion, gradleVersion, osVersion, log4jVersion);
    }
}