package com.neurovault.cognitive_engine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class CognitiveEngineApplication {

	public static void main(String[] args) {
		SpringApplication.run(CognitiveEngineApplication.class, args);
	}

}
