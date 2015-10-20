currentDir := $(shell pwd)
composeFile = docker-compose.yml

all: run

build:
	docker-compose -f $(composeFile) build

re-build:
	docker-compose -f $(composeFile) build --no-cache

run: build
	docker-compose -f $(composeFile) up --no-recreate -d

re-run: build
	docker-compose -f $(composeFile) up -d

.PHONY: all build run re-build re-run
