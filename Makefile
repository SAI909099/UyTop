.PHONY: bootstrap dev test lint

bootstrap:
	./scripts/bootstrap.sh

dev:
	./scripts/dev.sh

test:
	./scripts/test.sh

lint:
	./scripts/lint.sh
