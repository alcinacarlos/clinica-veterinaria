# Clínica Veterinaria - API Endpoints

This document lists all the available endpoints in the backend API, along with their HTTP methods, routes, expected JSON payloads (Body), and required roles for access.

## Base URL
All API routes are prefixed with `/api`.

---

## 🔐 Auth (`/api/auth`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `POST` | `/register` | Public | `{ "email": "", "password": "", "full_name": "", "phone": "" }` | Register a new user |
| `POST` | `/login` | Public | `{ "email": "", "password": "" }` | Login and get token |
| `GET` | `/me` | Authenticated | `None` | Get current user profile |

---

## 👥 Users (`/api/users`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/` | `admin` | `None` | Get all users |
| `PUT` | `/:id/role` | `admin` | `{ "role": "string" }` | Update user role |

---

## 🐾 Pets (`/api/pets`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/` | Public | `None` | Get all pets |
| `GET` | `/:id` | Public | `None` | Get pet by ID |
| `POST` | `/` | `admin` | `{ "name": "", "species": "", "breed": "", "age_years": 0, "description": "", "image_url": "", "status": "" }` | Create a new pet |
| `PUT` | `/:id` | `admin` | `{ "name": "", "species": "", "breed": "", "age_years": 0, "description": "", "image_url": "", "status": "" }` | Update an existing pet |

---

## 🏡 Adoptions (`/api/adoptions`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `POST` | `/` | `clientela` | `{ "pet_id": "UUID", "notes": "" }` | Request an adoption |
| `GET` | `/` | `admin` | `None` | Get all adoption requests |
| `PUT` | `/:id/status` | `admin` | `{ "status": "", "admin_notes": "" }` | Update adoption status |

---

## 🛍️ Products (`/api/products`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/` | Public | `None` | Get all products |
| `POST` | `/` | `ventas`, `admin` | `{ "name": "", "description": "", "price": 0, "stock": 0, "category": "", "image_url": "" }` | Create a new product |
| `PUT` | `/:id` | `ventas`, `admin` | `{ "name": "", "description": "", "price": 0, "stock": 0, "category": "", "image_url": "", "is_active": true }` | Update a product |

---

## 📦 Orders (`/api/orders`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `POST` | `/` | `clientela` | `{ "items": [{ "product_id": "UUID", "quantity": 1 }], "notes": "" }` | Create a new order |
| `GET` | `/` | `clientela`, `ventas`, `admin` | `None` | Get orders |
| `PUT` | `/:id/status` | `ventas`, `admin` | `{ "status": "pending\|processing\|shipped\|delivered\|cancelled" }` | Update order status |

---

## 🏥 Services (`/api/services`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/` | Public | `None` | Get all services |
| `POST` | `/` | `admin` | `{ "name": "", "description": "", "price": 0, "duration_minutes": 0 }` | Create a new service |

---

## 📅 Appointments (`/api/appointments`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `POST` | `/` | `clientela` | `{ "service_id": "UUID", "pet_id": "UUID", "scheduled_at": "ISO", "vet_id": "UUID", "notes": "" }` | Book an appointment |
| `GET` | `/` | `clientela`, `veterinario`, `admin` | `None` | Get appointments |
| `PUT` | `/:id/status` | `veterinario`, `admin` | `{ "status": "" }` | Update appointment status |

---

## 📋 Medical Records (`/api/medical-records`)
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/:petId` | `veterinario`, `clientela` | `None` | Get medical records for a pet |
| `POST` | `/` | `veterinario` | `{ "pet_id": "UUID", "appointment_id": "UUID", "diagnosis": "", "treatment": "", "notes": "" }` | Add a medical record |

---

## ⚕️ Health Check
| Method | Endpoint | Access | Expected Payload (JSON) | Description |
|--------|----------|--------|-------------------------|-------------|
| `GET` | `/health` | Public | `None` | API Health Check |
