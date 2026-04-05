# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o main .

# Stage 2: Final (Immagine piccolissima e sicura)
FROM alpine:latest
# Crea un utente non-root per la sicurezza
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Installa wget per l'healthcheck
RUN apk add --no-cache wget
USER appuser
WORKDIR /home/appuser
COPY --from=builder /app/main .
EXPOSE 8080
# Healthcheck per verificare che l'app sia sana
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1
CMD ["./main"]
