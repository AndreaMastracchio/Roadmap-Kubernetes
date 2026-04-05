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
USER appuser
WORKDIR /home/appuser
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
