# Load Testing and Profiling

This project uses `k6` from the `tests/` folder for load testing and Docker Compose services for backend profiling.

## Normal backend + k6

Start the usual backend container:

```sh
docker compose up backend
```

Run the k6 load test:

```sh
docker compose run --rm loadtest-profile
docker compose run --rm loadtest-feed
```

## CPU profiling

Start the backend with the normal `npm run dev` command and Node CPU profiling enabled:

```sh
docker compose up backend-cpu-profile
```

Then point k6 at that profiled container:

```sh
docker compose run --rm -e ENDPOINT=http://backend-cpu-profile:3000 loadtest-profile
docker compose run --rm -e ENDPOINT=http://backend-cpu-profile:3000 loadtest-feed
```

## Heap profiling

Start the backend with heap profiling enabled:

```sh
docker compose up backend-heap-profile
```

Then run k6 against that profiled container:

```sh
docker compose run --rm -e ENDPOINT=http://backend-heap-profile:3000 loadtest-profile
docker compose run --rm -e ENDPOINT=http://backend-heap-profile:3000 loadtest-feed
```

## Profile artifacts

Profile files are written to `backend/profiles/` on the host.
