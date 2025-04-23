WEB_DIR=Web
BACKEND_DIR=Backend

mongo-up:
	docker compose up -d db

web:
	cd $(WEB_DIR) && npm run build && node .output/server/index.mjs

backend:
	cd $(BACKEND_DIR) && npm run dev

run:
	make mongo-up
	make -j2 web backend

clean:
	docker compose down -v
