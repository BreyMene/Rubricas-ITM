WEB_DIR=Web
BACKEND_DIR=Backend

mongo-up:
	docker compose up -d db redis

web:
	cd $(WEB_DIR) && npm run dev
	# build && node .output/server/index.mjs

backend:
	cd $(BACKEND_DIR) && npm run dev

run:
	make mongo-up
	make -j2 web backend

clean:
	docker compose down -v
