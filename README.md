## Deskripsi
Proyek ini adalah aplikasi mikroservis sederhana yang dibangun menggunakan NestJS yang mendemonstrasikan komunikasi event-driven antara dua layanan: user-service dan order-service. Aplikasi ini menggunakan RabbitMQ untuk komunikasi asynchronous, Redis untuk caching, dan PostgreSQL sebagai database.

## Fitur
user-service:
- Membuat pengguna baru
- Mendapatkan pengguna berdasarkan ID (dengan caching Redis)
- Memancarkan event user_created ketika pengguna baru dibuat

order-service:
- Membuat pesanan hanya jika userId tersedia (dengan memverifikasi dari user-service)
- Mendapatkan pesanan berdasarkan ID pengguna (dengan caching Redis)
- Mendengarkan event user_created dan mencatatnya

## Teknologi yang Digunakan
- NestJS - Framework backend
- RabbitMQ - Message broker untuk komunikasi event-driven
- Redis - Caching layer
- PostgreSQL - Database
- Docker & Docker Compose - Containerization dan orchestration

## Struktur Proyek
```bash
├── docker-compose.yml
├── user-service/
│   ├── src/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── user.entity.ts
│   │   │   └── dto/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── src/
│   │   ├── orders/
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── orders.repository.ts
│   │   │   ├── order.entity.ts
│   │   │   └── dto/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── Dockerfile
│   └── package.json
└── README.md
```

### Cara Menjalankan Aplikasi
## Prerequisites
Docker dan Docker Compose terinstal di PC/Laptop

## Langkah-langkah
1. Clone repositori ini
  `
  git clone <repository-url>
  cd <repository-directory>
  `

2. Jalankan aplikasi dengan Docker Compose
  `
  docker-compose up --build
  `

3. Akses layanan
  - user-service: http://localhost:3001
  - order-service: http://localhost:3002

### Contoh Permintaan API
## User Service
Membuat Pengguna Baru
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

Mendapatkan Pengguna berdasarkan ID
```bash
curl -X GET http://localhost:3001/users/1
```

## Order Service
Membuat Pesanan Baru
```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "product": "Laptop",
    "price": 15000000,
    "status": "pending"
  }'
```

Mendapatkan Pesanan berdasarkan User ID
```bash
curl -X GET http://localhost:3002/orders/user/1
```

## Arsitektur
Aplikasi ini mengikuti arsitektur mikroservis dengan layanan yang terpisah untuk manajemen pengguna dan pesanan. Komunikasi antara layanan dilakukan secara asynchronous menggunakan RabbitMQ. Redis digunakan sebagai layer caching untuk meningkatkan performa. Setiap layanan memiliki database PostgreSQL sendiri untuk memastikan decoupling.

## Diagram Arsitektur
```bash
Client -> [API Gateway] -> user-service (POST /users -> emit event)
                         -> order-service (POST /orders -> validate user)
                         
user-service <-> Redis (caching)
order-service <-> Redis (caching)

user-service --[user_created]--> RabbitMQ --> order-service (consumes event)
```

## Pengujian
Setiap layanan dilengkapi dengan unit test. Untuk menjalankan test:

## Di dalam direktori user-service
`
npm test
`

## Di dalam direktori order-service
`
npm test
`